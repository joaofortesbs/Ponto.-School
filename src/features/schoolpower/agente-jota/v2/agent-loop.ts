import { executeWithCascadeFallback } from '../../services/controle-APIs-gerais-school-power';
import { findCapability, executeCapability, getAllCapabilities } from '../capabilities';
import { formatCapabilitiesForPrompt } from '../prompts/planning-prompt';
import type { ProgressUpdate } from '../../interface-chat-producao/types';

export interface AgentState {
  sessionId: string;
  userId: string;
  userPrompt: string;
  iteration: number;
  maxIterations: number;
  status: 'thinking' | 'acting' | 'observing' | 'done' | 'error' | 'stuck';
  thoughts: ThoughtEntry[];
  actions: ActionEntry[];
  observations: ObservationEntry[];
  capabilityResults: Map<string, any>;
  startTime: number;
  timeoutMs: number;
  finalResult: any;
}

export interface ThoughtEntry {
  iteration: number;
  reasoning: string;
  nextAction: string | null;
  nextParams: Record<string, any>;
  parallelActions?: Array<{ action: string; params: Record<string, any> }>;
  isDone: boolean;
  timestamp: number;
}

export interface ActionEntry {
  iteration: number;
  capabilityName: string;
  params: Record<string, any>;
  startTime: number;
  endTime?: number;
  success: boolean;
  result?: any;
  error?: string;
}

export interface ObservationEntry {
  iteration: number;
  summary: string;
  dataDiscovered: string[];
  decisionsNeeded: string[];
  timestamp: number;
}

export interface AgentLoopConfig {
  maxIterations: number;
  timeoutMs: number;
  stuckThreshold: number;
  onProgress?: (update: ProgressUpdate) => void;
  onThought?: (thought: ThoughtEntry) => void;
  onAction?: (action: ActionEntry) => void;
  onObservation?: (observation: ObservationEntry) => void;
}

const DEFAULT_CONFIG: AgentLoopConfig = {
  maxIterations: 10,
  timeoutMs: 120000,
  stuckThreshold: 3,
};

const REACT_SYSTEM_PROMPT = `Você é o Agente Jota, assistente inteligente do Ponto School para professores.

Você opera em um loop de PENSAR → AGIR → OBSERVAR.
A cada iteração, analise o estado atual e decida a próxima ação.

CAPABILITIES DISPONÍVEIS:
{capabilities}

REGRAS DO LOOP:
1. Analise o que já foi feito (observações anteriores)
2. Decida a próxima capability a executar
3. Se tudo necessário já foi feito, sinalize DONE
4. Se capabilities são independentes, pode indicar execução paralela

FORMATO DE RESPOSTA (JSON ESTRITO):
{
  "pensamento": "Análise do estado atual e raciocínio sobre próxima ação",
  "acao": "nome_da_capability" ou null se DONE,
  "parametros": {},
  "acoes_paralelas": [{"acao": "nome", "parametros": {}}] ou null,
  "done": true/false,
  "motivo_done": "Explicação se done=true"
}

PIPELINE TÍPICO:
1. pesquisar_atividades_disponiveis + pesquisar_atividades_conta (PARALELO)
2. decidir_atividades_criar (usa resultados da pesquisa)
3. gerar_conteudo_atividades (gera conteúdo para atividades decididas)
4. criar_atividade (cria cada atividade decidida)
5. salvar_atividades_bd (salva no banco)
6. criar_arquivo (gera documento complementar) - OPCIONAL
7. DONE

IMPORTANTE:
- Use APENAS os nomes de capabilities listados acima
- Nunca repita uma capability já executada com sucesso
- Se uma capability falhou, pode tentar novamente com parâmetros diferentes
- Analise os resultados anteriores para tomar decisões informadas`.trim();

function buildReactPrompt(state: AgentState, conversationHistory: string): string {
  const capabilities = getAllCapabilities();
  const capabilitiesText = formatCapabilitiesForPrompt(capabilities);

  const systemPrompt = REACT_SYSTEM_PROMPT.replace('{capabilities}', capabilitiesText);

  const historyEntries: string[] = [];

  for (let i = 0; i < state.thoughts.length; i++) {
    const thought = state.thoughts[i];
    historyEntries.push(`\n--- Iteração ${thought.iteration} ---`);
    historyEntries.push(`PENSAMENTO: ${thought.reasoning}`);

    const actionsForIteration = state.actions.filter(a => a.iteration === thought.iteration);
    for (const action of actionsForIteration) {
      const duration = action.endTime ? `${action.endTime - action.startTime}ms` : 'em andamento';
      historyEntries.push(`AÇÃO: ${action.capabilityName} (${action.success ? 'sucesso' : 'falha'}, ${duration})`);
      if (action.result) {
        const resultStr = typeof action.result === 'string'
          ? action.result.substring(0, 500)
          : JSON.stringify(action.result, null, 2).substring(0, 500);
        historyEntries.push(`RESULTADO: ${resultStr}`);
      }
      if (action.error) {
        historyEntries.push(`ERRO: ${action.error}`);
      }
    }

    const obsForIteration = state.observations.filter(o => o.iteration === thought.iteration);
    for (const obs of obsForIteration) {
      historyEntries.push(`OBSERVAÇÃO: ${obs.summary}`);
      if (obs.dataDiscovered.length > 0) {
        historyEntries.push(`DADOS: ${obs.dataDiscovered.join(', ')}`);
      }
    }
  }

  const history = historyEntries.join('\n');

  return `${systemPrompt}

PEDIDO DO PROFESSOR:
"${state.userPrompt}"

${conversationHistory ? `CONTEXTO DA CONVERSA:\n${conversationHistory}\n` : ''}
HISTÓRICO DE EXECUÇÃO:
${history || 'Nenhuma ação executada ainda. Esta é a primeira iteração.'}

ITERAÇÃO ATUAL: ${state.iteration + 1} de ${state.maxIterations}

Analise o estado e decida a próxima ação. Responda APENAS com JSON válido.`.trim();
}

