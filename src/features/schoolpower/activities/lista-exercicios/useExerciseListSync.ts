/**
 * CAMADA 4 - SINCRONIZAÇÃO EM TEMPO REAL
 * Hook para sincronizar estado da Lista de Exercícios
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  UnifiedExerciseListResponse, 
  processExerciseListWithUnifiedPipeline,
  IntelligentExtractor
} from './unified-exercise-pipeline';

interface UseExerciseListSyncOptions {
  activityId?: string;
  inputData?: any;
  autoSync?: boolean;
  debounceMs?: number;
}

interface UseExerciseListSyncResult {
  data: UnifiedExerciseListResponse | null;
  isLoading: boolean;
  error: string | null;
  processData: (rawData: any) => UnifiedExerciseListResponse;
  refresh: () => void;
  logs: string[];
}

export function useExerciseListSync(options: UseExerciseListSyncOptions = {}): UseExerciseListSyncResult {
  const { activityId, inputData, autoSync = false, debounceMs = 300 } = options;
  
  const [data, setData] = useState<UnifiedExerciseListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastInputRef = useRef<string>('');

  const processData = useCallback((rawData: any): UnifiedExerciseListResponse => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 [useExerciseListSync] Processando dados...');
      
      const result = processExerciseListWithUnifiedPipeline(rawData, {
        id: activityId,
        ...inputData
      });
      
      setData(result);
      setLogs(IntelligentExtractor.getLogs());
      
      if (!result.success) {
        setError(result.errors?.join('; ') || 'Falha no processamento');
      }
      
      console.log('✅ [useExerciseListSync] Processamento completo:', {
        success: result.success,
        questoes: result.metadata.totalQuestoes,
        valid: result.metadata.validQuestoes
      });
      
      return result;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Erro desconhecido';
      setError(errorMsg);
      console.error('❌ [useExerciseListSync] Erro:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [activityId, inputData]);

  const refresh = useCallback(() => {
    if (!inputData) return;
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      processData(data);
    }, debounceMs);
  }, [data, inputData, debounceMs, processData]);

  useEffect(() => {
    if (!autoSync || !inputData) return;
    
    const inputKey = JSON.stringify(inputData);
    if (inputKey === lastInputRef.current) return;
    
    lastInputRef.current = inputKey;
    refresh();
  }, [autoSync, inputData, refresh]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    processData,
    refresh,
    logs
  };
}

/**
 * Hook simplificado para uso direto no Preview
 */
export function useProcessedQuestions(rawData: any, inputData: any = {}): {
  questions: any[];
  metadata: any;
  isValid: boolean;
} {
  const [result, setResult] = useState<{
    questions: any[];
    metadata: any;
    isValid: boolean;
  }>({
    questions: [],
    metadata: {},
    isValid: false
  });

  useEffect(() => {
    if (!rawData) {
      setResult({ questions: [], metadata: {}, isValid: false });
      return;
    }

    try {
      const processed = processExerciseListWithUnifiedPipeline(rawData, inputData);
      setResult({
        questions: processed.questoes,
        metadata: processed.metadata,
        isValid: processed.success && processed.metadata.validQuestoes > 0
      });
    } catch (e) {
      console.error('[useProcessedQuestions] Erro:', e);
      setResult({ questions: [], metadata: { error: e }, isValid: false });
    }
  }, [rawData, inputData]);

  return result;
}
