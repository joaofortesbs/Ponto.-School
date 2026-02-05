import { create } from 'zustand';
import type { DossieSessionEvent, DossieActivity, DossieData, DossieContent, DossieStats } from './types';

interface DossieState {
  sessionId: string | null;
  events: DossieSessionEvent[];
  activities: DossieActivity[];
  dossie: DossieData | null;
  isGenerating: boolean;
  isViewerOpen: boolean;
  planObjective: string;
  planSteps: string[];
  userMessages: string[];
  aiResponses: string[];
  startTime: number | null;

  initSession: (sessionId: string) => void;
  addEvent: (event: Omit<DossieSessionEvent, 'id' | 'timestamp'>) => void;
  addActivity: (activity: DossieActivity) => void;
  updateActivityStatus: (activityId: string, status: DossieActivity['status']) => void;
  setPlanInfo: (objective: string, steps: string[]) => void;
  addUserMessage: (message: string) => void;
  addAiResponse: (response: string) => void;
  setDossie: (dossie: DossieData) => void;
  setGenerating: (generating: boolean) => void;
  setViewerOpen: (open: boolean) => void;
  getSessionSummary: () => SessionSummary;
  clearSession: () => void;
}

export interface SessionSummary {
  sessionId: string;
  objective: string;
  steps: string[];
  activities: DossieActivity[];
  events: DossieSessionEvent[];
  userMessages: string[];
  aiResponses: string[];
  duration: string;
  stats: DossieStats;
}

function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

function generateDossieId(): string {
  return `dossie-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
}

function formatDuration(startTime: number | null): string {
  if (!startTime) return '0min';
  const diff = Date.now() - startTime;
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}min ${seconds}s`;
}

export const useDossieStore = create<DossieState>()((set, get) => ({
  sessionId: null,
  events: [],
  activities: [],
  dossie: null,
  isGenerating: false,
  isViewerOpen: false,
  planObjective: '',
  planSteps: [],
  userMessages: [],
  aiResponses: [],
  startTime: null,

  initSession: (sessionId) => {
    set({
      sessionId,
      events: [],
      activities: [],
      dossie: null,
      isGenerating: false,
      isViewerOpen: false,
      planObjective: '',
      planSteps: [],
      userMessages: [],
      aiResponses: [],
      startTime: Date.now(),
    });
  },

  addEvent: (event) => {
    const newEvent: DossieSessionEvent = {
      ...event,
      id: generateEventId(),
      timestamp: Date.now(),
    };
    set((state) => ({
      events: [...state.events, newEvent],
    }));
  },

  addActivity: (activity) => {
    set((state) => {
      const exists = state.activities.some(a => a.id === activity.id);
      if (exists) {
        return {
          activities: state.activities.map(a =>
            a.id === activity.id ? { ...a, ...activity } : a
          ),
        };
      }
      return {
        activities: [...state.activities, activity],
      };
    });
  },

  updateActivityStatus: (activityId, status) => {
    set((state) => ({
      activities: state.activities.map(a =>
        a.id === activityId ? { ...a, status } : a
      ),
    }));
  },

  setPlanInfo: (objective, steps) => {
    set({ planObjective: objective, planSteps: steps });
  },

  addUserMessage: (message) => {
    set((state) => ({
      userMessages: [...state.userMessages, message],
    }));
  },

  addAiResponse: (response) => {
    set((state) => ({
      aiResponses: [...state.aiResponses, response],
    }));
  },

  setDossie: (dossie) => {
    set({ dossie });
  },

  setGenerating: (generating) => {
    set({ isGenerating: generating });
  },

  setViewerOpen: (open) => {
    set({ isViewerOpen: open });
  },

  getSessionSummary: (): SessionSummary => {
    const state = get();

    const tiposCount: Record<string, number> = {};
    state.activities.forEach(a => {
      tiposCount[a.tipo] = (tiposCount[a.tipo] || 0) + 1;
    });

    const capEvents = state.events.filter(e => e.type === 'capability_executed');

    return {
      sessionId: state.sessionId || '',
      objective: state.planObjective,
      steps: state.planSteps,
      activities: state.activities,
      events: state.events,
      userMessages: state.userMessages,
      aiResponses: state.aiResponses,
      duration: formatDuration(state.startTime),
      stats: {
        total_atividades: state.activities.length,
        tipos_atividades: tiposCount,
        tempo_estimado_aula: estimateClassTime(state.activities),
        capabilities_executadas: capEvents.length,
        tempo_processamento: formatDuration(state.startTime),
      },
    };
  },

  clearSession: () => {
    set({
      sessionId: null,
      events: [],
      activities: [],
      dossie: null,
      isGenerating: false,
      isViewerOpen: false,
      planObjective: '',
      planSteps: [],
      userMessages: [],
      aiResponses: [],
      startTime: null,
    });
  },
}));

function estimateClassTime(activities: DossieActivity[]): string {
  const timePerType: Record<string, number> = {
    'lista-exercicios': 20,
    'quiz-interativo': 15,
    'flash-cards': 10,
    'redacao': 30,
    'plano-aula': 50,
    'sequencia-didatica': 45,
    'prova': 40,
    'aula': 50,
  };

  let totalMinutes = 0;
  activities.forEach(a => {
    totalMinutes += timePerType[a.tipo] || 20;
  });

  if (totalMinutes <= 0) return '~20 minutos';
  if (totalMinutes <= 60) return `~${totalMinutes} minutos`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `~${hours}h ${mins}min` : `~${hours}h`;
}
