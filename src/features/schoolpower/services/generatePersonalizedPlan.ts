import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import schoolPowerActivities from '../data/schoolPowerActivities.json';
import activityFieldsSchema from '../data/activityFieldsSchema.json';
import { isActivityEligibleForTrilhas } from '../data/trilhasActivitiesConfig';
import { validateGeminiPlan } from './validateGeminiPlan';
import { processAIGeneratedContent } from './exerciseListProcessor';

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
  // Extrair quantidade específica do pedido do usuário com múltiplos padrões
  const quantityPatterns = [
    /(\d+)\s*(atividades?|exercícios?|questões?|materiais?|sugestões?)/i,
    /quero\s+(\d+)/i,
    /preciso\s+de\s+(\d+)/i,
    /gerar\s+(\d+)/i,
    /(\d+)\s*por\s*dia/i,
    /(\d+)\s*para/i
  ];
  
  let requestedQuantity = null;
  for (const pattern of quantityPatterns) {
    const match = initialMessage.match(pattern);
    if (match) {
      requestedQuantity = parseInt(match[1]);
      break;
    }
  }
  
  console.log(`🎯 Quantidade solicitada detectada: ${requestedQuantity || 'não especificada'}`);
  console.log(`📝 Mensagem original: ${initialMessage}`);

  // Simplificar lista de atividades para economizar tokens
  const activitiesIds = allowedActivities
    .filter(a => a.enabled)
    .map(a => a.id);

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

${requestedQuantity ? `
🎯🎯🎯 ATENÇÃO CRÍTICA - QUANTIDADE OBRIGATÓRIA 🎯🎯🎯
O usuário solicitou EXATAMENTE ${requestedQuantity} atividades.
VOCÊ DEVE GERAR PRECISAMENTE ${requestedQuantity} ATIVIDADES - NEM MAIS, NEM MENOS!
Este é um requisito ABSOLUTO e NÃO NEGOCIÁVEL.
Se necessário, reutilize IDs de atividades com contextos diferentes para atingir ${requestedQuantity} atividades.
CONTAGEM FINAL OBRIGATÓRIA: ${requestedQuantity} atividades.
🎯🎯🎯 QUANTIDADE OBRIGATÓRIA: ${requestedQuantity} 🎯🎯🎯
` : ''} 

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

