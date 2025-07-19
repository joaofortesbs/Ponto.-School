
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
      // Usar o serviço de geração de plano de ação
      const { generateActionPlan: generatePlan } = await import('../services/actionPlanService');
      
      const result = await generatePlan({
        initialMessage: message,
        contextualizationData: contextData
      });

      // Converter para o formato esperado pelo ActionPlanCard
      return result.map(activity => ({
        id: activity.id,
        title: activity.personalizedTitle || activity.title,
        description: activity.personalizedDescription || activity.description,
        approved: false
      }));

    } catch (error) {
      console.error('❌ Erro ao gerar plano de ação:', error);
      
      // Fallback com atividades básicas
      return [
        {
          id: "plano-aula",
          title: `Plano de Aula - ${contextData.subjects}`,
          description: `Plano detalhado para ${contextData.audience}`,
          approved: false
        },
        {
          id: "resumo-inteligente",
          title: "Resumo Inteligente",
          description: "Criar resumos otimizados dos conteúdos principais",
          approved: false
        },
        {
          id: 'lista-exercicios',
          title: 'Lista de Exercícios',
          description: 'Exercícios práticos sobre o tema',
          approved: false
        },
        {
          id: 'mapa-mental',
          title: 'Mapa Mental',
          description: 'Organização visual dos conceitos',
          approved: false
        },
        {
          id: 'prova-interativa',
          title: 'Prova Interativa',
          description: 'Avaliação com correção automática',
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
