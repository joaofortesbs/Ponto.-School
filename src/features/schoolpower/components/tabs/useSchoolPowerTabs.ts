import { useCallback, useEffect, useRef } from 'react';
import { useTabsStore } from './useTabsStore';
import { useChatState } from '../../interface-chat-producao/state/chatState';
import { useChosenActivitiesStore } from '../../interface-chat-producao/stores/ChosenActivitiesStore';
import type { FlowState, SchoolPowerFlowData } from '../../hooks/useSchoolPowerFlow';
import type { TabBarTab } from './types';

interface UseSchoolPowerTabsParams {
  currentFlowState: FlowState;
  currentFlowData: SchoolPowerFlowData;
  restoreFlow: (state: FlowState, data: SchoolPowerFlowData) => void;
  resetFlow: () => void;
}

export function useSchoolPowerTabs({
  currentFlowState,
  currentFlowData,
  restoreFlow,
  resetFlow,
}: UseSchoolPowerTabsParams) {
  const tabsStore = useTabsStore();
  const isSwitching = useRef(false);

  const saveCurrentTabState = useCallback(() => {
    const currentTabId = useTabsStore.getState().activeTabId;
    const chatStore = useChatState.getState();
    const chosenStore = useChosenActivitiesStore.getState();

    useTabsStore.getState().saveTabState(currentTabId, {
      chatMessages: chatStore.messages,
      chatSessionId: chatStore.sessionId,
      chatInitialMessageProcessed: chatStore.initialMessageProcessed,
      chatLastProcessedMessage: chatStore.lastProcessedInitialMessage,
      flowState: currentFlowState,
      flowData: currentFlowData,
      chosenActivities: chosenStore.chosenActivities,
      chosenActivitiesSessionId: chosenStore.sessionId,
      isDecisionComplete: chosenStore.isDecisionComplete,
      isContentGenerationComplete: chosenStore.isContentGenerationComplete,
    });
  }, [currentFlowState, currentFlowData]);

  const restoreTabState = useCallback((tabId: string) => {
    const targetTab = useTabsStore.getState().getTab(tabId);

    useChatState.getState().clearMessages();
    useChosenActivitiesStore.getState().clearSession();

    if (!targetTab || targetTab.chatMessages.length === 0) {
      resetFlow();
      return;
    }

    useChatState.setState({
      messages: targetTab.chatMessages,
      sessionId: targetTab.chatSessionId,
      initialMessageProcessed: targetTab.chatInitialMessageProcessed,
      lastProcessedInitialMessage: targetTab.chatLastProcessedMessage,
      isExecuting: false,
      executionStarted: false,
      activePlanCardId: null,
      activeDevModeCardId: null,
      isLoading: false,
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
        sessionId: targetTab.chosenActivitiesSessionId ?? `restored-${tabId}`,
        chosenActivities: targetTab.chosenActivities,
        isDecisionComplete: targetTab.isDecisionComplete,
        isContentGenerationComplete: targetTab.isContentGenerationComplete,
        totalDecididas: targetTab.chosenActivities.length,
        estrategiaPedagogica: '',
        decisionTimestamp: null,
        _hasHydrated: true,
      });
    }
  }, [resetFlow, restoreFlow]);

  const handleTabClick = useCallback((tabId: string) => {
    if (isSwitching.current) return;
    const currentActiveId = useTabsStore.getState().activeTabId;
    if (tabId === currentActiveId) return;

    isSwitching.current = true;
    try {
      saveCurrentTabState();
      restoreTabState(tabId);
      useTabsStore.getState().setActiveTab(tabId);
    } finally {
      isSwitching.current = false;
    }
  }, [saveCurrentTabState, restoreTabState]);

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

    useTabsStore.getState().openNewTab();
  }, [saveCurrentTabState, resetFlow]);

  const handleCloseTab = useCallback((tabId: string) => {
    const { tabs, activeTabId } = useTabsStore.getState();
    if (tabs.length <= 1) return;

    const isCurrentlyActive = tabId === activeTabId;

    if (isCurrentlyActive) {
      const idx = tabs.findIndex((t) => t.tabId === tabId);
      const remaining = tabs.filter((t) => t.tabId !== tabId);
      const nextTabId = remaining[Math.max(0, idx - 1)]?.tabId ?? remaining[0]?.tabId;

      restoreTabState(nextTabId);
      useTabsStore.getState().closeTab(tabId);
    } else {
      useTabsStore.getState().closeTab(tabId);
    }
  }, [restoreTabState]);

  const notifyMessageSent = useCallback((message: string) => {
    const activeTabId = useTabsStore.getState().activeTabId;
    const currentTab = useTabsStore.getState().getTab(activeTabId);
    if (currentTab && currentTab.title === 'Home') {
      const title = message.trim().slice(0, 22) || 'Nova conversa';
      useTabsStore.getState().updateTabTitle(activeTabId, title);
    }
  }, []);

  const notifyFlowStateChange = useCallback((newFlowState: FlowState) => {
    const activeTabId = useTabsStore.getState().activeTabId;
    if (newFlowState === 'chat') {
      useTabsStore.getState().updateTabIcon(activeTabId, 'chat');
    } else if (newFlowState === 'activities') {
      useTabsStore.getState().updateTabIcon(activeTabId, 'activity');
      useTabsStore.getState().updateTabActivity(activeTabId, true);
    }
  }, []);

  const tabs: TabBarTab[] = tabsStore.tabs.map((t) => ({
    tabId: t.tabId,
    title: t.title,
    isActive: t.tabId === tabsStore.activeTabId,
    hasActivity: t.hasActivity,
    icon: t.icon,
  }));

  return {
    tabs,
    activeTabId: tabsStore.activeTabId,
    handleTabClick,
    handleNewTab,
    handleCloseTab,
    notifyMessageSent,
    notifyFlowStateChange,
    saveCurrentTabState,
  };
}

export default useSchoolPowerTabs;
