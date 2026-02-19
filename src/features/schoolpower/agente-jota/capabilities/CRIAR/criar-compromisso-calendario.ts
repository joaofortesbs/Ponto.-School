/**
 * CAPABILITY: criar_compromisso_calendario
 * 
 * Responsabilidade: Criar compromissos/eventos no calendário do professor
 * diretamente a partir do chat com o Jota, sem necessidade de interação manual.
 * 
 * ARQUITETURA v2.0 - BATCH SUPPORT:
 * 1. Aceita evento único OU array de eventos via "eventos" param
 * 2. Valida cada evento individualmente
 * 3. Usa /api/calendar/events/batch para múltiplos eventos (10x mais rápido)
 * 4. Emite CustomEvent 'calendar-events-updated' para refresh do calendário
 * 5. Retorna resultado detalhado por evento
 */

interface CalendarEventParams {
  titulo: string;
  data: string;
  hora_inicio?: string;
  hora_fim?: string;
  dia_todo?: boolean;
  repeticao?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  icone?: string;
  labels?: string[];
  label_colors?: { [key: string]: string };
  linked_activity_ids?: Array<{ id: string; tipo: string; titulo: string }>;
}

interface CriarCompromissoParams {
  titulo?: string;
  data?: string;
  hora_inicio?: string;
  hora_fim?: string;
  dia_todo?: boolean;
  repeticao?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  icone?: string;
  labels?: string[];
  label_colors?: { [key: string]: string };
  linked_activity_ids?: Array<{ id: string; tipo: string; titulo: string }>;
  professor_id: string;
  eventos?: CalendarEventParams[];
  modo_batch?: boolean;
  vincular_atividades?: boolean;
}

interface CriarCompromissoResult {
  success: boolean;
  evento?: any;
  eventos?: any[];
  message: string;
  error?: string;
  batch_details?: {
    total: number;
    successCount: number;
    errors: any[];
  };
}

const ICON_MAP: Record<string, string> = {
  'aula': 'pencil',
  'prova': 'check',
  'reuniao': 'camera',
  'evento': 'star',
  'atividade': 'pencil',
  'default': 'pencil',
};

export function inferIcon(titulo: string, tipo?: string): string {
  const tituloLower = titulo.toLowerCase();
  if (tipo && ICON_MAP[tipo]) return ICON_MAP[tipo];
  if (tituloLower.includes('prova') || tituloLower.includes('avaliação') || tituloLower.includes('avaliacao') || tituloLower.includes('teste') || tituloLower.includes('simulado')) return 'check';
  if (tituloLower.includes('reunião') || tituloLower.includes('reuniao') || tituloLower.includes('conselho') || tituloLower.includes('coordenação')) return 'camera';
  if (tituloLower.includes('evento') || tituloLower.includes('festa') || tituloLower.includes('celebração') || tituloLower.includes('formatura')) return 'star';
  return 'pencil';
}

function normalizeDateFormat(dateStr: string): string {
  const ddmmFull = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmFull) {
    return `${ddmmFull[3]}-${ddmmFull[2].padStart(2, '0')}-${ddmmFull[1].padStart(2, '0')}`;
  }
  const ddmmShort = dateStr.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (ddmmShort) {
    const year = new Date().getFullYear();
    return `${year}-${ddmmShort[2].padStart(2, '0')}-${ddmmShort[1].padStart(2, '0')}`;
  }
  return dateStr;
}

function validateDate(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr + 'T00:00:00');
  return !isNaN(date.getTime());
}

function validateTime(timeStr: string): boolean {
  const regex = /^\d{2}:\d{2}$/;
  return regex.test(timeStr);
}

function buildEventPayload(evt: CalendarEventParams, professorId: string): any | null {
  if (!evt.titulo || !evt.data) return null;

  const normalizedDate = normalizeDateFormat(evt.data);
  if (!validateDate(normalizedDate)) return null;

  if (evt.hora_inicio && !validateTime(evt.hora_inicio)) return null;
  if (evt.hora_fim && !validateTime(evt.hora_fim)) return null;

  const resolvedIcon = evt.icone || inferIcon(evt.titulo);
  const isAllDay = evt.dia_todo !== undefined ? evt.dia_todo : (!evt.hora_inicio && !evt.hora_fim);

  return {
    userId: professorId,
    title: evt.titulo,
    eventDate: normalizedDate,
    startTime: isAllDay ? null : (evt.hora_inicio || null),
    endTime: isAllDay ? null : (evt.hora_fim || null),
    isAllDay,
    repeat: evt.repeticao || 'none',
    icon: resolvedIcon,
    labels: evt.labels || [],
    labelColors: evt.label_colors || {},
    linkedActivities: evt.linked_activity_ids || [],
    createdBy: 'jota_ia',
  };
}

