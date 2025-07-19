
import { useState, useCallback } from 'react';
import { ContextualizationData } from '../contextualization/ContextualizationCard';

export type FlowState = 'idle' | 'contextualizing' | 'generating';

interface SchoolPowerFlowData {
  initialMessage: string | null;
  contextualizationData: ContextualizationData | null;
  timestamp: number;
}

interface UseSchoolPowerFlowReturn {
  flowState: FlowState;
  flowData: SchoolPowerFlowData;
  sendInitialMessage: (message: string) => void;
  submitContextualization: (data: ContextualizationData) => void;
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
      timestamp: Date.now()
    };
  };

  const [flowData, setFlowData] = useState<SchoolPowerFlowData>(loadStoredData);
  const [flowState, setFlowState] = useState<FlowState>(() => {
    const stored = loadStoredData();
    if (stored.initialMessage && !stored.contextualizationData) {
      return 'contextualizing';
    }
    if (stored.initialMessage && stored.contextualizationData) {
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
      timestamp: Date.now()
    };
    
    setFlowData(newData);
    saveData(newData);
    setFlowState('contextualizing');
  }, [saveData]);

  // Submete dados de contextualização e inicia geração
  const submitContextualization = useCallback((data: ContextualizationData) => {
    console.log('📝 Contextualização submetida:', data);
    setIsLoading(true);
    
    const newData: SchoolPowerFlowData = {
      ...flowData,
      contextualizationData: data,
      timestamp: Date.now()
    };
    
    setFlowData(newData);
    saveData(newData);
    setFlowState('generating');
    
    // Simula processamento - aqui será integrado com a API Gemini
    setTimeout(() => {
      console.log('🤖 Dados prontos para IA:', {
        message: newData.initialMessage,
        context: newData.contextualizationData
      });
      setIsLoading(false);
    }, 2000);
  }, [flowData, saveData]);

  // Reseta todo o fluxo
  const resetFlow = useCallback(() => {
    console.log('🔄 Resetando School Power Flow');
    
    const emptyData: SchoolPowerFlowData = {
      initialMessage: null,
      contextualizationData: null,
      timestamp: Date.now()
    };
    
    setFlowData(emptyData);
    saveData(emptyData);
    setFlowState('idle');
    setIsLoading(false);
    
    // Limpa localStorage
    localStorage.removeItem(STORAGE_KEY);
  }, [saveData]);

  return {
    flowState,
    flowData,
    sendInitialMessage,
    submitContextualization,
    resetFlow,
    isLoading
  };
}

export default useSchoolPowerFlow;
