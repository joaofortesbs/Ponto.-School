import { executeWithCascadeFallback } from '../../services/controle-APIs-gerais-school-power';
import { runAgentLoop, getAgentLoopSummary, type AgentState, type AgentLoopConfig } from './agent-loop';
import { ContextEngine } from './context-engine';
import { PersistentMemory } from './persistent-memory';
import { verifyAgentResult, shouldRetry, formatVerificationForUser, type VerificationResult } from './verifier';
import { sanitizeAiOutput, containsRawJson } from '../context/output-sanitizer';
import type { ProgressUpdate, ExecutionPlan, WorkingMemoryItem } from '../../interface-chat-producao/types';
import type { ArtifactData } from '../capabilities/CRIAR_ARQUIVO';

export interface ProcessPromptResultV2 {
  plan: ExecutionPlan | null;
  initialMessage: string;
  interpretation: {
    intent: string;
    entities: Record<string, any>;
    summary: string;
  };
}

export interface ExecutePlanResultV2 {
  relatorio: string;
  respostaFinal: string;
  verification: VerificationResult | null;
  agentState: AgentState;
  artifactData?: ArtifactData | null;
  metrics: {
    totalDuration: number;
    aiCalls: number;
    iterationsUsed: number;
    capabilitiesExecuted: number;
    parallelExecutions: number;
  };
}

const sessionContextEngines: Map<string, ContextEngine> = new Map();
const sessionMemories: Map<string, PersistentMemory> = new Map();
const sessionTimestamps: Map<string, number> = new Map();
const SESSION_MAX_AGE = 60 * 60 * 1000;

function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [sessionId, timestamp] of sessionTimestamps.entries()) {
    if (now - timestamp > SESSION_MAX_AGE) {
      sessionContextEngines.delete(sessionId);
      sessionMemories.delete(sessionId);
      sessionTimestamps.delete(sessionId);
    }
  }
}

setInterval(cleanupExpiredSessions, 10 * 60 * 1000);

const UNIFIED_COMPREHENSION_PROMPT = `Você é o Jota, assistente inteligente de IA do Ponto School para professores.

PEDIDO DO PROFESSOR:
"{user_prompt}"

{memory_context}

SUA TAREFA (responda com JSON):
{
  "resposta_inicial": "Mensagem acolhedora e específica (2-4 frases) demonstrando que entendeu o pedido. Mencione elementos específicos. Não use frases genéricas.",
  "interpretacao": "Resumo estruturado do que o professor quer em 1 frase",
  "intencao": "CRIAR_ATIVIDADE | CRIAR_AVALIACAO | PESQUISAR | PLANEJAR | OUTRO",
  "entidades": {
    "quantidade": null,
    "disciplina": null,
    "serie": null,
    "tipo_atividade": null,
    "tema": null
  },
  "plano_macro": ["pesquisar", "decidir", "criar", "salvar"]
}

EXEMPLOS:
- "Crie 3 atividades de matemática para 7º ano"
  resposta_inicial: "Perfeito! Vou criar 3 atividades de matemática focadas no 7º ano. Vou analisar as melhores opções de formato para engajar seus alunos e personalizar o conteúdo para a faixa etária."

- "Preciso de um quiz sobre fotossíntese"
  resposta_inicial: "Entendi! Vou montar um quiz completo sobre fotossíntese. Vou criar questões variadas que testem o conhecimento dos alunos de forma dinâmica e educativa."

REGRAS:
- Seja direto e específico na resposta_inicial
- NÃO mencione "plano de ação" ou termos técnicos
- Retorne APENAS o JSON

Retorne APENAS o JSON.`.trim();

