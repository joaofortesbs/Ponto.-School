import type { CapabilityInput, CapabilityOutput } from '../shared/types';
import { criarCompromissoCalendario, inferIcon } from './criar-compromisso-calendario';

interface ActivityInfo {
  id: string;
  tipo: string;
  titulo: string;
}

const SCHOOL_HOURS = [
  { start: '07:30', end: '08:20' },
  { start: '08:20', end: '09:10' },
  { start: '09:30', end: '10:20' },
  { start: '10:20', end: '11:10' },
  { start: '13:00', end: '13:50' },
  { start: '13:50', end: '14:40' },
  { start: '15:00', end: '15:50' },
];

function getNextWeekdays(count: number, startFrom?: string): string[] {
  const dates: string[] = [];
  const start = startFrom ? new Date(startFrom + 'T00:00:00') : new Date();

  if (!startFrom) {
    start.setDate(start.getDate() + 1);
  }

  while (dates.length < count) {
    const day = start.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(start.toISOString().split('T')[0]);
    }
    start.setDate(start.getDate() + 1);
  }
  return dates;
}

function inferLabelFromActivity(titulo: string): string[] {
  const lower = titulo.toLowerCase();
  if (lower.includes('matemática') || lower.includes('matematica') || lower.includes('funç') || lower.includes('equaç') || lower.includes('geometr')) return ['Matemática'];
  if (lower.includes('português') || lower.includes('portugues') || lower.includes('redação') || lower.includes('interpretação') || lower.includes('leitura')) return ['Português'];
  if (lower.includes('ciências') || lower.includes('ciencias') || lower.includes('fotossíntese') || lower.includes('ecossistema') || lower.includes('biologia')) return ['Ciências'];
  if (lower.includes('história') || lower.includes('historia') || lower.includes('revolução') || lower.includes('guerra')) return ['História'];
  if (lower.includes('geografia') || lower.includes('clima') || lower.includes('bioma')) return ['Geografia'];
  if (lower.includes('inglês') || lower.includes('ingles') || lower.includes('english')) return ['Inglês'];
  if (lower.includes('arte') || lower.includes('música') || lower.includes('musica')) return ['Artes'];
  if (lower.includes('educação física') || lower.includes('ed. física') || lower.includes('esporte')) return ['Ed. Física'];
  return [];
}

const LABEL_COLORS: Record<string, string> = {
  'Matemática': '#3B82F6',
  'Português': '#8B5CF6',
  'Ciências': '#10B981',
  'História': '#F59E0B',
  'Geografia': '#06B6D4',
  'Inglês': '#EC4899',
  'Artes': '#F97316',
  'Ed. Física': '#EF4444',
};

function buildLabelColors(labels: string[]): Record<string, string> {
  const colors: Record<string, string> = {};
  labels.forEach((label, i) => {
    colors[`label-${i + 1}`] = LABEL_COLORS[label] || '#6B7280';
  });
  return colors;
}

