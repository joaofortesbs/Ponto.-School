import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import schoolPowerActivities from '../data/schoolPowerActivities.json';
import activityFieldsSchema from '../data/activityFieldsSchema.json';
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
  customFields?: Record<string, string>;
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

    const activitiesString = allowedActivities
    .filter(a => a.enabled)
    .map(a => `"${a.id}"`)
    .join(', ');

      // Obter campos personalizados disponíveis
    const getCustomFieldsForActivity = (activityId: string): string[] => {
      const schema = activityFieldsSchema[activityId as keyof typeof activityFieldsSchema];
      return schema?.fields || [];
    };

    // Criar string com informações sobre campos personalizados
    const customFieldsInfo = Object.keys(activityFieldsSchema).map(activityId => {
      const fields = getCustomFieldsForActivity(activityId);
      return `${activityId}: [${fields.join(', ')}]`;
    }).join('\n');

    // Construir o prompt para a Gemini
    const prompt = `Você é uma IA especializada em gerar planos de ação educacionais para professores e coordenadores, seguindo e planejando exatamente o que eles pedem, e seguindo muito bem os requesitos, sendo super treinado, utilizando apenas as atividades possíveis listadas abaixo. 

Aqui estão as informações coletadas:

DADOS:
- Pedido: "${initialMessage}"
- Matérias e temas: ${contextualizationData?.subjects || 'Geral'}
- Público: ${contextualizationData?.audience || 'Estudantes'}
- Restrições: "${contextualizationData?.restrictions || 'undefined'}"
- Datas importantes: "${contextualizationData?.dates || 'undefined'}"
- Observações: ${contextualizationData?.notes || 'Nenhuma'}

ATIVIDADES DISPONÍVEIS: ${activitiesString}

CAMPOS PERSONALIZADOS POR ATIVIDADE:
${customFieldsInfo}

INSTRUÇÕES:
1. Analise cuidadosamente o pedido e as informações fornecidas
2. Selecione APENAS atividades da lista disponível que sejam relevantes para o pedido
3. Gere um plano de ação com 5-15 atividades diferentes
4. Cada atividade deve ter um título personalizado e descritivo
5. A descrição deve ser específica e detalhada para o contexto fornecido
6. Use os IDs exatos das atividades disponíveis
7. Varie a duração e dificuldade conforme apropriado
8. OBRIGATÓRIO: Para cada atividade, preencha TODOS os campos personalizados listados acima para aquele ID específico
9. Os campos personalizados devem conter dados realistas, contextualizados e específicos - NUNCA deixe vazio ou genérico
10. Todos os campos extras devem ser strings (texto simples)

FORMATO DE RESPOSTA (JSON):
Retorne APENAS um array JSON válido com as atividades selecionadas, seguindo exatamente este formato:

[
  {
    "id": "id-da-atividade-exato",
    "title": "Título personalizado da atividade",
    "description": "Descrição específica e detalhada da atividade para este contexto",
    "duration": "XX min",
    "difficulty": "Fácil/Médio/Difícil",
    "category": "Categoria da disciplina",
    "type": "atividade",
    "Campo Personalizado 1": "Valor específico e realista",
    "Campo Personalizado 2": "Valor específico e realista",
    "Campo Personalizado N": "Valor específico e realista"
  }
]

EXEMPLO para lista-exercicios:
{
  "id": "lista-exercicios",
  "title": "Lista de Exercícios: Substantivos e Verbos",
  "description": "Elaboração de uma lista de exercícios abrangendo a identificação, classificação e uso de substantivos e verbos em diferentes contextos.",
  "duration": "30 min",
  "difficulty": "Médio",
  "category": "Gramática",
  "type": "atividade",
  "Quantidade de Questões": "10 questões mistas entre substantivos comuns e próprios, além de verbos regulares",
  "Tema": "Substantivos e Verbos",
  "Disciplina": "Língua Portuguesa",
  "Ano de Escolaridade": "6º Ano",
  "Nível de Dificuldade": "Intermediário",
  "Modelo de Questões": "Objetivas e dissertativas",
  "Fontes": "Livro didático Projeto Ápis e site TodaMatéria"
}

LEMBRE-SE: 
- TODOS os campos personalizados DEVEM ser preenchidos para CADA atividade
- Os valores devem ser específicos, detalhados e contextualizados
- NUNCA deixe um campo vazio ou com valor genérico
- Cada atividade deve ter TODOS os seus campos personalizados preenchidos

IMPORTANTE: 
- Use APENAS os IDs disponíveis na lista
- PREENCHA TODOS os campos personalizados para cada atividade
- Os dados dos campos devem ser específicos, realistas e contextualizados
- NÃO inclua explicações antes ou depois do JSON
- NÃO use markdown ou formatação
- Retorne APENAS o array JSON válido`;

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
      isTrilhasEligible: isActivityEligibleForTrilhas(activity.id),
      customFields: activity.customFields || {}
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
    const actionPlanItems = validatedActivities.map(activity => {
        // Extrair campos personalizados da atividade
        const customFields: Record<string, string> = {};
        
        // Pegar todos os campos que não são padrões do sistema
        const standardFields = ['id', 'title', 'description', 'duration', 'difficulty', 'category', 'type', 'personalizedTitle', 'personalizedDescription'];
        
        Object.keys(activity).forEach(key => {
            if (!standardFields.includes(key) && typeof activity[key] === 'string') {
                customFields[key] = activity[key];
            }
        });

        console.log(`✅ Campos personalizados extraídos para ${activity.id}:`, customFields);

        return {
            id: activity.id,
            title: activity.personalizedTitle || activity.title,
            description: activity.personalizedDescription || activity.description,
            approved: false,
            isTrilhasEligible: isActivityEligibleForTrilhas(activity.id),
            customFields: customFields
        };
    });

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