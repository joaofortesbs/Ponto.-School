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

  // Função para resetar o fluxo - VERSÃO OTIMIZADA
  const resetFlow = useCallback(() => {
    console.log('🔄 [RESET INICIADO] School Power Flow Reset...');
    console.log('📊 Estado ANTES do reset:', { 
      flowState, 
      hasInitialMessage: !!flowData.initialMessage,
      hasContextualization: !!flowData.contextualizationData,
      actionPlanLength: flowData.actionPlan?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    try {
      console.log('🧹 Iniciando limpeza completa do localStorage...');
      
      // Lista COMPLETA de chaves para remover
      const keysToRemove = [
        STORAGE_KEY,
        'schoolpower_activities',
        'schoolpower_construction_data', 
        'constructedActivities',
        'schoolpower_action_plan',
        'auto_activity_data_flash-cards',
        'auto_activity_data_quiz-interativo',
        'schoolpower_contextualization',
        'schoolpower_initial_message',
        'schoolpower_generated_plan'
      ];
      
      // Remover todas as chaves com verificação
      keysToRemove.forEach(key => {
        try {
          const existed = localStorage.getItem(key) !== null;
          localStorage.removeItem(key);
          console.log(`🗑️ ${existed ? 'REMOVIDO' : 'NÃO EXISTIA'}: ${key}`);
        } catch (error) {
          console.warn(`⚠️ Erro ao remover ${key}:`, error);
        }
      });
      
      // Marcar timestamp do reset
      const resetTimestamp = Date.now().toString();
      localStorage.setItem('schoolpower_reset_timestamp', resetTimestamp);
      console.log(`⏰ Timestamp de reset definido: ${resetTimestamp}`);
      
      // Estado limpo
      const cleanState: SchoolPowerFlowData = {
        initialMessage: null,
        contextualizationData: null,
        actionPlan: [],
        manualActivities: [],
        timestamp: Date.now()
      };
      
      console.log('🔄 Atualizando estados do React...');
      
      // Resetar loading primeiro
      setIsLoading(false);
      
      // Usar startTransition para atualização prioritária e SÍNCRONA
      startTransition(() => {
        console.log('⚡ Executando transição de estado...');
        setFlowState('idle');
        setFlowData(cleanState);
        console.log('✅ Estados React atualizados para idle + dados limpos');
      });

      // Verificação imediata
      console.log('🎯 Verificação imediata pós-reset:');
      console.log('   - flowState deve ser: idle');
      console.log('   - flowData deve estar limpo');
      
      // Disparar eventos de notificação
      const resetEvent = new CustomEvent('schoolpower-flow-reset', {
        detail: { 
          previousState: flowState, 
          newState: 'idle',
          timestamp: resetTimestamp,
          source: 'resetFlow-function'
        }
      });
      
      window.dispatchEvent(resetEvent);
      console.log('📡 Evento schoolpower-flow-reset disparado');
      
      // Verificação com delay para garantir sincronização
      setTimeout(() => {
        console.log('🔍 Verificação pós-reset (150ms):');
        
        // Remover timestamp de reset
        localStorage.removeItem('schoolpower_reset_timestamp');
        
        // Verificar se localStorage está realmente limpo
        const remainingData = localStorage.getItem(STORAGE_KEY);
        console.log('💾 Dados remanescentes no localStorage:', remainingData ? 'AINDA EXISTE' : 'LIMPO ✅');
        
        // Verificar estado atual
        console.log('📊 Estado atual do hook:', {
          currentFlowState: flowState,
          shouldBeIdle: true,
          dataEmpty: !flowData.initialMessage
        });
        
        // Força adicional se necessário
        if (flowState !== 'idle') {
          console.log('🔧 FORÇANDO estado idle - estado atual não é idle');
          setFlowState('idle');
          setFlowData(cleanState);
        }
        
        console.log('🎯 [RESET FINALIZADO] Estado deve estar em IDLE agora');
        
        // Evento final de confirmação
        window.dispatchEvent(new CustomEvent('schoolpower-reset-complete', {
          detail: { 
            finalState: 'idle',
            timestamp: Date.now(),
            success: true
          }
        }));
        
      }, 150);
      
    } catch (error) {
      console.error('❌ [ERRO CRÍTICO] Durante reset do School Power Flow:', error);
      
      // Fallback de emergência MÁS ROBUSTO
      try {
        console.log('🚨 Executando fallback de emergência...');
        
        // Limpar TODO o localStorage
        const storageLength = localStorage.length;
        console.log(`🧹 Limpando ${storageLength} itens do localStorage...`);
        localStorage.clear();
        
        // Recarregar página
        console.log('🔄 Recarregando página como último recurso...');
        window.location.reload();
        
      } catch (fallbackError) {
        console.error('❌ [ERRO FATAL] No fallback de reset:', fallbackError);
      }
    }
  }, [flowState, flowData, setFlowState, setFlowData, setIsLoading]);

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