import { useCallback, useEffect, useRef } from 'react';
import { useTabsStore } from './useTabsStore';
import { useChatState } from '../../interface-chat-producao/state/chatState';
import { useChosenActivitiesStore } from '../../interface-chat-producao/stores/ChosenActivitiesStore';
import { useSessionsApi } from './useSessionsApi';
import type { FlowState, SchoolPowerFlowData } from '../../hooks/useSchoolPowerFlow';
import type { TabBarTab, TabSnapshot } from './types';
import type { Message } from '../../interface-chat-producao/types/message-types';

interface UseSchoolPowerTabsParams {
  currentFlowState: FlowState;
  currentFlowData: SchoolPowerFlowData;
  restoreFlow: (state: FlowState, data: SchoolPowerFlowData) => void;
  resetFlow: () => void;
  userId?: string | null;
}

export function useSchoolPowerTabs({
  currentFlowState,
  currentFlowData,
  restoreFlow,
  resetFlow,
  userId = null,
}: UseSchoolPowerTabsParams) {
  const tabsStore = useTabsStore();
  const isSwitching = useRef(false);
  const dbInitialized = useRef(false);

  const api = useSessionsApi(userId ?? null);

  // ─── Debounced session sync ───────────────────────────────────────────────
  const syncDebounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  function debouncedSyncSession(tabId: string, updates: Partial<TabSnapshot>, delayMs = 800) {
    if (!userId) return;
    if (syncDebounceRef.current[tabId]) clearTimeout(syncDebounceRef.current[tabId]);
    syncDebounceRef.current[tabId] = setTimeout(() => {
      api.updateSession(tabId, updates);
    }, delayMs);
  }

  // ─── Message save queue (debounced for streaming, immediate for final) ────
  const msgQueueRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  function enqueueSaveMessage(tabId: string, msg: Message) {
    if (!userId) return;
    const isFinal = msg.role === 'user' || msg.metadata?.isStatic === true;
    const key = msg.id;
    if (msgQueueRef.current.has(key)) clearTimeout(msgQueueRef.current.get(key)!);
    const delay = isFinal ? 0 : 600;
    const timer = setTimeout(() => {
      api.saveMessage(tabId, msg);
      msgQueueRef.current.delete(key);
    }, delay);
    msgQueueRef.current.set(key, timer);
  }

  // ─── Build snapshot from current stores ──────────────────────────────────
  function buildCurrentSnapshot(): Partial<TabSnapshot> {
    const chatStore = useChatState.getState();
    const chosenStore = useChosenActivitiesStore.getState();
    return {
      chatMessages:                  chatStore.messages,
      chatSessionId:                 chatStore.sessionId,
      chatInitialMessageProcessed:   chatStore.initialMessageProcessed,
      chatLastProcessedMessage:      chatStore.lastProcessedInitialMessage,
      flowState:                     currentFlowState,
      flowData:                      currentFlowData,
      chosenActivities:              chosenStore.chosenActivities,
      chosenActivitiesSessionId:     chosenStore.sessionId,
      isDecisionComplete:            chosenStore.isDecisionComplete,
      isContentGenerationComplete:   chosenStore.isContentGenerationComplete,
    };
  }

  // ─── Save current tab to Zustand + debounce-sync to DB ───────────────────
  const saveCurrentTabState = useCallback(() => {
    const currentTabId = useTabsStore.getState().activeTabId;
    const snapshot = buildCurrentSnapshot();

    useTabsStore.getState().saveTabState(currentTabId, snapshot);

    const tab = useTabsStore.getState().getTab(currentTabId);
    if (tab) {
      debouncedSyncSession(currentTabId, {
        ...snapshot,
        title:       tab.title,
        icon:        tab.icon,
        hasActivity: tab.hasActivity,
      });
    }
  }, [currentFlowState, currentFlowData, userId]);

  // ─── Restore tab state from Zustand (+ lazy-load messages from DB) ───────
  const restoreTabState = useCallback(async (tabId: string) => {
    const targetTab = useTabsStore.getState().getTab(tabId);

    useChatState.getState().clearMessages();
    useChosenActivitiesStore.getState().clearSession();

    if (!targetTab || targetTab.chatMessages.length === 0) {
      resetFlow();

      if (userId && targetTab) {
        const dbMessages = await api.loadMessages(tabId);
        if (dbMessages.length > 0) {
          useChatState.setState({
            messages:                  dbMessages,
            sessionId:                 targetTab.chatSessionId,
            initialMessageProcessed:   targetTab.chatInitialMessageProcessed,
            lastProcessedInitialMessage: targetTab.chatLastProcessedMessage,
            isExecuting:               false,
            executionStarted:          false,
            activePlanCardId:          null,
            activeDevModeCardId:       null,
            isLoading:                 false,
          });
          useTabsStore.getState().saveTabState(tabId, { chatMessages: dbMessages });

          const flowData = targetTab.flowData ?? {
            initialMessage: null,
            contextualizationData: null,
            actionPlan: [],
            manualActivities: [],
            timestamp: Date.now(),
          };
          if (targetTab.flowState !== 'idle') {
            restoreFlow(targetTab.flowState, flowData);
          }
        }
      }
      return;
    }

    useChatState.setState({
      messages:                    targetTab.chatMessages,
      sessionId:                   targetTab.chatSessionId,
      initialMessageProcessed:     targetTab.chatInitialMessageProcessed,
      lastProcessedInitialMessage: targetTab.chatLastProcessedMessage,
      isExecuting:                 false,
      executionStarted:            false,
      activePlanCardId:            null,
      activeDevModeCardId:         null,
      isLoading:                   false,
    });

    const flowData = targetTab.flowData ?? {
      initialMessage: null,
      contextualizationData: null,
      actionPlan: [],
      manualActivities: [],
      timestamp: Date.now(),
    };
    restoreFlow(targetTab.flowState, flowData);

    if (targetTab.chosenActivities.length > 0) {
      useChosenActivitiesStore.setState({
        sessionId:                     targetTab.chosenActivitiesSessionId ?? `restored-${tabId}`,
        chosenActivities:              targetTab.chosenActivities,
        isDecisionComplete:            targetTab.isDecisionComplete,
        isContentGenerationComplete:   targetTab.isContentGenerationComplete,
        totalDecididas:                targetTab.chosenActivities.length,
        estrategiaPedagogica:          '',
        decisionTimestamp:             null,
        _hasHydrated:                  true,
      });
    }
  }, [resetFlow, restoreFlow, userId]);

  // ─── Tab click ────────────────────────────────────────────────────────────
  const handleTabClick = useCallback((tabId: string) => {
    if (isSwitching.current) return;
    const currentActiveId = useTabsStore.getState().activeTabId;
    if (tabId === currentActiveId) return;

    isSwitching.current = true;
    try {
      saveCurrentTabState();
      useTabsStore.getState().setActiveTab(tabId);
      restoreTabState(tabId);
    } finally {
      isSwitching.current = false;
    }
  }, [saveCurrentTabState, restoreTabState]);

  // ─── New tab ──────────────────────────────────────────────────────────────
  const handleNewTab = useCallback(() => {
    const { tabs } = useTabsStore.getState();
    const MAX_TABS = 6;
    if (tabs.length >= MAX_TABS) {
      console.warn('[Tabs] Limite de abas atingido.');
      return;
    }

    saveCurrentTabState();

    useChatState.getState().clearMessages();
    useChosenActivitiesStore.getState().clearSession();
    resetFlow();

    const newTabId = useTabsStore.getState().openNewTab();
    const newTab = useTabsStore.getState().getTab(newTabId);
    if (newTab) api.createSession(newTab);
  }, [saveCurrentTabState, resetFlow, userId]);

  // ─── Close tab ────────────────────────────────────────────────────────────
  const handleCloseTab = useCallback((tabId: string) => {
    const { tabs, activeTabId } = useTabsStore.getState();
    if (tabs.length <= 1) return;

    api.deleteSession(tabId);

    const isCurrentlyActive = tabId === activeTabId;

    if (isCurrentlyActive) {
      const idx = tabs.findIndex((t) => t.tabId === tabId);
      const remaining = tabs.filter((t) => t.tabId !== tabId);
      const nextTabId = remaining[Math.max(0, idx - 1)]?.tabId ?? remaining[0]?.tabId;

      useTabsStore.getState().closeTab(tabId);
      restoreTabState(nextTabId);
    } else {
      useTabsStore.getState().closeTab(tabId);
    }
  }, [restoreTabState, userId]);

  // ─── T005: Subscribe to chat messages and auto-save to DB ─────────────────
  useEffect(() => {
    if (!userId) return;
    const unsub = useChatState.subscribe((state, prevState) => {
      if (state.messages === prevState.messages) return;
      if (state.messages.length <= prevState.messages.length) return;
      const newMsgs = state.messages.slice(prevState.messages.length);
      const activeTabId = useTabsStore.getState().activeTabId;
      newMsgs.forEach((msg) => enqueueSaveMessage(activeTabId, msg));
    });
    return unsub;
  }, [userId]);

  // ─── T004 + T008: Load sessions from DB on mount ─────────────────────────
  useEffect(() => {
    if (!userId || dbInitialized.current) return;
    dbInitialized.current = true;

    (async () => {
      const dbSessions = await api.loadSessions();

      if (dbSessions.length > 0) {
        const firstSession = dbSessions[0];
        useTabsStore.setState({
          tabs:        dbSessions,
          activeTabId: firstSession.tabId,
        });
        await restoreTabState(firstSession.tabId);
        return;
      }

      const migrationKey = `sp_migrated_${userId}`;
      if (localStorage.getItem(migrationKey)) return;

      const localTabs = useTabsStore.getState().tabs;
      const tabsWithContent = localTabs.filter(
        (t) => t.chatMessages.length > 0 || t.flowState !== 'idle'
      );

      if (tabsWithContent.length === 0) {
        const currentTabs = useTabsStore.getState().tabs;
        for (const tab of currentTabs) {
          await api.createSession(tab);
        }
        localStorage.setItem(migrationKey, '1');
        return;
      }

      for (const tab of tabsWithContent) {
        await api.createSession(tab);
        if (tab.chatMessages.length > 0) {
          await api.saveMessages(tab.tabId, tab.chatMessages);
        }
        await api.updateSession(tab.tabId, tab);
      }

      localStorage.setItem(migrationKey, '1');
    })();
  }, [userId]);

  // ─── Notify helpers ───────────────────────────────────────────────────────
  const notifyMessageSent = useCallback((message: string) => {
    const activeTabId = useTabsStore.getState().activeTabId;
    const currentTab = useTabsStore.getState().getTab(activeTabId);
    if (currentTab && currentTab.title === 'Home') {
      const title = message.trim().slice(0, 22) || 'Nova conversa';
      useTabsStore.getState().updateTabTitle(activeTabId, title);
      debouncedSyncSession(activeTabId, { title }, 300);
    }
  }, [userId]);

  const notifyFlowStateChange = useCallback((newFlowState: FlowState) => {
    const activeTabId = useTabsStore.getState().activeTabId;
    if (newFlowState === 'chat') {
      useTabsStore.getState().updateTabIcon(activeTabId, 'chat');
      debouncedSyncSession(activeTabId, { icon: 'chat', flowState: newFlowState }, 400);
    } else if (newFlowState === 'activities') {
      useTabsStore.getState().updateTabIcon(activeTabId, 'activity');
      useTabsStore.getState().updateTabActivity(activeTabId, true);
      debouncedSyncSession(activeTabId, { icon: 'activity', hasActivity: true, flowState: newFlowState }, 400);
    }
  }, [userId]);

  const tabs: TabBarTab[] = tabsStore.tabs.map((t) => ({
    tabId:       t.tabId,
    title:       t.title,
    isActive:    t.tabId === tabsStore.activeTabId,
    hasActivity: t.hasActivity,
    icon:        t.icon,
  }));

  return {
    tabs,
    activeTabId:          tabsStore.activeTabId,
    handleTabClick,
    handleNewTab,
    handleCloseTab,
    notifyMessageSent,
    notifyFlowStateChange,
    saveCurrentTabState,
  };
}

export default useSchoolPowerTabs;
