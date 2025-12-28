import create from 'zustand';
import type { Message, DevModeCardData, PlanCardData, CapabilityState } from '../types/message-types';

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface ChatState {
  messages: Message[];
  activePlanCardId: string | null;
  activeDevModeCardId: string | null;
  isExecuting: boolean;
  executionStarted: boolean;

  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  addTextMessage: (role: 'user' | 'assistant', content: string) => void;
  addPlanCard: (planData: PlanCardData) => void;
  addDevModeCard: (devModeData: DevModeCardData) => void;
  startExecution: () => boolean;
  addConstructionCard: (constructionData: any) => void;
  updateCardData: (cardId: string, newData: Partial<DevModeCardData>) => void;
  updateCapabilityStatus: (cardId: string, etapaIndex: number, capabilityId: string, status: CapabilityState['status']) => void;
  updateEtapaStatus: (cardId: string, etapaIndex: number, status: 'pendente' | 'executando' | 'concluido') => void;
  addCapabilityToEtapa: (cardId: string, etapaIndex: number, capability: CapabilityState) => void;
  setExecuting: (isExecuting: boolean) => void;
  clearMessages: () => void;

  getPlanCard: () => Message | null;
  getDevModeCard: () => Message | null;
}

export const useChatState = create<ChatState>((set, get) => ({
  messages: [],
  activePlanCardId: null,
  activeDevModeCardId: null,
  isExecuting: false,
  executionStarted: false,

  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: Date.now()
    };

    set((state) => ({
      messages: [...state.messages, newMessage]
    }));
  },

  addTextMessage: (role, content) => {
    const newMessage: Message = {
      id: generateId(),
      type: role === 'user' ? 'user' : 'assistant',
      role,
      content,
      timestamp: Date.now()
    };

    set((state) => ({
      messages: [...state.messages, newMessage]
    }));
  },

  addPlanCard: (planData) => {
    set((state) => {
      const existingPlanCard = state.messages.find(m => m.type === 'plan_card');
      if (existingPlanCard) {
        console.warn('⚠️ [chatState.addPlanCard] PlanCard já existe! ID:', existingPlanCard.id);
        return state;
      }

      const planCard: Message = {
        id: generateId(),
        type: 'plan_card',
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        metadata: {
          cardType: 'plan',
          cardData: planData,
          isStatic: true,
          shouldUpdate: false
        }
      };

      console.log('✅ [chatState.addPlanCard] Criando novo PlanCard com ID:', planCard.id);

      return {
        ...state,
        messages: [...state.messages, planCard],
        activePlanCardId: planCard.id
      };
    });
  },

  startExecution: () => {
    const state = get();
    if (state.executionStarted) {
      console.warn('⚠️ [chatState.startExecution] Execução já iniciada! Bloqueando.');
      return false;
    }
    set({ executionStarted: true });
    console.log('✅ [chatState.startExecution] Execução iniciada com sucesso.');
    return true;
  },

  addDevModeCard: (devModeData) => {
    set((state) => {
      if (state.activeDevModeCardId) {
        console.warn('⚠️ [chatState.addDevModeCard] activeDevModeCardId já existe! Ignorando.');
        return state;
      }

      const existingDevModeCard = state.messages.find(m => m.type === 'dev_mode_card');
      if (existingDevModeCard) {
        console.warn('⚠️ [chatState.addDevModeCard] DevModeCard já existe! ID:', existingDevModeCard.id);
        return state;
      }

      const devCard: Message = {
        id: generateId(),
        type: 'dev_mode_card',
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        metadata: {
          cardType: 'dev_mode',
          cardData: devModeData,
          isStatic: true,
          shouldUpdate: true
        }
      };

      console.log('✅ [chatState.addDevModeCard] Criando novo DevModeCard com ID:', devCard.id);

      return {
        ...state,
        messages: [...state.messages, devCard],
        activeDevModeCardId: devCard.id,
        isExecuting: true
      };
    });
  },

  addConstructionCard: (constructionData) => {
    const constructionCard: Message = {
      id: generateId(),
      type: 'construction_card',
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      metadata: {
        cardType: 'construction',
        cardData: constructionData,
        isStatic: true,
        shouldUpdate: true
      }
    };

    set((state) => ({
      messages: [...state.messages, constructionCard]
    }));
  },

  updateCardData: (cardId, newData) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === cardId
          ? {
              ...msg,
              metadata: {
                ...msg.metadata,
                cardData: {
                  ...msg.metadata?.cardData,
                  ...newData
                }
              }
            }
          : msg
      )
    }));
  },

  updateCapabilityStatus: (cardId, etapaIndex, capabilityId, status) => {
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id !== cardId) return msg;

        const cardData = msg.metadata?.cardData as DevModeCardData;
        if (!cardData?.etapas) return msg;

        const updatedEtapas = cardData.etapas.map((e, idx) => {
          if (idx !== etapaIndex) return e;
          return {
            ...e,
            capabilities: e.capabilities.map(cap =>
              cap.id === capabilityId
                ? { ...cap, status }
                : cap
            )
          };
        });

        return {
          ...msg,
          metadata: {
            ...msg.metadata,
            cardData: {
              ...cardData,
              etapas: updatedEtapas
            }
          }
        };
      })
    }));
  },

  updateEtapaStatus: (cardId, etapaIndex, status) => {
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id !== cardId) return msg;

        const cardData = msg.metadata?.cardData as DevModeCardData;
        if (!cardData?.etapas) return msg;

        const updatedEtapas = cardData.etapas.map((e, idx) =>
          idx === etapaIndex
            ? { ...e, status }
            : e
        );

        return {
          ...msg,
          metadata: {
            ...msg.metadata,
            cardData: {
              ...cardData,
              etapas: updatedEtapas,
              etapaAtual: status === 'concluido' ? etapaIndex + 1 : cardData.etapaAtual
            }
          }
        };
      })
    }));
  },

  addCapabilityToEtapa: (cardId, etapaIndex, capability) => {
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id !== cardId) return msg;

        const cardData = msg.metadata?.cardData as DevModeCardData;
        if (!cardData?.etapas) return msg;

        const updatedEtapas = cardData.etapas.map((e, idx) => {
          if (idx !== etapaIndex) return e;
          return {
            ...e,
            capabilities: [...e.capabilities, capability]
          };
        });

        return {
          ...msg,
          metadata: {
            ...msg.metadata,
            cardData: {
              ...cardData,
              etapas: updatedEtapas
            }
          }
        };
      })
    }));
  },

  setExecuting: (isExecuting) => {
    set({ isExecuting });

    if (!isExecuting) {
      const state = get();
      if (state.activeDevModeCardId) {
        get().updateCardData(state.activeDevModeCardId, { status: 'concluido' });
      }
    }
  },

  clearMessages: () => {
    set({
      messages: [],
      activePlanCardId: null,
      activeDevModeCardId: null,
      isExecuting: false,
      executionStarted: false
    });
  },

  getPlanCard: () => {
    const state = get();
    return state.messages.find(m => m.id === state.activePlanCardId) || null;
  },

  getDevModeCard: () => {
    const state = get();
    return state.messages.find(m => m.id === state.activeDevModeCardId) || null;
  }
}));

export default useChatState;
