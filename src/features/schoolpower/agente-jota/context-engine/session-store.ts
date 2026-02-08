/**
 * SESSION STORE - Armazenamento Centralizado de Sessão
 * 
 * Fonte ÚNICA de verdade para todo o estado da sessão do Agente Jota.
 * Substitui o MemoryManager + ContextManager fragmentados.
 * 
 * Inspirado no Manus AI filesystem-as-memory:
 * Toda informação relevante é mantida estruturada e acessível,
 * nunca descartada prematuramente.
 * 
 * v2.0: InteractionLedger (registro permanente de fatos),
 *       sessão de 4 horas, session warmup para reconexão.
 */

import type { SessionContext, LedgerFact } from './context-assembler';
import type { ConversationTurn } from './conversation-compactor';

const sessionStore: Map<string, SessionContext> = new Map();

const SESSION_MAX_AGE = 4 * 60 * 60 * 1000;
const CLEANUP_INTERVAL = 15 * 60 * 1000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessionStore.entries()) {
      const lastTurn = session.conversationHistory[session.conversationHistory.length - 1];
      const lastActivity = lastTurn?.timestamp || session.interactionLedger?.[session.interactionLedger.length - 1]?.timestamp || 0;
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
    interactionLedger: [],
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

    addLedgerFact(sessionId, {
      fact: `Interação anterior: "${existing.originalGoal.substring(0, 100)}" → ${buildInteractionSummary(existing)}`,
      category: 'context',
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
    parts.push(`Criou ${session.activitiesCreated.length} atividades: ${session.activitiesCreated.join(', ')}`);
  }

  const ledgerDecisions = session.interactionLedger?.filter(f => f.category === 'decision').slice(-3) || [];
  if (ledgerDecisions.length > 0) {
    parts.push(`Decisões: ${ledgerDecisions.map(d => d.fact).join('; ')}`);
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

  if (result.capabilityResults) {
    for (const cap of result.capabilityResults) {
      if (cap.discoveries && cap.discoveries.length > 0) {
        for (const discovery of cap.discoveries) {
          addLedgerFact(sessionId, {
            fact: discovery,
            category: 'discovery',
            metadata: { stepIndex: result.stepIndex, capability: cap.name },
          });
        }
      }
      if (cap.decisions && cap.decisions.length > 0) {
        for (const decision of cap.decisions) {
          addLedgerFact(sessionId, {
            fact: decision,
            category: 'decision',
            metadata: { stepIndex: result.stepIndex, capability: cap.name },
          });
        }
      }
    }
  }
}

export function registerActivity(sessionId: string, activityName: string): void {
  const session = sessionStore.get(sessionId);
  if (!session) return;
  session.activitiesCreated.push(activityName);

  addLedgerFact(sessionId, {
    fact: `Atividade criada: ${activityName}`,
    category: 'activity_created',
  });
}

export function addLedgerFact(
  sessionId: string,
  fact: Omit<LedgerFact, 'id' | 'timestamp'>
): void {
  const session = sessionStore.get(sessionId);
  if (!session) return;

  if (!session.interactionLedger) {
    session.interactionLedger = [];
  }

  session.interactionLedger.push({
    id: `fact-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    fact: fact.fact,
    category: fact.category,
    timestamp: Date.now(),
    metadata: fact.metadata,
  });
}

export function clearSession(sessionId: string): void {
  sessionStore.delete(sessionId);
  console.log(`🧹 [SessionStore] Sessão removida: ${sessionId}`);
}

export function warmupSession(sessionId: string, userId: string, lastGoal: string): SessionContext {
  const existing = sessionStore.get(sessionId);
  if (existing) return existing;

  console.log(`♻️ [SessionStore] Session warmup: reconstruindo sessão ${sessionId}`);
  const session = createSession(sessionId, userId, lastGoal);
  return session;
}
