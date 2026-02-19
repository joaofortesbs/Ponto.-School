import { executeWithCascadeFallback } from '../../../../services/controle-APIs-gerais-school-power';
import {
  visualizarEventos,
  analisarDisponibilidade,
  editarEvento,
  excluirEvento,
  criarEventos,
  type SubOperationResult,
} from './sub-operations';
import type { DebugEntry } from '../../shared/types';

export interface CalendarAgentInput {
  professor_id: string;
  user_objective: string;
  user_prompt: string;
  create_params?: Record<string, any>;
  previous_results?: Map<string, any>;
}

export interface CalendarAgentOutput {
  success: boolean;
  operations_executed: Array<{
    operation: string;
    success: boolean;
    summary: string;
  }>;
  final_message: string;
  data: any;
  debug_log: DebugEntry[];
  iterations: number;
}

interface AgentAction {
  operation: 'visualizar_eventos' | 'analisar_disponibilidade' | 'editar_evento' | 'excluir_evento' | 'criar_eventos' | 'finalizar';
  params: Record<string, any>;
  reasoning: string;
}

const MAX_ITERATIONS = 4;

const CALENDAR_AGENT_SYSTEM = `Você é o agente de calendário do Jota — um assistente inteligente de organização escolar.

SUAS SUB-OPERAÇÕES DISPONÍVEIS:
1. "visualizar_eventos" — Busca eventos do calendário. Params: { date_from?: "YYYY-MM-DD", date_to?: "YYYY-MM-DD", month?: number, year?: number, labels?: string[] }
2. "analisar_disponibilidade" — Mostra dias livres e ocupados. Params: { date_from: "YYYY-MM-DD", date_to: "YYYY-MM-DD" }
3. "editar_evento" — Edita um evento existente. Params: { event_id: "uuid", changes: { title?, eventDate?, startTime?, endTime?, isAllDay?, repeat?, icon?, labels?, linkedActivities? } }
4. "excluir_evento" — Remove um evento. Params: { event_id: "uuid" }
5. "criar_eventos" — Cria novo(s) evento(s). Params: { titulo, data, hora_inicio?, hora_fim?, dia_todo?, repeticao?, icone?, labels?, eventos?: [...], modo_batch?: boolean, professor_id }
6. "finalizar" — Encerra o fluxo quando o objetivo foi alcançado. Params: {}

REGRAS:
- Hoje é ${new Date().toISOString().split('T')[0]}.
- Sempre comece buscando os eventos existentes se o objetivo envolve editar, excluir, mover ou visualizar.
- Para editar/excluir, você PRECISA do event_id exato — busque os eventos primeiro.
- Se o objetivo é apenas criar novos eventos (sem menção a editar/ver/excluir), vá direto para criar_eventos.
- Após cada ação, avalie se o objetivo foi alcançado. Se sim, use "finalizar".
- Máximo ${MAX_ITERATIONS} iterações. Seja eficiente.
- NUNCA invente event_ids. Use apenas IDs reais dos resultados da busca.

Responda APENAS com JSON válido:
{
  "operation": "nome_da_operacao",
  "params": { ... },
  "reasoning": "Por que escolhi esta ação"
}`;

function buildDecisionPrompt(
  userObjective: string,
  iterationHistory: string[],
  currentState: string
): string {
  let prompt = `OBJETIVO DO PROFESSOR: "${userObjective}"

`;

  if (iterationHistory.length > 0) {
    prompt += `HISTÓRICO DE AÇÕES JÁ EXECUTADAS:\n${iterationHistory.map((h, i) => `  Iteração ${i + 1}: ${h}`).join('\n')}\n\n`;
  }

  if (currentState) {
    prompt += `ESTADO ATUAL DO CALENDÁRIO:\n${currentState}\n\n`;
  }

  prompt += `Qual é a PRÓXIMA ação a executar? Se o objetivo já foi alcançado, use "finalizar".`;

  return prompt;
}

function detectDirectCreateIntent(userPrompt: string, createParams?: Record<string, any>): boolean {
  const nonCreatePatterns = [
    /(?:edit|alter|mud|mov|troc|atualiz)/i,
    /(?:exclu|delet|remov|cancel|apag)/i,
    /(?:mostr|ver|vej|list|quais|como está|o que tem)/i,
    /(?:dia.*livr|disponib|vagas|quando.*posso)/i,
    /(?:remarc|reagend)/i,
  ];

  const hasNonCreate = nonCreatePatterns.some(p => p.test(userPrompt));
  if (hasNonCreate) return false;

  if (createParams && (createParams.titulo || createParams.eventos || createParams.vincular_atividades)) {
    return true;
  }

  const createOnlyPatterns = [
    /^(?:crie|agende|marque|adicione|coloque)\s/i,
    /(?:cri(?:e|ar)|agend(?:e|ar)|marc(?:ar|que))\s+(?:um|uma|o|a)\s+(?:compromisso|evento|aula|reunião|prova)/i,
  ];

  return createOnlyPatterns.some(p => p.test(userPrompt));
}

