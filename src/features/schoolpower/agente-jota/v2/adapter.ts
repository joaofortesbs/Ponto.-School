import type {
  ExecutionPlan,
  WorkingMemoryItem,
  ProgressUpdate,
} from '../../interface-chat-producao/types';
import type { InitialResponseResult } from '../context';
import type { ProcessPromptResult } from '../orchestrator';
import {
  processUserPromptV2,
  executeAgentPlanV2,
  getSessionContextV2,
  clearSessionV2,
} from './orchestrator-v2';
import type { ProcessPromptResultV2, ExecutePlanResultV2 } from './orchestrator-v2';

export async function processUserPromptAdapted(
  userPrompt: string,
  sessionId: string,
  userId: string,
  _currentContext: WorkingMemoryItem[] = []
): Promise<ProcessPromptResult> {
  console.log('🔄 [AdapterV2] processUserPrompt → processUserPromptV2');

  const v2Result: ProcessPromptResultV2 = await processUserPromptV2(
    userPrompt,
    sessionId,
    userId
  );

  const initialResponseData: InitialResponseResult = {
    resposta: v2Result.initialMessage,
    interpretacao: v2Result.interpretation.summary,
    intencao: v2Result.interpretation.intent,
    entidades: v2Result.interpretation.entities,
    sucesso: true,
  };

  return {
    plan: v2Result.plan,
    initialMessage: v2Result.initialMessage,
    initialResponseData,
  };
}

type ExtendedProgressUpdate = ProgressUpdate & {
  capabilityId?: string;
  capabilityStatus?: string;
  capabilityResult?: any;
  capabilityDuration?: number;
  reflectionLoading?: boolean;
  reflection?: any;
};

export async function executeAgentPlanAdapted(
  plan: ExecutionPlan,
  sessionId: string,
  onProgress?: (update: ExtendedProgressUpdate) => void,
  conversationHistory?: string,
  userId?: string
): Promise<string> {
  console.log('🔄 [AdapterV2] executeAgentPlan → executeAgentPlanV2');

  const resolvedUserId = userId || getUserIdFromStorage();

  const completedCapabilities = new Set<string>();

  const v2ProgressHandler = (update: ProgressUpdate) => {
    if (!onProgress) return;

    const etapaIndex = mapDescriptionToEtapa(plan, update.descricao || '');

    if (update.status === 'executando' && update.descricao) {
      const capInfo = findCapabilityInPlan(plan, update.descricao);

      if (capInfo && !completedCapabilities.has(capInfo.capabilityId)) {
        onProgress({
          sessionId,
          status: 'executando',
          etapaAtual: capInfo.etapaIndex + 1,
          descricao: capInfo.displayName || update.descricao,
          capabilityId: capInfo.capabilityId,
          capabilityStatus: 'executing',
        });
      } else {
        onProgress({
          ...update,
          etapaAtual: etapaIndex !== null ? etapaIndex + 1 : update.etapaAtual,
        });
      }
    } else {
      onProgress({
        ...update,
        etapaAtual: etapaIndex !== null ? etapaIndex + 1 : update.etapaAtual,
      });
    }
  };

  const v2Result: ExecutePlanResultV2 = await executeAgentPlanV2(
    plan,
    sessionId,
    resolvedUserId,
    v2ProgressHandler,
    conversationHistory
  );

  emitPostExecutionProgress(v2Result, plan, sessionId, onProgress, completedCapabilities);

  if (v2Result.artifactData) {
    window.dispatchEvent(new CustomEvent('artifact:generated', {
      detail: v2Result.artifactData,
    }));
  }

  onProgress?.({
    sessionId,
    status: 'concluido',
    descricao: 'Execução completa',
    resultado: v2Result.relatorio,
  });

  console.log(`✅ [AdapterV2] Execução concluída | ${v2Result.metrics.aiCalls} chamadas IA | ${v2Result.metrics.iterationsUsed} iterações | ${v2Result.metrics.totalDuration}ms`);

  return v2Result.respostaFinal;
}

