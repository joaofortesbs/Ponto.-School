import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TabSnapshot, TabIcon } from './types';

function generateTabId(): string {
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createEmptyTab(overrides?: Partial<TabSnapshot>): TabSnapshot {
  return {
    tabId: generateTabId(),
    title: 'Home',
    icon: 'home',
    hasActivity: false,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
    chatMessages: [],
    chatSessionId: null,
    chatInitialMessageProcessed: false,
    chatLastProcessedMessage: null,
    flowState: 'idle',
    flowData: null,
    chosenActivities: [],
    chosenActivitiesSessionId: null,
    isDecisionComplete: false,
    isContentGenerationComplete: false,
    ...overrides,
  };
}

const MAX_TABS = 6;

interface TabsStore {
  tabs: TabSnapshot[];
  activeTabId: string;

  openNewTab: () => string;
  setActiveTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  updateTabTitle: (tabId: string, title: string) => void;
  updateTabIcon: (tabId: string, icon: TabIcon) => void;
  updateTabActivity: (tabId: string, hasActivity: boolean) => void;
  saveTabState: (tabId: string, state: Partial<Omit<TabSnapshot, 'tabId' | 'title' | 'icon' | 'hasActivity' | 'createdAt'>>) => void;
  getTab: (tabId: string) => TabSnapshot | undefined;
  getActiveTab: () => TabSnapshot | undefined;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
}

const initFirstTab = createEmptyTab();

export const useTabsStore = create<TabsStore>()(
  persist(
    (set, get) => ({
      tabs: [initFirstTab],
      activeTabId: initFirstTab.tabId,

      openNewTab: () => {
        const { tabs } = get();
        if (tabs.length >= MAX_TABS) {
          console.warn(`[TabsStore] Limite de ${MAX_TABS} abas atingido.`);
          return get().activeTabId;
        }
        const newTab = createEmptyTab();
        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.tabId,
        }));
        return newTab.tabId;
      },

      setActiveTab: (tabId) => {
        const { tabs } = get();
        if (!tabs.find((t) => t.tabId === tabId)) return;
        set({
          activeTabId: tabId,
          tabs: get().tabs.map((t) =>
            t.tabId === tabId ? { ...t, lastActiveAt: Date.now() } : t
          ),
        });
      },

      closeTab: (tabId) => {
        const { tabs, activeTabId } = get();
        if (tabs.length <= 1) return;

        const idx = tabs.findIndex((t) => t.tabId === tabId);
        const remaining = tabs.filter((t) => t.tabId !== tabId);

        let newActiveId = activeTabId;
        if (activeTabId === tabId) {
          const fallback = remaining[Math.max(0, idx - 1)];
          newActiveId = fallback?.tabId ?? remaining[0].tabId;
        }

        set({ tabs: remaining, activeTabId: newActiveId });
      },

      updateTabTitle: (tabId, title) => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.tabId === tabId ? { ...t, title: title.slice(0, 28) } : t
          ),
        }));
      },

      updateTabIcon: (tabId, icon) => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.tabId === tabId ? { ...t, icon } : t
          ),
        }));
      },

      updateTabActivity: (tabId, hasActivity) => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.tabId === tabId ? { ...t, hasActivity } : t
          ),
        }));
      },

      saveTabState: (tabId, state) => {
        set((store) => ({
          tabs: store.tabs.map((t) =>
            t.tabId === tabId
              ? { ...t, ...state, lastActiveAt: Date.now() }
              : t
          ),
        }));
      },

      getTab: (tabId) => {
        return get().tabs.find((t) => t.tabId === tabId);
      },

      getActiveTab: () => {
        const { tabs, activeTabId } = get();
        return tabs.find((t) => t.tabId === activeTabId);
      },

      reorderTabs: (fromIndex, toIndex) => {
        const { tabs } = get();
        const reordered = [...tabs];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);
        set({ tabs: reordered });
      },
    }),
    {
      name: 'school-power-tabs',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
      }),
    }
  )
);

export default useTabsStore;
