import type { CapabilityInput, CapabilityOutput } from '../../shared/types';
import { executeCalendarAgent, type CalendarAgentInput } from './calendar-agent-router';
import { criarCompromissoCalendarioV2 } from '../criar-compromisso-calendario-v2';

interface ActivityInfo {
  id: string;
  tipo: string;
  titulo: string;
}

export async function gerenciarCalendarioV2(input: CapabilityInput): Promise<CapabilityOutput> {
  const startTime = Date.now();
  const debugLog: any[] = [];

  debugLog.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: '🧠 Capability gerenciar_calendario v1.0 — Iniciando análise inteligente',
  });

  try {
    const params: Record<string, any> = { ...(input.context || {}) };
    const professorId = params.professor_id || params.user_id || getAuthenticatedUserIdFromStorage();

    if (!professorId) {
      return buildErrorOutput(input, startTime, debugLog, 'MISSING_PROFESSOR_ID', 'ID do professor é obrigatório.');
    }

    const userObjective = params.user_objective || params.user_prompt || params.conversation_context || '';
    const userPrompt = params.user_prompt || params.solicitacao || params.contexto || userObjective;

    const isBackwardCompatCreate = detectBackwardCompatCreate(params, input.previous_results);

    if (isBackwardCompatCreate) {
      debugLog.push({
        timestamp: new Date().toISOString(),
        type: 'decision',
        narrative: 'Backward compatibility: Detectado padrão de criação V2 — delegando para criar_compromisso_calendario_v2 diretamente (sem LLM extra)',
      });

      const v2Result = await criarCompromissoCalendarioV2(input);

      v2Result.debug_log = [...debugLog, ...(v2Result.debug_log || [])];
      return v2Result;
    }

    debugLog.push({
      timestamp: new Date().toISOString(),
      type: 'decision',
      narrative: `Modo inteligente ativado — Mini-agente vai analisar: "${userObjective.substring(0, 100)}..."`,
    });

    const agentInput: CalendarAgentInput = {
      professor_id: professorId,
      user_objective: userObjective,
      user_prompt: userPrompt,
      create_params: extractCreateParams(params),
      previous_results: input.previous_results,
    };

    const agentResult = await executeCalendarAgent(agentInput);

    debugLog.push(...agentResult.debug_log);

    const operationsSummary = agentResult.operations_executed
      .map(op => `${op.operation}: ${op.success ? '✅' : '❌'} ${op.summary.substring(0, 100)}`)
      .join('\n');

    debugLog.push({
      timestamp: new Date().toISOString(),
      type: agentResult.success ? 'confirmation' : 'error',
      narrative: `Mini-agente concluiu em ${agentResult.iterations} iteração(ões).\n${operationsSummary}`,
    });

    return {
      success: agentResult.success,
      capability_id: input.capability_id,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: agentResult.success ? {
        operations: agentResult.operations_executed,
        final_data: agentResult.data,
        message: agentResult.final_message,
        resposta_para_professor: agentResult.final_message,
        calendar_updated: true,
        iterations: agentResult.iterations,
      } : null,
      error: agentResult.success ? null : {
        code: 'CALENDAR_AGENT_ERROR',
        message: agentResult.final_message,
        severity: 'medium',
        recoverable: true,
        recovery_suggestion: 'Tente reformular o pedido com mais detalhes',
      },
      debug_log: debugLog,
      data_confirmation: {
        confirmed: agentResult.success,
        checks: agentResult.operations_executed.map((op, i) => ({
          id: `op_${i}`,
          label: op.operation,
          passed: op.success,
          expected: 'Operação concluída com sucesso',
          value: op.summary.substring(0, 100),
          message: op.summary,
        })),
        summary: agentResult.final_message,
        blocksNextStep: false,
      },
      metadata: {
        duration_ms: Date.now() - startTime,
        retry_count: 0,
        data_source: 'neon_postgresql',
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    debugLog.push({
      timestamp: new Date().toISOString(),
      type: 'error',
      narrative: `Erro no gerenciar_calendario: ${errorMsg}`,
    });

    return buildErrorOutput(input, startTime, debugLog, 'CALENDAR_EXCEPTION', errorMsg);
  }
}

function detectBackwardCompatCreate(
  params: Record<string, any>,
  previousResults?: Map<string, any>
): boolean {
  if (params.vincular_atividades) return true;

  if (params.eventos && Array.isArray(params.eventos) && params.eventos.length > 0) return true;

  if (params.titulo && params.data) return true;

  if (previousResults) {
    const hasCriarResult = previousResults.has('criar_atividade');
    const hasSalvarResult = previousResults.has('salvar_atividades_bd');
    if (hasCriarResult || hasSalvarResult) {
      const userPrompt = (params.user_prompt || params.user_objective || '').toLowerCase();
      const hasEditDeleteKeywords = /(?:edit|alter|mud|mov|troc|exclu|delet|remov|cancel|apag|quais|mostr|ver|livr|disponib)/i.test(userPrompt);
      if (!hasEditDeleteKeywords) return true;
    }
  }

  return false;
}

function extractCreateParams(params: Record<string, any>): Record<string, any> {
  const createKeys = [
    'titulo', 'data', 'hora_inicio', 'hora_fim', 'dia_todo',
    'repeticao', 'icone', 'labels', 'label_colors',
    'linked_activity_ids', 'eventos', 'modo_batch', 'vincular_atividades',
    'data_inicio',
  ];

  const createParams: Record<string, any> = {};
  for (const key of createKeys) {
    if (params[key] !== undefined) {
      createParams[key] = params[key];
    }
  }

  return Object.keys(createParams).length > 0 ? createParams : {};
}

function buildErrorOutput(
  input: CapabilityInput,
  startTime: number,
  debugLog: any[],
  code: string,
  message: string
): CapabilityOutput {
  return {
    success: false,
    capability_id: input.capability_id,
    execution_id: input.execution_id,
    timestamp: new Date().toISOString(),
    data: null,
    error: {
      code,
      message,
      severity: 'high',
      recoverable: true,
      recovery_suggestion: 'Tente novamente com os parâmetros corretos',
    },
    debug_log: debugLog,
    metadata: {
      duration_ms: Date.now() - startTime,
      retry_count: 0,
      data_source: 'neon_postgresql',
    },
  };
}

function getAuthenticatedUserIdFromStorage(): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const userId = localStorage.getItem('userId');
    if (userId) return userId;
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      return userData?.id || userData?.userId || null;
    }
    return null;
  } catch {
    return null;
  }
}
