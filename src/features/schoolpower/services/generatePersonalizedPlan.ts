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

    // Adicionar informações específicas para plano-aula
    const planoAulaSpecificInfo = `
ATENÇÃO ESPECIAL PARA PLANO-AULA:
Os campos obrigatórios são EXATAMENTE:
- Tema ou Tópico Central
- Ano/Série Escolar
- Componente Curricular
- Carga Horária
- Habilidades BNCC
- Objetivo Geral
- Materiais/Recursos
- Perfil da Turma
- Tipo de Aula
- Observações do Professor

USE EXATAMENTE ESTES NOMES DE CAMPOS para plano-aula!`;

    // Construir o prompt para a Gemini
    const prompt = `Você é uma IA especializada em gerar planos de ação educacionais para professores e coordenadores, seguindo e planejando exatamente o que eles pedem, e seguindo muito bem os requesitos, sendo super treinado, utilizando apenas as atividades possíveis listadas abaixo.

DADOS COLETADOS DO USUÁRIO:
- Mensagem inicial: "${initialMessage}"
- Matérias e temas: ${contextualizationData.materias || 'Não especificado'}
- Público-alvo: ${contextualizationData.publicoAlvo || 'Não especificado'}
- Restrições: "${contextualizationData.restricoes || 'Nenhuma'}"
- Datas importantes: "${contextualizationData.datasImportantes || 'Não informado'}"
- Observações: ${contextualizationData.observacoes || 'Nenhuma'}

ATIVIDADES DISPONÍVEIS: ${activitiesString}

CAMPOS PERSONALIZADOS POR ATIVIDADE:
${customFieldsInfo}

${planoAulaSpecificInfo}

INSTRUÇÕES CRÍTICAS:
1. ANALISE CUIDADOSAMENTE o pedido: "${initialMessage}"
2. IDENTIFIQUE TODAS as atividades específicas mencionadas (ex: "Quadro Interativo", "Sequência Didática", etc.)
3. INCLUA OBRIGATORIAMENTE todas as atividades específicas pedidas pelo usuário
4. Complete com 3-5 atividades complementares relevantes ao contexto
5. Para CADA atividade, PREENCHA os customFields com informações ESPECÍFICAS baseadas nos dados coletados
6. Use SEMPRE as matérias informadas (${contextualizationData.materias}) para personalizar os campos
7. Use SEMPRE o público-alvo informado (${contextualizationData.publicoAlvo}) nos campos relevantes
8. Retorne APENAS JSON válido no formato especificado abaixo

FORMATO DE RESPOSTA (JSON):
[
  {
    "id": "id-da-atividade-exata-da-lista",
    "personalizedTitle": "Título personalizado com a matéria: ${contextualizationData.materias}",
    "personalizedDescription": "Descrição detalhada personalizada baseada no contexto coletado",
    "customFields": {
      "campo1": "valor personalizado baseado nos dados coletados",
      "campo2": "valor personalizado baseado nos dados coletados"
    }
  }
]

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional antes ou depois.`;

  return prompt;
}

/**
 * Makes the call to the Gemini API
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  console.log('🚀 Making call to Gemini API...');
  console.log('🔑 API Key available:', !!GEMINI_API_KEY);
  console.log('🌐 API URL:', GEMINI_API_URL);

  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API Key is not configured');
  }

  try {
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3, // Reduced for more consistent responses
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 32768, // Significantly increased to support 50+ activities
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
      console.error('❌ Error in Gemini API response:', response.status, errorText);
      throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const data: GeminiResponse = await response.json();
    console.log('📥 Raw Gemini response:', data);

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error('❌ Empty response from Gemini API');
      throw new Error('Empty response from Gemini API');
    }

    console.log('✅ Text generated by Gemini:', generatedText);
    return generatedText;

  } catch (error) {
    console.error('❌ Error calling Gemini API:', error);
    throw error;
  }
}

/**
 * Processes and cleans the Gemini response
 */
function parseGeminiResponse(responseText: string): GeminiActivityResponse[] {
  console.log('🔍 Processing Gemini response...');

  try {
    // Removes markdown and other unwanted characters
    let cleanedText = responseText.trim();

    // Removes markdown code blocks if they exist
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Removes extra line breaks
    cleanedText = cleanedText.trim();

    console.log('🧹 Cleaned text:', cleanedText);

    // Attempts to parse the JSON
    const parsedActivities: GeminiActivityResponse[] = JSON.parse(cleanedText);

    if (!Array.isArray(parsedActivities)) {
      throw new Error('Response is not a valid array');
    }

    console.log('✅ Parsed activities:', parsedActivities);
    return parsedActivities;

  } catch (error) {
    console.error('❌ Error parsing response:', error);
    console.error('📝 Original text:', responseText);
    throw new Error('Error processing AI response');
  }
}

