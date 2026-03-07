import type { TabSnapshot } from './types';
import type { Message } from '../../interface-chat-producao/types/message-types';

const BASE = '/api/sp';

async function apiFetch(path: string, options?: RequestInit) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function useSessionsApi(userId: string | null) {
  const uid = userId ?? null;

  async function loadSessions(): Promise<TabSnapshot[]> {
    if (!uid) return [];
    const data = await apiFetch(`/sessions/${uid}`);
    return data?.sessions ?? [];
  }

  async function createSession(tab: TabSnapshot): Promise<void> {
    if (!uid) return;
    await apiFetch('/sessions', {
      method: 'POST',
      body: JSON.stringify({ userId: uid, id: tab.tabId, title: tab.title, icon: tab.icon }),
    });
  }

  async function updateSession(tabId: string, updates: Partial<TabSnapshot>): Promise<void> {
    if (!uid) return;
    await apiFetch(`/sessions/${tabId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title:                         updates.title,
        icon:                          updates.icon,
        hasActivity:                   updates.hasActivity,
        flowState:                     updates.flowState,
        flowData:                      updates.flowData,
        chosenActivities:              updates.chosenActivities,
        chosenActivitiesSessionId:     updates.chosenActivitiesSessionId,
        isDecisionComplete:            updates.isDecisionComplete,
        isContentGenerationComplete:   updates.isContentGenerationComplete,
        chatSessionId:                 updates.chatSessionId,
        chatInitialMessageProcessed:   updates.chatInitialMessageProcessed,
        chatLastProcessedMessage:      updates.chatLastProcessedMessage,
      }),
    });
  }

  async function deleteSession(tabId: string): Promise<void> {
    if (!uid) return;
    await apiFetch(`/sessions/${tabId}`, { method: 'DELETE' });
  }

  async function loadMessages(tabId: string): Promise<Message[]> {
    if (!uid) return [];
    const data = await apiFetch(`/sessions/${tabId}/messages`);
    return data?.messages ?? [];
  }

  async function saveMessage(tabId: string, msg: Message): Promise<void> {
    if (!uid) return;
    await apiFetch(`/sessions/${tabId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ ...msg, userId: uid }),
    });
  }

  async function saveMessages(tabId: string, messages: Message[]): Promise<void> {
    if (!uid || messages.length === 0) return;
    await apiFetch(`/sessions/${tabId}/messages/batch`, {
      method: 'POST',
      body: JSON.stringify({ messages, userId: uid }),
    });
  }

  return {
    loadSessions,
    createSession,
    updateSession,
    deleteSession,
    loadMessages,
    saveMessage,
    saveMessages,
  };
}
