
import { create } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';

export type SchoolPowerFlowState = 'idle' | 'contextualizing' | 'generating' | 'actionplan' | 'approved';

interface SchoolPowerState {
  // Estado do fluxo
  flowState: SchoolPowerFlowState;
  
  // Dados coletados
  initialMessage: string | null;
  contextualizationData: ContextualizationData | null;
  actionPlan: ActionPlanItem[] | null;
  
  // Estados de loading
  isLoading: boolean;
  isGeneratingPlan: boolean;
  
  // Metadados
  timestamp: number;
  
  // Actions
  setFlowState: (state: SchoolPowerFlowState) => void;
  setInitialMessage: (message: string) => void;
  setContextualizationData: (data: ContextualizationData) => void;
  setActionPlan: (plan: ActionPlanItem[]) => void;
  setLoading: (loading: boolean) => void;
  setGeneratingPlan: (generating: boolean) => void;
  updateActionPlanItem: (id: string, updates: Partial<ActionPlanItem>) => void;
  getApprovedItems: () => ActionPlanItem[];
  resetStore: () => void;
}

const initialState = {
  flowState: 'idle' as SchoolPowerFlowState,
  initialMessage: null,
  contextualizationData: null,
  actionPlan: null,
  isLoading: false,
  isGeneratingPlan: false,
  timestamp: Date.now(),
};

export const useSchoolPowerStore = create<SchoolPowerState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setFlowState: (state: SchoolPowerFlowState) => {
        console.log(`🔄 School Power: Estado mudou para "${state}"`);
        set({ flowState: state, timestamp: Date.now() });
      },
      
      setInitialMessage: (message: string) => {
        console.log('📝 School Power: Mensagem inicial salva:', message);
        set({ 
          initialMessage: message, 
          flowState: 'contextualizing',
          timestamp: Date.now() 
        });
      },
      
      setContextualizationData: (data: ContextualizationData) => {
        console.log('📋 School Power: Dados de contextualização salvos:', data);
        set({ 
          contextualizationData: data,
          timestamp: Date.now()
        });
      },
      
      setActionPlan: (plan: ActionPlanItem[]) => {
        console.log('📊 School Power: Plano de ação salvo:', plan);
        set({ 
          actionPlan: plan,
          flowState: 'actionplan',
          isGeneratingPlan: false,
          timestamp: Date.now()
        });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setGeneratingPlan: (generating: boolean) => {
        set({ 
          isGeneratingPlan: generating,
          flowState: generating ? 'generating' : get().flowState
        });
      },
      
      updateActionPlanItem: (id: string, updates: Partial<ActionPlanItem>) => {
        const currentPlan = get().actionPlan;
        if (!currentPlan) return;
        
        const updatedPlan = currentPlan.map(item => 
          item.id === id ? { ...item, ...updates } : item
        );
        
        console.log(`✏️ School Power: Item "${id}" atualizado:`, updates);
        set({ actionPlan: updatedPlan, timestamp: Date.now() });
      },
      
      getApprovedItems: () => {
        const actionPlan = get().actionPlan;
        return actionPlan ? actionPlan.filter(item => item.approved) : [];
      },
      
      resetStore: () => {
        console.log('🔄 School Power: Store resetado');
        set({
          ...initialState,
          timestamp: Date.now()
        });
      },
    }),
    {
      name: 'school-power-store',
      partialize: (state) => ({
        flowState: state.flowState,
        initialMessage: state.initialMessage,
        contextualizationData: state.contextualizationData,
        actionPlan: state.actionPlan,
        timestamp: state.timestamp,
      }),
    }
  )
);
