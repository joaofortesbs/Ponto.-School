
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
  console.log('🏁 Inicializando School Power Flow Hook...');

  // Carrega dados salvos do localStorage
  const loadStoredData = (): SchoolPowerFlowData => {
    try {
      console.log('📂 Tentando carregar dados salvos do localStorage...');
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        console.log('📂 Dados encontrados no localStorage:', data);
        
        // Verifica se os dados não são muito antigos (1 hora)
        const oneHour = 60 * 60 * 1000;
        const dataAge = Date.now() - data.timestamp;
        console.log(`⏰ Idade dos dados: ${Math.round(dataAge / 1000 / 60)} minutos`);
        
        if (dataAge < oneHour) {
          console.log('✅ Dados válidos carregados do localStorage');
          return data;
        } else {
          console.log('⏰ Dados expirados, usando dados vazios');
        }
      } else {
        console.log('📂 Nenhum dado encontrado no localStorage');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do School Power Flow:', error);
    }

    const emptyData = {
      initialMessage: null,
      contextualizationData: null,
      actionPlan: null,
      timestamp: Date.now()
    };
    console.log('📂 Retornando dados vazios:', emptyData);
    return emptyData;
  };

  const [flowData, setFlowData] = useState<SchoolPowerFlowData>(loadStoredData);
  const [flowState, setFlowState] = useState<FlowState>(() => {
    const stored = loadStoredData();
    console.log('🔄 Determinando estado inicial do fluxo...');
    
    if (stored.initialMessage && !stored.contextualizationData) {
      console.log('📝 Estado inicial: contextualizing (mensagem enviada, aguardando contextualização)');
      return 'contextualizing';
    }
    if (stored.initialMessage && stored.contextualizationData && !stored.actionPlan) {
      console.log('⚙️ Estado inicial: generating (contextualização feita, aguardando action plan)');
      return 'generating';
    }
    if (stored.initialMessage && stored.contextualizationData && stored.actionPlan) {
      console.log('📋 Estado inicial: actionplan (action plan gerado, aguardando aprovação)');
      return 'actionplan';
    }
    
    console.log('🏠 Estado inicial: idle (fluxo limpo)');
    return 'idle';
  });
  const [isLoading, setIsLoading] = useState(false);

  // Salva dados no localStorage
  const saveData = useCallback((data: SchoolPowerFlowData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('💾 Dados do School Power Flow salvos no localStorage:', {
        hasInitialMessage: !!data.initialMessage,
        hasContextualizationData: !!data.contextualizationData,
        hasActionPlan: !!data.actionPlan,
        actionPlanCount: data.actionPlan?.length || 0,
        timestamp: new Date(data.timestamp).toLocaleString()
      });
    } catch (error) {
      console.error('❌ Erro ao salvar dados do School Power Flow:', error);
    }
  }, []);

  // Envia mensagem inicial e inicia processo de contextualização
  const sendInitialMessage = useCallback((message: string) => {
    console.log('📤 School Power Flow: Processando mensagem inicial...');
    console.log('📝 Mensagem recebida:', message);
    console.log('📊 Estado atual do fluxo:', flowState);

    if (!message || message.trim().length === 0) {
      console.error('❌ Mensagem inicial vazia ou inválida');
      return;
    }

    const newData: SchoolPowerFlowData = {
      initialMessage: message.trim(),
      contextualizationData: null,
      actionPlan: null,
      timestamp: Date.now()
    };

    console.log('📤 Mensagem inicial enviada e salva:', newData);
    setFlowData(newData);
    saveData(newData);
    setFlowState('contextualizing');
    console.log('🔄 Estado do fluxo alterado para: contextualizing');
  }, [saveData, flowState]);

  // Submete contextualização e gera action plan
  const submitContextualization = useCallback(async (contextData: ContextualizationData) => {
    console.log('📝 School Power Flow: Processando contextualização...');
    console.log('📊 Dados de contextualização recebidos:', contextData);
    console.log('📊 Estado atual do fluxo:', flowState);
    console.log('📊 Dados atuais do fluxo:', flowData);

    if (!flowData.initialMessage) {
      console.error('❌ Mensagem inicial não encontrada no fluxo');
      console.error('❌ Estado do flowData:', flowData);
      return;
    }

    console.log('🔄 Iniciando processo de geração do action plan...');
    setIsLoading(true);
    setFlowState('generating');

    try {
      console.log('🤖 Chamando serviço de geração personalizada...');
      console.log('📤 Dados enviados para IA:', {
        message: flowData.initialMessage,
        contextData: contextData
      });

      // Usar o serviço de geração personalizada
      const actionPlan = await generatePersonalizedPlan(flowData.initialMessage, contextData);

      console.log('📥 Action plan recebido da IA:', actionPlan);
      console.log('📊 Número de atividades geradas:', actionPlan.length);

      const updatedData: SchoolPowerFlowData = {
        ...flowData,
        contextualizationData: contextData,
        actionPlan: actionPlan,
        timestamp: Date.now()
      };

      console.log('💾 Salvando dados atualizados do fluxo:', {
        hasInitialMessage: !!updatedData.initialMessage,
        hasContextualizationData: !!updatedData.contextualizationData,
        hasActionPlan: !!updatedData.actionPlan,
        actionPlanCount: updatedData.actionPlan?.length || 0
      });

      setFlowData(updatedData);
      saveData(updatedData);
      setFlowState('actionplan');

      console.log('✅ Action plan gerado e salvo com sucesso!');
      console.log('🔄 Estado do fluxo alterado para: actionplan');

    } catch (error) {
      console.error('❌ Erro ao gerar action plan:', error);
      console.error('📊 Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });

      // Em caso de erro, ainda assim continua o fluxo com dados vazios
      const updatedData: SchoolPowerFlowData = {
        ...flowData,
        contextualizationData: contextData,
        actionPlan: [],
        timestamp: Date.now()
      };

      console.log('🔄 Continuando fluxo com action plan vazio devido ao erro');
      setFlowData(updatedData);
      saveData(updatedData);
      setFlowState('actionplan');
    } finally {
      setIsLoading(false);
      console.log('🔄 Loading finalizado');
    }
  }, [flowData, saveData, flowState]);

  // Aprova action plan e inicia geração das atividades
  const approveActionPlan = useCallback((approvedItems: ActionPlanItem[]) => {
    console.log('✅ School Power Flow: Processando aprovação do action plan...');
    console.log('📊 Itens aprovados recebidos:', approvedItems);
    console.log('📊 Número de itens aprovados:', approvedItems.length);
    console.log('📋 IDs dos itens aprovados:', approvedItems.map(item => item.id));

    if (approvedItems.length === 0) {
      console.warn('⚠️ Nenhum item aprovado no action plan');
      console.warn('⚠️ Interrompendo processo de geração');
      return;
    }

    console.log('🔄 Alterando estado para: generatingActivities');
    setFlowState('generatingActivities');

    // Simular processo de geração (aqui você implementaria a lógica real)
    console.log('⏳ Iniciando simulação de geração de atividades...');
    setTimeout(() => {
      console.log('🎉 Simulação de geração de atividades concluída!');
      console.log('📊 Atividades que seriam geradas:', approvedItems.map(item => ({
        id: item.id,
        title: item.title
      })));

      // Reset do fluxo após sucesso
      const resetData: SchoolPowerFlowData = {
        initialMessage: null,
        contextualizationData: null,
        actionPlan: null,
        timestamp: Date.now()
      };

      console.log('🔄 Resetando fluxo após sucesso...');
      setFlowData(resetData);
      saveData(resetData);
      setFlowState('idle');
      console.log('✅ Fluxo resetado para estado inicial: idle');
    }, 3000);
  }, [saveData]);

  // Reset do fluxo
  const resetFlow = useCallback(() => {
    console.log('🔄 School Power Flow: Iniciando reset manual do fluxo...');
    console.log('📊 Estado atual antes do reset:', flowState);
    console.log('📊 Dados atuais antes do reset:', flowData);

    const resetData: SchoolPowerFlowData = {
      initialMessage: null,
      contextualizationData: null,
      actionPlan: null,
      timestamp: Date.now()
    };

    console.log('🗑️ Limpando todos os dados do fluxo...');
    setFlowData(resetData);
    saveData(resetData);
    setFlowState('idle');
    setIsLoading(false);
    
    console.log('✅ Reset do School Power Flow concluído');
    console.log('🔄 Estado final: idle');
  }, [saveData, flowState, flowData]);

  // Log do estado atual sempre que houver mudanças
  console.log('📊 School Power Flow - Estado Atual:', {
    flowState,
    hasInitialMessage: !!flowData.initialMessage,
    hasContextualizationData: !!flowData.contextualizationData,
    hasActionPlan: !!flowData.actionPlan,
    actionPlanCount: flowData.actionPlan?.length || 0,
    isLoading,
    timestamp: flowData.timestamp ? new Date(flowData.timestamp).toLocaleString() : 'N/A'
  });

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
