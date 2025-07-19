
import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import schoolPowerActivities from '../data/schoolPowerActivities.json';

const GEMINI_API_KEY = 'AIzaSyD-Sso0SdyYKoA4M3tQhcWjQ1AoddB7Wo4';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

interface GeminiPlanRequest {
  userMessage: string;
  quizResponses: {
    materiasETemas: string;
    publicoAlvo: string;
    restricoes: string;
    datasImportantes?: string;
    observacoes?: string;
  };
  availableActivities: any[];
}

interface GeminiPlanResponse {
  id: string;
  title: string;
  description: string;
}

export async function generatePersonalizedPlan(
  initialMessage: string,
  contextualizationData: ContextualizationData
): Promise<ActionPlanItem[]> {
  try {
    console.log('🚀 Iniciando geração de plano personalizado com API Gemini...');
    console.log('📊 Dados de entrada:', { initialMessage, contextualizationData });

    // Preparar dados para envio
    const requestData: GeminiPlanRequest = {
      userMessage: initialMessage,
      quizResponses: {
        materiasETemas: contextualizationData.subjects,
        publicoAlvo: contextualizationData.audience,
        restricoes: contextualizationData.restrictions,
        datasImportantes: contextualizationData.dates || '',
        observacoes: contextualizationData.notes || ''
      },
      availableActivities: schoolPowerActivities
    };

    // Construir prompt estruturado para a API Gemini
    const prompt = `Você é a IA do School Power. Seu trabalho é gerar de 3 a 5 atividades personalizadas para um professor ou coordenador educacional, utilizando SOMENTE as atividades disponíveis abaixo.

Mensagem inicial:
"${requestData.userMessage}"

Respostas do Quiz:
- Matérias e temas: "${requestData.quizResponses.materiasETemas}"
- Público-alvo: "${requestData.quizResponses.publicoAlvo}"
- Restrições ou preferências: "${requestData.quizResponses.restricoes}"
- Datas importantes: "${requestData.quizResponses.datasImportantes}"
- Observações: "${requestData.quizResponses.observacoes}"

Atividades disponíveis:
${JSON.stringify(requestData.availableActivities, null, 2)}

INSTRUÇÕES IMPORTANTES:
1. Retorne APENAS um JSON válido com um array de atividades
2. Cada atividade deve ter exatamente estes campos: id, title, description
3. O campo "id" deve corresponder exatamente a um id existente na lista de atividades disponíveis
4. O campo "title" deve ser personalizado, curto e claro, incluindo contexto específico do usuário
5. O campo "description" deve ser personalizada e alinhada ao contexto fornecido
6. Gere entre 3 a 5 atividades
7. NÃO inclua texto explicativo, apenas o JSON

Exemplo de formato esperado:
[
  {
    "id": "prova-interativa",
    "title": "Prova de Redação - 28/07 - 3º Ano",
    "description": "Avaliação interativa com foco em dissertação argumentativa para o 3º ano."
  },
  {
    "id": "resumo-inteligente",
    "title": "Resumo de Interpretação - 3º Ano",
    "description": "Resumo direcionado para técnicas de interpretação textual."
  }
]

Responda APENAS com o JSON válido:`;

    console.log('📤 Enviando requisição para API Gemini...');

    // Fazer requisição para API Gemini
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API Gemini: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('Nenhum conteúdo foi gerado pela IA Gemini');
    }

    console.log('📥 Resposta bruta da API Gemini:', generatedText);

    // Extrair JSON da resposta
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Formato JSON inválido na resposta da IA Gemini');
    }

    const generatedActivities: GeminiPlanResponse[] = JSON.parse(jsonMatch[0]);
    console.log('🔍 Atividades extraídas da IA:', generatedActivities);

    // Validar atividades geradas
    const validatedActivities = validateGeminiPlan(generatedActivities);
    
    if (validatedActivities.length === 0) {
      throw new Error('Nenhuma atividade válida foi gerada pela IA');
    }

    // Converter para formato ActionPlanItem
    const actionPlanItems: ActionPlanItem[] = validatedActivities.map(activity => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      approved: false
    }));

    console.log('✅ Plano personalizado gerado com sucesso:', actionPlanItems);
    return actionPlanItems;

  } catch (error) {
    console.error('❌ Erro ao gerar plano personalizado:', error);
    
    // Fallback com atividades básicas personalizadas
    const fallbackActivities: ActionPlanItem[] = generateFallbackPlan(initialMessage, contextualizationData);
    console.log('🔄 Usando plano fallback personalizado:', fallbackActivities);
    return fallbackActivities;
  }
}

function validateGeminiPlan(generatedActivities: GeminiPlanResponse[]): GeminiPlanResponse[] {
  console.log('🔍 Validando atividades geradas pela IA...');
  
  const validActivities = generatedActivities.filter(activity => {
    // Verificar se o ID existe na lista de atividades disponíveis
    const exists = schoolPowerActivities.some(available => available.id === activity.id);
    
    if (!exists) {
      console.warn(`⚠️ Atividade com ID "${activity.id}" não encontrada na lista de atividades disponíveis`);
      return false;
    }

    // Verificar se possui todos os campos obrigatórios
    if (!activity.id || !activity.title || !activity.description) {
      console.warn(`⚠️ Atividade com campos obrigatórios faltando:`, activity);
      return false;
    }

    return true;
  });

  console.log(`✅ ${validActivities.length} de ${generatedActivities.length} atividades são válidas`);
  return validActivities;
}

function generateFallbackPlan(
  initialMessage: string,
  contextualizationData: ContextualizationData
): ActionPlanItem[] {
  console.log('🔄 Gerando plano fallback personalizado...');
  
  // Selecionar atividades baseadas no contexto
  const baseActivities = [
    'resumo-inteligente',
    'lista-exercicios',
    'prova-interativa',
    'simulador-questoes',
    'cronograma-estudos'
  ];

  const fallbackItems: ActionPlanItem[] = baseActivities.slice(0, 3).map((activityId, index) => {
    const originalActivity = schoolPowerActivities.find(activity => activity.id === activityId);
    
    return {
      id: activityId,
      title: `${originalActivity?.title || 'Atividade'} - ${contextualizationData.audience}`,
      description: `${originalActivity?.description || 'Atividade personalizada'} adaptada para ${contextualizationData.subjects}`,
      approved: false
    };
  });

  return fallbackItems;
}

export { validateGeminiPlan };
