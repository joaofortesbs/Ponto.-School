import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import schoolPowerActivities from '../data/schoolPowerActivities.json';
import activityFieldsSchema from '../data/activityFieldsSchema.json';
import { isActivityEligibleForTrilhas } from '../data/trilhasActivitiesConfig';
import { validateGeminiPlan } from './validateGeminiPlan';
import { processAIGeneratedContent } from './exerciseListProcessor';
import { sequenciaDidaticaPrompt } from '../prompts/sequenciaDidaticaPrompt';
import { validateSequenciaDidaticaData } from './sequenciaDidaticaValidator';
import { geminiLogger } from '../../../utils/geminiDebugLogger';

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
- Return ONLY the valid JSON array

        IMPORTANTE: Para atividades do tipo "quadro-interativo", use OBRIGATORIAMENTE estes campos específicos:
        - "Disciplina / Área de conhecimento": string com a disciplina
        - "Ano / Série": string com ano/série escolar
        - "Tema ou Assunto da aula": string com o tema principal
        - "Objetivo de aprendizagem da aula": string com objetivos específicos
        - "Nível de Dificuldade": string (Básico/Intermediário/Avançado)
        - "Atividade mostrada": string descrevendo a atividade interativa

        IMPORTANTE: Para atividades do tipo "mapa-mental", use OBRIGATORIAMENTE estes campos específicos:
        - "Título": string com o título do mapa mental
        - "Descrição": string com descrição detalhada da atividade
        - "Tema Central": string com o tema central do mapa (ex: "Revolução Francesa")
        - "Categorias Principais": string com as categorias principais (ex: "Causas, Fases, Consequências")
        - "Objetivo Geral": string com objetivo geral da atividade
        - "Critérios de Avaliação": string com critérios de avaliação

        EXEMPLO para quadro-interativo:
        {
          "id": "quadro-interativo",
          "title": "Quadro Interativo: Frações",
          "description": "Atividade interativa para ensino de frações usando quadro digital",
          "duration": "45 min",
          "difficulty": "Intermediário",
          "category": "Matemática",
          "type": "activity",
          "Disciplina / Área de conhecimento": "Matemática",
          "Ano / Série": "5º Ano",
          "Tema ou Assunto da aula": "Frações e suas representações",
          "Objetivo de aprendizagem da aula": "Compreender o conceito de frações e suas representações visuais",
          "Nível de Dificuldade": "Intermediário",
          "Atividade mostrada": "Jogo interativo de arrastar e soltar para montar frações"
        }

        EXEMPLO para mapa-mental:
        {
          "id": "mapa-mental",
          "title": "Mapa Mental: Teorema de Pitágoras",
          "description": "Criação de um mapa mental para organizar visualmente os conceitos e aplicações do Teorema de Pitágoras",
          "duration": "40 min",
          "difficulty": "Médio",
          "category": "Matemática",
          "type": "activity",
          "Título": "Mapa Mental: Teorema de Pitágoras",
          "Descrição": "Criação de um mapa mental para organizar visualmente os conceitos e aplicações do Teorema de Pitágoras",
          "Tema Central": "Teorema de Pitágoras",
          "Categorias Principais": "Conceitos Principais, Fórmulas, Aplicações Práticas, Demonstrações",
          "Objetivo Geral": "Organizar e compreender os conceitos fundamentais do Teorema de Pitágoras através de representação visual",
          "Critérios de Avaliação": "Clareza na organização, correção dos conceitos, criatividade na apresentação, completude das informações"
        }
