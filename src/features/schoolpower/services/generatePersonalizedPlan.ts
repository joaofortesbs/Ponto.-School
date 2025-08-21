
import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import schoolPowerActivities from '../data/schoolPowerActivities.json';
import activityFieldsSchema from '../data/activityFieldsSchema.json';
import { isActivityEligibleForTrilhas } from '../data/trilhasActivitiesConfig';
import { validateGeminiPlan } from './validateGeminiPlan';
import { processAIGeneratedContent } from './exerciseListProcessor';
import { sequenciaDidaticaPrompt } from '../prompts/sequenciaDidaticaPrompt';
import { validateSequenciaDidaticaData } from './sequenciaDidaticaValidator';

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
 * Valida dados de contextualização
 */
function validateContextualizationData(data: ContextualizationData): boolean {
  console.log('🔍 Validando dados de contextualização:', data);
  
  // Verificar se os dados não são apenas "73" ou valores inválidos
  const isValidField = (field: string) => {
    return field && 
           field.trim() !== '' && 
           field.trim() !== '73' && 
           field.length > 2;
  };
  
  const isValid = isValidField(data.materias) && isValidField(data.publicoAlvo);
  
  console.log('✅ Validação de contextualização:', {
    materias: isValidField(data.materias),
    publicoAlvo: isValidField(data.publicoAlvo),
    isValid
  });
  
  return isValid;
}

/**
 * Constrói o prompt otimizado para a API Gemini
 */
function buildGeminiPrompt(
  initialMessage: string,
  contextualizationData: ContextualizationData,
  allowedActivities: typeof schoolPowerActivities
): string {
  console.log('🏗️ Construindo prompt para Gemini...');
  console.log('📝 Mensagem inicial:', initialMessage);
  console.log('📊 Dados de contextualização:', contextualizationData);

  // Verificar se os dados são válidos
  if (!validateContextualizationData(contextualizationData)) {
    console.warn('⚠️ Dados de contextualização inválidos, usando fallback');
    // Usar dados de fallback baseados na mensagem inicial
    contextualizationData = {
      materias: extrairMateriasFromMessage(initialMessage),
      publicoAlvo: extrairPublicoAlvoFromMessage(initialMessage),
      restricoes: contextualizationData.restricoes || 'Nenhuma restrição específica',
      datasImportantes: contextualizationData.datasImportantes || '',
      observacoes: contextualizationData.observacoes || ''
    };
  }

  // Simplificar lista de atividades para economizar tokens
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

  // Analisar atividades específicas mencionadas na mensagem
  const atividadesEspecificas = extrairAtividadesEspecificas(initialMessage);
  
  // Construir o prompt para a Gemini
  const prompt = `Você é uma IA especializada em educação que gera planos de ação personalizados para professores.

ANÁLISE DA SOLICITAÇÃO:
Mensagem do usuário: "${initialMessage}"
Atividades específicas identificadas: ${atividadesEspecificas.join(', ') || 'Nenhuma específica'}

DADOS DO CONTEXTO EDUCACIONAL:
- Matérias/Disciplinas: ${contextualizationData.materias}
- Público-alvo: ${contextualizationData.publicoAlvo}
- Restrições: ${contextualizationData.restricoes || 'Nenhuma'}
- Datas importantes: ${contextualizationData.datasImportantes || 'Não informado'}
- Observações: ${contextualizationData.observacoes || 'Nenhuma'}

ATIVIDADES DISPONÍVEIS: ${activitiesString}

CAMPOS PERSONALIZADOS POR ATIVIDADE:
${customFieldsInfo}

INSTRUÇÕES ESPECÍFICAS:
1. IDENTIFIQUE todas as atividades mencionadas na mensagem do usuário
2. INCLUA OBRIGATORIAMENTE todas as atividades específicas solicitadas
3. ADICIONE atividades complementares relevantes (total de 8-15 atividades)
4. PERSONALIZE cada atividade com base no contexto fornecido
5. PREENCHA os customFields com informações específicas e detalhadas
6. Use as matérias (${contextualizationData.materias}) para personalizar títulos e descrições
7. Adapte para o público-alvo (${contextualizationData.publicoAlvo})

ATIVIDADES ESPECÍFICAS OBRIGATÓRIAS:
${atividadesEspecificas.map(ativ => `- ${ativ}`).join('\n')}

FORMATO DE RESPOSTA (JSON VÁLIDO):
[
  {
    "id": "id-exato-da-atividade-da-lista",
    "personalizedTitle": "Título personalizado para ${contextualizationData.materias} - ${contextualizationData.publicoAlvo}",
    "personalizedDescription": "Descrição detalhada personalizada baseada no contexto",
    "customFields": {
      "campo1": "valor específico baseado em ${contextualizationData.materias}",
      "campo2": "valor específico baseado em ${contextualizationData.publicoAlvo}"
    }
  }
]

IMPORTANTE: 
- Retorne APENAS o JSON válido
- Inclua TODAS as atividades específicas mencionadas pelo usuário
- Personalize com base nos dados reais fornecidos
- Preencha customFields com informações úteis e específicas`;

  console.log('✅ Prompt construído com sucesso');
  return prompt;
}

