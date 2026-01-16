/**
 * ACTIVITY DEBUG STORE - Sistema de rastreamento de logs por atividade
 * 
 * Armazena logs detalhados de cada etapa do processo de construção de atividades.
 * Permite visualizar exatamente o que aconteceu em cada atividade.
 * 
 * NÍVEIS DE LOG:
 * - info: Informação geral do processo
 * - action: Ação sendo executada
 * - api: Chamada de API
 * - success: Operação bem-sucedida
 * - warning: Aviso que não impede execução
 * - error: Erro que pode impedir execução
 */

import { create } from 'zustand';

export type DebugLogLevel = 'info' | 'action' | 'api' | 'success' | 'warning' | 'error';

export interface ActivityDebugEntry {
  id: string;
  timestamp: Date;
  level: DebugLogLevel;
  source: string;
  message: string;
  data?: Record<string, any>;
  duration?: number;
}

export interface ActivityDebugState {
  activityId: string;
  activityName: string;
  activityType: string;
  status: 'pending' | 'building' | 'completed' | 'error';
  startTime?: Date;
  endTime?: Date;
  entries: ActivityDebugEntry[];
  currentStep?: string;
  progress: number;
  errorSummary?: string;
}

interface ActivityDebugStoreState {
  activities: Map<string, ActivityDebugState>;
  
  initActivity: (activityId: string, name: string, type: string) => void;
  
  log: (
    activityId: string, 
    level: DebugLogLevel, 
    source: string, 
    message: string, 
    data?: Record<string, any>,
    duration?: number
  ) => void;
  
  setStatus: (activityId: string, status: ActivityDebugState['status']) => void;
  
  setProgress: (activityId: string, progress: number, step?: string) => void;
  
  setError: (activityId: string, errorSummary: string) => void;
  
  markCompleted: (activityId: string) => void;
  
  getActivityDebug: (activityId: string) => ActivityDebugState | undefined;
  
  getAllLogs: (activityId: string) => ActivityDebugEntry[];
  
  clearActivity: (activityId: string) => void;
  
  clearAll: () => void;
}

let entryCounter = 0;

export const useActivityDebugStore = create<ActivityDebugStoreState>((set, get) => ({
  activities: new Map(),

  initActivity: (activityId, name, type) => {
    set(state => {
      const newActivities = new Map(state.activities);
      const existingState = newActivities.get(activityId);
      
      if (!existingState) {
        newActivities.set(activityId, {
          activityId,
          activityName: name,
          activityType: type,
          status: 'pending',
          entries: [],
          progress: 0
        });
        
        console.log(`🐛 [ActivityDebug] Inicializado debug para: ${name} (${activityId})`);
      }
      
      return { activities: newActivities };
    });
  },

  log: (activityId, level, source, message, data, duration) => {
    const entry: ActivityDebugEntry = {
      id: `debug-${++entryCounter}-${Date.now()}`,
      timestamp: new Date(),
      level,
      source,
      message,
      data,
      duration
    };

    set(state => {
      const newActivities = new Map(state.activities);
      const activityState = newActivities.get(activityId);
      
      if (activityState) {
        newActivities.set(activityId, {
          ...activityState,
          entries: [...activityState.entries, entry]
        });
      } else {
        newActivities.set(activityId, {
          activityId,
          activityName: 'Atividade Desconhecida',
          activityType: 'unknown',
          status: 'pending',
          entries: [entry],
          progress: 0
        });
      }
      
      return { activities: newActivities };
    });

    const emoji = {
      info: 'ℹ️',
      action: '⚡',
      api: '🌐',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[level];
    
    console.log(`${emoji} [${source}] ${message}`, data || '');
  },

  setStatus: (activityId, status) => {
    set(state => {
      const newActivities = new Map(state.activities);
      const activityState = newActivities.get(activityId);
      
      if (activityState) {
        const updates: Partial<ActivityDebugState> = { status };
        
        if (status === 'building' && !activityState.startTime) {
          updates.startTime = new Date();
        }
        if (status === 'completed' || status === 'error') {
          updates.endTime = new Date();
        }
        
        newActivities.set(activityId, { ...activityState, ...updates });
        
        get().log(activityId, 'info', 'StatusChange', `Status alterado para: ${status}`);
      }
      
      return { activities: newActivities };
    });
  },

  setProgress: (activityId, progress, step) => {
    set(state => {
      const newActivities = new Map(state.activities);
      const activityState = newActivities.get(activityId);
      
      if (activityState) {
        newActivities.set(activityId, {
          ...activityState,
          progress,
          currentStep: step || activityState.currentStep
        });
      }
      
      return { activities: newActivities };
    });
  },

  setError: (activityId, errorSummary) => {
    set(state => {
      const newActivities = new Map(state.activities);
      const activityState = newActivities.get(activityId);
      
      if (activityState) {
        newActivities.set(activityId, {
          ...activityState,
          status: 'error',
          errorSummary,
          endTime: new Date()
        });
        
        get().log(activityId, 'error', 'BuildError', errorSummary);
      }
      
      return { activities: newActivities };
    });
  },

  markCompleted: (activityId) => {
    set(state => {
      const newActivities = new Map(state.activities);
      const activityState = newActivities.get(activityId);
      
      if (activityState) {
        newActivities.set(activityId, {
          ...activityState,
          status: 'completed',
          progress: 100,
          endTime: new Date()
        });
        
        get().log(activityId, 'success', 'BuildComplete', 'Atividade construída com sucesso');
      }
      
      return { activities: newActivities };
    });
  },

  getActivityDebug: (activityId) => {
    return get().activities.get(activityId);
  },

  getAllLogs: (activityId) => {
    const activity = get().activities.get(activityId);
    return activity?.entries || [];
  },

  clearActivity: (activityId) => {
    set(state => {
      const newActivities = new Map(state.activities);
      newActivities.delete(activityId);
      return { activities: newActivities };
    });
  },

  clearAll: () => {
    set({ activities: new Map() });
  }
}));

export function logActivityDebug(
  activityId: string,
  level: DebugLogLevel,
  source: string,
  message: string,
  data?: Record<string, any>
): void {
  useActivityDebugStore.getState().log(activityId, level, source, message, data);
}
