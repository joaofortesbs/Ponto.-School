
import { GEMINI_API_KEY, schoolPowerActivities, ActionPlanActivity } from '../activitiesManager';
import { ContextualizationData } from '../contextualization/ContextualizationCard';

export interface GenerateActionPlanParams {
  initialMessage: string;
  contextualizationData: ContextualizationData;
}

export async function generateActionPlan(params: GenerateActionPlanParams): Promise<ActionPlanActivity[]> {
  const { initialMessage, contextualizationData } = params;
  
  try {
    // Preparar lista de atividades disponíveis para o prompt
    const availableActivities = schoolPowerActivities.map(activity => 
      `- ${activity.id}: ${activity.title} - ${activity.description}`
    ).join('\n');

    // Construir prompt detalhado para a IA
    const prompt = `Você é uma IA especializada em gerar planos de ação para professores utilizando apenas as atividades possíveis listadas abaixo.

Aqui estão as informações coletadas:

Mensagem inicial do professor:
"${initialMessage}"

Respostas do Quiz de Contextualização:
- Matérias e temas: "${contextualizationData.subjects}"
- Público-alvo: "${contextualizationData.audience}"
- Restrições: "${contextualizationData.restrictions}"
- Datas importantes: "${contextualizationData.dates}"
- Observações adicionais: "${contextualizationData.notes}"

Lista completa de atividades disponíveis no School Power:
${availableActivities}

Com base nessas informações, gere um plano de ação em formato JSON com entre 5 a 8 atividades, utilizando APENAS as atividades listadas acima. Para cada atividade, crie um título personalizado e uma descrição personalizada que seja relevante aos dados coletados.

Formato de resposta esperado (JSON válido):
[
  {
    "id": "id-da-atividade-da-lista",
    "title": "Título original da atividade",
    "description": "Descrição original da atividade",
    "personalizedTitle": "Título personalizado baseado no contexto (ex: 'Prova de Matemática para 27/07')",
    "personalizedDescription": "Descrição personalizada explicando como essa atividade específica vai ajudar no contexto fornecido",
    "approved": false
  }
]

IMPORTANTE: 
- Use APENAS os IDs das atividades que estão na lista fornecida
- Personalize os títulos e descrições para serem relevantes ao contexto
- Inclua datas específicas se mencionadas pelo professor
- Foque nas matérias e temas mencionados
- Considere o público-alvo ao personalizar as atividades
- Retorne APENAS o JSON, sem texto adicional`;

    // Fazer chamada para a API Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('Resposta vazia da API Gemini');
    }

    // Extrair JSON da resposta
    let jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      // Tentar encontrar o JSON de outra forma
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
    }

    if (!jsonMatch) {
      throw new Error('Não foi possível extrair JSON válido da resposta da IA');
    }

    const generatedActivities: ActionPlanActivity[] = JSON.parse(jsonMatch[0]);

    // Validar se todas as atividades existem na lista disponível
    const validActivities = generatedActivities.filter(activity => {
      const exists = schoolPowerActivities.some(available => available.id === activity.id);
      if (!exists) {
        console.warn(`Atividade ${activity.id} não encontrada na lista de atividades disponíveis`);
      }
      return exists;
    });

    if (validActivities.length === 0) {
      throw new Error('Nenhuma atividade válida foi gerada pela IA');
    }

    // Garantir que todas as atividades tenham as propriedades necessárias
    const finalActivities = validActivities.map(activity => ({
      ...activity,
      approved: false, // Sempre começar com false
      personalizedTitle: activity.personalizedTitle || activity.title,
      personalizedDescription: activity.personalizedDescription || activity.description
    }));

    console.log('✅ Plano de ação gerado com sucesso:', finalActivities);
    return finalActivities;

  } catch (error) {
    console.error('❌ Erro ao gerar plano de ação:', error);
    
    // Fallback: retornar algumas atividades padrão baseadas no contexto
    const fallbackActivities: ActionPlanActivity[] = [
      {
        id: "plano-aula",
        title: "Plano de Aula",
        description: "Desenvolve planos detalhados para aulas específicas",
        personalizedTitle: `Plano de Aula - ${contextualizationData.subjects}`,
        personalizedDescription: `Plano detalhado para aula de ${contextualizationData.subjects} direcionado para ${contextualizationData.audience}`,
        approved: false
      },
      {
        id: "lista-exercicios",
        title: "Lista de Exercícios",
        description: "Gera questões objetivas ou dissertativas com gabarito",
        personalizedTitle: `Lista de Exercícios - ${contextualizationData.subjects}`,
        personalizedDescription: `Exercícios personalizados de ${contextualizationData.subjects} para ${contextualizationData.audience}`,
        approved: false
      },
      {
        id: "resumo",
        title: "Resumo",
        description: "Produz resumos didáticos de temas ou arquivos",
        personalizedTitle: `Resumo - ${contextualizationData.subjects}`,
        personalizedDescription: `Resumo estruturado dos principais conceitos de ${contextualizationData.subjects}`,
        approved: false
      }
    ];

    console.log('🔄 Usando atividades de fallback:', fallbackActivities);
    return fallbackActivities;
  }
}
