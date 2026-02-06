import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  isLoading: boolean;
  sessionId: string | null;
  initialMessageProcessed: boolean;
  lastProcessedInitialMessage: string | null;
  _hasHydrated: boolean;

  setHasHydrated: (state: boolean) => void;
  setLastProcessedInitialMessage: (message: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  addTextMessage: (role: 'user' | 'assistant', content: string) => void;
  addPlanCard: (planData: PlanCardData) => void;
  addDevModeCard: (devModeData: DevModeCardData) => void;
  startExecution: () => boolean;
  addConstructionCard: (constructionData: any) => void;
  addArtifactCard: (artifactData: any) => void;
  updateCardData: (cardId: string, newData: Partial<DevModeCardData>) => void;
  updateCapabilityStatus: (cardId: string, etapaIndex: number, capabilityId: string, status: CapabilityState['status']) => void;
  updateEtapaStatus: (cardId: string, etapaIndex: number, status: 'pendente' | 'executando' | 'concluido') => void;
  addCapabilityToEtapa: (cardId: string, etapaIndex: number, capability: CapabilityState) => void;
  setExecuting: (isExecuting: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  clearMessages: () => void;
  setSessionId: (sessionId: string) => void;
  setInitialMessageProcessed: (processed: boolean) => void;
  hasActiveSession: () => boolean;

  getPlanCard: () => Message | null;
  getDevModeCard: () => Message | null;
}

export const useChatState = create<ChatState>()(
  persist(
    (set, get) => ({
  messages: [],
  activePlanCardId: null,
  activeDevModeCardId: null,
  isExecuting: false,
  executionStarted: false,
  isLoading: false,
  sessionId: null,
  initialMessageProcessed: false,
  lastProcessedInitialMessage: null,
  _hasHydrated: false,

  setHasHydrated: (state) => {
    set({ _hasHydrated: state });
  },

  setLastProcessedInitialMessage: (message) => {
    set({ lastProcessedInitialMessage: message, initialMessageProcessed: true });
  },

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
      // REMOVIDO: Bloqueio que impedia múltiplos planos na mesma conversa
      // Agora permitimos criar novos PlanCards - cada um representa um novo plano na conversa contínua
      
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
      // REMOVIDO: Bloqueios que impediam múltiplos cards de desenvolvimento na mesma conversa
      // Agora permitimos criar novos DevModeCards - cada um representa uma nova execução
      
      const textMessage: Message = {
        id: generateId(),
        type: 'assistant',
        role: 'assistant',
        content: 'Vou executar o seu plano de ação agora',
        timestamp: Date.now()
      };

      const devCard: Message = {
        id: generateId(),
        type: 'dev_mode_card',
        role: 'assistant',
        content: '',
        timestamp: Date.now() + 1,
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
        messages: [...state.messages, textMessage, devCard],
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

  addArtifactCard: (artifactData) => {
    const artifactCard: Message = {
      id: generateId(),
      type: 'artifact_card',
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      metadata: {
        cardType: 'artifact',
        cardData: artifactData,
        isStatic: true,
        shouldUpdate: false
      }
    };

    console.log('📄 [chatState.addArtifactCard] Criando ArtifactCard:', artifactCard.id, artifactData?.metadata?.titulo);

    set((state) => ({
      messages: [...state.messages, artifactCard]
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
    console.log(`🔄 [chatState] updateCapabilityStatus:`, { cardId, etapaIndex, capabilityId, status });
    
    set((state) => {
      const targetMessage = state.messages.find(m => m.id === cardId);
      if (!targetMessage) {
        console.warn(`⚠️ [chatState] Mensagem não encontrada: ${cardId}`);
        return state;
      }

      const cardData = targetMessage.metadata?.cardData as DevModeCardData;
      if (!cardData?.etapas) {
        console.warn(`⚠️ [chatState] etapas não encontradas`);
        return state;
      }

      const targetEtapa = cardData.etapas[etapaIndex];
      if (!targetEtapa) {
        console.warn(`⚠️ [chatState] Etapa ${etapaIndex} não encontrada. Total: ${cardData.etapas.length}`);
        return state;
      }

      const targetCapability = targetEtapa.capabilities.find(c => c.id === capabilityId);
      if (!targetCapability) {
        console.warn(`⚠️ [chatState] Capability ${capabilityId} não encontrada. IDs disponíveis:`, 
          targetEtapa.capabilities.map(c => c.id));
        return state;
      }

      console.log(`✅ [chatState] Atualizando capability ${capabilityId} -> ${status}`);

      return {
        ...state,
        messages: state.messages.map((msg) => {
          if (msg.id !== cardId) return msg;

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
      };
    });
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
      
      // CRÍTICO: Resetar flags para permitir novas execuções na mesma conversa
      console.log('🔄 [chatState] Execução finalizada - resetando flags para permitir novas execuções');
      set({ 
        executionStarted: false,
        activePlanCardId: null,
        activeDevModeCardId: null
      });
    }
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  clearMessages: () => {
    set({
      messages: [],
      activePlanCardId: null,
      activeDevModeCardId: null,
      isExecuting: false,
      executionStarted: false,
      sessionId: null,
      initialMessageProcessed: false,
      lastProcessedInitialMessage: null
    });
  },

  setSessionId: (sessionId) => {
    set({ sessionId });
  },

  setInitialMessageProcessed: (processed) => {
    set({ initialMessageProcessed: processed });
  },

  hasActiveSession: () => {
    const state = get();
    return state.messages.length > 0 && state.sessionId !== null;
  },

  getPlanCard: () => {
    const state = get();
    return state.messages.find(m => m.id === state.activePlanCardId) || null;
  },

  getDevModeCard: () => {
    const state = get();
    return state.messages.find(m => m.id === state.activeDevModeCardId) || null;
  }
}),
    {
      name: 'jota-chat-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        messages: state.messages,
        activePlanCardId: state.activePlanCardId,
        activeDevModeCardId: state.activeDevModeCardId,
        sessionId: state.sessionId,
        initialMessageProcessed: state.initialMessageProcessed,
        lastProcessedInitialMessage: state.lastProcessedInitialMessage,
        executionStarted: state.executionStarted,
        isExecuting: state.isExecuting
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('🔄 [chatState] Hydration complete - initialMessageProcessed:', state.initialMessageProcessed);
          state.setHasHydrated(true);
        }
      }
    }
  )
);

export default useChatState;
