
import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import schoolPowerActivities from '../data/schoolPowerActivities.json';

const GEMINI_API_KEY = 'AIzaSyD-Sso0SdyYKoA4M3tQhcWjQ1AoddB7Wo4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface GeminiActivityResponse {
  id: string;
  title: string;
  description: string;
}

export async function generatePersonalizedPlan(
  userMessage: string,
  quizResponses: ContextualizationData
): Promise<ActionPlanItem[]> {
  try {
    console.log('🤖 Iniciando geração de plano personalizado via API Gemini...');
    console.log('📝 Dados recebidos:', { userMessage, quizResponses });

    // Preparar payload estruturado
    const payload = {
      userMessage,
      quizResponses: {
        materiasETemas: quizResponses.subjects,
        publicoAlvo: quizResponses.audience,
        restricoes: quizResponses.restrictions,
        datasImportantes: quizResponses.dates,
        observacoes: quizResponses.notes
      },
      availableActivities: schoolPowerActivities
    };

    // Construir prompt para a API Gemini
    const prompt = `Você é a IA do School Power. Seu trabalho é gerar de 3 a 5 atividades personalizadas para um professor ou coordenador educacional, utilizando SOMENTE as atividades disponíveis abaixo.

Mensagem inicial:
"${userMessage}"

Respostas do Quiz:
- Matérias e temas: "${quizResponses.subjects}"
- Público-alvo: "${quizResponses.audience}"
- Restrições ou preferências: "${quizResponses.restrictions}"
- Datas importantes: "${quizResponses.dates}"
- Observações: "${quizResponses.notes}"

Atividades disponíveis:
${JSON.stringify(schoolPowerActivities, null, 2)}

Retorne um JSON válido com atividades, cada uma com:
- id (da atividade existente na lista acima)
- title (personalizado, curto e claro)
- description (personalizada, detalhada)

Exemplo de resposta:
[
  {
    "id": "prova-interativa",
    "title": "Prova de Redação - 28/07 - 3º Ano",
    "description": "Avaliação interativa com foco em dissertação argumentativa para o 3º ano."
  },
  {
    "id": "lista-exercicios",
    "title": "Lista de Exercícios - Verbos em Português",
    "description": "Exercícios práticos sobre conjugação e classificação de verbos para o 3º ano."
  }
]

Certifique-se de que:
1. Os IDs das atividades existam na lista fornecida
2. Os títulos sejam personalizados e relevantes
3. As descrições sejam detalhadas e específicas
4. Retorne entre 3 a 5 atividades
5. O JSON seja válido e bem formatado`;

    // Fazer chamada para API Gemini
    console.log('📤 Enviando requisição para API Gemini...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
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
      console.error('❌ Erro na API Gemini:', response.status, errorText);
      throw new Error(`Erro na API Gemini: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('Nenhum conteúdo foi gerado pela IA Gemini');
    }

    console.log('📥 Resposta bruta da IA Gemini:', generatedText);

    // Extrair JSON da resposta
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('⚠️ Formato JSON inválido, tentando extrair JSON de outra forma...');
      
      // Tentar encontrar JSON entre ```json```
      const codeBlockMatch = generatedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        const codeBlockContent = codeBlockMatch[1];
        const jsonInCodeBlock = codeBlockContent.match(/\[[\s\S]*\]/);
        if (jsonInCodeBlock) {
          return parseAndValidateActivities(jsonInCodeBlock[0], userMessage);
        }
      }
      
      throw new Error('Formato JSON inválido na resposta da IA');
    }

    return parseAndValidateActivities(jsonMatch[0], userMessage);

  } catch (error) {
    console.error('❌ Erro ao gerar plano personalizado:', error);
    
    // Retornar plano fallback personalizado
    console.log('🔄 Usando plano fallback personalizado...');
    return generateFallbackPlan(userMessage, quizResponses);
  }
}

function parseAndValidateActivities(jsonString: string, userMessage: string): ActionPlanItem[] {
  try {
    const generatedActivities: GeminiActivityResponse[] = JSON.parse(jsonString);
    console.log('🔍 Atividades extraídas:', generatedActivities);

    // Validar se todas as atividades existem na lista disponível
    const validActivities = generatedActivities.filter(activity => {
      const exists = schoolPowerActivities.some(available => available.id === activity.id);
      if (!exists) {
        console.warn(`⚠️ Atividade ${activity.id} não encontrada na lista de atividades disponíveis`);
      }
      return exists && activity.id && activity.title && activity.description;
    });

    if (validActivities.length === 0) {
      throw new Error('Nenhuma atividade válida foi gerada');
    }

    // Converter para formato ActionPlanItem
    const actionPlanItems: ActionPlanItem[] = validActivities.map(activity => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      approved: false
    }));

    console.log('✅ Plano de ação gerado com sucesso:', actionPlanItems);
    return actionPlanItems;

  } catch (parseError) {
    console.error('❌ Erro ao fazer parse do JSON:', parseError);
    throw new Error('Erro ao processar resposta da IA');
  }
}

function generateFallbackPlan(userMessage: string, quizResponses: ContextualizationData): ActionPlanItem[] {
  console.log('🔄 Gerando plano fallback personalizado...');
  
  // Selecionar atividades baseadas nas palavras-chave da mensagem e quiz
  const keywords = [
    userMessage.toLowerCase(),
    quizResponses.subjects.toLowerCase(),
    quizResponses.audience.toLowerCase(),
    quizResponses.notes.toLowerCase()
  ].join(' ');

  // Atividades prioritárias baseadas em palavras-chave comuns
  const priorityActivities = [
    { keywords: ['redação', 'texto', 'escrita'], id: 'lista-exercicios' },
    { keywords: ['prova', 'avaliação', 'teste'], id: 'prova-interativa' },
    { keywords: ['resumo', 'revisão'], id: 'resumo-inteligente' },
    { keywords: ['exercício', 'atividade'], id: 'lista-exercicios' },
    { keywords: ['apresentação', 'slides'], id: 'slides-educativos' }
  ];

  let selectedActivities: string[] = [];
  
  // Selecionar atividades baseadas nas palavras-chave
  for (const priority of priorityActivities) {
    if (priority.keywords.some(keyword => keywords.includes(keyword)) && 
        !selectedActivities.includes(priority.id)) {
      selectedActivities.push(priority.id);
    }
  }

  // Se não encontrou atividades específicas, usar atividades genéricas
  if (selectedActivities.length === 0) {
    selectedActivities = ['resumo-inteligente', 'lista-exercicios', 'prova-interativa'];
  }

  // Garantir 3-5 atividades
  while (selectedActivities.length < 3) {
    const randomActivity = schoolPowerActivities[Math.floor(Math.random() * schoolPowerActivities.length)];
    if (!selectedActivities.includes(randomActivity.id)) {
      selectedActivities.push(randomActivity.id);
    }
  }

  // Limitar a 5 atividades
  selectedActivities = selectedActivities.slice(0, 5);

  // Gerar atividades personalizadas
  const fallbackActivities: ActionPlanItem[] = selectedActivities.map(activityId => {
    const baseActivity = schoolPowerActivities.find(a => a.id === activityId);
    if (!baseActivity) {
      return {
        id: 'resumo-inteligente',
        title: 'Resumo Inteligente Personalizado',
        description: 'Resumo personalizado baseado no seu contexto de estudo.',
        approved: false
      };
    }

    return {
      id: baseActivity.id,
      title: `${baseActivity.title} - ${quizResponses.audience || 'Personalizado'}`,
      description: `${baseActivity.description} Personalizado para: ${quizResponses.subjects || 'seu contexto de estudo'}.`,
      approved: false
    };
  });

  console.log('✅ Plano fallback gerado:', fallbackActivities);
  return fallbackActivities;
}
