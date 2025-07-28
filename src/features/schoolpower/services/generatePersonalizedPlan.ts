import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import schoolPowerActivities from '../data/schoolPowerActivities.json';
import { validateGeminiPlan } from './validateGeminiPlan';
import { isActivityEligibleForTrilhas } from '../data/trilhasActivitiesConfig';
import { activityMaterialFieldsMap, getCamposObrigatorios, AVAILABLE_FIELD_TYPES } from '../data/activityMaterialFieldsMap';

// Usar API Key centralizada
import { API_KEYS, API_URLS } from '@/config/apiKeys';

const GEMINI_API_KEY = API_KEYS.GEMINI;
const GEMINI_API_URL = API_URLS.GEMINI;

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
}

/**
 * Interface para resposta esperada da Gemini
 */
interface GeminiActivityResponse {
  id: string;
  title: string;
  description: string;
  personalizedTitle?: string;
  personalizedDescription?: string;
  duration: string;
  difficulty: string;
  category: string;
  type: string;
}

/**
 * Constrói o prompt otimizado para a API Gemini
 */
function buildGeminiPrompt(
  initialMessage: string, 
  contextualizationData: ContextualizationData,
  allowedActivities: typeof schoolPowerActivities
): string {
  // Simplificar lista de atividades para economizar tokens
  const activitiesIds = allowedActivities
    .filter(a => a.enabled)
    .map(a => a.id);

  // Criar exemplo de campos obrigatórios para o prompt
  const fieldExamples = Object.entries(activityMaterialFieldsMap).slice(0, 3).map(([id, config]) => {
    return `"${id}": [${config.camposObrigatorios.map(campo => `"${campo}"`).join(', ')}]`;
  }).join('\n  ');

  // Analisar contexto para personalização mais inteligente
  const materias = contextualizationData.subjects || contextualizationData.materias || 'Geral';
  const publicoAlvo = contextualizationData.audience || contextualizationData.publicoAlvo || 'Estudantes';
  const restricoes = contextualizationData.restrictions || contextualizationData.restricoes || 'Nenhuma';
  const datasImportantes = contextualizationData.dates || contextualizationData.datasImportantes || 'Não especificado';
  const observacoes = contextualizationData.notes || contextualizationData.observacoes || 'Nenhuma';

  // Identificar palavras-chave específicas no pedido para personalização mais precisa
  const palavrasChave = initialMessage.toLowerCase();
  const isListaExercicios = palavrasChave.includes('lista') || palavrasChave.includes('exercicio');
  const isProva = palavrasChave.includes('prova') || palavrasChave.includes('avaliacao');
  const isBimestre = palavrasChave.includes('bimestre') || palavrasChave.includes('trimestre');
  
  // Criar contexto educacional mais específico
  let contextoEspecifico = '';
  if (materias && materias !== 'Geral' && materias !== '7') {
    contextoEspecifico += `\nDISCIPLINA ESPECÍFICA: ${materias}`;
  }
  if (publicoAlvo && publicoAlvo !== 'Estudantes' && publicoAlvo !== '7') {
    contextoEspecifico += `\nPÚBLICO-ALVO: ${publicoAlvo}`;
  }
  if (isBimestre) {
    contextoEspecifico += `\nPERÍODO: Atividade para período bimestral/trimestral`;
  }

  const prompt = `Você é uma IA especializada em educação que cria planos de ação ULTRA PERSONALIZADOS baseados nos dados coletados. Você deve personalizar CADA atividade de acordo com o contexto específico fornecido.

🎯 ANÁLISE DO PEDIDO:
Pedido original: "${initialMessage}"

📊 DADOS DE CONTEXTUALIZAÇÃO:
- Matérias/Disciplinas: ${materias}
- Público-alvo: ${publicoAlvo}
- Restrições específicas: ${restricoes}
- Datas importantes: ${datasImportantes}
- Observações especiais: ${observacoes}${contextoEspecifico}

🎲 ATIVIDADES DISPONÍVEIS: ${activitiesIds.join(', ')}

🔧 CAMPOS AUTOMÁTICOS POR ATIVIDADE:
${fieldExamples}

📝 INSTRUÇÕES PARA PERSONALIZAÇÃO TOTAL:

1. ANÁLISE OBRIGATÓRIA:
   - Identifique EXATAMENTE o que foi pedido
   - Use as matérias/disciplinas mencionadas
   - Considere o público-alvo específico
   - Respeite todas as restrições

2. PERSONALIZAÇÃO INTELIGENTE:
   - TÍTULOS: Sempre inclua a disciplina + tema específico + nível
   - DESCRIÇÕES: Contextualize com base nos dados coletados
   - Se mencionou "Língua Portuguesa + Substantivos e Verbos" → personalize para isso
   - Se mencionou "3º bimestre" → inclua referências ao período

3. SELEÇÃO DE ATIVIDADES:
   ${isListaExercicios ? '- PRIORIDADE: Lista de exercícios (pedido específico identificado)' : ''}
   ${isProva ? '- PRIORIDADE: Prova/avaliação (pedido específico identificado)' : ''}
   - Selecione 8-15 atividades relevantes
   - Garanta variedade e completude
   - Use APENAS os IDs da lista fornecida

4. FORMATO DE RESPOSTA (JSON):
[
  {
    "id": "id-da-atividade",
    "personalizedTitle": "Título Ultra Personalizado com Disciplina + Tema + Contexto",
    "personalizedDescription": "Descrição detalhada considerando matéria, público, período e observações específicas",
    "duration": "Tempo estimado",
    "difficulty": "Nível adequado ao público",
    "category": "Categoria relevante",
    "type": "Tipo da atividade"
  }
]

⚠️ REGRAS CRÍTICAS:
- SEMPRE personalize títulos e descrições com base nos dados coletados
- Use APENAS IDs válidos da lista fornecida
- Retorne APENAS o JSON válido, sem texto adicional
- Contextualize CADA atividade para as disciplinas/temas mencionados`;

  return prompt;
}

