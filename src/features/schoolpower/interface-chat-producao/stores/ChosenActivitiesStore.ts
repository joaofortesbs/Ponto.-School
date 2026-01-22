/**
 * CHOSEN ACTIVITIES STORE
 * 
 * Store dedicado para armazenar as atividades decididas pela capability
 * "decidir_atividades_criar" e disponibilizá-las para a capability
 * "criar_atividade" e sua Interface de Construção.
 * 
 * Este store garante a sincronização entre:
 * - decidir_atividades_criar (popula o store)
 * - criar_atividade (consome do store)
 * - ConstructionInterface (exibe visualmente)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ActivityToBuild } from '../construction-interface';

export interface ChosenActivity {
  id: string;
  titulo: string;
  tipo: string;
  categoria?: string;
  materia?: string;
  nivel_dificuldade?: string;
  tags?: string[];
  campos_obrigatorios?: string[];
  campos_opcionais?: string[];
  schema_campos?: Record<string, any>;
  campos_preenchidos?: Record<string, any>;
  justificativa: string;
  ordem_sugerida: number;
  status_construcao: 'aguardando' | 'construindo' | 'concluida' | 'erro';
  progresso: number;
  erro?: string;
  dados_construidos?: Record<string, any>;
}

interface ChosenActivitiesState {
  sessionId: string | null;
  chosenActivities: ChosenActivity[];
  estrategiaPedagogica: string;
  totalDecididas: number;
  decisionTimestamp: string | null;
  isDecisionComplete: boolean;
  isContentGenerationComplete: boolean;
  _hasHydrated: boolean;

  initSession: (sessionId: string) => void;
  setChosenActivities: (activities: ChosenActivity[], estrategia?: string) => void;
  updateActivityStatus: (activityId: string, status: ChosenActivity['status_construcao'], progresso?: number, erro?: string) => void;
  updateActivityProgress: (activityId: string, progresso: number) => void;
  setActivityBuiltData: (activityId: string, dados: Record<string, any>) => void;
  setActivityGeneratedFields: (activityId: string, fields: Record<string, any>) => void;
  getChosenActivities: () => ChosenActivity[];
  getActivityById: (activityId: string) => ChosenActivity | undefined;
  getActivitiesForConstruction: () => ActivityToBuild[];
  clearSession: () => void;
  markDecisionComplete: () => void;
  markContentGenerationComplete: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useChosenActivitiesStore = create<ChosenActivitiesState>()(
  persist(
    (set, get) => ({
  sessionId: null,
  chosenActivities: [],
  estrategiaPedagogica: '',
  totalDecididas: 0,
  decisionTimestamp: null,
  isDecisionComplete: false,
  isContentGenerationComplete: false,
  _hasHydrated: false,

  setHasHydrated: (hasHydrated) => {
    set({ _hasHydrated: hasHydrated });
  },

  initSession: (sessionId) => {
    console.log('🎯 [ChosenActivitiesStore] Inicializando sessão:', sessionId);
    set({ 
      sessionId, 
      chosenActivities: [], 
      estrategiaPedagogica: '',
      totalDecididas: 0,
      decisionTimestamp: null,
      isDecisionComplete: false,
      isContentGenerationComplete: false
    });
  },

  setChosenActivities: (activities, estrategia = '') => {
    // 🔥 LOGGING INVASIVO - CONFIRMAR PERSISTÊNCIA
    console.error(`
═══════════════════════════════════════════════════════════════════════
📝 STORING ${activities.length} chosen activities
═══════════════════════════════════════════════════════════════════════`);
    
    console.log('🎯 [ChosenActivitiesStore] Salvando atividades decididas:', activities.length);
    console.log('   📋 IDs das atividades:', activities.map(a => a.id).join(', '));
    console.log('   📋 Estratégia pedagógica:', estrategia);
    
    // Log detalhado de cada atividade
    activities.forEach((act, idx) => {
      console.error(`   Activity ${idx + 1}: ID=${act.id}, Type=${act.tipo}, Title=${act.titulo}`);
    });

    const normalizedActivities = activities.map((activity, idx) => ({
      ...activity,
      status_construcao: activity.status_construcao || 'aguardando' as const,
      progresso: activity.progresso || 0,
      ordem_sugerida: activity.ordem_sugerida || idx + 1
    }));

    set({
      chosenActivities: normalizedActivities,
      estrategiaPedagogica: estrategia,
      totalDecididas: normalizedActivities.length,
      decisionTimestamp: new Date().toISOString(),
      isDecisionComplete: true
    });

    // 🔥 VERIFICAÇÃO IMEDIATA - CONFIRMAR QUE DADOS FORAM SALVOS
    const verification = get().chosenActivities;
    console.error(`✅ VERIFICATION: Store now contains ${verification.length} activities`);
    console.error(`   isDecisionComplete: ${get().isDecisionComplete}`);
    console.error(`   sessionId: ${get().sessionId}`);
    
    if (verification.length === 0) {
      console.error('❌ CRITICAL: Store verification FAILED - activities not persisted!');
    }
    
    console.log('✅ [ChosenActivitiesStore] Atividades salvas com sucesso!');
  },

  updateActivityStatus: (activityId, status, progresso, erro) => {
    console.log(`🔄 [ChosenActivitiesStore] Atualizando status de ${activityId}:`, status);
    
    set((state) => ({
      chosenActivities: state.chosenActivities.map(activity =>
        activity.id === activityId
          ? {
              ...activity,
              status_construcao: status,
              progresso: progresso ?? activity.progresso,
              erro: erro
            }
          : activity
      )
    }));
  },

  updateActivityProgress: (activityId, progresso) => {
    set((state) => ({
      chosenActivities: state.chosenActivities.map(activity =>
        activity.id === activityId
          ? { ...activity, progresso }
          : activity
      )
    }));
  },

  setActivityBuiltData: (activityId, dados) => {
    console.log(`✅ [ChosenActivitiesStore] Dados construídos para ${activityId}`);
    
    set((state) => ({
      chosenActivities: state.chosenActivities.map(activity =>
        activity.id === activityId
          ? {
              ...activity,
              status_construcao: 'concluida' as const,
              progresso: 100,
              dados_construidos: dados
            }
          : activity
      )
    }));
  },

  setActivityGeneratedFields: (activityId, fields) => {
    console.log(`📝 [ChosenActivitiesStore] Campos gerados para ${activityId}:`, Object.keys(fields));
    
    set((state) => ({
      chosenActivities: state.chosenActivities.map(activity =>
        activity.id === activityId
          ? {
              ...activity,
              campos_preenchidos: { ...activity.campos_preenchidos, ...fields },
              dados_construidos: { 
                ...activity.dados_construidos, 
                generated_fields: fields,
                generation_timestamp: new Date().toISOString()
              }
            }
          : activity
      )
    }));
  },

  getChosenActivities: () => {
    return get().chosenActivities;
  },

  getActivityById: (activityId) => {
    return get().chosenActivities.find(a => a.id === activityId);
  },

  getActivitiesForConstruction: () => {
    const state = get();
    
    return state.chosenActivities.map((activity, idx) => {
      // Preservar estrutura original do dados_construidos com metadados
      // Adicionar campos consolidados em campo separado para o modal
      const generatedFields = activity.dados_construidos?.generated_fields || {};
      const camposPreenchidos = activity.campos_preenchidos || {};
      
      // Consolidar campos para uso no modal (prioridade: generated_fields > campos_preenchidos)
      const consolidatedFields = {
        ...camposPreenchidos,
        ...generatedFields
      };
      
      // Calcular campos preenchidos vs total
      const fieldsCount = Object.keys(consolidatedFields).filter(k => 
        consolidatedFields[k] !== undefined && consolidatedFields[k] !== ''
      ).length;
      
      return {
        id: `build_${activity.id}_${idx}`,
        activity_id: activity.id,
        name: activity.titulo,
        type: activity.tipo,
        status: mapStatusToActivityToBuild(activity.status_construcao),
        progress: activity.progresso,
        fields_completed: fieldsCount,
        fields_total: activity.campos_obrigatorios?.length || 5,
        error_message: activity.erro,
        // Preservar estrutura original com metadados + campos consolidados
        built_data: {
          ...activity.dados_construidos,
          // Adicionar campos consolidados para acesso direto pelo modal
          _consolidated_fields: consolidatedFields
        }
      };
    });
  },

  clearSession: () => {
    console.log('🧹 [ChosenActivitiesStore] Limpando sessão');
    set({
      sessionId: null,
      chosenActivities: [],
      estrategiaPedagogica: '',
      totalDecididas: 0,
      decisionTimestamp: null,
      isDecisionComplete: false,
      isContentGenerationComplete: false
    });
  },

  markDecisionComplete: () => {
    set({ isDecisionComplete: true });
  },

  markContentGenerationComplete: () => {
    console.log('✅ [ChosenActivitiesStore] Geração de conteúdo marcada como completa');
    set({ isContentGenerationComplete: true });
  }
}),
    {
      name: 'jota-chosen-activities',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        sessionId: state.sessionId,
        chosenActivities: state.chosenActivities,
        estrategiaPedagogica: state.estrategiaPedagogica,
        totalDecididas: state.totalDecididas,
        decisionTimestamp: state.decisionTimestamp,
        isDecisionComplete: state.isDecisionComplete,
        isContentGenerationComplete: state.isContentGenerationComplete
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('🔄 [ChosenActivitiesStore] Hydration complete - activities:', state.chosenActivities?.length || 0);
          state.setHasHydrated(true);
        }
      }
    }
  )
);

function mapStatusToActivityToBuild(status: ChosenActivity['status_construcao']): ActivityToBuild['status'] {
  switch (status) {
    case 'aguardando':
      return 'waiting';
    case 'construindo':
      return 'building';
    case 'concluida':
      return 'completed';
    case 'erro':
      return 'error';
    default:
      return 'waiting';
  }
}

export function saveChosenActivitiesFromDecision(result: any) {
  const store = useChosenActivitiesStore.getState();
  
  // CORREÇÃO CRÍTICA: Suportar AMBAS as estruturas de retorno
  // - Versão legacy: result.chosen_activities
  // - Versão V2: result.data.chosen_activities
  const chosenActivities = result?.chosen_activities || result?.data?.chosen_activities;
  const estrategia = result?.estrategia_pedagogica || result?.data?.estrategia || '';
  
  console.error(`📦 [saveChosenActivitiesFromDecision] Checking structures:
   - result?.chosen_activities: ${result?.chosen_activities?.length || 'undefined'}
   - result?.data?.chosen_activities: ${result?.data?.chosen_activities?.length || 'undefined'}
   - Final chosenActivities: ${chosenActivities?.length || 'undefined'}`);
  
  if (chosenActivities && Array.isArray(chosenActivities) && chosenActivities.length > 0) {
    store.setChosenActivities(chosenActivities, estrategia);
    return true;
  }
  
  console.warn('⚠️ [ChosenActivitiesStore] Resultado de decisão inválido:', result);
  return false;
}
