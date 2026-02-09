/**
 * ORCHESTRATOR - Orquestrador Principal do Agente Jota
 * 
 * Coordena todo o fluxo do agente com arquitetura de 3 chamadas:
 * 1. Chamada 1: Resposta Inicial (InitialResponseService)
 * 2. Chamada 2: Card de Desenvolvimento (MenteMaior unificada) 
 * 3. Chamada 3: Resposta Final (FinalResponseService)
 * 
 * CONTEXT ENGINE v2.0 (fonte ÚNICA de verdade):
 * - SessionStore mantém toda a memória da sessão
 * - ContextGateway garante contexto alinhado em TODAS as chamadas
 * - InteractionLedger registra fatos permanentes (nunca truncados)
 * - GoalReciter garante que o objetivo original nunca se perde
 * - MemoryManager mantido como bridge read-only para backward compat
 */

import { createExecutionPlan, generatePlanMessage } from './planner';
import { AgentExecutor } from './executor';
import { MemoryManager, createMemoryManager } from './memory-manager';
import type { ExecutionPlan, WorkingMemoryItem, ProgressUpdate } from '../interface-chat-producao/types';
import { 
  generateInitialResponse,
  generateFinalResponse,
  type InitialResponseResult,
  type FinalResponseResult,
} from './context';
import type { ArtifactData } from './capabilities/CRIAR_ARQUIVO';
import { determineFlowArtifacts, executeFlowPackage } from './ponto-flow/flow-orchestrator';
import {
  createSession,
  addConversationTurn,
  setPlan,
  addLedgerFact,
  getSession,
  clearSession as clearContextEngineSession,
  buildContextForFollowUp,
  buildContextForPlanner,
  classifyIntent,
  shouldCreatePlan,
  shouldRespondDirectly,
  type ConversationTurn,
} from './context-engine';

const memoryManagers: Map<string, MemoryManager> = new Map();
const executors: Map<string, AgentExecutor> = new Map();
const sessionTimestamps: Map<string, number> = new Map();
const SESSION_CLEANUP_INTERVAL = 15 * 60 * 1000;
const SESSION_MAX_AGE = 4 * 60 * 60 * 1000;

