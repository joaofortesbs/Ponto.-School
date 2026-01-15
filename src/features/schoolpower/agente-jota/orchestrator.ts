/**
 * ORCHESTRATOR - Orquestrador Principal do Agente Jota
 * 
 * Coordena todo o fluxo do agente:
 * 1. Recebe prompts do usuário
 * 2. Aciona o Planner para criar planos
 * 3. Aciona o Executor para executar planos
 * 4. Gerencia a memória durante todo o processo
 */

import { createExecutionPlan, generatePlanMessage } from './planner';
import { AgentExecutor } from './executor';
import { MemoryManager, createMemoryManager } from './memory-manager';
import type { ExecutionPlan, WorkingMemoryItem, ProgressUpdate } from '../interface-chat-producao/types';

const memoryManagers: Map<string, MemoryManager> = new Map();
const executors: Map<string, AgentExecutor> = new Map();
const sessionTimestamps: Map<string, number> = new Map();
const SESSION_CLEANUP_INTERVAL = 10 * 60 * 1000;
const SESSION_MAX_AGE = 60 * 60 * 1000;

function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [sessionId, timestamp] of sessionTimestamps.entries()) {
    if (now - timestamp > SESSION_MAX_AGE) {
      console.log('🧹 [Orchestrator] Limpando sessão expirada:', sessionId);
      memoryManagers.delete(sessionId);
      executors.delete(sessionId);
      sessionTimestamps.delete(sessionId);
    }
  }
}

setInterval(cleanupExpiredSessions, SESSION_CLEANUP_INTERVAL);

function getOrCreateMemoryManager(sessionId: string, userId: string): MemoryManager {
  sessionTimestamps.set(sessionId, Date.now());
  if (!memoryManagers.has(sessionId)) {
    memoryManagers.set(sessionId, createMemoryManager(sessionId, userId));
  }
  return memoryManagers.get(sessionId)!;
}

function getOrCreateExecutor(sessionId: string, memory: MemoryManager): AgentExecutor {
  if (!executors.has(sessionId)) {
    executors.set(sessionId, new AgentExecutor(sessionId, memory));
  }
  return executors.get(sessionId)!;
}

export interface ProcessPromptResult {
  plan: ExecutionPlan | null;
  initialMessage: string;
}

export async function processUserPrompt(
  userPrompt: string,
  sessionId: string,
  userId: string,
  currentContext: WorkingMemoryItem[] = []
): Promise<ProcessPromptResult> {
  console.log('🎯 [Orchestrator] Processando prompt:', userPrompt);
  console.log('📌 [Orchestrator] Session:', sessionId, 'User:', userId);

  const memory = getOrCreateMemoryManager(sessionId, userId);

  await memory.addToShortTermMemory({
    type: 'interaction',
    content: userPrompt,
    metadata: { role: 'user' },
  });

  const contextForPlanner = memory.formatContextForPrompt();

  try {
    const plan = await createExecutionPlan(userPrompt, {
      workingMemory: contextForPlanner,
      userId,
      sessionId,
    });

    await memory.savePlan(plan);

    const initialMessage = generatePlanMessage(plan);

    await memory.addToShortTermMemory({
      type: 'interaction',
      content: initialMessage,
      metadata: { role: 'assistant', planId: plan.planId },
    });

    console.log('✅ [Orchestrator] Plano criado e salvo:', plan.planId);

    return {
      plan,
      initialMessage,
    };
  } catch (error) {
    console.error('❌ [Orchestrator] Erro ao processar prompt:', error);

    return {
      plan: null,
      initialMessage: 'Desculpe, não consegui processar sua solicitação no momento. Por favor, tente novamente ou reformule seu pedido.',
    };
  }
}

export async function executeAgentPlan(
  plan: ExecutionPlan,
  sessionId: string,
  onProgress?: (update: ProgressUpdate) => void,
  conversationHistory?: string
): Promise<string> {
  console.log('▶️ [Orchestrator] Iniciando execução do plano:', plan.planId);

  const memory = memoryManagers.get(sessionId);
  if (!memory) {
    throw new Error(`Sessão não encontrada: ${sessionId}`);
  }

  const executor = getOrCreateExecutor(sessionId, memory);

  if (onProgress) {
    executor.setProgressCallback(onProgress);
  }
  
  // Passar contexto da conversa para o executor
  if (conversationHistory) {
    executor.setConversationContext(conversationHistory);
  }

  try {
    const relatorio = await executor.executePlan(plan);

    await memory.addToShortTermMemory({
      type: 'result',
      content: `Plano ${plan.planId} executado com sucesso`,
      metadata: { planId: plan.planId },
    });

    console.log('✅ [Orchestrator] Plano executado com sucesso');
    return relatorio;

  } catch (error) {
    console.error('❌ [Orchestrator] Erro na execução:', error);

    await memory.saveToWorkingMemory({
      tipo: 'erro',
      conteudo: `Erro na execução do plano: ${error instanceof Error ? error.message : String(error)}`,
    });

    throw error;
  }
}

export async function getSessionContext(sessionId: string): Promise<{
  workingMemory: WorkingMemoryItem[];
  hasActivePlan: boolean;
}> {
  const memory = memoryManagers.get(sessionId);
  if (!memory) {
    return {
      workingMemory: [],
      hasActivePlan: false,
    };
  }

  const workingMemory = await memory.getWorkingMemory();
  const fullContext = await memory.getFullContext();

  return {
    workingMemory,
    hasActivePlan: fullContext.recentPlans.some(p => 
      p.status === 'aguardando_aprovacao' || p.status === 'em_execucao'
    ),
  };
}

export async function clearSession(sessionId: string): Promise<void> {
  console.log('🧹 [Orchestrator] Limpando sessão:', sessionId);

  const memory = memoryManagers.get(sessionId);
  if (memory) {
    await memory.clearSession();
    memoryManagers.delete(sessionId);
  }

  executors.delete(sessionId);
}

export async function sendFollowUpMessage(
  message: string,
  sessionId: string,
  userId: string
): Promise<string> {
  console.log('💬 [Orchestrator] Mensagem de follow-up:', message);

  const memory = getOrCreateMemoryManager(sessionId, userId);
  const context = memory.formatContextForPrompt();

  const { executeWithCascadeFallback } = await import('../services/controle-APIs-gerais-school-power');

  const prompt = `
Você é o assistente School Power. O professor enviou uma mensagem de acompanhamento:

MENSAGEM: "${message}"

CONTEXTO ATUAL:
${context}

Responda de forma útil e amigável, considerando o contexto da conversa.
Se for uma nova solicitação, indique que você pode criar um novo plano de ação.
  `.trim();

  const result = await executeWithCascadeFallback(prompt);

  if (result.success && result.data) {
    await memory.addToShortTermMemory({
      type: 'interaction',
      content: message,
      metadata: { role: 'user' },
    });

    await memory.addToShortTermMemory({
      type: 'interaction',
      content: result.data,
      metadata: { role: 'assistant' },
    });

    return result.data;
  }

  return 'Entendi! Posso ajudar com mais alguma coisa?';
}

export default {
  processUserPrompt,
  executeAgentPlan,
  getSessionContext,
  clearSession,
  sendFollowUpMessage,
};
