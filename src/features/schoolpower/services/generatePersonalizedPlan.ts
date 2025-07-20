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
    console.log('📝 Dados coletados:', { message: userMessage, contextData: quizResponses });

    // Construir prompt otimizado para a API Gemini
    const prompt = createOptimizedPrompt(userMessage, quizResponses);
    console.log('📤 Enviando prompt para Gemini API...');

    // Fazer chamada para API Gemini
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
    console.log('📥 Resposta bruta da API Gemini:', result);

    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('Nenhum conteúdo foi gerado pela IA Gemini');
    }

    console.log('📥 Texto gerado pela Gemini:', generatedText);

    // Processar resposta da IA
    const activities = extractAndValidateActivities(generatedText);

    if (activities.length > 0) {
      console.log('✅ Plano de ação gerado com sucesso via IA:', activities);
      return activities;
    } else {
      throw new Error('Nenhuma atividade válida foi extraída da resposta da IA');
    }

  } catch (error) {
    console.error('❌ Erro ao gerar plano personalizado via IA:', error);

    // Retornar plano fallback inteligente
    console.log('🔄 Usando plano de ação fallback:');
    return generateIntelligentFallbackPlan(userMessage, quizResponses);
  }
}

function createOptimizedPrompt(userMessage: string, quizResponses: ContextualizationData): string {
  const prompt = `Você é a IA do School Power. Gere entre 3 e 5 atividades personalizadas, utilizando SOMENTE as atividades disponíveis abaixo.

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

Retorne APENAS em formato JSON válido:
[
  {
    "id": "id_existente_da_lista",
    "title": "Título personalizado com base nos dados fornecidos",
    "description": "Descrição personalizada detalhada com base nos dados fornecidos"
  }
]

IMPORTANTE: Use apenas IDs que existem na lista de atividades disponíveis. Personalize os títulos e descrições baseado nos dados fornecidos pelo usuário.`;

  return prompt;
}

function extractAndValidateActivities(generatedText: string): ActionPlanItem[] {
  try {
    // Tentar extrair JSON da resposta
    let jsonString = generatedText.trim();

    // Procurar por array JSON na resposta
    const jsonMatch = jsonString.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    } else {
      // Tentar encontrar JSON entre códigos
      const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        const codeContent = codeBlockMatch[1];
        const arrayMatch = codeContent.match(/\[\s*\{[\s\S]*?\}\s*\]/);
        if (arrayMatch) {
          jsonString = arrayMatch[0];
        }
      }
    }

    const generatedActivities: GeminiActivityResponse[] = JSON.parse(jsonString);
    console.log('🔍 Atividades extraídas da IA:', generatedActivities);

    if (!Array.isArray(generatedActivities)) {
      throw new Error('Resposta da IA não é um array válido');
    }

    // Validar e filtrar atividades usando o validateGeminiPlan
    const { validateGeminiPlan } = require('./validateGeminiPlan');
    const validationResult = validateGeminiPlan(generatedActivities);

    if (validationResult.isValid && validationResult.validActivities.length > 0) {
      console.log('✅ Atividades validadas com sucesso:', validationResult.validActivities);
      return validationResult.validActivities;
    } else {
      console.warn('⚠️ Validação falhou, usando fallback:', validationResult.errors);
      throw new Error('Atividades geradas pela IA não passaram na validação');
    }

  } catch (parseError) {
    console.error('❌ Erro ao processar resposta da IA:', parseError);
    throw new Error('Erro ao processar resposta da IA Gemini');
  }
}

function generateIntelligentFallbackPlan(
  userMessage: string, 
  quizResponses: ContextualizationData
): ActionPlanItem[] {
  console.log('🔄 Gerando plano fallback inteligente baseado nos dados do usuário...');

  // Combinar todas as informações para análise
  const allText = [
    userMessage,
    quizResponses.subjects,
    quizResponses.audience,
    quizResponses.notes
  ].join(' ').toLowerCase();

  // Mapear palavras-chave para atividades específicas
  const keywordMapping = [
    { keywords: ['caça palavras', 'caça-palavras', 'cruzadinha'], activityId: 'caca-palavras', priority: 10 },
    { keywords: ['colorir', 'pintar', 'desenho'], activityId: 'atividade-colorir', priority: 10 },
    { keywords: ['verbos', 'verbo', 'conjugação'], activityId: 'lista-exercicios', priority: 9 },
    { keywords: ['redação', 'texto', 'escrita'], activityId: 'lista-exercicios', priority: 8 },
    { keywords: ['prova', 'avaliação', 'teste'], activityId: 'prova-interativa', priority: 8 },
    { keywords: ['resumo', 'revisão'], activityId: 'resumo-inteligente', priority: 7 },
    { keywords: ['exercício', 'atividade', 'prática'], activityId: 'lista-exercicios', priority: 6 },
    { keywords: ['apresentação', 'slides'], activityId: 'slides-educativos', priority: 6 }
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

  // Gerar atividades personalizadas baseadas nos dados reais
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

    // Personalizar baseado nos dados do usuário
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
  return fallbackActivities.slice(0, 5);
}