/**
 * Faz a chamada para a API Gemini
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  console.log('🚀 Fazendo chamada para API Gemini...');
  console.log('📤 Prompt enviado (primeiros 300 chars):', prompt.substring(0, 300));
  console.log('🔑 API Key disponível:', !!GEMINI_API_KEY);
  console.log('🌐 URL da API:', GEMINI_API_URL);

  if (!GEMINI_API_KEY) {
    throw new Error('API Key do Gemini não está configurada');
  }

  try {
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3, // Reduzido para respostas mais consistentes
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 12288, // Aumentado para suportar mais atividades
      }
    };

    console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta da API Gemini:', response.status, errorText);
      throw new Error(`Erro na API Gemini: ${response.status} - ${errorText}`);
    }

    const data: GeminiResponse = await response.json();
    console.log('📥 Resposta bruta da Gemini:', data);

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error('❌ Resposta vazia da API Gemini');
      throw new Error('Resposta vazia da API Gemini');
    }

    console.log('✅ Texto gerado pela Gemini:', generatedText);
    return generatedText;

  } catch (error) {
    console.error('❌ Erro ao chamar API Gemini:', error);
    throw error;
  }
}

/**
 * Processa e limpa a resposta da Gemini
 */
function parseGeminiResponse(responseText: string): GeminiActivityResponse[] {
  console.log('🔍 Processando resposta da Gemini...');

  try {
    // Remove markdown e outros caracteres indesejados
    let cleanedText = responseText.trim();

    // Remove blocos de código markdown se existirem
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Remove quebras de linha extras
    cleanedText = cleanedText.trim();

    console.log('🧹 Texto limpo:', cleanedText);

    // Tenta fazer parse do JSON
    const parsedActivities: GeminiActivityResponse[] = JSON.parse(cleanedText);

    if (!Array.isArray(parsedActivities)) {
      throw new Error('Resposta não é um array válido');
    }

    console.log('✅ Atividades parseadas:', parsedActivities);
    return parsedActivities;

  } catch (error) {
    console.error('❌ Erro ao fazer parse da resposta:', error);
    console.error('📝 Texto original:', responseText);
    throw new Error('Erro ao processar resposta da IA');
  }
}

/**
 * Converte resposta da Gemini para formato ActionPlanItem
 */
function convertToActionPlanItems(
  geminiActivities: GeminiActivityResponse[], 
  allowedActivities: typeof schoolPowerActivities
): ActionPlanItem[] {
  console.log('🔄 Convertendo atividades para ActionPlanItems...');

  return geminiActivities.map(activity => {
    // Busca a atividade original no JSON para validação
    const originalActivity = allowedActivities.find(a => a.id === activity.id);

    if (!originalActivity) {
      console.warn(`⚠️ Atividade não encontrada: ${activity.id}`);
      return null;
    }

    const actionPlanItem: ActionPlanItem = {
      id: activity.id,
      title: activity.personalizedTitle || activity.title || originalActivity.name,
      description: activity.personalizedDescription || activity.description || originalActivity.description,
      approved: false,
      isTrilhasEligible: isActivityEligibleForTrilhas(activity.id)
    };

    console.log('✅ ActionPlanItem criado:', actionPlanItem);
    return actionPlanItem;
  }).filter((item): item is ActionPlanItem => item !== null);
}

/**
 * Gera um plano de ação de fallback caso a API falhe
 */