function detectStuck(state: AgentState, threshold: number): boolean {
  if (state.actions.length < threshold) return false;

  const recentActions = state.actions.slice(-threshold);
  const actionNames = recentActions.map(a => a.capabilityName);
  return new Set(actionNames).size === 1;
}

function isTimedOut(state: AgentState): boolean {
  return Date.now() - state.startTime > state.timeoutMs;
}

function parseThoughtResponse(responseText: string): Partial<ThoughtEntry> & { done: boolean; parallelActions?: any[] } {
  let cleanedText = responseText.trim();
  cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { reasoning: responseText, nextAction: null, nextParams: {}, isDone: false, done: false };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      reasoning: parsed.pensamento || parsed.reasoning || '',
      nextAction: parsed.acao || parsed.action || null,
      nextParams: parsed.parametros || parsed.params || {},
      parallelActions: parsed.acoes_paralelas || parsed.parallel_actions || null,
      isDone: parsed.done === true,
      done: parsed.done === true,
    };
  } catch {
    return { reasoning: responseText, nextAction: null, nextParams: {}, isDone: false, done: false };
  }
}

function createObservation(iteration: number, actions: ActionEntry[]): ObservationEntry {
  const successActions = actions.filter(a => a.success);
  const failedActions = actions.filter(a => !a.success);

  const dataDiscovered: string[] = [];
  for (const action of successActions) {
    if (action.result) {
      if (typeof action.result === 'object' && action.result.success !== undefined) {
        dataDiscovered.push(`${action.capabilityName}: ${action.result.success ? 'completado' : 'falhou'}`);
      } else {
        dataDiscovered.push(`${action.capabilityName}: dados obtidos`);
      }
    }
  }

  const summary = [
    successActions.length > 0 ? `${successActions.length} ação(ões) concluída(s) com sucesso` : '',
    failedActions.length > 0 ? `${failedActions.length} ação(ões) falharam` : '',
  ].filter(Boolean).join('. ');

  return {
    iteration,
    summary: summary || 'Sem ações executadas nesta iteração',
    dataDiscovered,
    decisionsNeeded: failedActions.length > 0 ? ['Decidir como lidar com falhas'] : [],
    timestamp: Date.now(),
  };
}

