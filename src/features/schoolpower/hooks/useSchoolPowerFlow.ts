
import { useState, useCallback } from 'react';

export type FlowState = 'idle' | 'contextualization' | 'construction' | 'action-plan';

export const useSchoolPowerFlow = () => {
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startFlow = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      setFlowState('contextualization');
    } catch (err) {
      console.error('Erro ao iniciar fluxo:', err);
      setError('Erro ao iniciar o fluxo');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const nextStep = useCallback(() => {
    try {
      setFlowState(current => {
        switch (current) {
          case 'idle':
            return 'contextualization';
          case 'contextualization':
            return 'construction';
          case 'construction':
            return 'action-plan';
          case 'action-plan':
            return 'idle';
          default:
            return 'idle';
        }
      });
    } catch (err) {
      console.error('Erro ao avançar etapa:', err);
      setError('Erro ao avançar etapa');
    }
  }, []);

  const resetFlow = useCallback(() => {
    try {
      setFlowState('idle');
      setError(null);
    } catch (err) {
      console.error('Erro ao resetar fluxo:', err);
    }
  }, []);

  return {
    flowState,
    isLoading,
    error,
    startFlow,
    nextStep,
    resetFlow
  };
};
