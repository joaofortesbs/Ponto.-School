
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

    // Construir prompt otimizado para a API Gemini
    const prompt = createOptimizedPrompt(userMessage, quizResponses);

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

    // Processar resposta da IA
    const activities = extractAndValidateActivities(generatedText, userMessage, quizResponses);
    
    if (activities.length > 0) {
      console.log('✅ Plano de ação gerado com sucesso via IA:', activities);
      return activities;
    } else {
      throw new Error('Nenhuma atividade válida foi extraída da resposta da IA');
    }

  } catch (error) {
    console.error('❌ Erro ao gerar plano personalizado via IA:', error);
    
    // Retornar plano fallback inteligente
    console.log('🔄 Usando plano fallback inteligente...');
    return generateIntelligentFallbackPlan(userMessage, quizResponses);
  }
}

function createOptimizedPrompt(userMessage: string, quizResponses: ContextualizationData): string {
  // Criar lista compacta de atividades disponíveis
  const availableActivities = schoolPowerActivities.slice(0, 20).map(activity => 
    `${activity.id}: ${activity.title}`
  ).join(', ');

  return `Você é uma IA especializada em educação. Analise a solicitação do professor e gere 3-5 atividades personalizadas.

SOLICITAÇÃO: "${userMessage}"

CONTEXTO:
- Matérias: ${quizResponses.subjects}
- Público: ${quizResponses.audience}  
- Restrições: ${quizResponses.restrictions}
- Datas: ${quizResponses.dates}
- Observações: ${quizResponses.notes}

ATIVIDADES DISPONÍVEIS: ${availableActivities}

RESPONDA APENAS COM JSON VÁLIDO:
[
  {
    "id": "id_da_atividade_disponivel",
    "title": "Título Personalizado",
    "description": "Descrição detalhada e personalizada"
  }
]

REGRAS:
1. Use apenas IDs da lista de atividades disponíveis
2. Personalize títulos e descrições para o contexto específico
3. Retorne 3-5 atividades
4. JSON válido apenas, sem texto adicional`;
}

function extractAndValidateActivities(
  generatedText: string, 
  userMessage: string, 
  quizResponses: ContextualizationData
): ActionPlanItem[] {
  try {
    // Tentar extrair JSON da resposta
    let jsonString = generatedText.trim();
    
    // Procurar por array JSON
    const jsonMatch = jsonString.match(/\[\s*{[\s\S]*}\s*\]/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    } else {
      // Tentar encontrar JSON entre código
      const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        const codeContent = codeBlockMatch[1];
        const arrayMatch = codeContent.match(/\[\s*{[\s\S]*}\s*\]/);
        if (arrayMatch) {
          jsonString = arrayMatch[0];
        }
      }
    }

    const generatedActivities: GeminiActivityResponse[] = JSON.parse(jsonString);
    console.log('🔍 Atividades extraídas da IA:', generatedActivities);

    // Validar e filtrar atividades
    const validActivities = generatedActivities.filter(activity => {
      const exists = schoolPowerActivities.some(available => available.id === activity.id);
      const hasRequiredFields = activity.id && activity.title && activity.description;
      
      if (!exists) {
        console.warn(`⚠️ Atividade ${activity.id} não encontrada na lista disponível`);
      }
      if (!hasRequiredFields) {
        console.warn(`⚠️ Atividade ${activity.id} tem campos obrigatórios faltando`);
      }
      
      return exists && hasRequiredFields;
    });

    if (validActivities.length === 0) {
      throw new Error('Nenhuma atividade válida foi gerada pela IA');
    }

    // Converter para ActionPlanItem
    const actionPlanItems: ActionPlanItem[] = validActivities.map(activity => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      approved: false
    }));

    return actionPlanItems;

  } catch (parseError) {
    console.error('❌ Erro ao processar resposta da IA:', parseError);
    throw new Error('Erro ao processar resposta da IA Gemini');
  }
}

function generateIntelligentFallbackPlan(
  userMessage: string, 
  quizResponses: ContextualizationData
): ActionPlanItem[] {
  console.log('🔄 Gerando plano fallback inteligente...');
  
  // Combinar todas as informações para análise
  const allText = [
    userMessage,
    quizResponses.subjects,
    quizResponses.audience,
    quizResponses.notes
  ].join(' ').toLowerCase();

  // Mapear palavras-chave para atividades específicas
  const keywordMapping = [
    { 
      keywords: ['caça palavras', 'caça-palavras', 'cruzadinha'], 
      activityId: 'caca-palavras',
      priority: 10 
    },
    { 
      keywords: ['colorir', 'pintar', 'desenho'], 
      activityId: 'atividade-colorir',
      priority: 10 
    },
    { 
      keywords: ['verbos', 'verbo', 'conjugação'], 
      activityId: 'lista-exercicios',
      priority: 9 
    },
    { 
      keywords: ['redação', 'texto', 'escrita'], 
      activityId: 'lista-exercicios',
      priority: 8 
    },
    { 
      keywords: ['prova', 'avaliação', 'teste'], 
      activityId: 'prova-interativa',
      priority: 8 
    },
    { 
      keywords: ['resumo', 'revisão'], 
      activityId: 'resumo-inteligente',
      priority: 7 
    },
    { 
      keywords: ['exercício', 'atividade', 'prática'], 
      activityId: 'lista-exercicios',
      priority: 6 
    },
    { 
      keywords: ['apresentação', 'slides'], 
      activityId: 'slides-educativos',
      priority: 6 
    }
  ];

  // Pontuar atividades baseado nas palavras-chave
  const activityScores: { [key: string]: number } = {};
  
  keywordMapping.forEach(mapping => {
    const matchCount = mapping.keywords.filter(keyword => 
      allText.includes(keyword)
    ).length;
    
    if (matchCount > 0) {
      const score = matchCount * mapping.priority;
      activityScores[mapping.activityId] = (activityScores[mapping.activityId] || 0) + score;
    }
  });

  // Selecionar atividades com maior pontuação
  let selectedActivityIds = Object.entries(activityScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id);

  // Se não encontrou atividades específicas, usar padrão inteligente
  if (selectedActivityIds.length === 0) {
    selectedActivityIds = ['lista-exercicios', 'resumo-inteligente', 'prova-interativa'];
  }

  // Garantir pelo menos 3 atividades
  const defaultActivities = ['slides-educativos', 'mapa-mental', 'cronograma-estudos'];
  while (selectedActivityIds.length < 3) {
    const nextDefault = defaultActivities.find(id => !selectedActivityIds.includes(id));
    if (nextDefault) {
      selectedActivityIds.push(nextDefault);
    } else {
      break;
    }
  }

  // Gerar atividades personalizadas
  const fallbackActivities: ActionPlanItem[] = selectedActivityIds.map(activityId => {
    const baseActivity = schoolPowerActivities.find(a => a.id === activityId);
    
    if (!baseActivity) {
      return {
        id: 'resumo-inteligente',
        title: 'Resumo Inteligente Personalizado',
        description: `Resumo personalizado baseado em: ${quizResponses.subjects || 'seu contexto de estudo'}.`,
        approved: false
      };
    }

    const audience = quizResponses.audience || 'estudantes';
    const subject = quizResponses.subjects || 'o tema solicitado';

    return {
      id: baseActivity.id,
      title: `${baseActivity.title} - ${audience}`,
      description: `${baseActivity.description} Personalizado para ${subject} com foco em ${audience}.`,
      approved: false
    };
  });

  console.log('✅ Plano fallback inteligente gerado:', fallbackActivities);
  return fallbackActivities.slice(0, 5); // Máximo de 5 atividades
}
