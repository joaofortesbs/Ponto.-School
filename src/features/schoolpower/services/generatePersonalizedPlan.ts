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

ESTRUTURA OBRIGATÓRIA DE ETAPAS DE DESENVOLVIMENTO:
Para plano-aula, você DEVE incluir um campo "etapas_desenvolvimento" que é um array de objetos com a seguinte estrutura:

"etapas_desenvolvimento": [
  {
    "id": "etapa-1",
    "titulo": "1. Introdução e Contextualização",
    "descricao": "Apresente o contexto específico do tema solicitado, conectando com a realidade dos alunos e estabelecendo a relevância do conteúdo...",
    "tipo_interacao": "Apresentação dialogada",
    "tempo_estimado": "15 minutos",
    "recursos_usados": ["Slides contextualizados", "Quadro interativo", "Exemplos do cotidiano"],
    "metodologia": "Aula expositiva dialogada",
    "objetivos_especificos": ["Contextualizar o tema específico", "Ativar conhecimentos prévios dos alunos"],
    "atividades_praticas": "Discussão inicial sobre experiências dos alunos relacionadas ao tema",
    "avaliacao": "Participação ativa nas discussões iniciais",
    "observacoes": "Adaptar exemplos para o nível da série e realidade local"
  },
  {
    "id": "etapa-2",
    "titulo": "2. Desenvolvimento do Conteúdo",
    "descricao": "Exposição sistemática dos conceitos fundamentais do tema, adequada para a série especificada...",
    "tipo_interacao": "Explicação interativa + demonstração",
    "tempo_estimado": "20 minutos",
    "recursos_usados": ["Material didático específico", "Recursos visuais", "Exemplos práticos"],
    "metodologia": "Metodologia ativa com demonstrações",
    "objetivos_especificos": ["Compreender conceitos fundamentais", "Relacionar teoria e prática"],
    "atividades_praticas": "Resolução de problemas contextualizados sobre o tema",
    "avaliacao": "Acompanhamento da compreensão através de perguntas direcionadas",
    "observacoes": "Pausar para esclarecimentos e verificar compreensão individual"
  }
]

INSTRUÇÕES ESPECÍFICAS PARA ETAPAS:
- GERE SEMPRE ENTRE 3-6 ETAPAS PERSONALIZADAS baseadas no contexto específico fornecido
- CADA ETAPA deve ser única e adequada ao tema, disciplina e série especificados
- NUNCA use exemplos genéricos - sempre contextualize com o tema fornecido
- VARIE os tipos de interação e metodologias entre as etapas
- ADAPTE o tempo estimado conforme a complexidade do conteúdo
- INCLUA recursos específicos para cada etapa baseados no tema

USE EXATAMENTE ESTES NOMES DE CAMPOS para plano-aula!`;

    // Construir o prompt para a Gemini
    const prompt = `Você é uma IA especializada em gerar planos de ação educacionais para professores e coordenadores, seguindo e planejando exatamente o que eles pedem, e seguindo muito bem os requesitos, sendo super treinado, utilizando apenas as atividades possíveis listadas abaixo.

Here are the collected information:

DATA:
- Request: "${initialMessage}"
- Subjects and themes: ${contextualizationData?.subjects || 'General'}
- Audience: ${contextualizationData?.audience || 'Students'}
- Restrictions: "${contextualizationData?.restrictions || 'undefined'}"
- Important dates: "${contextualizationData?.dates || 'undefined'}"
- Observations: ${contextualizationData?.notes || 'None'}

AVAILABLE ACTIVITIES: ${activitiesString}

CUSTOM FIELDS PER ACTIVITY:
${customFieldsInfo}

${planoAulaSpecificInfo}

INSTRUCTIONS:
1. Carefully analyze the request and provided information
2. Select ONLY activities from the available list that are relevant to the request
3. Generate a COMPREHENSIVE action plan with 15-50 different activities according to the request complexity
4. Each activity must have a personalized and descriptive title
5. The description must be specific and detailed for the given context
6. Use the exact IDs of the available activities
7. Vary duration and difficulty as appropriate
8. MANDATORY: For each activity, fill ALL custom fields listed above for that specific ID
9. Custom fields must contain realistic, contextualized, and specific data - NEVER leave them empty or generic
10. All extra fields must be strings (plain text)
11. Prioritize diversity of activity types for a complete and comprehensive plan

RESPONSE FORMAT (JSON):
Return ONLY a valid JSON array with the selected activities, following this exact format:

[
  {
    "id": "exact-activity-id",
    "title": "Personalized activity title",
    "description": "Specific and detailed activity description for this context",
    "duration": "XX min",
    "difficulty": "Easy/Medium/Hard",
    "category": "Subject category",
    "type": "activity",
    "Custom Field 1": "Specific and realistic value",
    "Custom Field 2": "Specific and realistic value",
    "Custom Field N": "Specific and realistic value"
  }
]

EXAMPLE for exercise-list:
{
  "id": "lista-exercicios",
  "title": "Exercise List: Nouns and Verbs",
  "description": "Development of an exercise list covering the identification, classification, and use of nouns and verbs in different contexts.",
  "duration": "30 min",
  "difficulty": "Medium",
  "category": "Grammar",
  "type": "activity",
  "Number of Questions": "10 mixed questions involving common and proper nouns, as well as regular verbs",
  "Theme": "Nouns and Verbs",
  "Subject": "Portuguese Language",
  "Grade Level": "6th Grade",
  "Difficulty Level": "Intermediate",
  "Question Model": "Objective and essay questions",
  "Sources": "Projeto Ápis textbook and site TodaMatéria"
}

REMEMBER:
- ALL custom fields MUST be filled for EACH activity
- Values must be specific, detailed, and contextualized
- NEVER leave a field empty or with a generic value
- Each activity must have ALL its custom fields filled

IMPORTANT:
- Use ONLY available IDs from the list
- FILL ALL custom fields for each activity
- Field data must be specific, realistic, and contextualized
- DO NOT include explanations before or after the JSON
- DO NOT use markdown or formatting
- Return ONLY the valid JSON array`;

  return prompt;
}

/**
 * Makes the call to the Gemini API
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  console.log('🚀 Making call to Gemini API...');
  console.log('📤 Sent Prompt (first 300 chars):', prompt.substring(0, 300));
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
    const geminiActivities = parseGeminiResponse(geminiResponse);

    // Validates the returned activities
    const validatedActivities = await validateGeminiPlan(geminiActivities, schoolPowerActivities);



    // Maps validated activities to the ActionPlanItem format
    const actionPlanItems = validatedActivities.map(activityData => {
        // Extracts custom fields from the activity
        const customFields: Record<string, string> = {};

        // Gets all fields that are not standard system fields
        const standardFields = ['id', 'title', 'description', 'duration', 'difficulty', 'category', 'type', 'personalizedTitle', 'personalizedDescription'];

        Object.keys(activityData).forEach(key => {
            if (!standardFields.includes(key) && typeof activityData[key] === 'string') {
                customFields[key] = activityData[key];
            }
        });

        console.log(`✅ Custom fields extracted for ${activityData.id}:`, customFields);

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