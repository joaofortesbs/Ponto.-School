
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SchoolPowerStage = 'start' | 'contextualization' | 'planning' | 'execution';

export interface ContextData {
  content: string[];
  materials: string[];
  dates: string[];
  restrictions: string[];
}

export interface SchoolPowerState {
  userMessage: string;
  stage: SchoolPowerStage;
  contextData: ContextData;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUserMessage: (message: string) => void;
  setStage: (stage: SchoolPowerStage) => void;
  setContextData: (data: Partial<ContextData>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  userMessage: '',
  stage: 'start' as SchoolPowerStage,
  contextData: {
    content: [],
    materials: [],
    dates: [],
    restrictions: []
  },
  isLoading: false,
  error: null
};

export const useSchoolPowerStore = create<SchoolPowerState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setUserMessage: (message: string) => {
        set({ userMessage: message });
      },
      
      setStage: (stage: SchoolPowerStage) => {
        set({ stage, error: null });
      },
      
      setContextData: (data: Partial<ContextData>) => {
        set((state) => ({
          contextData: { ...state.contextData, ...data }
        }));
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setError: (error: string | null) => {
        set({ error });
      },
      
      reset: () => {
        set(initialState);
      }
    }),
    {
      name: 'school-power-store',
      partialize: (state) => ({
        userMessage: state.userMessage,
        stage: state.stage,
        contextData: state.contextData
      })
    }
  )
);
