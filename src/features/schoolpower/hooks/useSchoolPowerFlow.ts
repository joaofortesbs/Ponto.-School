import React, { useState, useCallback, startTransition } from 'react';
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

  // Carrega dados do localStorage apenas na inicialização
  const loadStoredData = (): SchoolPowerFlowData | null => {
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
  };

  // Inicializar com dados salvos se existirem - mas APENAS uma vez na montagem
  React.useEffect(() => {
    // Verificar se já foi resetado recentemente (últimos 2 segundos)
    const resetTimestamp = localStorage.getItem('schoolpower_reset_timestamp');
    const now = Date.now();
    
    if (resetTimestamp && (now - parseInt(resetTimestamp)) < 2000) {
      console.log('🔄 Reset recente detectado - mantendo estado idle');
      localStorage.removeItem('schoolpower_reset_timestamp');
      setFlowState('idle');
      return;
    }

    const storedData = loadStoredData();
    if (storedData) {
      console.log('📥 Carregando dados salvos:', storedData);
      setFlowData(storedData);

      // Definir estado baseado nos dados carregados
      if (storedData.initialMessage && !storedData.contextualizationData) {
        console.log('🔄 Estado definido: contextualizing');
        setFlowState('contextualizing');
      } else if (storedData.initialMessage && storedData.contextualizationData && (!storedData.actionPlan || storedData.actionPlan.length === 0)) {
        console.log('🔄 Estado definido: actionplan');
        setFlowState('actionplan');
      } else if (storedData.initialMessage && storedData.contextualizationData && storedData.actionPlan && storedData.actionPlan.length > 0) {
        // Verificar se temos atividades aprovadas
        const hasApprovedActivities = storedData.actionPlan.some(item => item.approved);
        if (hasApprovedActivities) {
          console.log('🔄 Estado definido: activities - atividades aprovadas encontradas');
          setFlowState('activities');
        } else {
          console.log('🔄 Estado definido: actionplan - nenhuma atividade aprovada');
          setFlowState('actionplan');
        }
      } else {
        console.log('🔄 Estado definido: idle - dados incompletos');
        setFlowState('idle');
      }
    } else {
      console.log('🔄 Nenhum dado salvo encontrado - mantendo idle');
      setFlowState('idle');
    }
  }, []);

  // Envia mensagem inicial e inicia processo de contextualização
  const sendInitialMessage = useCallback((message: string) => {
    console.log('📤 Enviando mensagem inicial para School Power:', message);

    const newData: SchoolPowerFlowData = {
      initialMessage: message,
      contextualizationData: null,
      actionPlan: [],
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

    // Validar se temos initialMessage (buscar também no localStorage se necessário)
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

    // Atualizar estado para generating imediatamente
    setIsLoading(true);
    setFlowState('generating');

    // Salvar dados de contextualização no estado
    const dataWithContext = {
      initialMessage: currentMessage, // Garantir que a mensagem está presente
      contextualizationData: contextData,
      actionPlan: [],
      timestamp: Date.now()
    };

    setFlowData(dataWithContext);
    saveData(dataWithContext);

    console.log('✅ Dados de contextualização salvos:', dataWithContext);

    try {
      // Gera action plan usando o novo serviço personalizado
      console.log('🤖 Iniciando geração de plano de ação com IA Gemini...');
      console.log('📝 Dados coletados:', {
        message: currentMessage,
        contextData
      });

      console.log('📤 Enviando para geração personalizada...');
      const actionPlan = await generatePersonalizedPlan(
        currentMessage,
        contextData
      );

      console.log('✅ Action plan personalizado gerado:', actionPlan);

      // Salvar action plan gerado
      const finalData = {
        ...dataWithContext,
        actionPlan,
        timestamp: Date.now()
      };

      setFlowData(finalData);
      saveData(finalData);
      setFlowState('actionplan');

      console.log('✅ Action plan gerado e salvo:', actionPlan);

    } catch (error) {
      console.error('❌ Erro ao gerar plano de ação com IA Gemini:', error);

      // Em caso de erro, o generatePersonalizedPlan já retorna um fallback
      // Então tentamos novamente com dados mínimos
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

        console.log('🔄 Plano de fallback aplicado:', fallbackPlan);
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

      // Garantir que temos uma mensagem inicial
      const currentMessage = flowData.initialMessage || 'Atividades educacionais';

      const newFlowData = {
        ...flowData,
        initialMessage: currentMessage, // Garantir que a mensagem está preservada
        actionPlan: approvedItems.map(item => ({
          ...item,
          approved: true // Garantir que todas estão marcadas como aprovadas
        })),
        timestamp: Date.now()
      };

      console.log('💾 Salvando dados do plano aprovado:', newFlowData);
      
      setFlowData(newFlowData);
      saveData(newFlowData);

      // Transição imediata para activities
      console.log('🎯 Transitando imediatamente para interface de construção...');
      setFlowState('activities');

      console.log('✅ Plano aprovado com sucesso! Interface de construção ativa.');

    } catch (error) {
      console.error('❌ Erro ao aprovar plano de ação:', error);
      setFlowState('actionplan');
    } finally {
      setIsLoading(false);
    }
  }, [flowData, saveData]);

  // Função para resetar o fluxo
  const resetFlow = useCallback(() => {
    console.log('🔄 Resetando School Power Flow...');
    console.log('📊 Estado antes do reset:', { flowState, flowData });
    
    try {
      // Limpar TODOS os dados relacionados ao School Power
      const keysToRemove = [
        STORAGE_KEY,
        'schoolpower_activities',
        'schoolpower_construction_data',
        'constructedActivities',
        'schoolpower_action_plan',
        'auto_activity_data_flash-cards',
        'auto_activity_data_quiz-interativo'
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log(`🗑️ Removido: ${key}`);
        } catch (error) {
          console.warn(`⚠️ Erro ao remover ${key}:`, error);
        }
      });
      
      // Marcar timestamp do reset para evitar restauração automática
      localStorage.setItem('schoolpower_reset_timestamp', Date.now().toString());
      
      // Resetar todos os estados de forma síncrona e imediata
      const cleanState: SchoolPowerFlowData = {
        initialMessage: null,
        contextualizationData: null,
        actionPlan: [],
        manualActivities: [],
        timestamp: Date.now()
      };
      
      // Força a atualização dos estados em ordem específica
      setIsLoading(false);
      
      // Usar startTransition para garantir que a atualização seja prioritária
      startTransition(() => {
        setFlowState('idle'); // Primeiro muda o estado
        setFlowData(cleanState); // Depois limpa os dados
      });

      console.log('✅ School Power Flow resetado COMPLETAMENTE - voltando para interface inicial');
      console.log('🏠 Estado após reset:', { flowState: 'idle', flowData: cleanState });
      
      // Disparar evento customizado para notificar outros componentes
      window.dispatchEvent(new CustomEvent('schoolpower-flow-reset', {
        detail: { previousState: flowState, newState: 'idle' }
      }));
      
      // Verificação adicional para garantir que o reset foi efetivo
      setTimeout(() => {
        localStorage.removeItem('schoolpower_reset_timestamp');
        
        // Verificação final - se ainda não estiver em idle, forçar novamente
        if (flowState !== 'idle') {
          console.log('🔧 Forçando estado idle após reset');
          setFlowState('idle');
          setFlowData(cleanState);
        }
        
        console.log('🎯 Reset finalizado - estado deve estar em idle');
      }, 150);
      
    } catch (error) {
      console.error('❌ Erro durante reset do School Power Flow:', error);
      
      // Fallback em caso de erro
      try {
        localStorage.clear();
        window.location.reload();
      } catch (fallbackError) {
        console.error('❌ Erro no fallback de reset:', fallbackError);
      }
    }
  }, [flowState, flowData]);

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