function parseComprehensionResponse(responseText: string): {
  resposta: string;
  interpretacao: string;
  intencao: string;
  entidades: Record<string, any>;
  planoMacro: string[];
} {
  let cleanedText = responseText.trim();
  cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      resposta: 'Entendi seu pedido! Vou começar a trabalhar nisso agora.',
      interpretacao: 'Criar atividades educacionais',
      intencao: 'CRIAR_ATIVIDADE',
      entidades: {},
      planoMacro: ['pesquisar', 'decidir', 'criar', 'salvar'],
    };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      resposta: parsed.resposta_inicial || parsed.resposta || 'Entendi seu pedido!',
      interpretacao: parsed.interpretacao || '',
      intencao: parsed.intencao || 'CRIAR_ATIVIDADE',
      entidades: parsed.entidades || {},
      planoMacro: parsed.plano_macro || ['pesquisar', 'decidir', 'criar', 'salvar'],
    };
  } catch {
    return {
      resposta: 'Entendi seu pedido! Vou começar a trabalhar nisso agora.',
      interpretacao: '',
      intencao: 'CRIAR_ATIVIDADE',
      entidades: {},
      planoMacro: ['pesquisar', 'decidir', 'criar', 'salvar'],
    };
  }
}

export async function processUserPromptV2(
  userPrompt: string,
  sessionId: string,
  userId: string
): Promise<ProcessPromptResultV2> {
  console.log('🎯 [OrchestratorV2] Processando prompt:', userPrompt.substring(0, 80));
  const startTime = Date.now();

  sessionTimestamps.set(sessionId, Date.now());

  const contextEngine = new ContextEngine(sessionId);
  sessionContextEngines.set(sessionId, contextEngine);

  const memory = new PersistentMemory(userId, sessionId);
  sessionMemories.set(sessionId, memory);

  await memory.initialize();

  const memoryContext = await memory.getMemoryContext();
  contextEngine.addUserInput(userPrompt);
  if (memoryContext) {
    contextEngine.addMemoryContext(memoryContext);
  }

  try {
    const prompt = UNIFIED_COMPREHENSION_PROMPT
      .replace('{user_prompt}', userPrompt)
      .replace('{memory_context}', memoryContext ? `CONTEXTO DE MEMÓRIA:\n${memoryContext}` : '');

    const result = await executeWithCascadeFallback(prompt, {
      onProgress: (s) => console.log(`🤖 [OrchestratorV2] Compreensão: ${s}`),
    });

    const comprehension = result.success && result.data
      ? parseComprehensionResponse(result.data)
      : parseComprehensionResponse('');

    const plan = createMacroPlan(userPrompt, comprehension.planoMacro);

    console.log(`✅ [OrchestratorV2] Compreensão em ${Date.now() - startTime}ms (1 chamada IA unificada)`);

    return {
      plan,
      initialMessage: comprehension.resposta,
      interpretation: {
        intent: comprehension.intencao,
        entities: comprehension.entidades,
        summary: comprehension.interpretacao,
      },
    };
  } catch (error) {
    console.error('❌ [OrchestratorV2] Erro na compreensão:', error);
    return {
      plan: createMacroPlan(userPrompt, ['pesquisar', 'decidir', 'criar', 'salvar']),
      initialMessage: 'Entendi seu pedido! Vou começar a trabalhar nisso agora.',
      interpretation: {
        intent: 'CRIAR_ATIVIDADE',
        entities: {},
        summary: 'Criar atividades educacionais',
      },
    };
  }
}

