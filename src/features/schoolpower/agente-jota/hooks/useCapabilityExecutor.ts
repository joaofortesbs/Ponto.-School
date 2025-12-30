/**
 * HOOK: useCapabilityExecutor
 * 
 * Hook React para integrar o CapabilityExecutor com a UI.
 * Gerencia estado de execução e emite eventos de progresso para os componentes.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { capabilityExecutor, ExecutionResult } from '../capability-executor';
import type { CapabilityOutput, DataConfirmation } from '../capabilities/shared/types';
import { useDebugStore, createDebugEntry } from '../../interface-chat-producao/debug-system/DebugStore';

export type ExecutionStatus = 'idle' | 'running' | 'completed' | 'failed' | 'blocked';

export interface CapabilityProgress {
  capabilityId: string;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'blocked';
  dataConfirmation?: DataConfirmation;
  duration?: number;
  error?: string;
}

export interface ExecutorState {
  status: ExecutionStatus;
  currentCapability: string | null;
  completedCapabilities: string[];
  blockedCapabilities: string[];
  progress: Map<string, CapabilityProgress>;
  results: Map<string, CapabilityOutput>;
  executionId: string | null;
  errors: string[];
}

const initialState: ExecutorState = {
  status: 'idle',
  currentCapability: null,
  completedCapabilities: [],
  blockedCapabilities: [],
  progress: new Map(),
  results: new Map(),
  executionId: null,
  errors: []
};

export function useCapabilityExecutor() {
  const [state, setState] = useState<ExecutorState>(initialState);
  const debugStore = useDebugStore();
  const abortRef = useRef(false);

  const resetState = useCallback(() => {
    setState(initialState);
    abortRef.current = false;
  }, []);

  const executeCapability = useCallback(async (
    capabilityId: string,
    context: Record<string, any> = {}
  ): Promise<CapabilityOutput | null> => {
    if (abortRef.current) return null;

    setState(prev => ({
      ...prev,
      status: 'running',
      currentCapability: capabilityId,
      progress: new Map(prev.progress).set(capabilityId, {
        capabilityId,
        status: 'executing'
      })
    }));

    debugStore.startCapability(capabilityId, capabilityId);
    
    createDebugEntry(
      capabilityId,
      capabilityId,
      'action',
      `Iniciando execução da capability "${capabilityId}"...`,
      'low'
    );

    try {
      const result = await capabilityExecutor.execute(capabilityId, context);
      
      // Verificar data confirmation
      const isBlocked = result.data_confirmation?.blocksNextStep && !result.data_confirmation?.confirmed;

      if (result.data_confirmation) {
        createDebugEntry(
          capabilityId,
          capabilityId,
          'confirmation',
          result.data_confirmation.summary,
          result.data_confirmation.confirmed ? 'low' : 'high',
          { checks: result.data_confirmation.checks }
        );
      }

      setState(prev => {
        const newProgress = new Map(prev.progress);
        newProgress.set(capabilityId, {
          capabilityId,
          status: isBlocked ? 'blocked' : (result.success ? 'completed' : 'failed'),
          dataConfirmation: result.data_confirmation,
          duration: result.metadata.duration_ms,
          error: result.error?.message
        });

        return {
          ...prev,
          currentCapability: null,
          completedCapabilities: result.success && !isBlocked 
            ? [...prev.completedCapabilities, capabilityId]
            : prev.completedCapabilities,
          blockedCapabilities: isBlocked 
            ? [...prev.blockedCapabilities, capabilityId]
            : prev.blockedCapabilities,
          progress: newProgress,
          results: new Map(prev.results).set(capabilityId, result),
          errors: result.error 
            ? [...prev.errors, result.error.message]
            : prev.errors
        };
      });

      debugStore.endCapability(capabilityId);

      if (isBlocked) {
        console.error(`🚫 [useCapabilityExecutor] Capability ${capabilityId} bloqueada por data confirmation`);
        return null;
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      createDebugEntry(
        capabilityId,
        capabilityId,
        'error',
        `Erro na capability: ${errorMessage}`,
        'high'
      );

      setState(prev => ({
        ...prev,
        currentCapability: null,
        progress: new Map(prev.progress).set(capabilityId, {
          capabilityId,
          status: 'failed',
          error: errorMessage
        }),
        errors: [...prev.errors, errorMessage]
      }));

      debugStore.endCapability(capabilityId);
      return null;
    }
  }, [debugStore]);

  const executeSequence = useCallback(async (
    capabilities: string[],
    context: Record<string, any> = {},
    dependencies?: Record<string, string[]>
  ): Promise<ExecutionResult | null> => {
    if (abortRef.current) return null;

    resetState();

    setState(prev => ({
      ...prev,
      status: 'running',
      executionId: capabilityExecutor.getExecutionId()
    }));

    // Inicializar progresso para todas capabilities
    const initialProgress = new Map<string, CapabilityProgress>();
    capabilities.forEach(cap => {
      initialProgress.set(cap, { capabilityId: cap, status: 'pending' });
    });
    setState(prev => ({ ...prev, progress: initialProgress }));

    try {
      const result = await capabilityExecutor.executeSequence({
        capabilities,
        context,
        dependencies
      });

      // Atualizar estado com resultados
      const finalProgress = new Map<string, CapabilityProgress>();
      result.results.forEach((output, capId) => {
        const isBlocked = output.data_confirmation?.blocksNextStep && !output.data_confirmation?.confirmed;
        finalProgress.set(capId, {
          capabilityId: capId,
          status: isBlocked ? 'blocked' : (output.success ? 'completed' : 'failed'),
          dataConfirmation: output.data_confirmation,
          duration: output.metadata.duration_ms,
          error: output.error?.message
        });
      });

      setState(prev => ({
        ...prev,
        status: result.success ? 'completed' : 'failed',
        currentCapability: null,
        progress: finalProgress,
        results: result.results,
        errors: result.errors
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      setState(prev => ({
        ...prev,
        status: 'failed',
        currentCapability: null,
        errors: [...prev.errors, errorMessage]
      }));

      return null;
    }
  }, [resetState]);

  const abort = useCallback(() => {
    abortRef.current = true;
    setState(prev => ({
      ...prev,
      status: 'idle',
      currentCapability: null
    }));
  }, []);

  const getResult = useCallback((capabilityId: string): CapabilityOutput | undefined => {
    return state.results.get(capabilityId);
  }, [state.results]);

  const getDataConfirmation = useCallback((capabilityId: string): DataConfirmation | undefined => {
    return state.progress.get(capabilityId)?.dataConfirmation;
  }, [state.progress]);

  const isCapabilityBlocked = useCallback((capabilityId: string): boolean => {
    return state.blockedCapabilities.includes(capabilityId);
  }, [state.blockedCapabilities]);

  return {
    state,
    executeCapability,
    executeSequence,
    abort,
    resetState,
    getResult,
    getDataConfirmation,
    isCapabilityBlocked,
    isRunning: state.status === 'running',
    isCompleted: state.status === 'completed',
    isFailed: state.status === 'failed'
  };
}

export default useCapabilityExecutor;