// ═══════════════════════════════════════════════════════════════════════
// LAYER 5: backupActivityContentToLocalStorage
// Garante que o conteúdo gerado seja persistido no localStorage
// ANTES que o ChosenActivitiesStore seja limpo
// ═══════════════════════════════════════════════════════════════════════
async function backupActivityContentToLocalStorage(collectedItems: { activities: any[]; artifacts: any[] }): Promise<void> {
  if (collectedItems.activities.length === 0) return;
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

  try {
    const { useChosenActivitiesStore } = await import('../interface-chat-producao/stores/ChosenActivitiesStore');
    const store = useChosenActivitiesStore.getState();
    const contentKeys = ['questoes', 'questions', 'cards', 'etapas', 'sections'];

    for (const act of collectedItems.activities) {
      let backupContent: Record<string, any> | null = null;
      let backupSource = '';

      const storeActivity = store.getActivityById(act.id);
      if (storeActivity) {
        const genFields = storeActivity.dados_construidos?.generated_fields || {};
        const campos = storeActivity.campos_preenchidos || {};
        const builtData = storeActivity.dados_construidos || {};
        const fullContent = { ...campos, ...builtData, ...genFields };
        const fullKeys = Object.keys(fullContent).filter(k => fullContent[k] !== undefined && fullContent[k] !== null);
        if (fullKeys.length > 2) {
          backupContent = fullContent;
          backupSource = 'store';
        }
      }

      if (!backupContent && act._contentSnapshot && Object.keys(act._contentSnapshot).length > 2) {
        backupContent = act._contentSnapshot;
        backupSource = 'snapshot';
      }

      if (backupContent) {
        try {
          const { writeActivityContent } = await import('../services/activity-storage-contract');
          writeActivityContent(act.id, act.tipo, backupContent);
          console.log(`🛡️ [LAYER5] ${act.tipo}_${act.id}: backup via StorageContract (${backupSource})`);
        } catch (e) {
          console.warn(`⚠️ [LAYER5] Erro ao salvar backup para ${act.id}:`, e);
        }
      } else {
        console.warn(`⚠️ [LAYER5] ${act.tipo}_${act.id}: nenhum conteúdo encontrado para backup`);
      }
    }

    try {
      const { ContentSyncService } = await import('../services/content-sync-service');
      for (const act of collectedItems.activities) {
        const constructedKey = `constructed_${act.tipo}_${act.id}`;
        const raw = localStorage.getItem(constructedKey);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const data = parsed?.data || parsed;
            const contentIndicators = ['questoes', 'questions', 'cards', 'etapas', 'sections'];
            const hasArrays = contentIndicators.some(k => Array.isArray(data?.[k]) && data[k].length > 0);
            if (hasArrays) {
              ContentSyncService.setContent(act.id, act.tipo, data);
              console.log(`📡 [LAYER5] ContentSync atualizado para ${act.tipo}_${act.id}`);
            }
          } catch {}
        }
      }
    } catch {}

    console.log(`🔄 [LAYER5] Verificação concluída para ${collectedItems.activities.length} atividades`);
  } catch (e) {
    console.warn('⚠️ [LAYER5] Erro geral no backup:', e);
  }
}

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
  sessionTimestamps.set(sessionId, Date.now());

  const intent = classifyIntent(userPrompt);
  console.log(`🧠 [Orchestrator] Intent: ${intent.type} (${(intent.confidence * 100).toFixed(0)}%) — ${intent.reasoning}`);

  if (shouldRespondDirectly(intent)) {
    console.log('💬 [Orchestrator] Modo conversacional — respondendo sem criar plano');

    const existingSession = getSession(sessionId);
    if (!existingSession) {
      createSession(sessionId, userId, userPrompt);
    }

    addConversationTurn(sessionId, {
      role: 'user',
      content: userPrompt,
      timestamp: Date.now(),
    });

    addLedgerFact(sessionId, {
      fact: `Professor perguntou: "${userPrompt.substring(0, 150)}" [intent: ${intent.type}]`,
      category: 'context',
    });
    
    const directResponse = await handleDirectResponse(userPrompt, sessionId, userId);
    
    addConversationTurn(sessionId, {
      role: 'assistant',
      content: directResponse,
      timestamp: Date.now(),
      metadata: { type: 'follow_up' },
    });

    return {
      plan: null,
      initialMessage: directResponse,
    };
  }

  const session = createSession(sessionId, userId, userPrompt);
  
  addConversationTurn(sessionId, {
    role: 'user',
    content: userPrompt,
    timestamp: Date.now(),
  });

  addLedgerFact(sessionId, {
    fact: `Professor pediu: "${userPrompt.substring(0, 150)}" [intent: ${intent.type}]`,
    category: 'context',
  });

  const contextForPlanner = buildContextForPlanner(sessionId, userPrompt);

  try {
    const plan = await createExecutionPlan(userPrompt, {
      workingMemory: contextForPlanner,
      userId,
      sessionId,
    });

    await memory.savePlan(plan);

    setPlan(sessionId, {
      planId: plan.planId,
      objetivo: plan.objetivo,
      totalEtapas: plan.etapas.length,
      etapasCompletas: 0,
      etapas: plan.etapas.map(e => ({
        ordem: e.ordem,
        titulo: e.titulo || e.descricao,
        descricao: e.descricao,
        status: 'pendente' as const,
        capabilities: e.capabilities?.map(c => c.nome) || [e.funcao],
      })),
    });

    addLedgerFact(sessionId, {
      fact: `Plano criado: "${plan.objetivo}" com ${plan.etapas.length} etapas (${plan.planId})`,
      category: 'decision',
    });

    let initialMessage = generatePlanMessage(plan);
    let initialResponseData: InitialResponseResult | undefined;

    try {
      initialResponseData = await generateInitialResponse(sessionId, userPrompt);
      initialMessage = initialResponseData.resposta;
      console.log('💡 [Orchestrator] Interpretação:', initialResponseData.interpretacao);
    } catch (initialError) {
      console.warn('⚠️ [Orchestrator] Erro ao gerar resposta inicial, usando fallback:', initialError);
    }

    addConversationTurn(sessionId, {
      role: 'assistant',
      content: initialMessage,
      timestamp: Date.now(),
      metadata: { type: 'initial_response', planId: plan.planId },
    });

    console.log('✅ [Orchestrator] Plano criado e resposta inicial gerada:', plan.planId);

    return {
      plan,
      initialMessage,
      initialResponseData,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('❌ [Orchestrator] Erro ao processar prompt:', {
      error: errorMessage,
      stack: errorStack,
      userPrompt: userPrompt.substring(0, 100),
      sessionId,
      userId,
    });

    addLedgerFact(sessionId, {
      fact: `Erro ao processar pedido: ${errorMessage.substring(0, 200)}`,
      category: 'error',
    });

    return {
      plan: null,
      initialMessage: 'Desculpe, não consegui processar sua solicitação no momento. Por favor, tente novamente ou reformule seu pedido.',
    };
  }
}

