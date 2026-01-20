/**
 * ORCHESTRATOR - Orquestrador Principal do Agente Jota
 * 
 * Coordena todo o fluxo do agente com arquitetura de 3 chamadas:
 * 1. Chamada 1: Resposta Inicial (InitialResponseService)
 * 2. Chamada 2: Card de Desenvolvimento (DevelopmentCardService) 
 * 3. Chamada 3: Resposta Final (FinalResponseService)
 * 
 * O ContextManager mantém a visão unificada de toda a conversa.
 */

import { createExecutionPlan, generatePlanMessage } from './planner';
import { AgentExecutor } from './executor';
import { MemoryManager, createMemoryManager } from './memory-manager';
import type { ExecutionPlan, WorkingMemoryItem, ProgressUpdate } from '../interface-chat-producao/types';
import { 
  getContextManager,
  generateInitialResponse,
  generateFinalResponse,
  type InitialResponseResult,
  type FinalResponseResult,
} from './context';

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
  initialResponseData?: InitialResponseResult;
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
  const contextManager = getContextManager(sessionId);

  // CRÍTICO: Usar prepararParaNovoPlano para permitir múltiplas interações
  // Isso preserva o histórico da conversa mas reseta o estado de execução
  contextManager.prepararParaNovoPlano(userPrompt);

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
    contextManager.definirPlano(plan.planId, plan.objetivo, plan.etapas.length);

    let initialMessage = generatePlanMessage(plan);
    let initialResponseData: InitialResponseResult | undefined;

    try {
      initialResponseData = await generateInitialResponse(sessionId, userPrompt);
      initialMessage = initialResponseData.resposta;
      console.log('💡 [Orchestrator] Interpretação:', initialResponseData.interpretacao);
    } catch (initialError) {
      console.warn('⚠️ [Orchestrator] Erro ao gerar resposta inicial, usando fallback:', initialError);
    }

    await memory.addToShortTermMemory({
      type: 'interaction',
      content: initialMessage,
      metadata: { role: 'assistant', planId: plan.planId },
    });

    console.log('✅ [Orchestrator] Plano criado e resposta inicial gerada:', plan.planId);

    return {
      plan,
      initialMessage,
      initialResponseData,
    };
  } catch (error) {
    console.error('❌ [Orchestrator] Erro ao processar prompt:', error);

    return {
      plan: null,
      initialMessage: 'Desculpe, não consegui processar sua solicitação no momento. Por favor, tente novamente ou reformule seu pedido.',
    };
  }
}

export interface ExecutePlanResult {
  relatorio: string;
  respostaFinal: string;
  finalResponseData?: FinalResponseResult;
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

  // CRÍTICO: Resetar executor para nova execução
  executor.resetForNewExecution();

  if (onProgress) {
    executor.setProgressCallback(onProgress);
  }
  
  if (conversationHistory) {
    executor.setConversationContext(conversationHistory);
  }

  try {
    const relatorio = await executor.executePlan(plan);

    console.log('🏁 [Orchestrator] Execução completa, gerando resposta final...');
    
    let respostaFinal = relatorio;
    try {
      const finalResponseData = await generateFinalResponse(sessionId);
      respostaFinal = finalResponseData.resposta;
      
      await memory.addToShortTermMemory({
        type: 'interaction',
        content: finalResponseData.resposta,
        metadata: { role: 'assistant', type: 'final_response' },
      });
      
      console.log('📊 [Orchestrator] Resumo:', finalResponseData.resumo);
    } catch (finalError) {
      console.warn('⚠️ [Orchestrator] Erro ao gerar resposta final, usando relatório:', finalError);
    }

    await memory.addToShortTermMemory({
      type: 'result',
      content: `Plano ${plan.planId} executado com sucesso`,
      metadata: { planId: plan.planId },
    });

    console.log('✅ [Orchestrator] Plano executado e resposta final gerada');
    
    return respostaFinal;

  } catch (error) {
    console.error('❌ [Orchestrator] Erro na execução:', error);

    await memory.saveToWorkingMemory({
      tipo: 'erro',
      conteudo: `Erro na execução do plano: ${error instanceof Error ? error.message : String(error)}`,
    });

    throw error;
  }
}

export async function executeAgentPlanWithDetails(
  plan: ExecutionPlan,
  sessionId: string,
  onProgress?: (update: ProgressUpdate) => void,
  conversationHistory?: string
): Promise<ExecutePlanResult> {
  console.log('▶️ [Orchestrator] Iniciando execução do plano (com detalhes):', plan.planId);

  const memory = memoryManagers.get(sessionId);
  if (!memory) {
    throw new Error(`Sessão não encontrada: ${sessionId}`);
  }

  const executor = getOrCreateExecutor(sessionId, memory);

  // CRÍTICO: Resetar executor para nova execução
  executor.resetForNewExecution();

  if (onProgress) {
    executor.setProgressCallback(onProgress);
  }
  
  if (conversationHistory) {
    executor.setConversationContext(conversationHistory);
  }

  try {
    const relatorio = await executor.executePlan(plan);

    console.log('🏁 [Orchestrator] Execução completa, gerando resposta final...');
    
    let respostaFinal = relatorio;
    let finalResponseData: FinalResponseResult | undefined;
    
    try {
      finalResponseData = await generateFinalResponse(sessionId);
      respostaFinal = finalResponseData.resposta;
      
      await memory.addToShortTermMemory({
        type: 'interaction',
        content: finalResponseData.resposta,
        metadata: { role: 'assistant', type: 'final_response' },
      });
    } catch (finalError) {
      console.warn('⚠️ [Orchestrator] Erro ao gerar resposta final, usando relatório:', finalError);
    }

    await memory.addToShortTermMemory({
      type: 'result',
      content: `Plano ${plan.planId} executado com sucesso`,
      metadata: { planId: plan.planId },
    });

    console.log('✅ [Orchestrator] Plano executado e resposta final gerada');
    
    return {
      relatorio,
      respostaFinal,
      finalResponseData,
    };

  } catch (error) {
    console.error('❌ [Orchestrator] Erro na execução:', error);
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
