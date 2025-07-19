
import { useState, useCallback } from 'react';
import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import { GEMINI_API_KEY } from '../activitiesManager';

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
      // Buscar atividades disponíveis
      const { getEnabledSchoolPowerActivities } = await import('../activitiesManager');
      const availableActivities = getEnabledSchoolPowerActivities();
      
      const activitiesText = availableActivities.map(activity => 
        `- ${activity.name}: ${activity.description}`
      ).join('\n');

      const prompt = `Você é uma IA que ajuda professores a planejar atividades para seus alunos. Aqui estão as informações:

Mensagem inicial do professor:
"${message}"

Respostas do Quiz:
Matérias e temas: "${contextData.subjects}"
Público-alvo: "${contextData.audience}"
Restrições: "${contextData.restrictions}"
Datas importantes: "${contextData.dates}"
Observações: "${contextData.notes}"

Lista de atividades que você pode sugerir:
${activitiesText}

Com base nessas informações, gere um plano de ação em formato de checklist, com no mínimo 5 tarefas, garantindo que cada tarefa seja uma das atividades da lista, com um título curto e uma descrição curta para cada uma. Responda APENAS em JSON no formato:
[
  {"id":"atividade-1","title":"Título","description":"Descrição"},
  {"id":"atividade-2","title":"Título","description":"Descrição"}
]`;

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
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No content generated');
      }

      // Parse JSON do response
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const actionPlanData = JSON.parse(jsonMatch[0]);
      
      // Converter para ActionPlanItem[]
      return actionPlanData.map((item: any, index: number) => ({
        id: item.id || `action-${index + 1}`,
        title: item.title || 'Atividade sem título',
        description: item.description || 'Descrição não disponível',
        approved: false
      }));
      
    } catch (error) {
      console.error('❌ Erro ao gerar action plan:', error);
      
      // Fallback para plano genérico
      return [
        {
          id: 'fallback-1',
          title: 'Resumo Inteligente',
          description: 'Criar resumos otimizados dos conteúdos principais',
          approved: false
        },
        {
          id: 'fallback-2',
          title: 'Prova Interativa',
          description: 'Gerar avaliação com correção automática',
          approved: false
        },
        {
          id: 'fallback-3',
          title: 'Plano de Estudo',
          description: 'Cronograma personalizado para o aluno',
          approved: false
        },
        {
          id: 'fallback-4',
          title: 'Exercícios Práticos',
          description: 'Lista de exercícios sobre o tema',
          approved: false
        },
        {
          id: 'fallback-5',
          title: 'Material de Apoio',
          description: 'Recursos complementares para estudo',
          approved: false
        }
      ];
    }
  }, []);

  // Submete dados de contextualização e gera action plan
  const submitContextualization = useCallback(async (data: ContextualizationData) => {
    console.log('📝 Contextualização submetida:', data);
    setIsLoading(true);
    setFlowState('actionplan');
    
    try {
      // Gerar action plan com API Gemini
      const actionPlan = await generateActionPlan(flowData.initialMessage || '', data);
      
      const newData: SchoolPowerFlowData = {
        ...flowData,
        contextualizationData: data,
        actionPlan,
        timestamp: Date.now()
      };
      
      setFlowData(newData);
      saveData(newData);
      console.log('✅ Action plan gerado:', actionPlan);
      
    } catch (error) {
      console.error('❌ Erro ao processar contextualização:', error);
    } finally {
      setIsLoading(false);
    }
  }, [flowData, saveData, generateActionPlan]);

  // Aprova action plan e inicia geração de atividades
  const approveActionPlan = useCallback((approvedItems: ActionPlanItem[]) => {
    console.log('✅ Action plan aprovado:', approvedItems);
    setIsLoading(true);
    setFlowState('generatingActivities');
    
    // Simula geração das atividades
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