function emitPostExecutionProgress(
  v2Result: ExecutePlanResultV2,
  plan: ExecutionPlan,
  sessionId: string,
  onProgress: ((update: ExtendedProgressUpdate) => void) | undefined,
  completedCapabilities: Set<string>
): void {
  if (!v2Result.agentState || !onProgress) return;

  const actions = v2Result.agentState.actions;

  for (const action of actions) {
    const capInfo = findCapabilityInPlan(plan, action.capabilityName);

    if (capInfo && !completedCapabilities.has(capInfo.capabilityId)) {
      completedCapabilities.add(capInfo.capabilityId);

      onProgress({
        sessionId,
        status: 'executando',
        etapaAtual: capInfo.etapaIndex + 1,
        descricao: capInfo.displayName || action.capabilityName,
        capabilityId: capInfo.capabilityId,
        capabilityStatus: action.success ? 'completed' : 'failed',
        capabilityResult: action.result,
        capabilityDuration: action.endTime && action.startTime
          ? action.endTime - action.startTime
          : undefined,
      });
    }
  }

  const etapasCompleted = new Set<number>();
  for (const action of actions) {
    const capInfo = findCapabilityInPlan(plan, action.capabilityName);
    if (capInfo) {
      etapasCompleted.add(capInfo.etapaIndex);
    }
  }

  for (const etapaIdx of etapasCompleted) {
    onProgress({
      sessionId,
      status: 'etapa_concluida',
      etapaAtual: etapaIdx + 1,
      descricao: plan.etapas[etapaIdx]?.titulo || plan.etapas[etapaIdx]?.descricao || '',
      resultado: `Etapa ${etapaIdx + 1} concluída`,
    });
  }
}

function findCapabilityInPlan(plan: ExecutionPlan, capabilityName: string): {
  etapaIndex: number;
  capabilityId: string;
  displayName: string;
} | null {
  for (let i = 0; i < plan.etapas.length; i++) {
    const etapa = plan.etapas[i];
    if (etapa.capabilities) {
      const cap = etapa.capabilities.find(c => c.nome === capabilityName);
      if (cap) {
        return {
          etapaIndex: i,
          capabilityId: cap.id,
          displayName: cap.displayName,
        };
      }
    }
    if (etapa.funcao === capabilityName) {
      return {
        etapaIndex: i,
        capabilityId: `etapa-${i}-func`,
        displayName: etapa.titulo || etapa.descricao,
      };
    }
  }
  return null;
}

function mapDescriptionToEtapa(plan: ExecutionPlan, description: string): number | null {
  if (!description) return null;

  for (let i = 0; i < plan.etapas.length; i++) {
    const etapa = plan.etapas[i];
    if (etapa.titulo === description || etapa.descricao === description) {
      return i;
    }
    if (etapa.capabilities?.some(c => c.nome === description || c.displayName === description)) {
      return i;
    }
  }
  return null;
}

function getUserIdFromStorage(): string {
  try {
    return localStorage.getItem('userId') || 'user-default';
  } catch {
    return 'user-default';
  }
}

export async function getSessionContextAdapted(sessionId: string): Promise<{
  workingMemory: WorkingMemoryItem[];
  hasActivePlan: boolean;
}> {
  return getSessionContextV2(sessionId);
}

export async function clearSessionAdapted(sessionId: string): Promise<void> {
  return clearSessionV2(sessionId);
}

export async function sendFollowUpMessageAdapted(
  message: string,
  sessionId: string,
  userId: string
): Promise<string> {
  const { executeWithCascadeFallback } = await import('../../services/controle-APIs-gerais-school-power');
  const { PersistentMemory } = await import('./persistent-memory');

  const memory = new PersistentMemory(userId, sessionId);
  await memory.initialize();
  const memoryContext = await memory.getMemoryContext();

  const prompt = `
Você é o Jota, assistente inteligente do Ponto School. O professor enviou uma mensagem:

MENSAGEM: "${message}"

${memoryContext ? `CONTEXTO DE MEMÓRIA:\n${memoryContext}\n` : ''}

Responda de forma útil e amigável, considerando o contexto.
Se for uma nova solicitação, indique que pode criar um novo plano.
  `.trim();

  const result = await executeWithCascadeFallback(prompt);

  if (result.success && result.data) {
    await memory.saveWorkingMemory('follow_up', message, { role: 'user' });
    await memory.saveWorkingMemory('follow_up_response', result.data, { role: 'assistant' });
    return result.data;
  }

  return 'Entendi! Posso ajudar com mais alguma coisa?';
}