async function handleDirectResponse(
  message: string,
  sessionId: string,
  userId: string
): Promise<string> {
  const unifiedContext = buildContextForFollowUp(sessionId, message, userId);

  const { executeWithCascadeFallback } = await import('../services/controle-APIs-gerais-school-power');

  const prompt = `
${unifiedContext}

═══════════════════════════════════════════════════════════════
MENSAGEM ATUAL DO PROFESSOR:
"${message}"
═══════════════════════════════════════════════════════════════

O professor está conversando, não pedindo para criar algo específico.
Responda de forma natural, amigável e conversacional.
Lembre-se de TUDO que já foi feito e discutido na sessão.
Se o professor está agradecendo, reconheça e pergunte se precisa de mais algo.
Se está fazendo uma pergunta, responda com base no contexto.
Se quiser criar algo, indique que pode fazer um plano.
  `.trim();

  const result = await executeWithCascadeFallback(prompt);

  if (result.success && result.data) {
    return result.data;
  }

  return 'Entendi! Estou aqui para ajudar. O que precisa?';
}

export interface ExecutePlanResult {
  relatorio: string;
  respostaFinal: string;
  finalResponseData?: FinalResponseResult;
  artifactData?: ArtifactData | null;
}

export interface ExecuteAgentPlanResult {
  resposta: string;
  collectedItems: {
    activities: Array<{ id: string; titulo: string; tipo: string; db_id?: number }>;
    artifacts: any[];
  };
}

