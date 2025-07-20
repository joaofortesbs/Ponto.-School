
import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import schoolPowerActivities from '../data/schoolPowerActivities.json';
import { validateGeminiPlan } from './validateGeminiPlan';

// API Key da Gemini para School Power
const GEMINI_API_KEY = 'AIzaSyD-Sso0SdyYKoA4M3tQhcWjQ1AoddB7Wo4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

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
}

/**
 * Constrói o prompt estruturado para a API Gemini
 */
function buildGeminiPrompt(
  initialMessage: string, 
  contextualizationData: ContextualizationData,
  allowedActivities: typeof schoolPowerActivities
): string {
  const prompt = `
🎯 SISTEMA: Você é a IA especializada do School Power, responsável por gerar planos de ação educacionais 100% personalizados.

📝 DADOS DO USUÁRIO:
Mensagem Inicial: "${initialMessage}"

Contextualização Detalhada:
- Disciplinas/Matérias: ${contextualizationData.subjects}
- Público-Alvo: ${contextualizationData.audience}
- Restrições/Limitações: ${contextualizationData.restrictions}
- Datas/Cronograma: ${contextualizationData.dates}
- Observações Adicionais: ${contextualizationData.notes}

🎯 ATIVIDADES PERMITIDAS (${allowedActivities.length} disponíveis):
${JSON.stringify(allowedActivities.map(activity => ({
  id: activity.id,
  name: activity.name,
  description: activity.description,
  tags: activity.tags
})), null, 2)}

📋 INSTRUÇÕES ESPECÍFICAS:
1. Analise CUIDADOSAMENTE a mensagem inicial e os dados de contextualização
2. Selecione entre 3 a 5 atividades que sejam PERFEITAMENTE adequadas ao pedido
3. Use EXCLUSIVAMENTE os IDs das atividades da lista acima
4. Personalize os títulos e descrições baseando-se nos dados fornecidos
5. Garanta que cada atividade seja única e relevante para o contexto

🎯 FORMATO DE RESPOSTA (JSON PURO, SEM MARKDOWN):
[
  {
    "id": "id-da-atividade-permitida",
    "title": "Título Personalizado Baseado no Contexto",
    "description": "Descrição personalizada que conecta a atividade com os dados fornecidos",
    "personalizedTitle": "Título ainda mais específico se necessário",
    "personalizedDescription": "Descrição detalhada e contextualizada"
  }
]

⚠️ REGRAS CRÍTICAS:
- Use APENAS IDs das atividades permitidas listadas acima
- NÃO invente novos IDs ou atividades
- Personalize títulos e descrições baseando-se nos dados reais
- Retorne APENAS o JSON sem explicações adicionais
- Garanta relevância total com a solicitação inicial

GERE AGORA o plano de ação personalizado:`;

  return prompt;
}

/**
 * Faz a chamada para a API Gemini
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  console.log('🚀 Fazendo chamada para API Gemini...');
  console.log('📤 Prompt enviado:', prompt.substring(0, 500) + '...');

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
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
      approved: false
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
        'plano-aula'
      ].includes(activity.id)
    );
  }

  // Limita a 4 atividades
  relevantActivities = relevantActivities.slice(0, 4);

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

    // Converte para ActionPlanItems
    const actionPlanItems = convertToActionPlanItems(validatedActivities, schoolPowerActivities);

    console.log('✅ Plano personalizado gerado com sucesso:', actionPlanItems);
    return actionPlanItems;

  } catch (error) {
    console.error('❌ Erro ao gerar plano personalizado:', error);
    
    // Em caso de erro, retorna o plano de fallback
    console.log('🔄 Usando plano de fallback devido ao erro');
    return generateFallbackPlan(initialMessage, contextualizationData);
  }
}
