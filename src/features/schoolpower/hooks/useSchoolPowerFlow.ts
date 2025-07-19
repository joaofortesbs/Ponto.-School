
import { useCallback } from 'react';
import { useSchoolPowerStore, SchoolPowerFlowState } from '../store/schoolPowerStore';
import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import { generatePersonalizedPlan } from '../services/generatePersonalizedPlan';

interface UseSchoolPowerFlowReturn {
  flowState: SchoolPowerFlowState;
  initialMessage: string | null;
  contextualizationData: ContextualizationData | null;
  actionPlan: ActionPlanItem[] | null;
  isLoading: boolean;
  isGeneratingPlan: boolean;
  sendInitialMessage: (message: string) => void;
  submitContextualization: (data: ContextualizationData) => Promise<void>;
  approveActionPlan: (approvedItems: ActionPlanItem[]) => void;
  updateActionPlanItem: (id: string, updates: Partial<ActionPlanItem>) => void;
  getApprovedItems: () => ActionPlanItem[];
  resetFlow: () => void;
}

export function useSchoolPowerFlow(): UseSchoolPowerFlowReturn {
  const {
    flowState,
    initialMessage,
    contextualizationData,
    actionPlan,
    isLoading,
    isGeneratingPlan,
    setFlowState,
    setInitialMessage,
    setContextualizationData,
    setActionPlan,
    setLoading,
    setGeneratingPlan,
    updateActionPlanItem,
    getApprovedItems,
    resetStore,
  } = useSchoolPowerStore();

  // Envia mensagem inicial e inicia processo de contextualização
  const sendInitialMessage = useCallback((message: string) => {
    console.log('📤 Enviando mensagem inicial:', message);
    setInitialMessage(message);
  }, [setInitialMessage]);

  // Submete dados de contextualização e gera action plan
  const submitContextualization = useCallback(async (data: ContextualizationData) => {
    console.log('📝 Submetendo contextualização:', data);
    
    try {
      setLoading(true);
      setContextualizationData(data);
      setGeneratingPlan(true);

      // Gera o plano personalizado
      const personalizedPlan = await generatePersonalizedPlan(data);
      
      // Converte para o formato ActionPlanItem
      const actionPlanItems: ActionPlanItem[] = personalizedPlan.map((item, index) => ({
        id: `item-${index + 1}`,
        title: item.titulo,
        description: item.descricao,
        approved: false,
        completed: false
      }));

      setActionPlan(actionPlanItems);
      setGeneratingPlan(false);
      setLoading(false);
      
    } catch (error) {
      console.error('Erro ao gerar plano:', error);
      setLoading(false);
      setGeneratingPlan(false);
    }
  }, [setLoading, setContextualizationData, setGeneratingPlan, setActionPlan]);

  // Aprova action plan e inicia geração de atividades
  const approveActionPlan = useCallback((approvedItems: ActionPlanItem[]) => {
    console.log('✅ Aprovando action plan:', approvedItems);
    
    setFlowState('approved');
    setLoading(true);

    // Simula geração de atividades
    setTimeout(() => {
      console.log('🎉 Gerando atividades...');
      setLoading(false);

      // Aqui será integrado com a geração real das atividades
      // Por enquanto, volta para o estado idle após alguns segundos
      setTimeout(() => {
        console.log('🎉 Atividades geradas com sucesso!');
        resetStore();
      }, 3000);
    }, 2000);
  }, [setLoading, setFlowState, resetStore]);

  // Reseta todo o fluxo
  const resetFlow = useCallback(() => {
    console.log('🔄 Resetando School Power Flow');
    resetStore();
  }, [resetStore]);

  return {
    flowState,
    initialMessage,
    contextualizationData,
    actionPlan,
    isLoading,
    isGeneratingPlan,
    sendInitialMessage,
    submitContextualization,
    approveActionPlan,
    updateActionPlanItem,
    getApprovedItems,
    resetFlow,
  };
}