/**
 * Extrai matérias da mensagem inicial quando dados de contextualização são inválidos
 */
function extrairMateriasFromMessage(message: string): string {
  const materiasComuns = [
    'matemática', 'português', 'história', 'geografia', 'ciências', 'física', 
    'química', 'biologia', 'inglês', 'educação física', 'artes', 'filosofia',
    'sociologia', 'literatura', 'redação', 'geometria', 'álgebra'
  ];
  
  const messageLower = message.toLowerCase();
  const materiasEncontradas = materiasComuns.filter(materia => 
    messageLower.includes(materia)
  );
  
  if (materiasEncontradas.length > 0) {
    return materiasEncontradas.join(', ');
  }
  
  // Se menciona relevo e geografia, focar nessas
  if (messageLower.includes('relevo') || messageLower.includes('geográfica') || messageLower.includes('montanhas')) {
    return 'Geografia - Relevo e Formações Geográficas';
  }
  
  return 'Ensino Fundamental';
}

/**
 * Extrai público-alvo da mensagem inicial
 */
function extrairPublicoAlvoFromMessage(message: string): string {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('bimestre')) {
    const bimestreMatch = message.match(/(\d+).*?bimestre/i);
    if (bimestreMatch) {
      return `Ensino Fundamental - ${bimestreMatch[1]}º Bimestre`;
    }
  }
  
  // Verificar menções de anos escolares
  const anoMatch = message.match(/(\d+)º?\s*ano/i);
  if (anoMatch) {
    return `${anoMatch[1]}º Ano do Ensino Fundamental`;
  }
  
  return 'Ensino Fundamental';
}

/**
 * Extrai atividades específicas mencionadas na mensagem
 */
function extrairAtividadesEspecificas(message: string): string[] {
  const atividades = [];
  const messageLower = message.toLowerCase();
  
  // Mapear termos mencionados para IDs de atividades
  const mapeamento = {
    'quadro interativo': 'quadro-interativo',
    'sequência didática': 'sequencia-didatica',
    'lista de exercícios': 'lista-exercicios',
    'exercícios': 'lista-exercicios',
    'plano de aula': 'plano-aula',
    'prova': 'prova',
    'avaliação': 'prova',
    'teste': 'prova',
    'mapa mental': 'mapa-mental',
    'resumo': 'resumo',
    'slides': 'slides-didaticos',
    'apresentação': 'slides-didaticos',
    'jogo': 'jogos-educativos',
    'atividade': 'atividades-matematica'
  };
  
  for (const [termo, id] of Object.entries(mapeamento)) {
    if (messageLower.includes(termo)) {
      atividades.push(id);
    }
  }
  
  return [...new Set(atividades)]; // Remove duplicatas
}

