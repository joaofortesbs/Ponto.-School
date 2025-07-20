
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
  // Estado centralizado sem dependência de cache defasado
  const [flowData, setFlowData] = useState<SchoolPowerFlowData>({
    initialMessage: null,
    contextualizationData: null,
    actionPlan: null,
    timestamp: Date.now()
  });

  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [isLoading, setIsLoading] = useState(false);

  // Salva dados no localStorage de forma sincronizada
  const saveData = useCallback((data: SchoolPowerFlowData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('💾 Dados do School Power Flow salvos no localStorage:', data);
    } catch (error) {
      console.error('❌ Erro ao salvar dados do School Power Flow no localStorage:', error);
    }
  }, []);

  // Carrega dados do localStorage apenas na inicialização
  const loadStoredData = useCallback((): SchoolPowerFlowData | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Verifica se os dados não são muito antigos (1 hora)
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - data.timestamp < oneHour) {
          console.log('📥 Dados carregados do localStorage:', data);
          return data;
        } else {
          console.log('⏰ Dados do localStorage expiraram, usando estado limpo');
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do localStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  }, []);

  // Inicializar com dados salvos se existirem
  React.useEffect(() => {
    const storedData = loadStoredData();
    if (storedData) {
      setFlowData(storedData);
      
      // Definir estado baseado nos dados carregados
      if (storedData.initialMessage && !storedData.contextualizationData) {
        setFlowState('contextualizing');
      } else if (storedData.initialMessage && storedData.contextualizationData && !storedData.actionPlan) {
        setFlowState('actionplan');
      } else if (storedData.initialMessage && storedData.contextualizationData && storedData.actionPlan) {
        setFlowState('generating');
      }
    }
  }, [loadStoredData]);

  // Envia mensagem inicial e inicia processo de contextualização
  const sendInitialMessage = useCallback((message: string) => {
    console.log('📤 Enviando mensagem inicial para School Power:', message);

    const newData: SchoolPowerFlowData = {
      initialMessage: message,
      contextualizationData: null,
      actionPlan: null,
      timestamp: Date.now()
    };

    // Atualizar estado imediatamente
    setFlowData(newData);
    setFlowState('contextualizing');
    
    // Salvar no localStorage de forma sincronizada
    saveData(newData);

    console.log('✅ Mensagem inicial salva e estado atualizado para contextualizing');
  }, [saveData]);

  // Submete contextualização e gera action plan
  const submitContextualization = useCallback(async (contextData: ContextualizationData) => {
    console.log('📝 Contextualização submetida:', contextData);
    console.log('📋 Dados atuais do flow:', flowData);

    if (!flowData.initialMessage) {
      console.error('❌ Mensagem inicial não encontrada no estado atual');
      return;
    }

    // Atualizar estado para generating imediatamente
    setIsLoading(true);
    setFlowState('generating');

    // Salvar dados de contextualização no estado
    const dataWithContext = {
      ...flowData,
      contextualizationData: contextData,
      timestamp: Date.now()
    };

    setFlowData(dataWithContext);
    saveData(dataWithContext);

    console.log('✅ Dados de contextualização salvos, iniciando geração do plano...');

    try {
      // Chamar API Gemini com dados em tempo real do estado
      console.log('🔄 Chamando generatePersonalizedPlan com dados atuais...');
      const actionPlan = await generatePersonalizedPlan(flowData.initialMessage, contextData);

      const finalData: SchoolPowerFlowData = {
        ...dataWithContext,
        actionPlan: actionPlan,
        timestamp: Date.now()
      };

      // Atualizar estado com o action plan gerado
      setFlowData(finalData);
      saveData(finalData);
      setFlowState('actionplan');

      console.log('✅ Action plan gerado e salvo com sucesso:', actionPlan);

    } catch (error) {
      console.error('❌ Erro ao gerar action plan:', error);

      // Em caso de erro, ainda assim atualiza o estado para permitir visualização do erro
      const errorData: SchoolPowerFlowData = {
        ...dataWithContext,
        actionPlan: [],
        timestamp: Date.now()
      };

      setFlowData(errorData);
      saveData(errorData);
      setFlowState('actionplan');
      
      console.log('⚠️ Estado atualizado para actionplan mesmo com erro para permitir recuperação');
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

    console.log('🎯 Iniciando geração de atividades com itens aprovados...');

    // Simular processo de geração (aqui seria implementada a lógica real de geração de atividades)
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
      
      console.log('🔄 Flow resetado para idle após sucesso');
    }, 3000);
  }, [saveData]);

  // Reset do fluxo
  const resetFlow = useCallback(() => {
    console.log('🔄 Resetando School Power Flow...');

    const resetData: SchoolPowerFlowData = {
      initialMessage: null,
      contextualizationData: null,
      actionPlan: null,
      timestamp: Date.now()
    };

    setFlowData(resetData);
    setFlowState('idle');
    setIsLoading(false);
    
    // Limpar localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ LocalStorage limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar localStorage:', error);
    }

    console.log('✅ School Power Flow resetado completamente');
  }, []);

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