`;

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

  // Log detalhado da requisição
  geminiLogger.info('request', 'Iniciando chamada para API Gemini', {
    prompt_length: prompt.length,
    api_key_available: !!GEMINI_API_KEY,
    api_url: GEMINI_API_URL
  });

  if (!GEMINI_API_KEY) {
    geminiLogger.error('error', 'Chave da API Gemini não configurada');
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

    // Log da requisição
    geminiLogger.logRequest(prompt, requestBody.generationConfig);

    const startTime = Date.now();
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const executionTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error in Gemini API response:', response.status, errorText);

      // Log do erro HTTP
      geminiLogger.error('error', `Erro HTTP na API Gemini: ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
        errorText,
        executionTime
      });

      throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const data: GeminiResponse = await response.json();
    console.log('📥 Raw Gemini response:', data);

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error('❌ Empty response from Gemini API');

      // Log resposta vazia
      geminiLogger.error('response', 'Resposta vazia da API Gemini', {
        executionTime,
        responseData: data
      });

      throw new Error('Empty response from Gemini API');
    }

    console.log('✅ Text generated by Gemini:', generatedText);

    // Log resposta bem-sucedida
    geminiLogger.logResponse(data, executionTime);

    return generatedText;

  } catch (error) {
    console.error('❌ Error calling Gemini API:', error);

    // Log erro geral
    geminiLogger.logError(error instanceof Error ? error : new Error(String(error)), {
      prompt_length: prompt.length,
      api_url: GEMINI_API_URL
    });

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
    const actionPlanItems = await Promise.all(validatedActivities.map(async (activityData) => {
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

        // Processamento específico para Quadro Interativo
        if (activityData.id === 'quadro-interativo') {
          console.log('🎯 Processando especificamente Quadro Interativo');

          // Garantir que todos os campos obrigatórios estejam presentes
          const requiredFields = {
            'Disciplina / Área de conhecimento': activityData['Disciplina / Área de conhecimento'] || 'Matemática',
            'Ano / Série': activityData['Ano / Série'] || '6º Ano',
            'Tema ou Assunto da aula': activityData['Tema ou Assunto da aula'] || activityData.title || 'Tema da Aula',
            'Objetivo de aprendizagem da aula': activityData['Objetivo de aprendizagem da aula'] || activityData.description || 'Objetivos de aprendizagem',
            'Nível de Dificuldade': activityData['Nível de Dificuldade'] || 'Intermediário',
            'Atividade mostrada': activityData['Atividade mostrada'] || 'Atividade interativa no quadro'
          };

          // Atualizar os dados da atividade
          activityData = {
            ...activityData,
            customFields: requiredFields,
            isQuadroInterativo: true,
            readyForGeneration: true
          };

          console.log('✅ Quadro Interativo processado com campos obrigatórios:', requiredFields);
        }

        // Processamento específico para Mapa Mental
        if (activityData.id === 'mapa-mental') {
          console.log('🧠 Processando especificamente Mapa Mental');

          // Garantir que todos os campos obrigatórios estejam presentes
          const requiredFields = {
            'Título': activityData['Título'] || activityData.title || 'Mapa Mental',
            'Descrição': activityData['Descrição'] || activityData.description || 'Criação de um mapa mental para organizar conhecimentos',
            'Tema Central': activityData['Tema Central'] || 'Tema a ser definido',
            'Categorias Principais': activityData['Categorias Principais'] || 'Categorias a serem definidas',
            'Objetivo Geral': activityData['Objetivo Geral'] || 'Organizar e visualizar conhecimentos de forma estruturada',
            'Critérios de Avaliação': activityData['Critérios de Avaliação'] || 'Clareza, organização, completude e criatividade'
          };

          // Atualizar os dados da atividade
          activityData = {
            ...activityData,
            customFields: requiredFields,
            isMapaMental: true,
            readyForGeneration: true
          };

          console.log('✅ Mapa Mental processado com campos obrigatórios:', requiredFields);
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
        let finalCustomFields = activityData.customFields || customFields || {};

        // Para Sequência Didática, garantir que todos os valores sejam strings
        if (activityData.id === 'sequencia-didatica') {
          Object.keys(finalCustomFields).forEach(key => {
            if (typeof finalCustomFields[key] !== 'string') {
              finalCustomFields[key] = String(finalCustomFields[key]);
            }
          });
        }

        // Para Quadro Interativo, garantir que todos os valores sejam strings
        if (activityData.id === 'quadro-interativo') {
          Object.keys(finalCustomFields).forEach(key => {
            if (typeof finalCustomFields[key] !== 'string') {
              finalCustomFields[key] = String(finalCustomFields[key]);
            }
          });
        }

        // Processar campos específicos para flash-cards
        if (activityData.id === 'flash-cards') {
          finalCustomFields = {
            titulo: activityData.titulo || activityData.title || '',
            descricao: activityData.descricao || activityData.description || '',
            tema: activityData.tema || activityData.theme || '',
            topicos: activityData.topicos || activityData.topics || '',
            numeroFlashcards: activityData.numeroFlashcards || activityData.numberOfFlashcards || '10',
            contexto: activityData.contexto || activityData.context || ''
          };
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
    }));

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