export async function runAgentLoop(
  userPrompt: string,
  sessionId: string,
  userId: string,
  config: Partial<AgentLoopConfig> = {},
  conversationHistory: string = ''
): Promise<AgentState> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  const state: AgentState = {
    sessionId,
    userId,
    userPrompt,
    iteration: 0,
    maxIterations: fullConfig.maxIterations,
    status: 'thinking',
    thoughts: [],
    actions: [],
    observations: [],
    capabilityResults: new Map(),
    startTime: Date.now(),
    timeoutMs: fullConfig.timeoutMs,
    finalResult: null,
  };

  console.log(`🔄 [AgentLoop] Iniciando loop ReAct para: "${userPrompt.substring(0, 80)}..."`);

  while (state.iteration < state.maxIterations) {
    if (isTimedOut(state)) {
      console.warn('⏰ [AgentLoop] Timeout atingido');
      state.status = 'done';
      break;
    }

    if (detectStuck(state, fullConfig.stuckThreshold)) {
      console.warn('🔁 [AgentLoop] Loop stuck detectado');
      state.status = 'stuck';
      break;
    }

    state.status = 'thinking';
    fullConfig.onProgress?.({
      sessionId,
      status: 'executando',
      descricao: `Iteração ${state.iteration + 1}: Analisando próximo passo...`,
      etapaAtual: state.iteration + 1,
    });

    const prompt = buildReactPrompt(state, conversationHistory);

    try {
      const result = await executeWithCascadeFallback(prompt, {
        onProgress: (s) => console.log(`🤖 [AgentLoop] Think: ${s}`),
      });

      if (!result.success || !result.data) {
        console.error('❌ [AgentLoop] Falha na chamada de pensamento');
        state.status = 'error';
        break;
      }

      const parsed = parseThoughtResponse(result.data);

      const thought: ThoughtEntry = {
        iteration: state.iteration,
        reasoning: parsed.reasoning || '',
        nextAction: parsed.nextAction || null,
        nextParams: parsed.nextParams || {},
        parallelActions: parsed.parallelActions || undefined,
        isDone: parsed.done,
        timestamp: Date.now(),
      };

      state.thoughts.push(thought);
      fullConfig.onThought?.(thought);

      console.log(`💭 [AgentLoop] Pensamento ${state.iteration + 1}: ${thought.reasoning.substring(0, 100)}...`);
      console.log(`🎯 [AgentLoop] Próxima ação: ${thought.isDone ? 'DONE' : thought.nextAction}`);

      if (thought.isDone) {
        state.status = 'done';
        console.log('✅ [AgentLoop] Agente sinalizou DONE');
        break;
      }

      state.status = 'acting';
      const iterationActions: ActionEntry[] = [];

      if (thought.parallelActions && thought.parallelActions.length > 0) {
        fullConfig.onProgress?.({
          sessionId,
          status: 'executando',
          descricao: `Executando ${thought.parallelActions.length} ações em paralelo...`,
          etapaAtual: state.iteration + 1,
        });

        const parallelPromises = thought.parallelActions.map(async (pa: any) => {
          const action: ActionEntry = {
            iteration: state.iteration,
            capabilityName: pa.action || pa.acao || '',
            params: pa.params || pa.parametros || {},
            startTime: Date.now(),
            success: false,
          };

          try {
            const cap = findCapability(action.capabilityName);
            if (!cap) {
              action.error = `Capability "${action.capabilityName}" não encontrada`;
              action.endTime = Date.now();
              return action;
            }

            const capResult = await executeCapability(action.capabilityName, action.params);
            action.result = capResult;
            action.success = capResult?.success !== false;
            action.endTime = Date.now();
            state.capabilityResults.set(action.capabilityName, capResult);
          } catch (error) {
            action.error = error instanceof Error ? error.message : String(error);
            action.success = false;
            action.endTime = Date.now();
          }

          return action;
        });

        const results = await Promise.allSettled(parallelPromises);
        for (const r of results) {
          if (r.status === 'fulfilled') {
            iterationActions.push(r.value);
          }
        }
      } else if (thought.nextAction) {
        const action: ActionEntry = {
          iteration: state.iteration,
          capabilityName: thought.nextAction,
          params: thought.nextParams || {},
          startTime: Date.now(),
          success: false,
        };

        fullConfig.onProgress?.({
          sessionId,
          status: 'executando',
          descricao: `Executando: ${thought.nextAction}...`,
          etapaAtual: state.iteration + 1,
        });

        try {
          const cap = findCapability(action.capabilityName);
          if (!cap) {
            action.error = `Capability "${action.capabilityName}" não encontrada`;
            action.endTime = Date.now();
          } else {
            const capResult = await executeCapability(action.capabilityName, action.params);
            action.result = capResult;
            action.success = capResult?.success !== false;
            action.endTime = Date.now();
            state.capabilityResults.set(action.capabilityName, capResult);

            fullConfig.onAction?.(action);
          }
        } catch (error) {
          action.error = error instanceof Error ? error.message : String(error);
          action.success = false;
          action.endTime = Date.now();
        }

        iterationActions.push(action);
      }

      state.actions.push(...iterationActions);

      state.status = 'observing';
      const observation = createObservation(state.iteration, iterationActions);
      state.observations.push(observation);
      fullConfig.onObservation?.(observation);

      console.log(`👁️ [AgentLoop] Observação: ${observation.summary}`);

    } catch (error) {
      console.error(`❌ [AgentLoop] Erro na iteração ${state.iteration}:`, error);
      state.status = 'error';
      break;
    }

    state.iteration++;
  }

  if (state.iteration >= state.maxIterations && state.status !== 'done') {
    console.warn('⚠️ [AgentLoop] Máximo de iterações atingido');
    state.status = 'done';
  }

  const totalDuration = Date.now() - state.startTime;
  console.log(`🏁 [AgentLoop] Loop concluído em ${totalDuration}ms com ${state.iteration + 1} iterações`);
  console.log(`📊 [AgentLoop] Ações executadas: ${state.actions.length}, Sucesso: ${state.actions.filter(a => a.success).length}`);

  return state;
}

export function getAgentLoopSummary(state: AgentState): string {
  const successActions = state.actions.filter(a => a.success);
  const failedActions = state.actions.filter(a => !a.success);

  return `Loop ReAct concluído em ${state.iteration + 1} iterações (${Date.now() - state.startTime}ms).
${successActions.length} ações executadas com sucesso, ${failedActions.length} falhas.
Status final: ${state.status}.
Capabilities executadas: ${[...new Set(successActions.map(a => a.capabilityName))].join(', ')}.`;
}
