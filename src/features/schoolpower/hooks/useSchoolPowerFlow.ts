import { useState, useCallback } from 'react';
import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';

export type FlowState = 'idle' | 'contextualizing' | 'actionplan' | 'generating' | 'generatingActivities';

interface SchoolPowerFlowData {
  initialMessage: string | null;
  contextualizationData: ContextualizationData | null;
  actionPlan: ActionPlanItem[] | null;
  timestamp: number;
}

interface UseSchoolPowerFlowReturn {
  flowState: FlowState;
  flowData: SchoolPowerFlowData;
  sendInitialMessage: (message: string) => void;
  submitContextualization: (data: ContextualizationData) => void;
  approveActionPlan: (approvedItems: ActionPlanItem[]) => void;
  resetFlow: () => void;
  isLoading: boolean;
}

const STORAGE_KEY = 'schoolpower_flow_data';
const GEMINI_API_KEY = 'AIzaSyD-Sso0SdyYKoA4M3tQhcWjQ1AoddB7Wo4';

export function useSchoolPowerFlow(): UseSchoolPowerFlowReturn {
  // Carrega dados salvos do localStorage
  const loadStoredData = (): SchoolPowerFlowData => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Verifica se os dados não são muito antigos (1 hora)
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - data.timestamp < oneHour) {
          return data;
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do School Power Flow:', error);
    }

    return {
      initialMessage: null,
      contextualizationData: null,
      actionPlan: null,
      timestamp: Date.now()
    };
  };

  const [flowData, setFlowData] = useState<SchoolPowerFlowData>(loadStoredData);
  const [flowState, setFlowState] = useState<FlowState>(() => {
    const stored = loadStoredData();
    if (stored.initialMessage && !stored.contextualizationData) {
      return 'contextualizing';
    }
    if (stored.initialMessage && stored.contextualizationData && !stored.actionPlan) {
      return 'actionplan';
    }
    if (stored.initialMessage && stored.contextualizationData && stored.actionPlan) {
      return 'generating';
    }
    return 'idle';
  });
  const [isLoading, setIsLoading] = useState(false);

  // Salva dados no localStorage
  const saveData = useCallback((data: SchoolPowerFlowData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('💾 Dados do School Power Flow salvos:', data);
    } catch (error) {
      console.error('❌ Erro ao salvar dados do School Power Flow:', error);
    }
  }, []);

  // Envia mensagem inicial e inicia processo de contextualização
  const sendInitialMessage = useCallback((message: string) => {
    console.log('📤 Mensagem inicial enviada:', message);

    const newData: SchoolPowerFlowData = {
      initialMessage: message,
      contextualizationData: null,
      actionPlan: null,
      timestamp: Date.now()
    };

    setFlowData(newData);
    saveData(newData);
    setFlowState('contextualizing');
  }, [saveData]);

  // Função para gerar action plan com API Gemini
  const generateActionPlan = useCallback(async (message: string, contextData: ContextualizationData): Promise<ActionPlanItem[]> => {
    try {
      console.log('🤖 Iniciando geração de plano de ação com IA Gemini...');
      console.log('📝 Dados coletados:', { message, contextData });

      // Importar lista de atividades disponíveis
      const activitiesModule = await import('../data/schoolPowerActivities.json');
      const schoolPowerActivities = activitiesModule.default;

      // Preparar lista de atividades para o prompt
      const activitiesText = schoolPowerActivities.map(activity => 
        `- ${activity.id}: ${activity.title} - ${activity.description}`
      ).join('\n');

      // Construir prompt detalhado para a IA Gemini
      const prompt = `Você é uma IA do School Power responsável por criar um plano de ação educacional para um professor ou coordenador. Use SOMENTE as atividades listadas abaixo que o School Power consegue gerar.

Mensagem inicial do usuário:
"${message}"

Respostas do Quiz:
Matérias e temas: "${contextData.subjects}"
Público-alvo: "${contextData.audience}"
Restrições ou preferências: "${contextData.restrictions}"
Datas importantes: "${contextData.dates}"
Observações adicionais: "${contextData.notes}"

Aqui está a lista de atividades possíveis:
${activitiesText}

Com base nessas informações, gere de 3 a 5 atividades personalizadas em formato JSON, com campos:
- id: mesmo id da atividade no banco de atividades
- title: título personalizado de acordo com as informações coletadas
- description: descrição curta e personalizada de acordo com as informações coletadas

Exemplo de resposta:
[
  {
    "id": "prova-interativa",
    "title": "Prova de Matemática - 27/07 - Ensino Médio",
    "description": "Avaliação focada em álgebra e geometria, programada para o dia 27/07."
  }
]

Responda APENAS com o JSON válido, sem texto adicional.`;

      console.log('📤 Enviando prompt para Gemini API...');

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
        throw new Error(`Erro na API Gemini: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('Nenhum conteúdo gerado pela IA Gemini');
      }

      console.log('📥 Resposta recebida da IA Gemini:', generatedText);

      // Extrair JSON da resposta
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Formato JSON inválido na resposta da IA');
      }

      const generatedActivities = JSON.parse(jsonMatch[0]);
      console.log('✅ Atividades geradas pela IA:', generatedActivities);

      // Validar se todas as atividades existem na lista disponível
      const validActivities = generatedActivities.filter((activity: any) => {
        const exists = schoolPowerActivities.some(available => available.id === activity.id);
        if (!exists) {
          console.warn(`⚠️ Atividade ${activity.id} não encontrada na lista de atividades disponíveis`);
        }
        return exists;
      });

      if (validActivities.length === 0) {
        throw new Error('Nenhuma atividade válida foi gerada pela IA');
      }

      // Converter para ActionPlanItem[]
      const actionPlanItems: ActionPlanItem[] = validActivities.map((item: any, index: number) => ({
        id: item.id || `action-${index + 1}`,
        title: item.title || 'Atividade personalizada',
        description: item.description || 'Descrição personalizada',
        approved: false
      }));

      console.log('✅ Plano de ação gerado com sucesso:', actionPlanItems);
      return actionPlanItems;

    } catch (error) {
      console.error('❌ Erro ao gerar plano de ação com IA Gemini:', error);

      // Fallback com atividades básicas personalizadas
      const fallbackActivities: ActionPlanItem[] = [
        {
          id: "resumo-inteligente",
          title: `Resumo Inteligente - ${contextData.subjects}`,
          description: `Resumo personalizado para ${contextData.audience} sobre ${contextData.subjects}`,
          approved: false
        },
        {
          id: "lista-exercicios",
          title: `Lista de Exercícios - ${contextData.subjects}`,
          description: `Exercícios práticos personalizados para ${contextData.audience}`,
          approved: false
        },
        {
          id: "prova-interativa",
          title: `Prova Interativa - ${contextData.subjects}`,
          description: `Avaliação interativa personalizada para ${contextData.audience}`,
          approved: false
        }
      ];

      console.log('🔄 Usando plano de ação fallback:', fallbackActivities);
      return fallbackActivities;
    }
  }, []);

  // Submete dados de contextualização e gera action plan
  const submitContextualization = useCallback(async (data: ContextualizationData) => {
    console.log('📝 Contextualização submetida:', data);
    setIsLoading(true);
    setFlowState('actionplan');

    try {
      // Gerar action plan com IA Gemini usando dados reais
      const actionPlan = await generateActionPlan(flowData.initialMessage || '', data);

      const newData: SchoolPowerFlowData = {
        ...flowData,
        contextualizationData: data,
        actionPlan,
        timestamp: Date.now()
      };

      setFlowData(newData);
      saveData(newData);
      console.log('✅ Action plan gerado e salvo:', actionPlan);

    } catch (error) {
      console.error('❌ Erro ao processar contextualização:', error);
      // Manter estado de erro visível para o usuário
      setFlowState('contextualizing');
    } finally {
      setIsLoading(false);
    }
  }, [flowData, saveData, generateActionPlan]);

  // Aprova action plan e inicia geração de atividades
  const approveActionPlan = useCallback((approvedItems: ActionPlanItem[]) => {
    console.log('✅ Action plan aprovado:', approvedItems);
    setIsLoading(true);
    setFlowState('generatingActivities');

    // Simula geração das atividades aprovadas
    setTimeout(() => {
      console.log('🤖 Gerando atividades aprovadas:', approvedItems);
      setIsLoading(false);

      // Aqui será integrado com a geração real das atividades
      // Por enquanto, volta para o estado idle após gerar
      setTimeout(() => {
        setFlowState('idle');
      }, 3000);
    }, 2000);
  }, []);

  // Reseta todo o fluxo
  const resetFlow = useCallback(() => {
    console.log('🔄 Resetando School Power Flow');

    const emptyData: SchoolPowerFlowData = {
      initialMessage: null,
      contextualizationData: null,
      actionPlan: null,
      timestamp: Date.now()
    };

    setFlowData(emptyData);
    saveData(emptyData);
    setFlowState('idle');
    setIsLoading(false);

    // Limpa localStorage
    localStorage.removeItem(STORAGE_KEY);
  }, [saveData]);

  return {
    flowState,
    flowData,
    sendInitialMessage,
    submitContextualization,
    approveActionPlan,
    resetFlow,
    isLoading
  };
}

export default useSchoolPowerFlow;