export async function executeCalendarAgent(input: CalendarAgentInput): Promise<CalendarAgentOutput> {
  const debugLog: DebugEntry[] = [];
  const operationsExecuted: CalendarAgentOutput['operations_executed'] = [];
  const iterationHistory: string[] = [];
  let currentState = '';
  let finalData: any = null;

  debugLog.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: `🧠 Mini-Agente de Calendário iniciado. Objetivo: "${input.user_objective.substring(0, 100)}..."`,
  });

  if (detectDirectCreateIntent(input.user_prompt, input.create_params)) {
    debugLog.push({
      timestamp: new Date().toISOString(),
      type: 'decision',
      narrative: 'Fast-path: Objetivo é criação direta — pulando LLM do mini-agente',
    });

    const createResult = await criarEventos({
      ...input.create_params,
      professor_id: input.professor_id,
    });

    debugLog.push(...createResult.debug_entries);
    operationsExecuted.push({
      operation: 'criar_eventos',
      success: createResult.success,
      summary: createResult.message,
    });

    return {
      success: createResult.success,
      operations_executed: operationsExecuted,
      final_message: createResult.message,
      data: createResult.data,
      debug_log: debugLog,
      iterations: 0,
    };
  }

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    debugLog.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `--- Iteração ${iteration + 1}/${MAX_ITERATIONS} ---`,
    });

    const decisionPrompt = buildDecisionPrompt(input.user_objective, iterationHistory, currentState);

    let action: AgentAction;
    try {
      const llmResult = await executeWithCascadeFallback(
        decisionPrompt,
        {
          onProgress: (status: string) => {
            console.log(`🧠 [CalendarAgent] LLM: ${status}`);
          },
          systemPrompt: CALENDAR_AGENT_SYSTEM,
        }
      );

      if (!llmResult.success || !llmResult.data) {
        debugLog.push({
          timestamp: new Date().toISOString(),
          type: 'error',
          narrative: `LLM falhou na iteração ${iteration + 1}: ${llmResult.errors?.join(', ') || 'sem dados'}`,
        });
        break;
      }

      action = parseAgentAction(llmResult.data);
    } catch (parseError) {
      debugLog.push({
        timestamp: new Date().toISOString(),
        type: 'error',
        narrative: `Erro ao parsear ação do LLM: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      });
      break;
    }

    debugLog.push({
      timestamp: new Date().toISOString(),
      type: 'decision',
      narrative: `Ação decidida: ${action.operation} — ${action.reasoning}`,
    });

    if (action.operation === 'finalizar') {
      debugLog.push({
        timestamp: new Date().toISOString(),
        type: 'confirmation',
        narrative: `Mini-agente finalizou após ${iteration + 1} iteração(ões)`,
      });
      break;
    }

    const result = await executeSubOperation(action, input.professor_id);

    debugLog.push(...result.debug_entries);
    operationsExecuted.push({
      operation: action.operation,
      success: result.success,
      summary: result.message,
    });

    iterationHistory.push(`${action.operation}: ${result.success ? 'SUCESSO' : 'FALHA'} — ${result.message.substring(0, 200)}`);

    if (result.success && result.data) {
      if (action.operation === 'visualizar_eventos') {
        currentState = result.message;
      }
      finalData = result.data;
    }
  }

  const allMessages = operationsExecuted.map(op => op.summary);
  const lastSuccessMessage = allMessages.filter((_, i) => operationsExecuted[i].success).pop();
  const anySuccess = operationsExecuted.some(op => op.success);

  return {
    success: anySuccess,
    operations_executed: operationsExecuted,
    final_message: lastSuccessMessage || (operationsExecuted.length > 0 ? allMessages[allMessages.length - 1] : 'Nenhuma operação executada'),
    data: finalData,
    debug_log: debugLog,
    iterations: operationsExecuted.length,
  };
}

async function executeSubOperation(
  action: AgentAction,
  professorId: string
): Promise<SubOperationResult> {
  switch (action.operation) {
    case 'visualizar_eventos':
      return visualizarEventos({
        professor_id: professorId,
        date_from: action.params.date_from,
        date_to: action.params.date_to,
        month: action.params.month,
        year: action.params.year,
        labels: action.params.labels,
      });

    case 'analisar_disponibilidade':
      return analisarDisponibilidade({
        professor_id: professorId,
        date_from: action.params.date_from || new Date().toISOString().split('T')[0],
        date_to: action.params.date_to || getDateOffset(14),
      });

    case 'editar_evento':
      return editarEvento({
        professor_id: professorId,
        event_id: action.params.event_id,
        changes: action.params.changes || {},
      });

    case 'excluir_evento':
      return excluirEvento({
        professor_id: professorId,
        event_id: action.params.event_id,
      });

    case 'criar_eventos':
      return criarEventos({
        ...action.params,
        professor_id: professorId,
      });

    default:
      return {
        success: false,
        operation: action.operation,
        data: null,
        message: `Operação desconhecida: ${action.operation}`,
        debug_entries: [{
          timestamp: new Date().toISOString(),
          type: 'error',
          narrative: `Operação "${action.operation}" não reconhecida`,
        }],
      };
  }
}

function parseAgentAction(llmResponse: string): AgentAction {
  let cleaned = llmResponse.trim();
  cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('JSON não encontrado na resposta do mini-agente');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  const validOperations = [
    'visualizar_eventos', 'analisar_disponibilidade',
    'editar_evento', 'excluir_evento', 'criar_eventos', 'finalizar',
  ];

  if (!validOperations.includes(parsed.operation)) {
    throw new Error(`Operação inválida: ${parsed.operation}. Válidas: ${validOperations.join(', ')}`);
  }

  return {
    operation: parsed.operation,
    params: parsed.params || {},
    reasoning: parsed.reasoning || 'Sem justificativa',
  };
}

function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
