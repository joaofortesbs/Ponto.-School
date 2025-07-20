
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
    console.log('📤 Prompt construído para Gemini:', prompt.substring(0, 200) + '...');

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

    console.log('📥 Status da resposta Gemini:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API Gemini:', response.status, errorText);
      throw new Error(`Erro na API Gemini: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('📥 Resposta completa da API Gemini:', result);
    
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      console.error('❌ Nenhum conteúdo foi gerado pela IA Gemini');
      throw new Error('Nenhum conteúdo foi gerado pela IA Gemini');
    }

    console.log('📥 Resposta bruta da IA Gemini:', generatedText);

    // Processar resposta da IA
    const activities = extractAndValidateActivities(generatedText, userMessage, quizResponses);
    
    if (activities.length > 0) {
      console.log('✅ Plano de ação gerado com sucesso via IA:', activities);
      return activities;
    } else {
      console.warn('⚠️ Nenhuma atividade válida extraída, usando fallback');
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
  const availableActivities = schoolPowerActivities
    .filter(activity => activity.enabled)
    .slice(0, 30)
    .map(activity => `${activity.id}: ${activity.title}`)
    .join('\n- ');

  const prompt = `Você é uma IA especializada em educação do School Power. Analise a solicitação do professor e gere 3-5 atividades personalizadas.

SOLICITAÇÃO DO PROFESSOR: "${userMessage}"

CONTEXTO EDUCACIONAL:
- Matérias/Disciplinas: ${quizResponses.subjects || 'Não especificado'}
- Público-alvo: ${quizResponses.audience || 'Não especificado'}  
- Restrições/Limitações: ${quizResponses.restrictions || 'Nenhuma'}
- Datas/Prazos: ${quizResponses.dates || 'Flexível'}
- Observações Adicionais: ${quizResponses.notes || 'Nenhuma'}

ATIVIDADES DISPONÍVEIS:
- ${availableActivities}

INSTRUÇÕES IMPORTANTES:
1. Retorne APENAS um JSON válido
2. Use SOMENTE IDs da lista de atividades disponíveis acima
3. Personalize títulos e descrições para o contexto específico
4. Retorne entre 3-5 atividades
5. Não inclua texto adicional antes ou depois do JSON

FORMATO DE RESPOSTA OBRIGATÓRIO:
[
  {
    "id": "id_da_atividade_disponivel",
    "title": "Título Personalizado para o Contexto",
    "description": "Descrição detalhada e personalizada considerando a solicitação"
  }
]`;

  return prompt;
}

function extractAndValidateActivities(
  generatedText: string, 
  userMessage: string, 
  quizResponses: ContextualizationData
): ActionPlanItem[] {
  try {
    console.log('🔍 Iniciando extração e validação das atividades...');
    
    // Tentar extrair JSON da resposta
    let jsonString = generatedText.trim();
    
    // Procurar por array JSON
    const jsonMatch = jsonString.match(/\[\s*{[\s\S]*}\s*\]/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
      console.log('✅ JSON encontrado via regex de array');
    } else {
      // Tentar encontrar JSON entre código
      const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        const codeContent = codeBlockMatch[1];
        const arrayMatch = codeContent.match(/\[\s*{[\s\S]*}\s*\]/);
        if (arrayMatch) {
          jsonString = arrayMatch[0];
          console.log('✅ JSON encontrado em bloco de código');
        }
      }
    }

    console.log('📋 JSON extraído para parsing:', jsonString);

    const generatedActivities: GeminiActivityResponse[] = JSON.parse(jsonString);
    console.log('🔍 Atividades extraídas da IA:', generatedActivities);

    // Validar se é um array
    if (!Array.isArray(generatedActivities)) {
      throw new Error('Resposta não é um array válido');
    }

    // Validar e filtrar atividades
    const validActivities = generatedActivities.filter(activity => {
      console.log(`🔍 Validando atividade: ${activity.id}`);
      
      const exists = schoolPowerActivities.some(available => 
        available.id === activity.id && available.enabled
      );
      const hasRequiredFields = activity.id && activity.title && activity.description;
      
      if (!exists) {
        console.warn(`⚠️ Atividade ${activity.id} não encontrada ou desabilitada na lista disponível`);
      }
      if (!hasRequiredFields) {
        console.warn(`⚠️ Atividade ${activity.id} tem campos obrigatórios faltando`);
      }
      
      return exists && hasRequiredFields;
    });

    console.log(`✅ ${validActivities.length} atividades válidas encontradas`);

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

    console.log('✅ Atividades convertidas para ActionPlanItem:', actionPlanItems);
    return actionPlanItems;

  } catch (parseError) {
    console.error('❌ Erro ao processar resposta da IA:', parseError);
    console.error('📄 Texto original:', generatedText);
    throw new Error('Erro ao processar resposta da IA Gemini');
  }
}

function generateIntelligentFallbackPlan(
  userMessage: string, 
  quizResponses: ContextualizationData
): ActionPlanItem[] {
  console.log('🔄 Gerando plano fallback inteligente...');
  console.log('📊 Dados para fallback:', { userMessage, quizResponses });
  
  // Combinar todas as informações para análise
  const allText = [
    userMessage || '',
    quizResponses.subjects || '',
    quizResponses.audience || '',
    quizResponses.notes || ''
  ].join(' ').toLowerCase();

  console.log('🔍 Texto combinado para análise:', allText);

  // Mapear palavras-chave para atividades específicas
  const keywordMapping = [
    { 
      keywords: ['caça palavras', 'caça-palavras', 'cruzadinha', 'palavra'], 
      activityIds: ['lista-exercicios', 'atividades-fixacao'],
      priority: 10 
    },
    { 
      keywords: ['colorir', 'pintar', 'desenho', 'imagem'], 
      activityIds: ['lista-exercicios', 'atividades-fixacao'],
      priority: 10 
    },
    { 
      keywords: ['verbos', 'verbo', 'conjugação', 'português', 'portugues'], 
      activityIds: ['lista-exercicios', 'atividades-fixacao', 'flashcards'],
      priority: 9 
    },
    { 
      keywords: ['redação', 'texto', 'escrita', 'redacao'], 
      activityIds: ['redacao-temas', 'lista-exercicios'],
      priority: 8 
    },
    { 
      keywords: ['prova', 'avaliação', 'teste', 'avaliacao'], 
      activityIds: ['prova-interativa', 'simulado-enem'],
      priority: 8 
    },
    { 
      keywords: ['resumo', 'revisão', 'revisao'], 
      activityIds: ['resumo-inteligente', 'flashcards'],
      priority: 7 
    },
    { 
      keywords: ['exercício', 'atividade', 'prática', 'exercicio', 'pratica'], 
      activityIds: ['lista-exercicios', 'atividades-fixacao'],
      priority: 6 
    },
    { 
      keywords: ['apresentação', 'slides', 'apresentacao'], 
      activityIds: ['apresentacao-slides', 'apostila-completa'],
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
      mapping.activityIds.forEach(activityId => {
        const score = matchCount * mapping.priority;
        activityScores[activityId] = (activityScores[activityId] || 0) + score;
        console.log(`📊 Atividade ${activityId} ganhou ${score} pontos (total: ${activityScores[activityId]})`);
      });
    }
  });

  // Selecionar atividades com maior pontuação
  let selectedActivityIds = Object.entries(activityScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id);

  console.log('🏆 Atividades selecionadas por pontuação:', selectedActivityIds);

  // Se não encontrou atividades específicas, usar padrão inteligente
  if (selectedActivityIds.length === 0) {
    selectedActivityIds = ['lista-exercicios', 'resumo-inteligente', 'prova-interativa'];
    console.log('📋 Usando atividades padrão:', selectedActivityIds);
  }

  // Garantir pelo menos 3 atividades
  const defaultActivities = ['apresentacao-slides', 'mapa-mental', 'cronograma-estudos', 'flashcards', 'atividades-fixacao'];
  while (selectedActivityIds.length < 3) {
    const nextDefault = defaultActivities.find(id => 
      !selectedActivityIds.includes(id) && 
      schoolPowerActivities.some(a => a.id === id && a.enabled)
    );
    if (nextDefault) {
      selectedActivityIds.push(nextDefault);
      console.log(`➕ Adicionada atividade padrão: ${nextDefault}`);
    } else {
      break;
    }
  }

  // Gerar atividades personalizadas
  const fallbackActivities: ActionPlanItem[] = selectedActivityIds.map(activityId => {
    const baseActivity = schoolPowerActivities.find(a => a.id === activityId && a.enabled);
    
    if (!baseActivity) {
      console.warn(`⚠️ Atividade ${activityId} não encontrada ou desabilitada`);
      return null;
    }

    const audience = quizResponses.audience || 'estudantes';
    const subject = quizResponses.subjects || 'o tema solicitado';

    return {
      id: baseActivity.id,
      title: `${baseActivity.title} - ${audience}`,
      description: `${baseActivity.description} Personalizado para ${subject} com foco em ${audience}.`,
      approved: false
    };
  }).filter(Boolean) as ActionPlanItem[];

  console.log('✅ Plano fallback inteligente gerado:', fallbackActivities);
  return fallbackActivities.slice(0, 5); // Máximo de 5 atividades
}
