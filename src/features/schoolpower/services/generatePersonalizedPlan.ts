import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import schoolPowerActivities from '../data/schoolPowerActivities.json';
import { isActivityEligibleForTrilhas } from '../data/trilhasActivitiesConfig';
import { validateGeminiPlan } from './validateGeminiPlan';

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
    .map(a => a.id); // Remover limitação para permitir todas as atividades

  const prompt = `Você é uma IA especializada em gerar planos de ação educacionais para professores e coordenadores, seguindo e planejando exatamente o que eles pedem, e seguindo muito bem os requesitos, sendo super treinado, utilizando apenas as atividades possíveis listadas abaixo. 
  
Aqui estão as informações coletadas:

DADOS:
- Pedido: "${initialMessage}"
- Matérias e temas: ${contextualizationData.subjects || 'Geral'}
- Público: ${contextualizationData.audience || 'Estudantes'}
- Restrições: "${contextualizationData.restrictions}"
- Datas importantes: "${contextualizationData.dates}"
- Observações: ${contextualizationData.notes || 'Nenhuma'}

ATIVIDADES DISPONÍVEIS: ${activitiesIds.join(', ')}

INSTRUÇÕES:
1. Analise cuidadosamente todas as informações fornecidas
2. TAREFA: Selecione 10-35 atividades adequadas ao pedido, priorizando variedade e completude. Retorne APENAS este JSON:
[{"id":"atividade-id","title":"Título Personalizado","description":"Descrição contextualizada", "duration": "30 min", "difficulty": "Médio", "category": "Geral", "type": "atividade"}]
3. Personalize o título e descrição de cada atividade com base nas informações coletadas
4. Priorize a diversidade de tipos de atividades para criar um plano completo e abrangente
5. Se o usuário pediu atividades específicas (como "lista de exercícios", "prova", "mapa mental", etc.), INCLUA TODAS elas!!!!!!!
6. Se o usuário pediu algo que demanda muitas atividades, faça o máximo de atividades possíveis, de uma maneira planejada, e priorizando a organização e planejamento para o professor/coordenador!
7. Se por acaso nos dados coletados tiver um número de atividades especificas para ser criadas/geradas, gere exatamente a mesma quantidade de atividades, sem deixar nada faltando!!!!!!!

IMPORTANTE: Use SOMENTE os IDs listados acima.`;

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



    // Mapear atividades validadas para o formato do ActionPlanItem
    const actionPlanItems = validatedActivities.map(activity => ({
        id: activity.id,
        title: activity.personalizedTitle || activity.title,
        description: activity.personalizedDescription || activity.description,
        approved: false,
        isTrilhasEligible: isActivityEligibleForTrilhas(activity.id)
    }));

    if (validatedActivities.length === 0) {
      console.warn('⚠️ Nenhuma atividade válida retornada, usando fallback');
      return generateFallbackPlan(initialMessage, contextualizationData);
    }

    // Converte para ActionPlanItems
    const actionPlanItems2 = convertToActionPlanItems(validatedActivities, schoolPowerActivities);

    console.log('✅ Plano personalizado gerado com sucesso:', actionPlanItems);
    return actionPlanItems;

  } catch (error) {
    console.error('❌ Erro ao gerar plano personalizado:', error);

    // Em caso de erro, retorna o plano de fallback
    console.log('🔄 Usando plano de fallback devido ao erro');
    return generateFallbackPlan(initialMessage, contextualizationData);
  }
}