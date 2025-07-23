
import { ContextualizationData } from '../contextualization/ContextualizationCard';

export interface ActionPlanActivity {
  id: string;
  title: string;
  description: string;
  personalizedTitle?: string;
  personalizedDescription?: string;
  approved: boolean;
}

export interface GenerateActionPlanParams {
  initialMessage: string;
  contextualizationData: ContextualizationData;
}

const GEMINI_API_KEY = 'AIzaSyD-Sso0SdyYKoA4M3tQhcWjQ1AoddB7Wo4';

export async function generateActionPlan(params: GenerateActionPlanParams): Promise<ActionPlanActivity[]> {
  const { initialMessage, contextualizationData } = params;
  
  try {
    console.log('🚀 Iniciando geração de plano de ação...');
    console.log('📋 Parâmetros recebidos:', params);

    // Importar lista de atividades disponíveis
    const activitiesModule = await import('../data/schoolPowerActivities.json');
    const schoolPowerActivities = activitiesModule.default;

    // Preparar lista de atividades disponíveis para o prompt
    const availableActivities = schoolPowerActivities.map(activity => 
      `- ${activity.id}: ${activity.title} - ${activity.description}`
    ).join('\n');

    // Construir prompt detalhado para a IA
    const prompt = `Você é uma IA especializada em gerar planos de ação educacionais para professores e coordenadores, seguindo e planejando exatamente o que eles pedem, e seguindo muito bem os requesitos, sendo super treinado, utilizando apenas as atividades possíveis listadas abaixo.

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

INSTRUÇÕES:
1. Analise cuidadosamente todas as informações fornecidas
2. Selecione TODAS as atividades da lista que se adequem ao contexto solicitado (Mínimo de 15 atividades, máximo de 35)
3. Personalize o título e descrição de cada atividade com base nas informações coletadas
4. Priorize a diversidade de tipos de atividades para criar um plano completo e abrangente
5. Se o usuário pediu atividades específicas (como "lista de exercícios", "prova", "mapa mental", etc.), INCLUA TODAS elas.
6. Se o usuário pediu algo que demanda muitas atividades, faça o máximo de atividades, de uma maneira planejada, e priorizando a organização e planejamento para o professor/coordenador!
7. Se por acaso nos dados coletados tiver um número de atividades especificas para ser criadas/geradas, gere exatamente a mesma quantidade de atividades, sem deixar nada faltando!!!!!!!
8. Retorne APENAS um JSON válido no formato especificado

Formato de resposta (JSON):
[
  {
    "id": "id-da-atividade-da-lista",
    "personalizedTitle": "Título personalizado baseado no contexto",
    "personalizedDescription": "Descrição personalizada baseada no contexto"
  }
]

Exemplo:
[
  {
    "id": "prova-interativa",
    "personalizedTitle": "Prova de Matemática - Álgebra - 9º Ano",
    "personalizedDescription": "Avaliação interativa focada em equações do 1º grau para alunos do 9º ano."
  }
]

Responda APENAS com o JSON, sem texto adicional.`;

    console.log('📤 Enviando requisição para Gemini API...');

    // Fazer requisição para API Gemini
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

    console.log('📥 Resposta bruta da IA:', generatedText);

    // Extrair JSON da resposta
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Formato JSON inválido na resposta da IA');
    }

    const generatedActivities: Array<{
      id: string;
      personalizedTitle: string;
      personalizedDescription: string;
    }> = JSON.parse(jsonMatch[0]);

    console.log('🔍 Atividades extraídas:', generatedActivities);

    // Validar se todas as atividades existem na lista disponível
    const validActivities = generatedActivities.filter(activity => {
      const exists = schoolPowerActivities.some(available => available.id === activity.id);
      if (!exists) {
        console.warn(`⚠️ Atividade ${activity.id} não encontrada na lista de atividades disponíveis`);
      }
      return exists;
    });

    if (validActivities.length === 0) {
      throw new Error('Nenhuma atividade válida foi gerada pela IA');
    }

    // Converter para o formato ActionPlanActivity
    const finalActivities: ActionPlanActivity[] = validActivities.map(activity => {
      const originalActivity = schoolPowerActivities.find(orig => orig.id === activity.id);
      
      return {
        id: activity.id,
        title: originalActivity?.title || 'Atividade',
        description: originalActivity?.description || 'Descrição da atividade',
        personalizedTitle: activity.personalizedTitle,
        personalizedDescription: activity.personalizedDescription,
        approved: false
      };
    });

    console.log('✅ Plano de ação gerado com sucesso:', finalActivities);
    return finalActivities;

  } catch (error) {
    console.error('❌ Erro ao gerar plano de ação:', error);
    
    // Fallback com atividades personalizadas básicas (mais abrangente)
    const fallbackActivities: ActionPlanActivity[] = [
      {
        id: 'resumo-inteligente',
        title: 'Resumo Inteligente',
        description: 'Criar resumos otimizados dos conteúdos principais',
        personalizedTitle: `Resumo de ${contextualizationData.subjects} para ${contextualizationData.audience}`,
        personalizedDescription: `Resumo personalizado de ${contextualizationData.subjects} adaptado para ${contextualizationData.audience}`,
        approved: false
      },
      {
        id: 'lista-exercicios',
        title: 'Lista de Exercícios',
        description: 'Gerar exercícios práticos sobre o tema',
        personalizedTitle: `Exercícios de ${contextualizationData.subjects} - ${contextualizationData.audience}`,
        personalizedDescription: `Lista de exercícios práticos sobre ${contextualizationData.subjects} para ${contextualizationData.audience}`,
        approved: false
      },
      {
        id: 'prova-interativa',
        title: 'Prova Interativa',
        description: 'Criar avaliação com correção automática',
        personalizedTitle: `Prova de ${contextualizationData.subjects} - ${contextualizationData.audience}`,
        personalizedDescription: `Avaliação interativa de ${contextualizationData.subjects} adaptada para ${contextualizationData.audience}`,
        approved: false
      },
      {
        id: 'mapa-mental',
        title: 'Mapa Mental',
        description: 'Criar mapas mentais organizados',
        personalizedTitle: `Mapa Mental: ${contextualizationData.subjects}`,
        personalizedDescription: `Mapa mental estruturado sobre ${contextualizationData.subjects} para ${contextualizationData.audience}`,
        approved: false
      },
      {
        id: 'jogos-educativos',
        title: 'Jogos Educativos',
        description: 'Criar jogos interativos para aprendizado',
        personalizedTitle: `Jogos Educativos: ${contextualizationData.subjects}`,
        personalizedDescription: `Jogos interativos sobre ${contextualizationData.subjects} para ${contextualizationData.audience}`,
        approved: false
      },
      {
        id: 'plano-aula',
        title: 'Plano de Aula',
        description: 'Estruturar planos de aula detalhados',
        personalizedTitle: `Plano de Aula: ${contextualizationData.subjects}`,
        personalizedDescription: `Plano de aula estruturado para ${contextualizationData.subjects} e ${contextualizationData.audience}`,
        approved: false
      },
      {
        id: 'simulado',
        title: 'Simulado',
        description: 'Criar simulados completos',
        personalizedTitle: `Simulado: ${contextualizationData.subjects}`,
        personalizedDescription: `Simulado completo sobre ${contextualizationData.subjects} para ${contextualizationData.audience}`,
        approved: false
      },
      {
        id: 'cronograma-estudos',
        title: 'Cronograma de Estudos',
        description: 'Organizar cronograma personalizado',
        personalizedTitle: `Cronograma: ${contextualizationData.subjects}`,
        personalizedDescription: `Cronograma de estudos para ${contextualizationData.subjects} adaptado para ${contextualizationData.audience}`,
        approved: false
      },
      {
        id: 'flashcards',
        title: 'Flashcards',
        description: 'Criar flashcards para memorização',
        personalizedTitle: `Flashcards: ${contextualizationData.subjects}`,
        personalizedDescription: `Flashcards para memorização de ${contextualizationData.subjects} para ${contextualizationData.audience}`,
        approved: false
      },
      {
        id: 'projeto-pratico',
        title: 'Projeto Prático',
        description: 'Desenvolver projetos hands-on',
        personalizedTitle: `Projeto Prático: ${contextualizationData.subjects}`,
        personalizedDescription: `Projeto prático aplicado de ${contextualizationData.subjects} para ${contextualizationData.audience}`,
        approved: false
      }
    ];

    console.log('🔄 Retornando atividades fallback personalizadas');
    return fallbackActivities;
  }
}
