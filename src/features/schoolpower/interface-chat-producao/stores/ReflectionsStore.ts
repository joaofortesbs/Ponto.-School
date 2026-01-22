/**
 * REFLECTIONS STORE - Persistência Robusta de Reflexões
 * 
 * Store dedicado para armazenar as reflexões narrativas geradas pelo
 * Agente Jota durante a execução de planos de ação.
 * 
 * Características:
 * - Persistência em localStorage para sobreviver a reloads
 * - Vinculação por cardId para suportar múltiplos cards
 * - Validação de integridade dos dados
 * - Logs detalhados para debugging
 * - Recuperação automática de dados corrompidos
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface StoredReflection {
  id: string;
  objectiveIndex: number;
  objectiveTitle: string;
  narrative: string;
  tone: 'celebratory' | 'cautious' | 'explanatory' | 'reassuring';
  highlights: string[];
  timestamp: number;
}

export interface CardReflections {
  cardId: string;
  reflections: Map<number, StoredReflection>;
  lastUpdated: number;
}

interface ReflectionsStoreState {
  cardReflections: Record<string, CardReflections>;
  _hasHydrated: boolean;

  setHasHydrated: (hasHydrated: boolean) => void;
  
  addReflection: (cardId: string, objectiveIndex: number, reflection: StoredReflection) => void;
  getReflection: (cardId: string, objectiveIndex: number) => StoredReflection | undefined;
  getCardReflections: (cardId: string) => Map<number, StoredReflection>;
  getAllReflectionsForCard: (cardId: string) => StoredReflection[];
  hasReflection: (cardId: string, objectiveIndex: number) => boolean;
  
  updateReflection: (cardId: string, objectiveIndex: number, updates: Partial<StoredReflection>) => void;
  removeReflection: (cardId: string, objectiveIndex: number) => void;
  clearCardReflections: (cardId: string) => void;
  clearAllReflections: () => void;
  
  getReflectionCount: (cardId: string) => number;
  isHydrated: () => boolean;
}

function serializeCardReflections(cardReflections: Record<string, CardReflections>): Record<string, any> {
  const serialized: Record<string, any> = {};
  
  for (const [cardId, card] of Object.entries(cardReflections)) {
    serialized[cardId] = {
      cardId: card.cardId,
      reflections: Array.from(card.reflections.entries()),
      lastUpdated: card.lastUpdated,
    };
  }
  
  return serialized;
}

function deserializeCardReflections(serialized: Record<string, any>): Record<string, CardReflections> {
  const deserialized: Record<string, CardReflections> = {};
  
  for (const [cardId, card] of Object.entries(serialized)) {
    if (!card || typeof card !== 'object') continue;
    
    try {
      const reflectionsArray = card.reflections || [];
      const reflectionsMap = new Map<number, StoredReflection>();
      
      for (const [index, reflection] of reflectionsArray) {
        if (validateReflection(reflection)) {
          reflectionsMap.set(Number(index), reflection);
        }
      }
      
      deserialized[cardId] = {
        cardId: card.cardId || cardId,
        reflections: reflectionsMap,
        lastUpdated: card.lastUpdated || Date.now(),
      };
    } catch (error) {
      console.error(`❌ [ReflectionsStore] Erro ao deserializar card ${cardId}:`, error);
    }
  }
  
  return deserialized;
}

function validateReflection(reflection: any): reflection is StoredReflection {
  if (!reflection || typeof reflection !== 'object') return false;
  
  const requiredFields = ['id', 'objectiveIndex', 'objectiveTitle', 'narrative', 'tone'];
  for (const field of requiredFields) {
    if (!(field in reflection)) {
      console.warn(`⚠️ [ReflectionsStore] Reflexão inválida - campo faltando: ${field}`);
      return false;
    }
  }
  
  if (typeof reflection.narrative !== 'string' || reflection.narrative.length === 0) {
    console.warn('⚠️ [ReflectionsStore] Reflexão inválida - narrative vazia ou não é string');
    return false;
  }
  
  const validTones = ['celebratory', 'cautious', 'explanatory', 'reassuring'];
  if (!validTones.includes(reflection.tone)) {
    console.warn(`⚠️ [ReflectionsStore] Reflexão inválida - tone inválido: ${reflection.tone}`);
    return false;
  }
  
  return true;
}

export const useReflectionsStore = create<ReflectionsStoreState>()(
  persist(
    (set, get) => ({
      cardReflections: {},
      _hasHydrated: false,

      setHasHydrated: (hasHydrated) => {
        set({ _hasHydrated: hasHydrated });
      },

      isHydrated: () => get()._hasHydrated,

      addReflection: (cardId, objectiveIndex, reflection) => {
        if (!validateReflection(reflection)) {
          console.error('❌ [ReflectionsStore] Tentativa de adicionar reflexão inválida:', reflection);
          return;
        }

        console.log(`💾 [ReflectionsStore] Salvando reflexão para card ${cardId}, objetivo ${objectiveIndex}`);
        console.log(`   📝 Título: "${reflection.objectiveTitle}"`);
        console.log(`   🎭 Tom: ${reflection.tone}`);
        console.log(`   📊 Narrativa (${reflection.narrative.length} chars)`);

        set((state) => {
          const existingCard = state.cardReflections[cardId] || {
            cardId,
            reflections: new Map(),
            lastUpdated: Date.now(),
          };

          const newReflections = new Map(existingCard.reflections);
          newReflections.set(objectiveIndex, {
            ...reflection,
            timestamp: reflection.timestamp || Date.now(),
          });

          const updatedCard: CardReflections = {
            ...existingCard,
            reflections: newReflections,
            lastUpdated: Date.now(),
          };

          console.log(`✅ [ReflectionsStore] Reflexão salva! Total para card ${cardId}: ${newReflections.size}`);

          return {
            cardReflections: {
              ...state.cardReflections,
              [cardId]: updatedCard,
            },
          };
        });
      },

      getReflection: (cardId, objectiveIndex) => {
        const state = get();
        const card = state.cardReflections[cardId];
        if (!card) return undefined;
        return card.reflections.get(objectiveIndex);
      },

      getCardReflections: (cardId) => {
        const state = get();
        const card = state.cardReflections[cardId];
        if (!card) return new Map();
        return new Map(card.reflections);
      },

      getAllReflectionsForCard: (cardId) => {
        const state = get();
        const card = state.cardReflections[cardId];
        if (!card) return [];
        return Array.from(card.reflections.values()).sort((a, b) => a.objectiveIndex - b.objectiveIndex);
      },

      hasReflection: (cardId, objectiveIndex) => {
        const state = get();
        const card = state.cardReflections[cardId];
        if (!card) return false;
        return card.reflections.has(objectiveIndex);
      },

      updateReflection: (cardId, objectiveIndex, updates) => {
        set((state) => {
          const card = state.cardReflections[cardId];
          if (!card) return state;

          const existing = card.reflections.get(objectiveIndex);
          if (!existing) return state;

          const newReflections = new Map(card.reflections);
          newReflections.set(objectiveIndex, {
            ...existing,
            ...updates,
            timestamp: Date.now(),
          });

          console.log(`📝 [ReflectionsStore] Reflexão atualizada: card ${cardId}, objetivo ${objectiveIndex}`);

          return {
            cardReflections: {
              ...state.cardReflections,
              [cardId]: {
                ...card,
                reflections: newReflections,
                lastUpdated: Date.now(),
              },
            },
          };
        });
      },

      removeReflection: (cardId, objectiveIndex) => {
        set((state) => {
          const card = state.cardReflections[cardId];
          if (!card) return state;

          const newReflections = new Map(card.reflections);
          newReflections.delete(objectiveIndex);

          console.log(`🗑️ [ReflectionsStore] Reflexão removida: card ${cardId}, objetivo ${objectiveIndex}`);

          return {
            cardReflections: {
              ...state.cardReflections,
              [cardId]: {
                ...card,
                reflections: newReflections,
                lastUpdated: Date.now(),
              },
            },
          };
        });
      },

      clearCardReflections: (cardId) => {
        set((state) => {
          const { [cardId]: removed, ...rest } = state.cardReflections;
          console.log(`🗑️ [ReflectionsStore] Todas as reflexões do card ${cardId} foram removidas`);
          return { cardReflections: rest };
        });
      },

      clearAllReflections: () => {
        console.log('🗑️ [ReflectionsStore] Todas as reflexões foram removidas');
        set({ cardReflections: {} });
      },

      getReflectionCount: (cardId) => {
        const state = get();
        const card = state.cardReflections[cardId];
        if (!card) return 0;
        return card.reflections.size;
      },
    }),
    {
      name: 'jota-reflections-v2',
      storage: createJSONStorage(() => localStorage, {
        replacer: (key, value) => {
          if (key === 'cardReflections' && value && typeof value === 'object') {
            return serializeCardReflections(value as Record<string, CardReflections>);
          }
          return value;
        },
        reviver: (key, value) => {
          if (key === 'cardReflections' && value && typeof value === 'object') {
            return deserializeCardReflections(value as Record<string, any>);
          }
          return value;
        },
      }),
      partialize: (state) => ({
        cardReflections: state.cardReflections,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('🔄 [ReflectionsStore] Hydration complete');
          
          const totalReflections = Object.values(state.cardReflections || {})
            .reduce((sum, card) => sum + (card.reflections?.size || 0), 0);
          const cardCount = Object.keys(state.cardReflections || {}).length;
          
          console.log(`   📊 Cards com reflexões: ${cardCount}`);
          console.log(`   📝 Total de reflexões: ${totalReflections}`);
          
          state.setHasHydrated(true);
        }
      },
    }
  )
);

export function saveReflectionFromEvent(
  cardId: string,
  objectiveIndex: number,
  reflection: {
    id: string;
    objectiveTitle: string;
    narrative: string;
    tone: 'celebratory' | 'cautious' | 'explanatory' | 'reassuring';
    highlights?: string[];
  }
): boolean {
  const store = useReflectionsStore.getState();
  
  const storedReflection: StoredReflection = {
    id: reflection.id,
    objectiveIndex,
    objectiveTitle: reflection.objectiveTitle,
    narrative: reflection.narrative,
    tone: reflection.tone,
    highlights: reflection.highlights || [],
    timestamp: Date.now(),
  };
  
  store.addReflection(cardId, objectiveIndex, storedReflection);
  return true;
}

export function restoreReflectionsForCard(cardId: string): Map<number, StoredReflection> {
  const store = useReflectionsStore.getState();
  return store.getCardReflections(cardId);
}