function generateFallbackPlan(
  initialMessage: string, 
  contextualizationData: ContextualizationData
): ActionPlanItem[] {
  console.log('🔄 Gerando plano de fallback...');

  // Seleciona atividades relevantes baseadas em palavras-chave
  const keywords = [
    initialMessage.toLowerCase(),
    contextualizationData.subjects?.toLowerCase() || '',
    contextualizationData.audience?.toLowerCase() || '',
  ].join(' ');

  let relevantActivities = schoolPowerActivities.filter(activity => {
    return activity.enabled && (
      keywords.includes('prova') && activity.tags.includes('avaliação') ||
      keywords.includes('exercicio') && activity.tags.includes('exercícios') ||
      keywords.includes('resumo') && activity.tags.includes('resumo') ||
      keywords.includes('jogo') && activity.tags.includes('jogos') ||
      keywords.includes('atividade') && activity.tags.includes('atividades')
    );
  });

  // Se não encontrar atividades específicas, usa as mais populares
  if (relevantActivities.length === 0) {
    relevantActivities = schoolPowerActivities.filter(activity => 
      activity.enabled && [
        'lista-exercicios',
        'resumo',
        'prova',
        'atividades-matematica',
        'plano-aula',
        'mapa-mental',
        'jogos-educativos',
        'atividades-ortografia-alfabeto',
        'caca-palavras',
        'projeto',
        'slides-didaticos',
        'palavra-cruzada',
        'desenho-simetrico',
        'sequencia-didatica',
        'atividades-contos-infantis'
      ].includes(activity.id)
    );
  }

  // Limita a 35 atividades para um plano mais completo
  relevantActivities = relevantActivities.slice(0, 35);

  const fallbackPlan: ActionPlanItem[] = relevantActivities.map(activity => ({
    id: activity.id,
    title: `${activity.name} - ${contextualizationData.subjects || 'Personalizado'}`,
    description: `${activity.description} Baseado em: "${initialMessage.substring(0, 100)}..."`,
    approved: false
  }));

  console.log('✅ Plano de fallback gerado:', fallbackPlan);
  return fallbackPlan;
}

/**
 * Função principal para gerar plano personalizado
 */
export async function generatePersonalizedPlan(
  initialMessage: string,
  contextualizationData: ContextualizationData
): Promise<ActionPlanItem[]> {
  console.log('🤖 Iniciando geração de plano personalizado...');
  console.log('📝 Dados de entrada:', { initialMessage, contextualizationData });

  try {
    // Validação dos dados de entrada
    if (!initialMessage?.trim()) {
      throw new Error('Mensagem inicial é obrigatória');
    }

    if (!contextualizationData) {
      throw new Error('Dados de contextualização são obrigatórios');
    }

    // Carrega atividades permitidas
    console.log('📚 Atividades disponíveis:', schoolPowerActivities.length);

    // Constrói o prompt estruturado
    const prompt = buildGeminiPrompt(initialMessage, contextualizationData, schoolPowerActivities);
    console.log('📝 Prompt construído com sucesso');

    // Chama a API Gemini
    const geminiResponse = await callGeminiAPI(prompt);

    // Processa a resposta
    const geminiActivities = parseGeminiResponse(geminiResponse);

    // Valida as atividades retornadas
    const validatedActivities = await validateGeminiPlan(geminiActivities, schoolPowerActivities);



    if (validatedActivities.length === 0) {
      console.warn('⚠️ Nenhuma atividade válida retornada, usando fallback');
      return generateFallbackPlan(initialMessage, contextualizationData);
    }

    // Mapear atividades validadas para o formato do ActionPlanItem
    const actionPlanItems: ActionPlanItem[] = validatedActivities.map(activity => {
      const actionPlanItem: ActionPlanItem = {
        id: activity.id,
        title: activity.personalizedTitle || activity.title,
        description: activity.personalizedDescription || activity.description,
        duration: activity.duration || "Personalizado",
        difficulty: activity.difficulty || "Personalizado", 
        category: activity.category || "Geral",
        type: activity.type || "Atividade",
        approved: false,
        isTrilhasEligible: isActivityEligibleForTrilhas(activity.id),
        camposPreenchidos: activity.camposPreenchidos || {}
      };

      console.log('✅ ActionPlanItem personalizado criado:', {
        id: actionPlanItem.id,
        title: actionPlanItem.title,
        description: actionPlanItem.description?.substring(0, 100) + '...',
        personalizada: !!(activity.personalizedTitle || activity.personalizedDescription)
      });

      return actionPlanItem;
    });

    console.log('✅ Plano personalizado gerado com sucesso:', actionPlanItems.length, 'atividades');
    return actionPlanItems;

  } catch (error) {
    console.error('❌ Erro ao gerar plano personalizado:', error);

    // Em caso de erro, retorna o plano de fallback
    console.log('🔄 Usando plano de fallback devido ao erro');
    return generateFallbackPlan(initialMessage, contextualizationData);
  }
}