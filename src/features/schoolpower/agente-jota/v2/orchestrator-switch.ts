import { isV2Enabled } from './feature-flag';
import type { WorkingMemoryItem, ProgressUpdate } from '../../interface-chat-producao/types';

import {
  processUserPrompt as processV1,
  executeAgentPlan as executeV1,
  getSessionContext as getContextV1,
  clearSession as clearV1,
  sendFollowUpMessage as followUpV1,
} from '../orchestrator';

import {
  processUserPromptAdapted as processV2,
  executeAgentPlanAdapted as executeV2,
  getSessionContextAdapted as getContextV2,
  clearSessionAdapted as clearV2,
  sendFollowUpMessageAdapted as followUpV2,
} from './adapter';

export async function processUserPrompt(
  userPrompt: string,
  sessionId: string,
  userId: string,
  currentContext: WorkingMemoryItem[] = []
) {
  if (isV2Enabled()) {
    console.log('🚀 [Switch] Usando OrchestratorV2');
    return processV2(userPrompt, sessionId, userId, currentContext);
  }
  console.log('📋 [Switch] Usando OrchestratorV1');
  return processV1(userPrompt, sessionId, userId, currentContext);
}

export async function executeAgentPlan(
  plan: any,
  sessionId: string,
  onProgress?: (update: ProgressUpdate & Record<string, any>) => void,
  conversationHistory?: string
) {
  if (isV2Enabled()) {
    console.log('🚀 [Switch] Executando com AgentLoopV2');
    const userId = getUserIdFromStorage();
    return executeV2(plan, sessionId, onProgress, conversationHistory, userId);
  }
  console.log('📋 [Switch] Executando com ExecutorV1');
  return executeV1(plan, sessionId, onProgress, conversationHistory);
}

export async function getSessionContext(sessionId: string) {
  if (isV2Enabled()) {
    return getContextV2(sessionId);
  }
  return getContextV1(sessionId);
}

export async function clearSession(sessionId: string) {
  if (isV2Enabled()) {
    return clearV2(sessionId);
  }
  return clearV1(sessionId);
}

export async function sendFollowUpMessage(
  message: string,
  sessionId: string,
  userId: string
) {
  if (isV2Enabled()) {
    return followUpV2(message, sessionId, userId);
  }
  return followUpV1(message, sessionId, userId);
}

function getUserIdFromStorage(): string {
  try {
    return localStorage.getItem('userId') || 'user-default';
  } catch {
    return 'user-default';
  }
}