export async function executeAgentPlanV2(
  plan: ExecutionPlan,
  sessionId: string,
  userId: string,
  onProgress?: (update: ProgressUpdate) => void,
  conversationHistory?: string
): Promise<ExecutePlanResultV2> {
  console.log('▶️ [OrchestratorV2] Iniciando execução agêntica para:', plan.planId);
  const startTime = Date.now();
  let aiCalls = 1;

  const contextEngine = sessionContextEngines.get(sessionId) || new ContextEngine(sessionId);
  const memory = sessionMemories.get(sessionId) || new PersistentMemory(userId, sessionId);

  const loopConfig: Partial<AgentLoopConfig> = {
    maxIterations: 10,
    timeoutMs: 120000,
    stuckThreshold: 3,
    onProgress,
  };

  onProgress?.({
    sessionId,
    status: 'executando',
    descricao: 'Iniciando execução inteligente...',
  });

  const agentState = await runAgentLoop(
    plan.objetivo,
    sessionId,
    userId,
    loopConfig,
    conversationHistory || ''
  );

  aiCalls += agentState.thoughts.length;

  for (const thought of agentState.thoughts) {
    contextEngine.addThought(thought);
  }
  for (const action of agentState.actions) {
    contextEngine.addAction(action);
  }
  for (const obs of agentState.observations) {
    contextEngine.addObservation(obs);
  }

  let verification: VerificationResult | null = null;
  const successActions = agentState.actions.filter(a => a.success);

  if (successActions.length > 0) {
    onProgress?.({
      sessionId,
      status: 'executando',
      descricao: 'Verificando qualidade do resultado...',
    });

    verification = await verifyAgentResult(agentState, plan.objetivo);
    aiCalls++;

    if (shouldRetry(verification) && agentState.iteration < 8) {
      console.log('🔄 [OrchestratorV2] Verificador solicitou retry, executando novamente...');

      onProgress?.({
        sessionId,
        status: 'executando',
        descricao: 'Ajustando resultado baseado na verificação...',
      });

      const retryState = await runAgentLoop(
        `${plan.objetivo}\n\nPROBLEMAS IDENTIFICADOS NA VERIFICAÇÃO:\n${verification.criticalIssues.join('\n')}\n\nCORRIJA estes problemas.`,
        sessionId,
        userId,
        { ...loopConfig, maxIterations: 3 },
        conversationHistory || ''
      );

      agentState.actions.push(...retryState.actions);
      agentState.thoughts.push(...retryState.thoughts);
      agentState.observations.push(...retryState.observations);
      aiCalls += retryState.thoughts.length;

      verification = await verifyAgentResult(agentState, plan.objetivo);
      aiCalls++;
    }
  }

  onProgress?.({
    sessionId,
    status: 'executando',
    descricao: 'Gerando resposta final...',
  });

  const respostaFinal = await generateFinalResponseV2(
    agentState,
    plan.objetivo,
    contextEngine,
    verification
  );
  aiCalls++;

  const verificationNote = verification ? formatVerificationForUser(verification) : '';

  await memory.learnFromInteraction(plan.objetivo, agentState);
  await memory.updateSessionSummary(
    getAgentLoopSummary(agentState),
    [...new Set(agentState.actions.map(a => a.capabilityName))],
    []
  );

  const parallelExecutions = agentState.thoughts.filter(t => t.parallelActions && t.parallelActions.length > 0).length;

  console.log(`🏁 [OrchestratorV2] Completo em ${Date.now() - startTime}ms | ${aiCalls} chamadas IA | ${agentState.iteration + 1} iterações`);

  return {
    relatorio: getAgentLoopSummary(agentState),
    respostaFinal: verificationNote
      ? `${respostaFinal}\n\n${verificationNote}`
      : respostaFinal,
    verification,
    agentState,
    artifactData: null,
    metrics: {
      totalDuration: Date.now() - startTime,
      aiCalls,
      iterationsUsed: agentState.iteration + 1,
      capabilitiesExecuted: agentState.actions.length,
      parallelExecutions,
    },
  };
}

async function generateFinalResponseV2(
  state: AgentState,
  objetivo: string,
  contextEngine: ContextEngine,
  verification: VerificationResult | null
): Promise<string> {
  const successActions = state.actions.filter(a => a.success);
  const actionsSummary = successActions
    .map(a => `- ${a.capabilityName}: ${a.result?.message || 'Concluído'}`)
    .join('\n');

  const prompt = `Você é o Jota, assistente de IA do Ponto School.

PEDIDO ORIGINAL: "${objetivo}"

AÇÕES REALIZADAS:
${actionsSummary || 'Nenhuma ação concluída'}

VERIFICAÇÃO: ${verification ? `Score ${verification.score}/100 - ${verification.summary}` : 'Não verificado'}

Gere uma RESPOSTA FINAL concisa (3-5 frases):
1. Resuma o que foi feito em resposta ao pedido
2. Mencione DADOS ESPECÍFICOS (tipos, quantidades)
3. Ofereça próximos passos úteis

REGRAS:
- Tom de celebração/conclusão
- NUNCA retorne JSON ou dados técnicos
- Seja específico, não genérico
- Conecte com o pedido original

Retorne APENAS a resposta em texto narrativo.`.trim();

  try {
    const result = await executeWithCascadeFallback(prompt, {
      onProgress: (s) => console.log(`📝 [OrchestratorV2] Final: ${s}`),
    });

    if (result.success && result.data) {
      let response = result.data.trim();
      if (containsRawJson(response)) {
        const sanitized = sanitizeAiOutput(response);
        response = typeof sanitized === 'string' ? sanitized : sanitized.sanitized;
      }
      return response;
    }
  } catch (error) {
    console.error('❌ [OrchestratorV2] Erro na resposta final:', error);
  }

  return 'Processo concluído! Suas atividades estão prontas para uso.';
}

