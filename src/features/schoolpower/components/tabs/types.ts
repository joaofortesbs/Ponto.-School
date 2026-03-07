import type { Message } from '../../interface-chat-producao/types/message-types';
import type { FlowState } from '../../hooks/useSchoolPowerFlow';
import type { ChosenActivity } from '../../interface-chat-producao/stores/ChosenActivitiesStore';

export type TabIcon = 'home' | 'chat' | 'activity';

export interface TabSnapshot {
  tabId: string;
  title: string;
  icon: TabIcon;
  hasActivity: boolean;
  createdAt: number;
  lastActiveAt: number;

  chatMessages: Message[];
  chatSessionId: string | null;
  chatInitialMessageProcessed: boolean;
  chatLastProcessedMessage: string | null;

  flowState: FlowState;
  flowData: {
    initialMessage: string | null;
    contextualizationData: any | null;
    actionPlan: any[] | null;
    manualActivities: any[] | null;
    timestamp: number;
  } | null;

  chosenActivities: ChosenActivity[];
  chosenActivitiesSessionId: string | null;
  isDecisionComplete: boolean;
  isContentGenerationComplete: boolean;
}

export interface TabBarTab {
  tabId: string;
  title: string;
  isActive: boolean;
  hasActivity: boolean;
  icon: TabIcon;
}