export async function criarCompromissoCalendarioV2(input: CapabilityInput): Promise<CapabilityOutput> {
  const startTime = Date.now();
  const debugLog: any[] = [];

  debugLog.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: 'Iniciando criação de compromisso(s) no calendário via V2 Batch API-First',
  });

  try {
    const params: Record<string, any> = { ...(input.context || {}) };

    const authenticatedUserId = getAuthenticatedUserIdFromStorage();
    if (authenticatedUserId && !params.professor_id) {
      params.professor_id = authenticatedUserId;
      debugLog.push({
        timestamp: new Date().toISOString(),
        type: 'info',
        narrative: `Professor ID injetado: ${authenticatedUserId.substring(0, 8)}...`,
      });
    }

    let activities: ActivityInfo[] = [];
    if (input.previous_results) {
      const criarResult = input.previous_results.get('criar_atividade');
      const criarActivities = criarResult?.data?.activities_built || criarResult?.data?.activities || [];
      if (criarResult?.success && criarActivities.length > 0) {
        activities = criarActivities
          .map((a: any) => ({
            id: a.id || a.db_id || a.activity_id || '',
            tipo: a.tipo || a.type || a.activity_type || '',
            titulo: a.titulo || a.title || a.name || '',
          }))
          .filter((a: ActivityInfo) => a.id && a.titulo);

        debugLog.push({
          timestamp: new Date().toISOString(),
          type: 'discovery',
          narrative: `Encontradas ${activities.length} atividades de criar_atividade (activities_built) para vincular`,
        });
      }

      const salvarResult = input.previous_results.get('salvar_atividades_bd');
      const salvarResults = salvarResult?.data?.results || salvarResult?.data?.saved_activities || [];
      if (salvarResult?.success && salvarResults.length > 0 && activities.length > 0) {
        const dbIdMap = new Map<string, string>();
        salvarResults.forEach((r: any) => {
          if (r.success && r.activity_id) {
            dbIdMap.set(r.activity_id, r.activity_id);
          }
        });
        if (dbIdMap.size > 0) {
          activities = activities.map(a => ({
            ...a,
            id: dbIdMap.get(a.id) || a.id,
          }));
          debugLog.push({
            timestamp: new Date().toISOString(),
            type: 'info',
            narrative: `Enriquecidas ${dbIdMap.size} atividades com IDs do banco (salvar_atividades_bd)`,
          });
        }
      } else if (salvarResult?.success && salvarResults.length > 0 && activities.length === 0) {
        activities = salvarResults
          .filter((r: any) => r.success)
          .map((r: any) => ({
            id: r.activity_id || r.db_id || r.id || '',
            tipo: r.tipo || r.type || '',
            titulo: r.titulo || r.title || `Atividade ${r.activity_id?.substring(0, 6) || ''}`,
          }))
          .filter((a: ActivityInfo) => a.id);
        debugLog.push({
          timestamp: new Date().toISOString(),
          type: 'discovery',
          narrative: `Usando ${activities.length} atividades do banco (salvar_atividades_bd) como fallback`,
        });
      }
    }

    if (activities.length === 0 && params.vincular_atividades) {
      debugLog.push({
        timestamp: new Date().toISOString(),
        type: 'warning',
        narrative: `vincular_atividades=true mas nenhuma atividade encontrada em previous_results. Keys disponíveis: ${input.previous_results ? Array.from(input.previous_results.keys()).join(', ') : 'NONE'}`,
      });
    }

    const shouldAutoGenerate = params.vincular_atividades && activities.length > 0;

    if (shouldAutoGenerate && (!params.eventos || params.eventos.length === 0)) {
      debugLog.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `Auto-gerando ${activities.length} eventos de calendário a partir das atividades criadas`,
      });

      const dates = getNextWeekdays(activities.length, params.data_inicio);

      params.eventos = activities.map((activity, index) => {
        const labels = inferLabelFromActivity(activity.titulo);
        const hour = SCHOOL_HOURS[index % SCHOOL_HOURS.length];

        return {
          titulo: activity.titulo,
          data: dates[index],
          hora_inicio: hour.start,
          hora_fim: hour.end,
          dia_todo: false,
          icone: inferIcon(activity.titulo, activity.tipo),
          labels,
          label_colors: buildLabelColors(labels),
          linked_activity_ids: [{ id: activity.id, tipo: activity.tipo, titulo: activity.titulo }],
        };
      });

      params.modo_batch = true;

      debugLog.push({
        timestamp: new Date().toISOString(),
        type: 'info',
        narrative: `Gerados ${params.eventos.length} eventos distribuídos em dias úteis com horários escolares`,
      });
    } else if (activities.length > 0 && params.eventos && params.eventos.length > 0) {
      const eventCount = params.eventos.length;
      const actPerEvent = Math.ceil(activities.length / eventCount);

      params.eventos = params.eventos.map((evt: any, index: number) => {
        const startIdx = index * actPerEvent;
        const eventActivities = activities.slice(startIdx, startIdx + actPerEvent);

        if (eventActivities.length > 0 && !evt.linked_activity_ids) {
          evt.linked_activity_ids = eventActivities.map(a => ({
            id: a.id, tipo: a.tipo, titulo: a.titulo
          }));
        }

        if (!evt.labels || evt.labels.length === 0) {
          const firstActivity = eventActivities[0] || activities[0];
          if (firstActivity) {
            evt.labels = inferLabelFromActivity(firstActivity.titulo);
            evt.label_colors = buildLabelColors(evt.labels);
          }
        }

        if (!evt.icone) {
          evt.icone = inferIcon(evt.titulo || '');
        }

        return evt;
      });

      debugLog.push({
        timestamp: new Date().toISOString(),
        type: 'info',
        narrative: `Vinculadas ${activities.length} atividades a ${eventCount} eventos pré-configurados`,
      });
    }

    const result = await criarCompromissoCalendario(params);

    debugLog.push({
      timestamp: new Date().toISOString(),
      type: result.success ? 'confirmation' : 'error',
      narrative: result.message,
    });

    const eventCount = result.batch_details?.successCount || (result.success ? 1 : 0);

    return {
      success: result.success,
      capability_id: input.capability_id,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: result.success ? {
        evento: result.evento,
        eventos: result.eventos || (result.evento ? [result.evento] : []),
        message: result.message,
        calendar_updated: true,
        events_created: eventCount,
        batch_details: result.batch_details,
        linked_activities_count: activities.length,
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
            id: 'eventos_criados',
            label: 'Compromissos no Calendário',
            passed: result.success,
            expected: `${eventCount} evento(s) criado(s)`,
            value: eventCount,
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
      } as any,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    debugLog.push({
      timestamp: new Date().toISOString(),
      type: 'error',
      narrative: `Erro ao criar compromisso(s): ${errorMsg}`,
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
