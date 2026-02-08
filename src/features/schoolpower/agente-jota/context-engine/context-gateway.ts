/**
 * CONTEXT GATEWAY - Ponto Único de Entrada para Contexto de IA
 * 
 * TODA chamada de IA do Agente Jota DEVE passar por este gateway.
 * Ele garante que todas as chamadas recebem:
 * 
 * CAMADA 1: SYSTEM_PROMPT (identidade, regras, personalidade do Jota)
 * CAMADA 2: Contexto da Sessão (histórico compactado, plano, resultados, ledger de fatos)
 * CAMADA 3: Contexto Dinâmico (dados específicos da chamada)
 * CAMADA 4: Goal Recitation (objetivo original nos tokens mais recentes)
 * 
 * Inspirado em:
 * - Manus AI: filesystem-as-memory, goal recitation, KV-cache optimization
 * - Replit Agent V3: contexto durável, multi-agent alignment
 * - Kimi K2.5: 256K context window management
 * 
 * REGRA DE OURO: Se uma chamada de IA não passa pelo gateway,
 * ela está ERRADA e vai gerar inconsistência de contexto.
 */

import { contextAssembler, type CallType, type SessionContext } from './context-assembler';
import { getSession, createSession } from './session-store';
import { SYSTEM_PROMPT } from '../prompts/system-prompt';

export interface GatewayOptions {
  includeSystemPrompt?: boolean;
  includeLedger?: boolean;
  maxTotalChars?: number;
}

const DEFAULT_OPTIONS: GatewayOptions = {
  includeSystemPrompt: true,
  includeLedger: true,
  maxTotalChars: 24000,
};

export function buildUnifiedContext(
  callType: CallType,
  sessionId: string,
  dynamicContext?: Record<string, any>,
  options?: GatewayOptions
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const layers: string[] = [];

  if (opts.includeSystemPrompt) {
    layers.push(SYSTEM_PROMPT);
  }

  const session = getSession(sessionId);

  if (session) {
    const sessionLayer = contextAssembler.assemble(callType, session, dynamicContext);
    if (sessionLayer) {
      layers.push(sessionLayer);
    }

    if (opts.includeLedger && session.interactionLedger && session.interactionLedger.length > 0) {
      const ledgerText = buildLedgerBlock(session);
      if (ledgerText) {
        layers.push(ledgerText);
      }
    }
  } else {
    if (dynamicContext) {
      const dynamicParts: string[] = [];
      for (const [key, value] of Object.entries(dynamicContext)) {
        if (value === undefined || value === null) continue;
        if (typeof value === 'string') {
          dynamicParts.push(`${key.toUpperCase()}:\n${value}`);
        } else {
          dynamicParts.push(`${key.toUpperCase()}:\n${JSON.stringify(value, null, 2)}`);
        }
      }
      if (dynamicParts.length > 0) {
        layers.push(dynamicParts.join('\n\n'));
      }
    }
    console.warn(`⚠️ [ContextGateway] Sessão não encontrada: ${sessionId} — usando contexto mínimo`);
  }

  let result = layers.join('\n\n');

  if (opts.maxTotalChars && result.length > opts.maxTotalChars) {
    const systemPromptLen = opts.includeSystemPrompt ? SYSTEM_PROMPT.length + 4 : 0;
    const goalBlock = session?.originalGoal
      ? `\n\n═══════════════════════════════════════\nPEDIDO ORIGINAL DO PROFESSOR:\n"${session.originalGoal}"\n═══════════════════════════════════════`
      : '';
    const reservedEnd = goalBlock.length;

    const budget = opts.maxTotalChars - systemPromptLen - reservedEnd - 100;
    const middleContent = result.substring(systemPromptLen, result.length - reservedEnd);
    const trimmedMiddle = middleContent.substring(0, budget) + '\n[...contexto compactado para otimização]';

    result = (opts.includeSystemPrompt ? SYSTEM_PROMPT + '\n\n' : '') + trimmedMiddle + goalBlock;
  }

  return result;
}

export function buildContextForFollowUp(
  sessionId: string,
  followUpMessage: string,
  userId?: string
): string {
  let session = getSession(sessionId);

  if (!session && userId) {
    session = createSession(sessionId, userId, followUpMessage);
  }

  return buildUnifiedContext('follow_up', sessionId, {
    mensagem_atual: followUpMessage,
  });
}

export function buildContextForPlanner(
  sessionId: string,
  userPrompt: string
): string {
  return buildUnifiedContext('planner', sessionId, {
    solicitacao_do_professor: userPrompt,
  });
}

export function buildContextForCapability(
  sessionId: string,
  capabilityName: string,
  capabilityParams?: Record<string, any>
): string {
  return buildUnifiedContext('capability', sessionId, {
    capability_atual: capabilityName,
    ...capabilityParams,
  }, {
    includeSystemPrompt: false,
  });
}

function buildLedgerBlock(session: SessionContext): string {
  const ledger = session.interactionLedger;
  if (!ledger || ledger.length === 0) return '';

  const lines: string[] = [
    '═══════════════════════════════════════',
    '📋 REGISTRO DE FATOS DA SESSÃO (nunca esqueça):',
    '═══════════════════════════════════════',
  ];

  const activityFacts = ledger.filter(f => f.category === 'activity_created');
  const decisionFacts = ledger.filter(f => f.category === 'decision');
  const contentFacts = ledger.filter(f => f.category === 'content_generated');
  const preferenceFacts = ledger.filter(f => f.category === 'preference');

  if (activityFacts.length > 0) {
    lines.push('\nAtividades criadas nesta sessão:');
    for (const fact of activityFacts) {
      lines.push(`  ✓ ${fact.fact}`);
    }
  }

  if (contentFacts.length > 0) {
    lines.push('\nConteúdos gerados:');
    for (const fact of contentFacts) {
      lines.push(`  ✓ ${fact.fact}`);
    }
  }

  if (decisionFacts.length > 0) {
    lines.push('\nDecisões tomadas:');
    for (const fact of decisionFacts.slice(-10)) {
      lines.push(`  • ${fact.fact}`);
    }
  }

  if (preferenceFacts.length > 0) {
    lines.push('\nPreferências do professor:');
    for (const fact of preferenceFacts) {
      lines.push(`  • ${fact.fact}`);
    }
  }

  return lines.join('\n');
}

export function getContextStats(sessionId: string): {
  hasSession: boolean;
  conversationTurns: number;
  ledgerFacts: number;
  stepResults: number;
  activitiesCreated: number;
  previousInteractions: number;
  hasPlan: boolean;
} {
  const session = getSession(sessionId);
  if (!session) {
    return {
      hasSession: false,
      conversationTurns: 0,
      ledgerFacts: 0,
      stepResults: 0,
      activitiesCreated: 0,
      previousInteractions: 0,
      hasPlan: false,
    };
  }

  return {
    hasSession: true,
    conversationTurns: session.conversationHistory.length,
    ledgerFacts: session.interactionLedger?.length || 0,
    stepResults: session.stepResults.length,
    activitiesCreated: session.activitiesCreated.length,
    previousInteractions: session.previousInteractions.length,
    hasPlan: !!session.currentPlan,
  };
}
