
import { useState, useEffect, useCallback } from 'react';
import { activitiesService, Activity, CreateActivityData, UpdateActivityData } from '@/services/activitiesService';

export interface UseActivitiesState {
  activities: Activity[];
  currentActivity: Activity | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
}

export interface UseActivitiesActions {
  createActivity: (data: CreateActivityData) => Promise<boolean>;
  updateActivity: (code: string, data: UpdateActivityData) => Promise<boolean>;
  getActivity: (code: string) => Promise<Activity | null>;
  getUserActivities: (userId: string) => Promise<void>;
  saveActivity: (data: CreateActivityData) => Promise<boolean>;
  syncFromLocalStorage: (code: string, localData: any) => Promise<boolean>;
  clearError: () => void;
  setCurrentActivity: (activity: Activity | null) => void;
}

export function useActivities(userId?: string): UseActivitiesState & UseActivitiesActions {
  const [state, setState] = useState<UseActivitiesState>({
    activities: [],
    currentActivity: null,
    loading: false,
    error: null,
    saving: false,
  });

  // Função para atualizar estado
  const updateState = useCallback((updates: Partial<UseActivitiesState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Criar nova atividade
  const createActivity = useCallback(async (data: CreateActivityData): Promise<boolean> => {
    updateState({ saving: true, error: null });
    
    try {
      const result = await activitiesService.createActivity(data);
      
      if (result.success && result.data) {
        updateState({ 
          saving: false,
          activities: [result.data, ...state.activities],
          currentActivity: result.data
        });
        return true;
      } else {
        updateState({ 
          saving: false, 
          error: result.error || 'Erro ao criar atividade' 
        });
        return false;
      }
    } catch (error) {
      updateState({ 
        saving: false, 
        error: 'Erro inesperado ao criar atividade' 
      });
      return false;
    }
  }, [state.activities, updateState]);

  // Atualizar atividade
  const updateActivity = useCallback(async (code: string, data: UpdateActivityData): Promise<boolean> => {
    updateState({ saving: true, error: null });
    
    try {
      const result = await activitiesService.updateActivity(code, data);
      
      if (result.success && result.data) {
        updateState({ 
          saving: false,
          activities: state.activities.map(activity => 
            activity.activity_code === code ? result.data! : activity
          ),
          currentActivity: state.currentActivity?.activity_code === code ? result.data : state.currentActivity
        });
        return true;
      } else {
        updateState({ 
          saving: false, 
          error: result.error || 'Erro ao atualizar atividade' 
        });
        return false;
      }
    } catch (error) {
      updateState({ 
        saving: false, 
        error: 'Erro inesperado ao atualizar atividade' 
      });
      return false;
    }
  }, [state.activities, state.currentActivity, updateState]);

  // Buscar atividade por código
  const getActivity = useCallback(async (code: string): Promise<Activity | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await activitiesService.getActivityByCode(code);
      
      if (result.success && result.data) {
        updateState({ 
          loading: false,
          currentActivity: result.data
        });
        return result.data;
      } else {
        updateState({ 
          loading: false, 
          error: result.error || 'Atividade não encontrada' 
        });
        return null;
      }
    } catch (error) {
      updateState({ 
        loading: false, 
        error: 'Erro inesperado ao buscar atividade' 
      });
      return null;
    }
  }, [updateState]);

  // Buscar atividades do usuário
  const getUserActivities = useCallback(async (userId: string): Promise<void> => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await activitiesService.getUserActivities(userId);
      
      if (result.success && result.data) {
        updateState({ 
          loading: false,
          activities: result.data
        });
      } else {
        updateState({ 
          loading: false, 
          error: result.error || 'Erro ao buscar atividades do usuário' 
        });
      }
    } catch (error) {
      updateState({ 
        loading: false, 
        error: 'Erro inesperado ao buscar atividades' 
      });
    }
  }, [updateState]);

  // Salvar atividade (criar ou atualizar)
  const saveActivity = useCallback(async (data: CreateActivityData): Promise<boolean> => {
    updateState({ saving: true, error: null });
    
    try {
      const result = await activitiesService.saveActivity(data);
      
      if (result.success && result.data) {
        // Atualizar a lista de atividades
        const existingIndex = state.activities.findIndex(
          activity => activity.activity_code === data.activity_code
        );
        
        let newActivities: Activity[];
        if (existingIndex >= 0) {
          // Atualizar existente
          newActivities = [...state.activities];
          newActivities[existingIndex] = result.data;
        } else {
          // Adicionar nova
          newActivities = [result.data, ...state.activities];
        }
        
        updateState({ 
          saving: false,
          activities: newActivities,
          currentActivity: result.data
        });
        return true;
      } else {
        updateState({ 
          saving: false, 
          error: result.error || 'Erro ao salvar atividade' 
        });
        return false;
      }
    } catch (error) {
      updateState({ 
        saving: false, 
        error: 'Erro inesperado ao salvar atividade' 
      });
      return false;
    }
  }, [state.activities, updateState]);

  // Sincronizar do LocalStorage
  const syncFromLocalStorage = useCallback(async (code: string, localData: any): Promise<boolean> => {
    updateState({ saving: true, error: null });
    
    try {
      const result = await activitiesService.syncFromLocalStorage(code, localData);
      
      if (result.success && result.data) {
        updateState({ 
          saving: false,
          currentActivity: result.data
        });
        
        // Atualizar atividades do usuário se necessário
        if (userId) {
          await getUserActivities(userId);
        }
        
        return true;
      } else {
        updateState({ 
          saving: false, 
          error: result.error || 'Erro ao sincronizar atividade' 
        });
        return false;
      }
    } catch (error) {
      updateState({ 
        saving: false, 
        error: 'Erro inesperado ao sincronizar atividade' 
      });
      return false;
    }
  }, [userId, getUserActivities, updateState]);

  // Limpar erro
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Definir atividade atual
  const setCurrentActivity = useCallback((activity: Activity | null) => {
    updateState({ currentActivity: activity });
  }, [updateState]);

  // Carregar atividades do usuário na inicialização
  useEffect(() => {
    if (userId) {
      getUserActivities(userId);
    }
  }, [userId, getUserActivities]);

  return {
    ...state,
    createActivity,
    updateActivity,
    getActivity,
    getUserActivities,
    saveActivity,
    syncFromLocalStorage,
    clearError,
    setCurrentActivity,
  };
}

export default useActivities;
