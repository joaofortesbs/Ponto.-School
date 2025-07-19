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

    if (!initialMessage) {
      console.error('❌ Mensagem inicial não encontrada');
      return;
    }

    try {
      // Salvar dados de contextualização
      setContextualizationData(data);

      // Iniciar geração do plano
      setGeneratingPlan(true);

      console.log('🤖 Gerando plano personalizado com API Gemini...');

      // Gerar plano personalizado usando API Gemini
      const personalizedPlan = await generatePersonalizedPlan(initialMessage, data);

      // Salvar plano gerado
      setActionPlan(personalizedPlan);

      console.log('✅ Plano personalizado gerado com sucesso:', personalizedPlan);

    } catch (error) {
      console.error('❌ Erro ao processar contextualização:', error);
      setGeneratingPlan(false);

      // Em caso de erro, voltar para contextualização
      setFlowState('contextualizing');
    }
  }, [initialMessage, setContextualizationData, setGeneratingPlan, setActionPlan, setFlowState]);

  // Aprova action plan e inicia geração de atividades
  const approveActionPlan = useCallback((approvedItems: ActionPlanItem[]) => {
    console.log('✅ Action plan aprovado:', approvedItems);

    setLoading(true);
    setFlowState('approved');

    // Simula geração das atividades aprovadas
    setTimeout(() => {
      console.log('🚀 Iniciando geração das atividades aprovadas...');
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

export default useSchoolPowerFlow;