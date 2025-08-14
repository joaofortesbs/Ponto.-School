
import React, { useState, useCallback } from 'react';
import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import { generatePersonalizedPlan } from '../services/generatePersonalizedPlan';
import { isActivityEligibleForTrilhas } from '../data/trilhasActivitiesConfig';
import { generateActivityContent } from '../construction/api/generateActivity';
import { SequenciaDidaticaGenerator } from '../activities/sequencia-didatica/SequenciaDidaticaGenerator';

export type FlowState = 'idle' | 'contextualizing' | 'actionplan' | 'generating' | 'generatingActivities' | 'activities';

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

  // Salva dados no localStorage de forma sincronizada
  const saveData = useCallback((data: SchoolPowerFlowData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('💾 Dados do School Power Flow salvos no localStorage:', data);
    } catch (error) {
      console.error('❌ Erro ao salvar dados do School Power Flow no localStorage:', error);
    }
  }, []);

  const sendInitialMessage = useCallback((message: string) => {
    console.log('📤 Enviando mensagem inicial:', message);
    setIsLoading(true);
    
    const newData = {
      ...flowData,
      initialMessage: message,
      timestamp: Date.now()
    };
    
    setFlowData(newData);
    saveData(newData);
    setFlowState('contextualizing');
    setIsLoading(false);
  }, [flowData, saveData]);

  const submitContextualization = useCallback(async (data: ContextualizationData) => {
    console.log('📝 Submetendo contextualização:', data);
    setIsLoading(true);
    setFlowState('generating');

    try {
      // Gerar plano personalizado
      const actionPlan = await generatePersonalizedPlan(data);
      
      const newData = {
        ...flowData,
        contextualizationData: data,
        actionPlan: actionPlan,
        timestamp: Date.now()
      };
      
      setFlowData(newData);
      saveData(newData);
      setFlowState('actionplan');
    } catch (error) {
      console.error('❌ Erro ao gerar plano:', error);
      setFlowState('contextualizing');
    } finally {
      setIsLoading(false);
    }
  }, [flowData, saveData]);

  const approveActionPlan = useCallback(async (approvedItems: ActionPlanItem[]) => {
    console.log('✅ Aprovando plano de ação:', approvedItems);
    setIsLoading(true);
    setFlowState('generatingActivities');

    try {
      // Processar atividades aprovadas
      const newData = {
        ...flowData,
        actionPlan: approvedItems,
        timestamp: Date.now()
      };
      
      setFlowData(newData);
      saveData(newData);
      setFlowState('activities');
    } catch (error) {
      console.error('❌ Erro ao processar atividades:', error);
      setFlowState('actionplan');
    } finally {
      setIsLoading(false);
    }
  }, [flowData, saveData]);

  const resetFlow = useCallback(() => {
    console.log('🔄 Resetando fluxo do School Power');
    const resetData = {
      initialMessage: null,
      contextualizationData: null,
      actionPlan: [],
      manualActivities: [],
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