/**
 * Converts Gemini response to ActionPlanItem format
 */
function convertToActionPlanItems(
  geminiActivities: GeminiActivityResponse[],
  allowedActivities: typeof schoolPowerActivities
): ActionPlanItem[] {
  console.log('🔄 Converting activities to ActionPlanItems...');

  return geminiActivities.map(activity => {
    // Finds the original activity in the JSON for validation
    const originalActivity = allowedActivities.find(a => a.id === activity.id);

    if (!originalActivity) {
      console.warn(`⚠️ Activity not found: ${activity.id}`);
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

    console.log('✅ ActionPlanItem created:', actionPlanItem);
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
  console.log('🔄 Generating fallback plan...');

  // Selects relevant activities based on keywords
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

  // If no specific activities are found, uses the most popular ones
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

  // Removes limit to allow generation of more activities as needed
  // relevantActivities = relevantActivities.slice(0, 35);

  const fallbackPlan: ActionPlanItem[] = relevantActivities.map(activity => ({
    id: activity.id,
    title: `${activity.name} - ${contextualizationData.subjects || 'Personalized'}`,
    description: `${activity.description} Based on: "${initialMessage.substring(0, 100)}..."`,
    approved: false
  }));

  console.log('✅ Fallback plan generated:', fallbackPlan);
  return fallbackPlan;
}

/**
 * Main function to generate a personalized plan
 */
export async function generatePersonalizedPlan(
  initialMessage: string,
  contextualizationData: ContextualizationData
): Promise<ActionPlanItem[]> {
  console.log('🤖 Starting personalized plan generation...');
  console.log('📝 Input data:', { initialMessage, contextualizationData });

  try {
    // Validation of input data
    if (!initialMessage?.trim()) {
      throw new Error('Initial message is mandatory');
    }

    if (!contextualizationData) {
      throw new Error('Contextualization data is mandatory');
    }

    // Loads allowed activities
    console.log('📚 Available activities:', schoolPowerActivities.length);

    // Builds the structured prompt
    const prompt = buildGeminiPrompt(initialMessage, contextualizationData, schoolPowerActivities);
    console.log('📝 Prompt built successfully');

    // Calls the Gemini API
    const geminiResponse = await callGeminiAPI(prompt);

    // Processes the response
    const generatedActivities = parseGeminiResponse(geminiResponse);

    // Validates the returned activities
    const validatedActivities = await validateGeminiPlan(generatedActivities, schoolPowerActivities);

    // Processar cada atividade e extrair custom fields
    const actionPlanItems = validatedActivities.map(activityData => {
        console.log(`🔄 Processing activity: ${activityData.id}`);

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
                'Ano / Série': '9º Ano',
                'Disciplina': 'Português',
                'BNCC / Competências': 'EF89LP01, EF89LP02',
                'Público-alvo': 'Alunos do Ensino Fundamental',
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

        // Extract custom fields (all fields except standard ones)
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

        // Para Sequência Didática, garantir que todos os valores sejam strings
        if (activityData.id === 'sequencia-didatica') {
          Object.keys(finalCustomFields).forEach(key => {
            if (typeof finalCustomFields[key] !== 'string') {
              finalCustomFields[key] = String(finalCustomFields[key]);
            }
          });
        }

        console.log(`✅ Custom fields extracted for ${activityData.id}:`, finalCustomFields);

        const activity = {
          id: activityData.id,
          title: activityData.title,
          description: activityData.description,
          duration: activityData.duration,
          difficulty: activityData.difficulty,
          category: activityData.category,
          type: activityData.type,
          customFields: finalCustomFields,
          approved: true,
          isTrilhasEligible: true,
          isBuilt: false, // Will be marked as true after automatic build
          builtAt: null
        };

        console.log(`✅ Complete ActionPlanItem created for ${activityData.id}:`, activity);
        return activity;
    });

    if (validatedActivities.length === 0) {
      console.warn('⚠️ No valid activities returned, using fallback');
      return generateFallbackPlan(initialMessage, contextualizationData);
    }

    console.log(`✅ Total validated activities generated: ${validatedActivities.length}`);

    // Converts to ActionPlanItems
    const actionPlanItems2 = convertToActionPlanItems(validatedActivities, schoolPowerActivities);

    console.log('✅ Personalized plan generated successfully:', actionPlanItems);
    return actionPlanItems;

  } catch (error) {
    console.error('❌ Error generating personalized plan:', error);

    // In case of error, returns the fallback plan
    console.log('🔄 Using fallback plan due to error');
    return generateFallbackPlan(initialMessage, contextualizationData);
  }
}