/**
 * Makes the call to the Gemini API
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  console.log('🚀 Fazendo chamada para API Gemini...');
  console.log('🔑 API Key disponível:', !!GEMINI_API_KEY);
  console.log('🌐 API URL:', GEMINI_API_URL);

  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API Key não está configurada');
  }

  try {
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 32768,
      }
    };

    console.log('📋 Enviando requisição para Gemini...');

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
      throw new Error(`Erro da API Gemini: ${response.status} - ${errorText}`);
    }

    const data: GeminiResponse = await response.json();
    console.log('📥 Resposta bruta da Gemini recebida');

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error('❌ Resposta vazia da API Gemini');
      throw new Error('Resposta vazia da API Gemini');
    }

    console.log('✅ Texto gerado pela Gemini:', generatedText.substring(0, 500) + '...');
    return generatedText;

  } catch (error) {
    console.error('❌ Erro ao chamar API Gemini:', error);
    throw error;
  }
}

/**
 * Processes and cleans the Gemini response
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

    console.log('🧹 Texto limpo:', cleanedText.substring(0, 300) + '...');

    // Tenta fazer o parse do JSON
    const parsedActivities: GeminiActivityResponse[] = JSON.parse(cleanedText);

    if (!Array.isArray(parsedActivities)) {
      throw new Error('Resposta não é um array válido');
    }

    console.log('✅ Atividades parseadas:', parsedActivities.length);
    return parsedActivities;

  } catch (error) {
    console.error('❌ Erro ao processar resposta:', error);
    console.error('📝 Texto original:', responseText);
    throw new Error('Erro ao processar resposta da IA');
  }
}

/**
 * Converts Gemini response to ActionPlanItem format
 */
function convertToActionPlanItems(
  geminiActivities: GeminiActivityResponse[],
  allowedActivities: typeof schoolPowerActivities
): ActionPlanItem[] {
  console.log('🔄 Convertendo atividades para ActionPlanItems...');

  return geminiActivities.map(activity => {
    // Encontra a atividade original no JSON para validação
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

    console.log('✅ ActionPlanItem criado:', actionPlanItem.id);
    return actionPlanItem;
  }).filter((item): item is ActionPlanItem => item !== null);
}

/**
 * Generates a fallback plan if the API fails
 */
function generateFallbackPlan(
  initialMessage: string,
  contextualizationData: ContextualizationData
): ActionPlanItem[] {
  console.log('🔄 Gerando plano de fallback...');

  // Extrair atividades específicas da mensagem
  const atividadesEspecificas = extrairAtividadesEspecificas(initialMessage);
  
  // Selecionar atividades relevantes
  let relevantActivities = schoolPowerActivities.filter(activity => {
    return activity.enabled && (
      atividadesEspecificas.includes(activity.id) ||
      activity.tags.some(tag => 
        initialMessage.toLowerCase().includes(tag.toLowerCase())
      )
    );
  });

  // Se nenhuma atividade específica foi encontrada, usar as mais populares
  if (relevantActivities.length === 0) {
    relevantActivities = schoolPowerActivities.filter(activity =>
      activity.enabled && [
        'lista-exercicios',
        'resumo',
        'prova',
        'plano-aula',
        'sequencia-didatica',
        'quadro-interativo',
        'mapa-mental',
        'jogos-educativos',
        'slides-didaticos'
      ].includes(activity.id)
    );
  }

  // Garantir que temos pelo menos as atividades específicas mencionadas
  atividadesEspecificas.forEach(idEspecifico => {
    const atividadeEspecifica = schoolPowerActivities.find(a => a.id === idEspecifico);
    if (atividadeEspecifica && !relevantActivities.some(r => r.id === idEspecifico)) {
      relevantActivities.push(atividadeEspecifica);
    }
  });

  const fallbackPlan: ActionPlanItem[] = relevantActivities.map(activity => ({
    id: activity.id,
    title: `${activity.name} - Personalizado`,
    description: `${activity.description} Baseado em: "${initialMessage.substring(0, 100)}..."`,
    approved: false,
    customFields: {
      'Disciplina': extrairMateriasFromMessage(initialMessage),
      'Público-alvo': extrairPublicoAlvoFromMessage(initialMessage),
      'Observações': 'Gerado automaticamente pelo sistema'
    }
  }));

  console.log('✅ Plano de fallback gerado:', fallbackPlan.length, 'atividades');
  return fallbackPlan;
}

/**
 * Main function to generate a personalized plan
 */