export async function executeAgentPlan(
  plan: ExecutionPlan,
  sessionId: string,
  onProgress?: (update: ProgressUpdate) => void,
  conversationHistory?: string
): Promise<ExecuteAgentPlanResult> {
  console.log('▶️ [Orchestrator] Iniciando execução do plano:', plan.planId);
  console.error(`
╔════════════════════════════════════════════════════════════════════════╗
║ 🎯 ORCHESTRATOR.executeAgentPlan() ENTRY POINT
║════════════════════════════════════════════════════════════════════════║
║ sessionId: ${sessionId}
║ planId: ${plan.planId}
║ objetivo: ${plan.objetivo.substring(0, 80)}...
║ etapas: ${plan.etapas.length}
║ conversationHistory provided: ${!!conversationHistory}
║ conversationHistory length: ${conversationHistory?.length || 0}
║ onProgress callback provided: ${!!onProgress}
║════════════════════════════════════════════════════════════════════════║
  `);

  const memory = memoryManagers.get(sessionId);
  if (!memory) {
    throw new Error(`Sessão não encontrada: ${sessionId}`);
  }

  const executor = getOrCreateExecutor(sessionId, memory);

  executor.resetForNewExecution();
  console.error('✅ [Orchestrator] Executor resetado para nova execução');

  if (onProgress) {
    executor.setProgressCallback(onProgress);
    console.error('✅ [Orchestrator] onProgress callback registrado');
  }
  
  if (conversationHistory) {
    executor.setConversationContext(conversationHistory);
    console.error(`✅ [Orchestrator] conversationContext definido (${conversationHistory.length} chars)`);
  }

  try {
    const relatorio = await executor.executePlan(plan);

    const collectedItems = executor.getCollectedItems();

    // LAYER 5: POST-EXECUTION CONTENT VERIFICATION (processUserPrompt path)
    await backupActivityContentToLocalStorage(collectedItems);

    // LAYER 6: PONTO FLOW — Generate complementary artifacts package
    if (collectedItems.activities.length > 0) {
      console.log(`\n🌊 [Orchestrator] Ponto Flow: ${collectedItems.activities.length} atividades detectadas, gerando pacote complementar...`);
      
      try {
        const flowPlan = determineFlowArtifacts(
          collectedItems.activities.length,
          plan.objetivo,
        );

        if (flowPlan.length > 0) {
          console.log(`🌊 [Orchestrator] Ponto Flow: ${flowPlan.length} artefatos planejados: ${flowPlan.map(a => a.tipo).join(', ')}`);

          onProgress?.({
            type: 'flow:etapa_added',
            flowTitle: 'Preparando pacote completo',
            flowDescription: `Gerando ${flowPlan.length} documentos complementares`,
            flowCapabilities: flowPlan.map((a, i) => ({
              id: `flow-${a.tipo}-${i}`,
              nome: `criar_arquivo_${a.tipo}`,
              displayName: a.titulo,
            })),
          } as any);

          const flowResult = await executeFlowPackage(sessionId, flowPlan, (update) => {
            const capId = `flow-${flowPlan[update.index]?.tipo}-${update.index}`;
            if (update.status === 'gerando') {
              onProgress?.({
                type: 'flow:capability_started',
                capability_id: capId,
              } as any);
            } else if (update.status === 'concluido') {
              onProgress?.({
                type: 'flow:capability_completed',
                capability_id: capId,
              } as any);
            } else if (update.status === 'erro') {
              onProgress?.({
                type: 'flow:capability_error',
                capability_id: capId,
              } as any);
            }
          });

          for (const artifact of flowResult.artifacts) {
            collectedItems.artifacts.push(artifact);
          }

          onProgress?.({
            type: 'flow:completed',
          } as any);

          console.log(`🌊 [Orchestrator] Ponto Flow concluído: ${flowResult.totalGenerated} gerados, ${flowResult.totalFailed} falhas, ${flowResult.generationTimeMs}ms`);

          addLedgerFact(sessionId, {
            fact: `Ponto Flow gerou ${flowResult.totalGenerated} documentos complementares: ${flowResult.artifacts.map(a => a.metadata.titulo).join(', ')}`,
            category: 'context',
          });
        }
      } catch (flowError) {
        console.warn('⚠️ [Orchestrator] Ponto Flow falhou (não-crítico, continuando):', flowError);
      }
    }

    console.log('🏁 [Orchestrator] Execução completa, gerando resposta final...');
    
    let respostaFinal = relatorio;
    try {
      const finalResponseData = await generateFinalResponse(sessionId, collectedItems);
      respostaFinal = finalResponseData.resposta;
      
      addConversationTurn(sessionId, {
        role: 'assistant',
        content: finalResponseData.resposta,
        timestamp: Date.now(),
        metadata: { type: 'final_response', planId: plan.planId },
      });
      
      console.log('📊 [Orchestrator] Resumo:', finalResponseData.resumo);
    } catch (finalError) {
      console.warn('⚠️ [Orchestrator] Erro ao gerar resposta final, usando relatório:', finalError);
    }

    addLedgerFact(sessionId, {
      fact: `Plano "${plan.objetivo}" executado com sucesso (${plan.etapas.length} etapas)`,
      category: 'context',
    });

    extractAndRegisterTopicFacts(sessionId, plan);

    console.log('✅ [Orchestrator] Plano executado e resposta final gerada');

    return {
      resposta: respostaFinal,
      collectedItems,
    };

  } catch (error) {
    console.error('❌ [Orchestrator] Erro na execução:', error);

    addLedgerFact(sessionId, {
      fact: `Erro na execução do plano: ${error instanceof Error ? error.message : String(error)}`,
      category: 'error',
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

  executor.resetForNewExecution();

  if (onProgress) {
    executor.setProgressCallback(onProgress);
  }
  
  if (conversationHistory) {
    executor.setConversationContext(conversationHistory);
  }

  try {
    const relatorio = await executor.executePlan(plan);

    const collectedItems = executor.getCollectedItems();

    // LAYER 5: POST-EXECUTION CONTENT VERIFICATION (executeFollowUp path)
    await backupActivityContentToLocalStorage(collectedItems);

    // LAYER 6: PONTO FLOW (executeFollowUp path)
    if (collectedItems.activities.length > 0) {
      try {
        const flowPlan = determineFlowArtifacts(collectedItems.activities.length, plan.objetivo);
        if (flowPlan.length > 0) {
          onProgress?.({
            type: 'flow:etapa_added',
            flowTitle: 'Preparando pacote completo',
            flowDescription: `Gerando ${flowPlan.length} documentos complementares`,
            flowCapabilities: flowPlan.map((a, i) => ({
              id: `flow-${a.tipo}-${i}`,
              nome: `criar_arquivo_${a.tipo}`,
              displayName: a.titulo,
            })),
          } as any);

          const flowResult = await executeFlowPackage(sessionId, flowPlan, (update) => {
            const capId = `flow-${flowPlan[update.index]?.tipo}-${update.index}`;
            if (update.status === 'gerando') {
              onProgress?.({ type: 'flow:capability_started', capability_id: capId } as any);
            } else if (update.status === 'concluido') {
              onProgress?.({ type: 'flow:capability_completed', capability_id: capId } as any);
            } else if (update.status === 'erro') {
              onProgress?.({ type: 'flow:capability_error', capability_id: capId } as any);
            }
          });

          for (const artifact of flowResult.artifacts) {
            collectedItems.artifacts.push(artifact);
          }
          onProgress?.({ type: 'flow:completed' } as any);
        }
      } catch (flowError) {
        console.warn('⚠️ [Orchestrator] Ponto Flow falhou (não-crítico):', flowError);
      }
    }

    console.log('🏁 [Orchestrator] Execução completa, gerando resposta final...');
    
    let respostaFinal = relatorio;
    let finalResponseData: FinalResponseResult | undefined;
    
    try {
      finalResponseData = await generateFinalResponse(sessionId, collectedItems);
      respostaFinal = finalResponseData.resposta;

      addConversationTurn(sessionId, {
        role: 'assistant',
        content: finalResponseData.resposta,
        timestamp: Date.now(),
        metadata: { type: 'final_response', planId: plan.planId },
      });
    } catch (finalError) {
      console.warn('⚠️ [Orchestrator] Erro ao gerar resposta final, usando relatório:', finalError);
    }

    addLedgerFact(sessionId, {
      fact: `Plano "${plan.objetivo}" executado com sucesso`,
      category: 'context',
    });

    console.log('✅ [Orchestrator] Plano executado e resposta final gerada');

    return {
      relatorio,
      respostaFinal,
      finalResponseData,
      artifactData: null,
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
  const session = getSession(sessionId);
  
  if (session) {
    return {
      workingMemory: [],
      hasActivePlan: !!session.currentPlan && session.currentPlan.etapasCompletas < session.currentPlan.totalEtapas,
    };
  }

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
  sessionTimestamps.delete(sessionId);

  clearContextEngineSession(sessionId);
}

function extractAndRegisterTopicFacts(sessionId: string, plan: ExecutionPlan): void {
  try {
    const session = getSession(sessionId);
    if (!session) return;

    const originalGoal = session.originalGoal || '';
    const objetivo = plan.objetivo || '';
    const fullText = `${originalGoal} ${objetivo}`.toLowerCase();

    const facts: string[] = [];

    const seriePatterns = [
      /(\d+)[ºªo°]\s*(?:ano|série)/i,
      /(?:ano|série)\s*(\d+)/i,
      /ensino\s+(fundamental|médio|medio)/i,
    ];
    for (const pattern of seriePatterns) {
      const match = fullText.match(pattern);
      if (match) {
        facts.push(`Série/ano mencionado: ${match[0].trim()}`);
        break;
      }
    }

    const turmaMatch = fullText.match(/turma\s+([a-zA-Z0-9]+)/i);
    if (turmaMatch) {
      facts.push(`Turma: ${turmaMatch[0].trim()}`);
    }

    const topicIndicators = [
      /(?:sobre|de|para)\s+(.{3,60})(?:\.|,|!|\?|$)/i,
      /(?:tema|assunto|conteúdo|conteudo|matéria|materia)[:\s]+(.{3,60})(?:\.|,|!|\?|$)/i,
    ];
    for (const pattern of topicIndicators) {
      const match = originalGoal.match(pattern);
      if (match && match[1]) {
        const topic = match[1].trim()
          .replace(/\s*(e me entregue|e prepare|e faça|e faca|e crie|e monte).*$/i, '')
          .trim();
        if (topic.length > 3 && topic.length < 80) {
          facts.push(`Tópico/tema trabalhado: ${topic}`);
          break;
        }
      }
    }

    const activityTypes: string[] = [];
    const session_ = getSession(sessionId);
    if (session_?.stepResults) {
      for (const step of session_.stepResults) {
        if (step.stepTitle) {
          activityTypes.push(step.stepTitle);
        }
      }
    }
    if (activityTypes.length > 0) {
      facts.push(`Atividades criadas: ${activityTypes.join(', ')}`);
    }

    if (facts.length > 0) {
      addLedgerFact(sessionId, {
        fact: `[CONTEXTO DO QUE FOI FEITO] ${facts.join(' | ')}`,
        category: 'discovery',
      });
      console.log(`📌 [Orchestrator] Fatos de tópico registrados no ledger: ${facts.join(' | ')}`);
    }
  } catch (error) {
    console.warn('⚠️ [Orchestrator] Erro ao extrair fatos de tópico (não crítico):', error);
  }
}

export async function sendFollowUpMessage(
  message: string,
  sessionId: string,
  userId: string
): Promise<string> {
  console.log('💬 [Orchestrator] Mensagem de follow-up:', message);

  sessionTimestamps.set(sessionId, Date.now());

  const session = getSession(sessionId);
  if (!session) {
    createSession(sessionId, userId, message);
  }

  addConversationTurn(sessionId, {
    role: 'user',
    content: message,
    timestamp: Date.now(),
    metadata: { type: 'follow_up' },
  });

  addLedgerFact(sessionId, {
    fact: `Follow-up do professor: "${message.substring(0, 120)}"`,
    category: 'context',
  });

  const unifiedContext = buildContextForFollowUp(sessionId, message, userId);

  const { executeWithCascadeFallback } = await import('../services/controle-APIs-gerais-school-power');

  const prompt = `
${unifiedContext}

═══════════════════════════════════════════════════════════════
MENSAGEM ATUAL DO PROFESSOR:
"${message}"
═══════════════════════════════════════════════════════════════

Responda de forma útil e amigável, considerando TODO o contexto da conversa acima.
Lembre-se de tudo que já foi feito, criado e discutido.
Se for uma nova solicitação que requer criação de atividades ou conteúdo, 
indique que você pode criar um novo plano de ação.
Se for uma conversa casual, pergunta ou agradecimento, responda naturalmente.
  `.trim();

  const result = await executeWithCascadeFallback(prompt);

  if (result.success && result.data) {
    addConversationTurn(sessionId, {
      role: 'assistant',
      content: result.data,
      timestamp: Date.now(),
      metadata: { type: 'follow_up' },
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
