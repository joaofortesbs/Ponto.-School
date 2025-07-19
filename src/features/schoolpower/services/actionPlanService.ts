
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

    // Construir prompt ultra-detalhado para análise completa
    const prompt = `Você é uma IA especializada do School Power que deve realizar uma análise PROFUNDA e COMPLETA de todos os dados fornecidos pelo usuário.

=== ANÁLISE OBRIGATÓRIA DE TODOS OS DADOS ===

🎯 MENSAGEM INICIAL COMPLETA:
"${initialMessage}"

📋 DADOS COMPLETOS DO QUESTIONÁRIO:
📚 Matérias e Temas Específicos: "${contextualizationData.subjects}"
👥 Público-Alvo Detalhado: "${contextualizationData.audience}"  
⚠️ Restrições e Preferências: "${contextualizationData.restrictions || 'Nenhuma especificada'}"
📅 Datas e Prazos Importantes: "${contextualizationData.dates || 'Nenhuma especificada'}"
📝 Observações Adicionais: "${contextualizationData.notes || 'Nenhuma especificada'}"

=== ATIVIDADES DISPONÍVEIS PARA SELEÇÃO ===
${availableActivities}

=== PROCESSO DE ANÁLISE OBRIGATÓRIO ===

1. 🔍 ANALISE PALAVRA POR PALAVRA a mensagem inicial
2. 📊 CORRELACIONE todos os dados do questionário  
3. 🎯 IDENTIFIQUE necessidades educacionais específicas
4. 📝 DETERMINE o tipo de conteúdo mais adequado
5. 👥 CONSIDERE as características do público-alvo
6. ⏰ LEVE EM CONTA prazos e datas mencionadas
7. 🚫 RESPEITE todas as restrições indicadas
8. 💡 INCORPORE observações adicionais na personalização

=== CRITÉRIOS RIGOROSOS DE SELEÇÃO ===
✅ Compatibilidade com matérias/temas mencionados
✅ Adequação ao público-alvo especificado
✅ Resposta direta à mensagem inicial
✅ Consideração de prazos e datas
✅ Respeito às restrições mencionadas  
✅ Incorporação das observações adicionais
✅ Variedade nos tipos de atividades (estudo, avaliação, prática)
✅ Personalização baseada em TODOS os dados coletados

=== FORMATO OBRIGATÓRIO DE RESPOSTA ===
[
  {
    "id": "id-exato-da-atividade-disponível",
    "personalizedTitle": "Título altamente personalizado baseado em TODA a análise",
    "personalizedDescription": "Descrição detalhada incorporando TODOS os dados coletados"
  }
]

⚠️ EXEMPLO DE ANÁLISE COMPLETA:
Para uma solicitação sobre "Prova de matemática para 3º ano sobre funções quadráticas" com público "Ensino Médio avançado", prazo "15/03", observação "turma com dificuldades em gráficos":

[
  {
    "id": "prova-interativa", 
    "personalizedTitle": "Avaliação de Funções Quadráticas - 3º Ano EM - Entrega 15/03",
    "personalizedDescription": "Prova interativa focada em funções quadráticas com ênfase em interpretação de gráficos, adaptada para alunos de nível avançado com exercícios extras de visualização para superar dificuldades identificadas."
  }
]

🚨 RESPONDA APENAS COM O JSON - ZERO TEXTO ADICIONAL 🚨`;

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
    
    // Fallback com atividades personalizadas básicas
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
      }
    ];

    console.log('🔄 Retornando atividades fallback personalizadas');
    return fallbackActivities;
  }
}
