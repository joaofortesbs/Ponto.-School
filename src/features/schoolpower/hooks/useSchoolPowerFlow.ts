import React, { useState, useCallback } from 'react';
import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import { generatePersonalizedPlan } from '../services/generatePersonalizedPlan';

export type FlowState = 'idle' | 'chat' | 'contextualizing' | 'actionplan' | 'generating' | 'generatingActivities' | 'activities';

interface SchoolPowerFlowData {
  initialMessage: string | null;
  contextualizationData: ContextualizationData | null;
  actionPlan: ActionPlanItem[] | null;
  manualActivities: ActionPlanItem[] | null;
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

export default function useSchoolPowerFlow(): UseSchoolPowerFlowReturn {
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [flowData, setFlowData] = useState<SchoolPowerFlowData>({
    initialMessage: null,
    contextualizationData: null,
    actionPlan: [],
    manualActivities: [],
    timestamp: Date.now()
  });
  const [isLoading, setIsLoading] = useState(false);

  const saveData = useCallback((data: SchoolPowerFlowData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('💾 Dados do School Power Flow salvos no localStorage:', data);
    } catch (error) {
      console.error('❌ Erro ao salvar dados do School Power Flow no localStorage:', error);
    }
  }, []);

  const loadStoredData = useCallback((): SchoolPowerFlowData | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
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

  React.useEffect(() => {
    const storedData = loadStoredData();
    if (storedData) {
      setFlowData(storedData);

      if (storedData.initialMessage && !storedData.contextualizationData) {
        setFlowState('chat');
      } else if (storedData.initialMessage && storedData.contextualizationData && !storedData.actionPlan) {
        setFlowState('chat');
      } else if (storedData.initialMessage && storedData.contextualizationData && storedData.actionPlan) {
        const hasApprovedActivities = storedData.actionPlan.some(item => item.approved);
        if (hasApprovedActivities) {
          setFlowState('activities');
        } else {
          setFlowState('chat');
        }
      }
    }
  }, [loadStoredData]);

  const sendInitialMessage = useCallback((message: string) => {
    console.log('📤 Enviando mensagem inicial para School Power (modo chat):', message);

    if (!message || !message.trim()) {
      console.error('❌ Mensagem vazia, cancelando envio');
      return;
    }

    const newData: SchoolPowerFlowData = {
      initialMessage: message.trim(),
      contextualizationData: null,
      actionPlan: [],
      manualActivities: [],
      timestamp: Date.now()
    };

    setFlowData(newData);
    setFlowState('chat');

    saveData(newData);

    console.log('✅ Mensagem inicial salva e estado atualizado para CHAT');
  }, [saveData]);

  const submitContextualization = useCallback(async (contextData: ContextualizationData) => {
    console.log('📝 Contextualização submetida:', contextData);
    console.log('📋 Dados atuais do flow:', flowData);

    let currentMessage = flowData.initialMessage;
    if (!currentMessage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const storedData = JSON.parse(stored);
          currentMessage = storedData.initialMessage;
        }
      } catch (error) {
        console.error('Erro ao buscar mensagem do localStorage:', error);
      }
    }

    if (!currentMessage) {
      console.error('❌ Mensagem inicial não encontrada');
      return;
    }

    setIsLoading(true);
    setFlowState('generating');

    const dataWithContext = {
      initialMessage: currentMessage,
      contextualizationData: contextData,
      actionPlan: [],
      timestamp: Date.now()
    };

    setFlowData(dataWithContext);
    saveData(dataWithContext);

    console.log('✅ Dados de contextualização salvos:', dataWithContext);

    try {
      console.log('🤖 Iniciando geração de plano de ação...');
      const actionPlan = await generatePersonalizedPlan(
        currentMessage,
        contextData
      );

      console.log('✅ Action plan personalizado gerado:', actionPlan);

      const finalData = {
        ...dataWithContext,
        actionPlan,
        timestamp: Date.now()
      };

      setFlowData(finalData);
      saveData(finalData);
      setFlowState('actionplan');

    } catch (error) {
      console.error('❌ Erro ao gerar plano de ação:', error);

      try {
        console.log('🔄 Tentando fallback...');
        const fallbackPlan = await generatePersonalizedPlan(
          flowData.initialMessage || 'Atividades educacionais gerais',
          contextData
        );

        const finalData = {
          ...dataWithContext,
          actionPlan: fallbackPlan,
          timestamp: Date.now()
        };

        setFlowData(finalData);
        saveData(finalData);
        setFlowState('actionplan');

      } catch (fallbackError) {
        console.error('❌ Erro crítico no fallback:', fallbackError);
        setFlowState('idle');
      }
    } finally {
      setIsLoading(false);
    }
  }, [flowData, saveData]);

  const approveActionPlan = useCallback(async (approvedItems: ActionPlanItem[]) => {
    console.log('📋 Aprovando plano de ação:', approvedItems);

    try {
      setIsLoading(true);

      const newFlowData = {
        ...flowData,
        actionPlan: approvedItems,
        timestamp: Date.now()
      };

      setFlowData(newFlowData);
      saveData(newFlowData);

      console.log('🎯 Transitando para interface de construção...');
      setFlowState('activities');
      setIsLoading(false);

      console.log('✅ Plano aprovado com sucesso! Interface de construção ativa.');

    } catch (error) {
      console.error('❌ Erro ao aprovar plano de ação:', error);
      setFlowState('actionplan');
    } finally {
      setIsLoading(false);
    }
  }, [flowData, saveData]);

  const resetFlow = useCallback(() => {
    console.log('🔄 Resetando School Power Flow...');
    setFlowState('idle');
    setFlowData({
      initialMessage: null,
      contextualizationData: null,
      actionPlan: [],
      manualActivities: [],
      timestamp: Date.now()
    });
    setIsLoading(false);

    localStorage.removeItem(STORAGE_KEY);

    console.log('✅ School Power Flow resetado');
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