INSTRUÇÕES CRÍTICAS:
1. Analise cuidadosamente o pedido e as informações fornecidas
2. ${requestedQuantity ? `🚨 QUANTIDADE ABSOLUTA: Gere EXATAMENTE ${requestedQuantity} atividades - nem mais, nem menos! Este é o requisito mais importante!` : 'Gere um plano de ação ABRANGENTE com 15-50 atividades diferentes conforme a complexidade do pedido'}
3. Selecione APENAS atividades da lista disponível que sejam relevantes para o pedido
4. ${requestedQuantity ? `Para atingir exatamente ${requestedQuantity} atividades, reutilize IDs de atividades variando títulos, contextos e abordagens diferentes` : 'Varie os tipos de atividades'}
5. Cada atividade deve ter um título personalizado e descritivo
6. A descrição deve ser específica e detalhada para o contexto fornecido
7. Use os IDs exatos das atividades disponíveis (pode repetir IDs com contextos diferentes)
8. Varie a duração e dificuldade conforme apropriado
9. OBRIGATÓRIO: Para cada atividade, preencha TODOS os campos personalizados listados acima para aquele ID específico
10. Os campos personalizados devem conter dados realistas, contextualizados e específicos - NUNCA deixe vazio ou genérico
11. Todos os campos extras devem ser strings (texto simples)
12. ${requestedQuantity ? `🔢 CONTAGEM FINAL OBRIGATÓRIA: Antes de enviar, conte suas atividades - devem ser EXATAMENTE ${requestedQuantity}! Se não estiver correto, ajuste imediatamente!` : 'Priorize diversidade de tipos de atividades para um plano completo e abrangente'}

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
        temperature: 0.2, // Reduzido ainda mais para consistência na quantidade
        topK: 15,
        topP: 0.7,
        maxOutputTokens: 131072, // Aumentado para suportar até 100+ atividades com campos completos
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
    console.log(`📊 Quantidade de atividades geradas: ${parsedActivities.length}`);
    
    // Verificar se a quantidade solicitada foi atendida
    const quantityMatch = responseText.match(/(\d+)/);
    const requestedFromResponse = quantityMatch ? parseInt(quantityMatch[1]) : null;
    
    if (requestedFromResponse && parsedActivities.length !== requestedFromResponse) {
      console.warn(`⚠️ Quantidade solicitada (${requestedFromResponse}) diferente da gerada (${parsedActivities.length})`);
    }
    
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

  // Remove limite para permitir geração de mais atividades conforme necessário
  // relevantActivities = relevantActivities.slice(0, 35);

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
    
    console.log(`📊 Atividades geradas: ${geminiActivities.length}`);
    console.log(`🎯 Quantidade solicitada: ${requestedQuantity || 'não especificada'}`);
    
    // Validação crítica de quantidade
    if (requestedQuantity && geminiActivities.length !== requestedQuantity) {
      console.warn(`⚠️ ERRO DE QUANTIDADE: Solicitado ${requestedQuantity}, gerado ${geminiActivities.length}`);
      
      // Tentar corrigir a quantidade automaticamente
      if (geminiActivities.length < requestedQuantity) {
        console.log(`🔄 Complementando atividades para atingir ${requestedQuantity}`);
        const deficit = requestedQuantity - geminiActivities.length;
        
        // Duplicar atividades existentes com variações para completar
        for (let i = 0; i < deficit; i++) {
          const baseActivity = geminiActivities[i % geminiActivities.length];
          const duplicatedActivity = {
            ...baseActivity,
            title: `${baseActivity.title} - Variação ${i + 1}`,
            description: `${baseActivity.description} (Atividade complementar ${i + 1})`
          };
          geminiActivities.push(duplicatedActivity);
        }
        
        console.log(`✅ Quantidade corrigida: ${geminiActivities.length} atividades`);
      } else if (geminiActivities.length > requestedQuantity) {
        console.log(`🔄 Reduzindo atividades para ${requestedQuantity}`);
        geminiActivities.splice(requestedQuantity);
        console.log(`✅ Quantidade corrigida: ${geminiActivities.length} atividades`);
      }
    }

    // Valida as atividades retornadas
    const validatedActivities = await validateGeminiPlan(geminiActivities, schoolPowerActivities, requestedQuantity);



    // Mapear atividades validadas para o formato do ActionPlanItem
    const actionPlanItems = validatedActivities.map(activityData => {
        // Extrair campos personalizados da atividade
        const customFields: Record<string, string> = {};

        // Pegar todos os campos que não são padrões do sistema
        const standardFields = ['id', 'title', 'description', 'duration', 'difficulty', 'category', 'type', 'personalizedTitle', 'personalizedDescription'];

        Object.keys(activityData).forEach(key => {
            if (!standardFields.includes(key) && typeof activityData[key] === 'string') {
                customFields[key] = activityData[key];
            }
        });

        console.log(`✅ Campos personalizados extraídos para ${activityData.id}:`, customFields);

        const activity = {
          id: activityData.id,
          title: activityData.title,
          description: activityData.description,
          duration: activityData.duration,
          difficulty: activityData.difficulty,
          category: activityData.category,
          type: activityData.type,
          customFields: customFields || {},
          approved: true,
          isTrilhasEligible: true,
          isBuilt: false, // Será marcado como true após construção automática
          builtAt: null
        };

        console.log(`✅ ActionPlanItem completo criado para ${activityData.id}:`, activity);
        return activity;
    });

    if (validatedActivities.length === 0) {
      console.warn('⚠️ Nenhuma atividade válida retornada, usando fallback');
      return generateFallbackPlan(initialMessage, contextualizationData);
    }

    console.log(`✅ Total de atividades validadas geradas: ${validatedActivities.length}`);

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