function createMacroPlan(userPrompt: string, steps: string[]): ExecutionPlan {
  const timestamp = Date.now();

  const etapas = steps.map((step, idx) => {
    const stepConfig = getStepConfig(step, userPrompt);
    return {
      ordem: idx + 1,
      titulo: stepConfig.titulo,
      descricao: stepConfig.descricao,
      funcao: stepConfig.funcao,
      parametros: stepConfig.parametros,
      status: 'pendente' as const,
      capabilities: stepConfig.capabilities.map((cap, capIdx) => ({
        id: `cap-${idx}-${capIdx}-${timestamp}`,
        nome: cap.nome,
        displayName: cap.displayName,
        categoria: cap.categoria as any,
        parametros: cap.parametros,
        status: 'pending' as const,
        ordem: capIdx + 1,
      })),
    };
  });

  return {
    planId: `plan-v2-${timestamp}`,
    objetivo: userPrompt,
    etapas,
    status: 'aguardando_aprovacao',
    createdAt: timestamp,
  };
}

function getStepConfig(step: string, userPrompt: string) {
  const configs: Record<string, any> = {
    pesquisar: {
      titulo: 'Pesquisar as melhores opções',
      descricao: 'Analisando catálogo e atividades anteriores',
      funcao: 'pesquisar_atividades_disponiveis',
      parametros: {},
      capabilities: [
        { nome: 'pesquisar_atividades_disponiveis', displayName: 'Pesquisando catálogo', categoria: 'PESQUISAR', parametros: {} },
        { nome: 'pesquisar_atividades_conta', displayName: 'Buscando atividades anteriores', categoria: 'PESQUISAR', parametros: {} },
      ],
    },
    decidir: {
      titulo: 'Decidir atividades ideais',
      descricao: 'Selecionando as melhores atividades',
      funcao: 'decidir_atividades_criar',
      parametros: { contexto: userPrompt },
      capabilities: [
        { nome: 'decidir_atividades_criar', displayName: 'Decidindo atividades', categoria: 'DECIDIR', parametros: { contexto: userPrompt } },
        { nome: 'gerar_conteudo_atividades', displayName: 'Gerando conteúdo', categoria: 'GERAR_CONTEUDO', parametros: { contexto: userPrompt } },
      ],
    },
    criar: {
      titulo: 'Criar atividades personalizadas',
      descricao: 'Construindo atividades sob medida',
      funcao: 'criar_atividade',
      parametros: { contexto: userPrompt },
      capabilities: [
        { nome: 'criar_atividade', displayName: 'Criando atividades', categoria: 'CRIAR', parametros: { contexto: userPrompt } },
      ],
    },
    salvar: {
      titulo: 'Salvar no banco de dados',
      descricao: 'Persistindo atividades criadas',
      funcao: 'salvar_atividades_bd',
      parametros: {},
      capabilities: [
        { nome: 'salvar_atividades_bd', displayName: 'Salvando atividades', categoria: 'SALVAR_BD', parametros: {} },
      ],
    },
    arquivo: {
      titulo: 'Gerar documento complementar',
      descricao: 'Criando documento de apoio pedagógico',
      funcao: 'criar_arquivo',
      parametros: {},
      capabilities: [
        { nome: 'criar_arquivo', displayName: 'Gerando documento', categoria: 'CRIAR', parametros: {} },
      ],
    },
  };

  return configs[step] || configs['pesquisar'];
}

export async function getSessionContextV2(sessionId: string): Promise<{
  workingMemory: WorkingMemoryItem[];
  hasActivePlan: boolean;
}> {
  return {
    workingMemory: [],
    hasActivePlan: false,
  };
}

export async function clearSessionV2(sessionId: string): Promise<void> {
  sessionContextEngines.delete(sessionId);
  sessionMemories.delete(sessionId);
  sessionTimestamps.delete(sessionId);
}