function normalizeEventDate(raw: any): Date {
  if (raw instanceof Date) return raw;
  const str = String(raw || '');
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date(str + 'T00:00:00');
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) return new Date(str);
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatEventConfirmation(events: any[]): string {
  if (events.length === 0) return '📅 Nenhum compromisso criado.';

  if (events.length === 1) {
    const e = events[0];
    const dateRaw = e.event_date || e.eventDate || e.startDate;
    const d = normalizeEventDate(dateRaw);
    const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const timeStr = e.is_all_day ? 'dia todo' : `${e.start_time || ''}${e.end_time ? ' até ' + e.end_time : ''}`;
    return `📅 Compromisso "${e.title}" criado para ${d.getDate()} de ${monthNames[d.getMonth()]} (${timeStr}). Calendário atualizado!`;
  }

  const lines = events.map((e: any, i: number) => {
    const dateRaw = e.event_date || e.eventDate || e.startDate;
    const d = normalizeEventDate(dateRaw);
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayName = dayNames[d.getDay()];
    const timeStr = e.is_all_day ? 'dia todo' : `${e.start_time || ''}${e.end_time ? '-' + e.end_time : ''}`;
    return `  ${i + 1}. ${dayName} ${d.getDate()}/${(d.getMonth() + 1).toString().padStart(2, '0')} — "${e.title}" (${timeStr})`;
  });

  return `📅 ${events.length} compromissos criados no calendário!\n\n${lines.join('\n')}\n\nCalendário atualizado automaticamente!`;
}

export async function criarCompromissoCalendario(params: Record<string, any>): Promise<CriarCompromissoResult> {
  console.log('📅 [Capability] criar_compromisso_calendario v2.0 - Batch Support', params);

  const {
    professor_id,
    eventos,
    modo_batch,
  } = params as CriarCompromissoParams;

  if (!professor_id) {
    return {
      success: false,
      message: 'ID do professor é obrigatório.',
      error: 'MISSING_PROFESSOR_ID',
    };
  }

  const eventList: CalendarEventParams[] = eventos && Array.isArray(eventos) && eventos.length > 0
    ? eventos
    : (params.titulo && params.data)
      ? [{
          titulo: params.titulo,
          data: params.data,
          hora_inicio: params.hora_inicio,
          hora_fim: params.hora_fim,
          dia_todo: params.dia_todo,
          repeticao: params.repeticao,
          icone: params.icone,
          labels: params.labels,
          label_colors: params.label_colors,
          linked_activity_ids: params.linked_activity_ids,
        }]
      : [];

  if (eventList.length === 0) {
    return {
      success: false,
      message: 'Nenhum evento para criar. Forneça titulo + data ou array de eventos.',
      error: 'NO_EVENTS',
    };
  }

  const payloads = eventList.map(evt => buildEventPayload(evt, professor_id)).filter(Boolean);

  if (payloads.length === 0) {
    return {
      success: false,
      message: 'Todos os eventos têm dados inválidos (titulo, data ou horários incorretos).',
      error: 'ALL_EVENTS_INVALID',
    };
  }

  try {
    if (payloads.length === 1 && !modo_batch) {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloads[0]),
      });

      const result = await response.json();

      if (!result.success) {
        console.error('❌ [Capability] Erro ao criar evento:', result.error);
        return {
          success: false,
          message: `Erro ao criar compromisso: ${result.error}`,
          error: 'API_ERROR',
        };
      }

      console.log('✅ [Capability] Evento criado com sucesso:', result.data);
      emitCalendarRefresh([result.data]);

      return {
        success: true,
        evento: result.data,
        eventos: [result.data],
        message: formatEventConfirmation([result.data]),
        batch_details: { total: 1, successCount: 1, errors: [] },
      };
    }

    console.log(`📅 [Capability] Criando ${payloads.length} eventos via batch API...`);
    const response = await fetch('/api/calendar/events/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: payloads }),
    });

    const result = await response.json();

    if (!result.success) {
      console.error('❌ [Capability] Erro no batch:', result.error);
      return {
        success: false,
        message: `Erro ao criar eventos em lote: ${result.error}`,
        error: 'BATCH_API_ERROR',
      };
    }

    const { created, errors: batchErrors, total, successCount } = result.data;
    console.log(`✅ [Capability] Batch concluído: ${successCount}/${total} eventos criados`);

    if (created.length > 0) {
      emitCalendarRefresh(created);
    }

    return {
      success: successCount > 0,
      eventos: created,
      evento: created[0] || null,
      message: formatEventConfirmation(created),
      batch_details: {
        total,
        successCount,
        errors: batchErrors || [],
      },
    };
  } catch (error) {
    console.error('❌ [Capability] Erro na requisição:', error);
    return {
      success: false,
      message: `Erro ao criar compromisso(s): ${error instanceof Error ? error.message : String(error)}`,
      error: 'NETWORK_ERROR',
    };
  }
}

function emitCalendarRefresh(events: any[]): void {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('calendar-events-updated', {
        detail: { events, source: 'jota_ia', count: events.length }
      }));
      console.log(`📅 [Capability] CustomEvent emitido: ${events.length} eventos`);
    }
  } catch (e) {
    console.warn('⚠️ [Capability] Não foi possível emitir evento de refresh:', e);
  }
}

export default criarCompromissoCalendario;
