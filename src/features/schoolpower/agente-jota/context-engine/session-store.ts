/**
 * SESSION STORE - Armazenamento Centralizado de Sessão
 * 
 * Substitui o MemoryManager + ContextManager fragmentados por
 * um store unificado que mantém TODO o estado da sessão.
 * 
 * Inspirado no Manus AI filesystem-as-memory:
 * Toda informação relevante é mantida estruturada e acessível,
 * nunca descartada prematuramente.
 */

import type { SessionContext } from './context-assembler';
import type { ConversationTurn } from './conversation-compactor';

const sessionStore: Map<string, SessionContext> = new Map();

const SESSION_MAX_AGE = 60 * 60 * 1000;
const CLEANUP_INTERVAL = 10 * 60 * 1000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessionStore.entries()) {
      const lastTurn = session.conversationHistory[session.conversationHistory.length - 1];
      const lastActivity = lastTurn?.timestamp || 0;
      if (now - lastActivity > SESSION_MAX_AGE) {
        console.log(`🧹 [SessionStore] Limpando sessão expirada: ${id}`);
        sessionStore.delete(id);
      }
    }
  }, CLEANUP_INTERVAL);
}

startCleanup();

export function getSession(sessionId: string): SessionContext | null {
  return sessionStore.get(sessionId) || null;
}

export function createSession(sessionId: string, userId: string, originalGoal: string): SessionContext {
  const existing = sessionStore.get(sessionId);
  
  if (existing) {
    return prepareForNewPlan(sessionId, originalGoal);
  }

  const session: SessionContext = {
    sessionId,
    userId,
    originalGoal,
    conversationHistory: [],
    stepResults: [],
    activitiesCreated: [],
    previousInteractions: [],
  };

  sessionStore.set(sessionId, session);
  console.log(`🎯 [SessionStore] Nova sessão criada: ${sessionId}`);
  return session;
}

export function prepareForNewPlan(sessionId: string, newGoal: string): SessionContext {
  const existing = sessionStore.get(sessionId);
  
  if (!existing) {
    return createSession(sessionId, '', newGoal);
  }

  console.log(`🔄 [SessionStore] Preparando sessão para novo plano: ${sessionId}`);

  if (existing.originalGoal && existing.originalGoal !== newGoal) {
    existing.previousInteractions.push({
      userInput: existing.originalGoal,
      summary: buildInteractionSummary(existing),
      timestamp: Date.now(),
    });
  }

  existing.originalGoal = newGoal;
  existing.currentPlan = undefined;
  existing.stepResults = [];

  return existing;
}

function buildInteractionSummary(session: SessionContext): string {
  const parts: string[] = [];
  
  if (session.stepResults.length > 0) {
    parts.push(`Executou ${session.stepResults.length} etapas`);
  }
  
  if (session.activitiesCreated.length > 0) {
    parts.push(`Criou ${session.activitiesCreated.length} atividades`);
  }

  return parts.join('. ') || 'Interação sem resultados registrados';
}

export function addConversationTurn(sessionId: string, turn: ConversationTurn): void {
  const session = sessionStore.get(sessionId);
  if (!session) {
    console.warn(`⚠️ [SessionStore] Sessão não encontrada: ${sessionId}`);
    return;
  }
  session.conversationHistory.push(turn);
}

export function setPlan(sessionId: string, plan: SessionContext['currentPlan']): void {
  const session = sessionStore.get(sessionId);
  if (!session) return;
  session.currentPlan = plan;
}

export function addStepResult(sessionId: string, result: SessionContext['stepResults'][0]): void {
  const session = sessionStore.get(sessionId);
  if (!session) return;
  session.stepResults.push(result);
  
  if (session.currentPlan) {
    session.currentPlan.etapasCompletas = session.stepResults.length;
    const etapa = session.currentPlan.etapas.find(e => e.ordem === result.stepIndex);
    if (etapa) {
      etapa.status = 'concluida';
    }
  }
}

export function registerActivity(sessionId: string, activityName: string): void {
  const session = sessionStore.get(sessionId);
  if (!session) return;
  session.activitiesCreated.push(activityName);
}

export function clearSession(sessionId: string): void {
  sessionStore.delete(sessionId);
  console.log(`🧹 [SessionStore] Sessão removida: ${sessionId}`);
}
