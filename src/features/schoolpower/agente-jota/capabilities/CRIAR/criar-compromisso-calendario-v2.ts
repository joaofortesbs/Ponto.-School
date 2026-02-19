import type { CapabilityInput, CapabilityOutput } from '../shared/types';
import { criarCompromissoCalendario } from './criar-compromisso-calendario';

export async function criarCompromissoCalendarioV2(input: CapabilityInput): Promise<CapabilityOutput> {
  const startTime = Date.now();
  const debugLog: any[] = [];

  debugLog.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: 'Iniciando criação de compromisso no calendário via V2 API-First',
  });

  try {
    const params = input.context || {};

    if (input.previous_results) {
      const criarResult = input.previous_results.get('criar_atividade');
      if (criarResult?.success && criarResult?.data?.activities && !params.linked_activity_ids) {
        params.linked_activity_ids = criarResult.data.activities
          .map((a: any) => ({
            id: a.id || a.db_id,
            tipo: a.tipo || a.type,
            titulo: a.titulo || a.title,
          }))
          .filter((a: any) => a.id);
        debugLog.push({
          timestamp: new Date().toISOString(),
          type: 'discovery',
          narrative: `Vinculando ${params.linked_activity_ids.length} atividades criadas anteriormente ao compromisso`,
        });
      }
    }

    const authenticatedUserId = getAuthenticatedUserIdFromStorage();
    if (authenticatedUserId && !params.professor_id) {
      params.professor_id = authenticatedUserId;
      debugLog.push({
        timestamp: new Date().toISOString(),
        type: 'info',
        narrative: `Professor ID injetado automaticamente: ${authenticatedUserId.substring(0, 8)}...`,
      });
    }

    const result = await criarCompromissoCalendario(params);

    debugLog.push({
      timestamp: new Date().toISOString(),
      type: result.success ? 'confirmation' : 'error',
      narrative: result.message,
    });

    return {
      success: result.success,
      capability_id: input.capability_id,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: result.success ? {
        evento: result.evento,
        message: result.message,
        calendar_updated: true,
      } : null,
      error: result.success ? null : {
        code: result.error || 'CALENDAR_ERROR',
        message: result.message,
        severity: 'medium',
        recoverable: true,
        recovery_suggestion: 'Verifique os parâmetros e tente novamente',
      },
      debug_log: debugLog,
      data_confirmation: {
        confirmed: result.success,
        checks: [
          {
            id: 'evento_criado',
            label: 'Compromisso no Calendário',
            passed: result.success,
            expected: 'Evento criado no calendário',
            value: result.success ? result.evento?.id : null,
            message: result.message,
          },
        ],
        summary: result.message,
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
      narrative: `Erro ao criar compromisso: ${errorMsg}`,
    });

    return {
      success: false,
      capability_id: input.capability_id,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: null,
      error: {
        code: 'CALENDAR_EXCEPTION',
        message: errorMsg,
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
