import React, { useState, useCallback } from 'react';
import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import { generatePersonalizedPlan } from '../services/generatePersonalizedPlan';
import { isActivityEligibleForTrilhas } from '../data/trilhasActivitiesConfig';

export type FlowState = 'idle' | 'contextualizing' | 'actionplan' | 'generating' | 'generatingActivities' | 'activities';

interface SchoolPowerFlowData {
  initialMessage: string | null;
  contextualizationData: ContextualizationData | null;
  actionPlan: ActionPlanItem[] | null;
  manualActivities: ActionPlanItem[] | null;
  timestamp: number;
}

const STORAGE_KEY = 'schoolPowerFlow';

export default function useSchoolPowerFlow() {
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [flowData, setFlowData] = useState<SchoolPowerFlowData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('📥 Dados carregados do localStorage:', parsed);

        // Verificar se os dados são válidos
        if (parsed.contextualizationData) {
          const isDataValid = validateContextualizationData(parsed.contextualizationData);
          if (!isDataValid) {
            console.warn('⚠️ Dados de contextualização inválidos encontrados no localStorage, limpando...');
            localStorage.removeItem(STORAGE_KEY);
            return {
              initialMessage: null,
              contextualizationData: null,
              actionPlan: null,
              manualActivities: null,
              timestamp: 0
            };
          }
        }

        return parsed;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do localStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
    }

    return {
      initialMessage: null,
      contextualizationData: null,
      actionPlan: null,
      manualActivities: null,
      timestamp: 0
    };
  });
  const [isLoading, setIsLoading] = useState(false);

  // Função para validar dados de contextualização
  const validateContextualizationData = (data: ContextualizationData): boolean => {
    if (!data) return false;

    const isValidField = (field: string) => {
      return field &&
             field.trim() !== '' &&
             field.trim() !== '73' &&
             field.length > 2;
    };

    return isValidField(data.materias) && isValidField(data.publicoAlvo);
  };

  // Detectar estado baseado nos dados
  React.useEffect(() => {
    console.log('🔄 Detectando estado do fluxo baseado nos dados:', flowData);

    if (flowData.actionPlan && flowData.actionPlan.length > 0) {
      // Verificar se existem atividades aprovadas
      const approvedActivities = flowData.actionPlan.filter(item => item.approved);
      console.log('✅ Atividades aprovadas encontradas:', approvedActivities.length);

      if (approvedActivities.length > 0) {
        console.log('🎯 Mudando para estado activities');
        setFlowState('activities');
      } else {
        console.log('📋 Mudando para estado actionplan');
        setFlowState('actionplan');
      }
    } else if (flowData.contextualizationData) {
      const isValid = validateContextualizationData(flowData.contextualizationData);
      console.log('🔍 Dados de contextualização válidos:', isValid);

      if (isValid) {
        console.log('📋 Dados válidos - mudando para actionplan');
        setFlowState('actionplan');
      } else {
        console.log('❌ Dados inválidos - mudando para contextualizing');
        setFlowState('contextualizing');
      }
    } else if (flowData.initialMessage) {
      console.log('💬 Mensagem inicial encontrada - mudando para contextualizing');
      setFlowState('contextualizing');
    } else {
      console.log('🏠 Nenhum dado encontrado - mudando para idle');
      setFlowState('idle');
    }
  }, [flowData]);

  // Salvar no localStorage sempre que os dados mudarem
  const saveToLocalStorage = useCallback((data: SchoolPowerFlowData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('💾 Dados salvos no localStorage');
    } catch (error) {
      console.error('❌ Erro ao salvar no localStorage:', error);
    }
  }, []);

  // Função para enviar mensagem inicial
  const sendInitialMessage = useCallback(async (message: string) => {
    console.log('📤 Enviando mensagem inicial:', message);

    if (!message?.trim()) {
      console.error('❌ Mensagem vazia');
      return;
    }

    const newData: SchoolPowerFlowData = {
      initialMessage: message.trim(),
      contextualizationData: null,
      actionPlan: null,
      manualActivities: null,
      timestamp: Date.now()
    };

    setFlowData(newData);
    saveToLocalStorage(newData);
    setFlowState('contextualizing');
  }, [saveToLocalStorage]);

  // Função para submeter contextualização
  const submitContextualization = useCallback(async (data: ContextualizationData) => {
    console.log('📝 Submetendo contextualização:', data);

    if (!flowData.initialMessage) {
      console.error('❌ Mensagem inicial não encontrada');
      alert('Mensagem inicial é obrigatória para gerar o plano.');
      return;
    }

    setIsLoading(true);
    setFlowState('generating');

    try {
      console.log('🤖 Iniciando geração do plano personalizado...');

      // Sempre gerar plano, mesmo com dados inválidos (o service fará a correção)
      const actionPlan = await generatePersonalizedPlan(flowData.initialMessage, data);

      if (!actionPlan || actionPlan.length === 0) {
        console.error('❌ Nenhuma atividade foi gerada pelo serviço');
        throw new Error('Nenhuma atividade foi gerada');
      }

      console.log('✅ Plano gerado com sucesso:', actionPlan.length, 'atividades');
      console.log('📋 Atividades geradas:', actionPlan.map(a => ({ id: a.id, title: a.title })));

      const newData: SchoolPowerFlowData = {
        ...flowData,
        contextualizationData: data,
        actionPlan: actionPlan,
        timestamp: Date.now()
      };

      setFlowData(newData);
      saveToLocalStorage(newData);

      // Aguardar um pouco para garantir que os dados foram salvos
      setTimeout(() => {
        setFlowState('actionplan');
      }, 500);

    } catch (error) {
      console.error('❌ Erro ao gerar plano:', error);
      alert(`Erro ao gerar o plano de ação: ${error.message || error}`);
      setFlowState('contextualizing');
    } finally {
      setIsLoading(false);
    }
  }, [flowData, saveToLocalStorage]);

  // Função para aprovar action plan
  const approveActionPlan = useCallback(async (approvedItems: ActionPlanItem[]) => {
    console.log('✅ Aprovando action plan:', approvedItems.length, 'itens');

    if (!approvedItems || approvedItems.length === 0) {
      console.error('❌ Nenhuma atividade selecionada');
      alert('Selecione pelo menos uma atividade para continuar.');
      return;
    }

    setIsLoading(true);
    setFlowState('generatingActivities');

    try {
      // Marcar atividades como aprovadas
      const approvedActivities = approvedItems.map(item => ({
        ...item,
        approved: true,
        timestamp: Date.now()
      }));

      const newData: SchoolPowerFlowData = {
        ...flowData,
        actionPlan: flowData.actionPlan?.map(item => {
          const approved = approvedActivities.find(a => a.id === item.id);
          return approved ? { ...item, approved: true } : item;
        }) || [],
        timestamp: Date.now()
      };

      setFlowData(newData);
      saveToLocalStorage(newData);

      // Simular processo de geração
      setTimeout(() => {
        setFlowState('activities');
        setIsLoading(false);
      }, 2000);

    } catch (error) {
      console.error('❌ Erro ao aprovar action plan:', error);
      alert('Erro ao processar atividades. Tente novamente.');
      setFlowState('actionplan');
      setIsLoading(false);
    }
  }, [flowData, saveToLocalStorage]);

  // Função para resetar o fluxo
  const resetFlow = useCallback(() => {
    console.log('🔄 Resetando fluxo do School Power');

    const emptyData: SchoolPowerFlowData = {
      initialMessage: null,
      contextualizationData: null,
      actionPlan: null,
      manualActivities: null,
      timestamp: 0
    };

    setFlowData(emptyData);
    setFlowState('idle');
    setIsLoading(false);

    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ Dados removidos do localStorage');
    } catch (error) {
      console.error('❌ Erro ao limpar localStorage:', error);
    }
  }, []);

  return {
    flowState,
    flowData,
    isLoading,
    sendInitialMessage,
    submitContextualization,
    approveActionPlan,
    resetFlow
  };
}