import { useState, useCallback } from 'react';
import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import { generatePersonalizedPlan } from '../services/generatePersonalizedPlan';

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

  // Submete contextualização e gera action plan
  const submitContextualization = useCallback(async (contextData: ContextualizationData) => {
    console.log('📝 Contextualização submetida:', contextData);

    if (!flowData.initialMessage) {
      console.error('❌ Mensagem inicial não encontrada');
      return;
    }

    setIsLoading(true);
    setFlowState('generating');

    try {
      // Usar o serviço de geração personalizada
      const actionPlan = await generatePersonalizedPlan(flowData.initialMessage, contextData);

      const updatedData: SchoolPowerFlowData = {
        ...flowData,
        contextualizationData: contextData,
        actionPlan: actionPlan,
        timestamp: Date.now()
      };

      setFlowData(updatedData);
      saveData(updatedData);
      setFlowState('actionplan');

      console.log('✅ Action plan gerado e salvo:', actionPlan);

    } catch (error) {
      console.error('❌ Erro ao gerar action plan:', error);

      // Em caso de erro, ainda assim continua o fluxo com dados vazios
      const updatedData: SchoolPowerFlowData = {
        ...flowData,
        contextualizationData: contextData,
        actionPlan: [],
        timestamp: Date.now()
      };

      setFlowData(updatedData);
      saveData(updatedData);
      setFlowState('actionplan');
    } finally {
      setIsLoading(false);
    }
  }, [flowData, saveData]);

  // Aprova action plan e inicia geração das atividades
  const approveActionPlan = useCallback((approvedItems: ActionPlanItem[]) => {
    console.log('✅ Aprovando action plan:', approvedItems);

    if (approvedItems.length === 0) {
      console.warn('⚠️ Nenhum item aprovado no action plan');
      return;
    }

    setFlowState('generatingActivities');

    // Simular processo de geração (aqui você implementaria a lógica real)
    setTimeout(() => {
      console.log('🎉 Atividades geradas com sucesso!');

      // Reset do fluxo após sucesso
      const resetData: SchoolPowerFlowData = {
        initialMessage: null,
        contextualizationData: null,
        actionPlan: null,
        timestamp: Date.now()
      };

      setFlowData(resetData);
      saveData(resetData);
      setFlowState('idle');
    }, 3000);
  }, [saveData]);

  // Reset do fluxo
  const resetFlow = useCallback(() => {
    console.log('🔄 Resetando School Power Flow');

    const resetData: SchoolPowerFlowData = {
      initialMessage: null,
      contextualizationData: null,
      actionPlan: null,
      timestamp: Date.now()
    };

    setFlowData(resetData);
    saveData(resetData);
    setFlowState('idle');
    setIsLoading(false);
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