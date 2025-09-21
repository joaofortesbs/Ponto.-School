
import { useCallback, useEffect, useRef } from 'react';
import { useActivities } from '@/hooks/useActivities';
import { autoSaveService } from '../services/autoSaveService';

export interface UseActivityAutoSaveOptions {
  enabled?: boolean;
  delayMs?: number;
  onSaveSuccess?: (activityCode: string) => void;
  onSaveError?: (error: string) => void;
}

export function useActivityAutoSave(options: UseActivityAutoSaveOptions = {}) {
  const { saveActivity } = useActivities();
  const optionsRef = useRef(options);
  
  // Atualizar referência das opções
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Configurar auto-save service na inicialização
  useEffect(() => {
    autoSaveService.configure({
      enabled: options.enabled ?? true,
      delayMs: options.delayMs ?? 2000,
      retryAttempts: 3
    });
  }, [options.enabled, options.delayMs]);

  const triggerAutoSave = useCallback(async (activity: any) => {
    if (!optionsRef.current.enabled) {
      console.log('🚫 Auto-save desabilitado');
      return;
    }

    console.log('🔄 Triggering auto-save para:', activity.title);
    
    try {
      // Usar o service de auto-save
      autoSaveService.scheduleAutoSave({
        id: activity.id,
        type: activity.type || 'generic',
        title: activity.title,
        description: activity.description || '',
        progress: activity.progress || 0,
        status: activity.status || 'draft',
        originalData: activity.originalData || activity
      });
      
    } catch (error) {
      console.error('❌ Erro no triggerAutoSave:', error);
      optionsRef.current.onSaveError?.(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }, []);

  const saveNow = useCallback(async (activity: any) => {
    console.log('💾 Salvamento imediato solicitado:', activity.title);
    
    try {
      const userId = localStorage.getItem('user_id') || 
                     localStorage.getItem('current_user_id') || 
                     'anonymous';
      
      const activityCode = `immediate-${activity.type}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      
      const saveData = {
        user_id: userId,
        activity_code: activityCode,
        type: activity.type || 'generic',
        title: activity.title,
        content: {
          ...activity.originalData || activity,
          savedAt: new Date().toISOString(),
          immediateSave: true
        }
      };

      const result = await saveActivity(saveData);
      
      if (result) {
        console.log('✅ Salvamento imediato bem-sucedido:', activityCode);
        optionsRef.current.onSaveSuccess?.(activityCode);
        return { success: true, activityCode };
      } else {
        throw new Error('Falha no salvamento');
      }
      
    } catch (error) {
      console.error('❌ Erro no salvamento imediato:', error);
      optionsRef.current.onSaveError?.(error instanceof Error ? error.message : 'Erro desconhecido');
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }, [saveActivity]);

  const getAutoSaveStats = useCallback(() => {
    return autoSaveService.getStats();
  }, []);

  const syncPending = useCallback(async () => {
    console.log('🔄 Sincronizando atividades pendentes...');
    return await autoSaveService.syncPendingActivities();
  }, []);

  const cancelPending = useCallback(() => {
    autoSaveService.cancelPendingSaves();
  }, []);

  return {
    triggerAutoSave,
    saveNow,
    getAutoSaveStats,
    syncPending,
    cancelPending,
    isEnabled: options.enabled ?? true
  };
}

export default useActivityAutoSave;