export async function generatePersonalizedPlan(
  initialMessage: string,
  contextualizationData: ContextualizationData
): Promise<ActionPlanItem[]> {
  console.log('🤖 Iniciando geração de plano personalizado...');
  console.log('📝 Dados de entrada:', { initialMessage, contextualizationData });

  try {
    // Validação de dados de entrada
    if (!initialMessage?.trim()) {
      throw new Error('Mensagem inicial é obrigatória');
    }

    if (!contextualizationData) {
      throw new Error('Dados de contextualização são obrigatórios');
    }

    // Carregar atividades permitidas
    console.log('📚 Atividades disponíveis:', schoolPowerActivities.length);

    // Construir o prompt estruturado
    const prompt = buildGeminiPrompt(initialMessage, contextualizationData, schoolPowerActivities);
    console.log('📝 Prompt construído com sucesso');

    // Chamar a API Gemini
    const geminiResponse = await callGeminiAPI(prompt);

    // Processar a resposta
    const generatedActivities = parseGeminiResponse(geminiResponse);

    // Validar as atividades retornadas
    const validatedActivities = await validateGeminiPlan(generatedActivities, schoolPowerActivities);

    // Processar cada atividade e extrair custom fields
    const actionPlanItems = validatedActivities.map(activityData => {
        console.log(`🔄 Processando atividade: ${activityData.id}`);

        // Validação específica para Sequência Didática
        if (activityData.id === 'sequencia-didatica') {
          console.log('🎯 Aplicando validação específica para Sequência Didática');
          const validation = validateSequenciaDidaticaData(activityData);

          if (!validation.isValid) {
            console.error('❌ Sequência Didática inválida:', validation.errors);
            // Use fallback data for invalid Sequência Didática
            activityData = {
              ...activityData,
              customFields: {
                'Título do Tema / Assunto': activityData.personalizedTitle || 'Sequência Didática Personalizada',
                'Ano / Série': extrairPublicoAlvoFromMessage(initialMessage),
                'Disciplina': extrairMateriasFromMessage(initialMessage),
                'BNCC / Competências': 'Competências específicas da disciplina',
                'Público-alvo': contextualizationData.publicoAlvo,
                'Objetivos de Aprendizagem': 'Desenvolver habilidades específicas',
                'Quantidade de Aulas': '4',
                'Quantidade de Diagnósticos': '1',
                'Quantidade de Avaliações': '2',
                'Cronograma': 'Cronograma a ser definido'
              }
            };
          } else if (validation.processedData) {
            activityData = validation.processedData;
          }
        }

        // Extrair custom fields
        const customFields: Record<string, string> = {};
        const standardFields = ['id', 'title', 'description', 'duration',
                               'difficulty', 'category', 'type', 'personalizedTitle', 'personalizedDescription'];

        Object.keys(activityData).forEach(key => {
            if (!standardFields.includes(key) && typeof activityData[key] === 'string') {
                customFields[key] = activityData[key];
            }
        });

        // Garantir que customFields seja um objeto válido
        const finalCustomFields = activityData.customFields || customFields || {};

        // Garantir que todos os valores sejam strings
        Object.keys(finalCustomFields).forEach(key => {
          if (typeof finalCustomFields[key] !== 'string') {
            finalCustomFields[key] = String(finalCustomFields[key]);
          }
        });

        console.log(`✅ Custom fields extraídos para ${activityData.id}:`, finalCustomFields);

        const activity = {
          id: activityData.id,
          title: activityData.personalizedTitle || activityData.title,
          description: activityData.personalizedDescription || activityData.description,
          duration: activityData.duration || "30 min",
          difficulty: activityData.difficulty || "Médio",
          category: activityData.category || "educacional",
          type: activityData.type || "atividade",
          customFields: finalCustomFields,
          approved: true,
          isTrilhasEligible: isActivityEligibleForTrilhas(activityData.id),
          isBuilt: false,
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
    console.log('✅ Plano personalizado gerado com sucesso:', actionPlanItems);
    return actionPlanItems;

  } catch (error) {
    console.error('❌ Erro ao gerar plano personalizado:', error);

    // Em caso de erro, retorna o plano de fallback
    console.log('🔄 Usando plano de fallback devido ao erro');
    return generateFallbackPlan(initialMessage, contextualizationData);
  }
}
