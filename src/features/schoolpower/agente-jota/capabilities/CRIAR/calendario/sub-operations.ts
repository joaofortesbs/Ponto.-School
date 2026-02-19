import type { DebugEntry } from '../../shared/types';

export interface SubOperationResult {
  success: boolean;
  operation: string;
  data: any;
  message: string;
  debug_entries: DebugEntry[];
}

interface CalendarEvent {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  is_all_day: boolean;
  repeat: string;
  icon: string;
  labels: string[];
  label_colors: Record<string, string>;
  linked_activities: any[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

function formatDateForDisplay(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return `${dayNames[d.getDay()]}, ${d.getDate()} de ${monthNames[d.getMonth()]}`;
  } catch {
    return dateStr;
  }
}

function formatEventSummary(evt: CalendarEvent): string {
  const dateDisplay = formatDateForDisplay(evt.event_date?.split('T')[0] || evt.event_date);
  const timeStr = evt.is_all_day ? 'dia todo' : `${evt.start_time || ''}${evt.end_time ? '-' + evt.end_time : ''}`;
  const labelsStr = Array.isArray(evt.labels) && evt.labels.length > 0 ? ` [${evt.labels.join(', ')}]` : '';
  const linkedStr = Array.isArray(evt.linked_activities) && evt.linked_activities.length > 0 ? ` (${evt.linked_activities.length} atividade(s) vinculada(s))` : '';
  return `"${evt.title}" — ${dateDisplay} (${timeStr})${labelsStr}${linkedStr}`;
}

export async function visualizarEventos(params: {
  professor_id: string;
  date_from?: string;
  date_to?: string;
  month?: number;
  year?: number;
  labels?: string[];
}): Promise<SubOperationResult> {
  const debug: DebugEntry[] = [];
  const { professor_id, date_from, date_to, month, year, labels } = params;

  debug.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: `Buscando eventos do calendário para professor ${professor_id.substring(0, 8)}...`,
  });

  try {
    let url: string;
    if (date_from && date_to) {
      url = `/api/calendar/events/${professor_id}/range?dateFrom=${date_from}&dateTo=${date_to}`;
      if (labels && labels.length > 0) {
        url += `&labels=${labels.join(',')}`;
      }
    } else {
      url = `/api/calendar/events/${professor_id}`;
      if (month && year) {
        url += `?month=${month}&year=${year}`;
      }
    }

    const response = await fetch(url);
    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        operation: 'visualizar_eventos',
        data: null,
        message: `Erro ao buscar eventos: ${result.error}`,
        debug_entries: debug,
      };
    }

    const events: CalendarEvent[] = result.data || [];

    const eventsSummary = events.map(formatEventSummary);

    debug.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: `Encontrados ${events.length} evento(s) no calendário`,
    });

    let formattedMessage: string;
    if (events.length === 0) {
      formattedMessage = '## 📅 Calendário\n\nNenhum compromisso encontrado no período selecionado.';
    } else {
      const grouped: Record<string, CalendarEvent[]> = {};
      for (const evt of events) {
        const dateKey = evt.event_date?.split('T')[0] || 'sem-data';
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(evt);
      }

      const sections = Object.entries(grouped).map(([dateKey, evts]) => {
        const dateLabel = formatDateForDisplay(dateKey);
        const items = evts.map(evt => {
          const timeStr = evt.is_all_day ? 'Dia todo' : `${evt.start_time || ''}${evt.end_time ? ' - ' + evt.end_time : ''}`;
          const labelsStr = Array.isArray(evt.labels) && evt.labels.length > 0 ? ` · ${evt.labels.join(', ')}` : '';
          return `- **${evt.title}** — ${timeStr}${labelsStr}`;
        });
        return `### ${dateLabel}\n${items.join('\n')}`;
      });

      formattedMessage = `## 📅 Seus Compromissos\n\n**${events.length}** evento(s) encontrado(s)\n\n${sections.join('\n\n')}`;
    }

    return {
      success: true,
      operation: 'visualizar_eventos',
      data: {
        events,
        total: events.length,
        events_summary: eventsSummary,
        period: date_from && date_to ? { from: date_from, to: date_to } : { month, year },
      },
      message: formattedMessage,
      debug_entries: debug,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    debug.push({ timestamp: new Date().toISOString(), type: 'error', narrative: errMsg });
    return { success: false, operation: 'visualizar_eventos', data: null, message: errMsg, debug_entries: debug };
  }
}

export async function analisarDisponibilidade(params: {
  professor_id: string;
  date_from: string;
  date_to: string;
}): Promise<SubOperationResult> {
  const debug: DebugEntry[] = [];
  const { professor_id, date_from, date_to } = params;

  debug.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: `Analisando disponibilidade de ${date_from} a ${date_to}`,
  });

  try {
    const response = await fetch(
      `/api/calendar/events/${professor_id}/availability?dateFrom=${date_from}&dateTo=${date_to}`
    );
    const result = await response.json();

    if (!result.success) {
      return { success: false, operation: 'analisar_disponibilidade', data: null, message: `Erro: ${result.error}`, debug_entries: debug };
    }

    const { free_days, busy_days, summary } = result.data;

    const freeDaysList = free_days.map((d: any) => formatDateForDisplay(d.date));
    const busyDaysList = busy_days.map((d: any) => {
      const evtNames = d.events.map((e: any) => e.title).join(', ');
      return `${formatDateForDisplay(d.date)} — ${d.event_count} evento(s): ${evtNames}`;
    });

    debug.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: `${summary.total_free_weekdays} dia(s) livre(s), ${summary.total_busy_days} dia(s) ocupado(s), ${summary.total_events} evento(s) total`,
    });

    const fromDisplay = formatDateForDisplay(date_from);
    const toDisplay = formatDateForDisplay(date_to);

    const availabilityMessage = `## 📊 Análise de Disponibilidade\n\n` +
      `**Período:** ${fromDisplay} → ${toDisplay}\n\n` +
      `| | Quantidade |\n|---|---|\n` +
      `| **Dias livres** | ${summary.total_free_weekdays} |\n` +
      `| **Dias ocupados** | ${summary.total_busy_days} |\n` +
      `| **Total de eventos** | ${summary.total_events} |\n\n` +
      (freeDaysList.length > 0 ? `### 🟢 Dias Livres\n${freeDaysList.map((d: string) => `- ${d}`).join('\n')}\n\n` : '') +
      (busyDaysList.length > 0 ? `### 🔴 Dias Ocupados\n${busyDaysList.map((d: string) => `- ${d}`).join('\n')}` : '');

    return {
      success: true,
      operation: 'analisar_disponibilidade',
      data: result.data,
      message: availabilityMessage,
      debug_entries: debug,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    debug.push({ timestamp: new Date().toISOString(), type: 'error', narrative: errMsg });
    return { success: false, operation: 'analisar_disponibilidade', data: null, message: errMsg, debug_entries: debug };
  }
}

export async function editarEvento(params: {
  professor_id: string;
  event_id: string;
  changes: {
    title?: string;
    eventDate?: string;
    startTime?: string;
    endTime?: string;
    isAllDay?: boolean;
    repeat?: string;
    icon?: string;
    labels?: string[];
    labelColors?: Record<string, string>;
    linkedActivities?: any[];
  };
}): Promise<SubOperationResult> {
  const debug: DebugEntry[] = [];
  const { event_id, changes } = params;

  const changeFields = Object.keys(changes).filter(k => changes[k as keyof typeof changes] !== undefined);
  debug.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: `Editando evento ${event_id.substring(0, 8)}... Campos: ${changeFields.join(', ')}`,
  });

  try {
    const response = await fetch(`/api/calendar/events/${event_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
    const result = await response.json();

    if (!result.success) {
      return { success: false, operation: 'editar_evento', data: null, message: `Erro ao editar: ${result.error}`, debug_entries: debug };
    }

    emitCalendarRefresh([result.data]);

    debug.push({
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      narrative: `Evento "${result.data.title}" atualizado com sucesso`,
    });

    const editedEvt = result.data;
    const dateDisplay = editedEvt.event_date ? formatDateForDisplay(editedEvt.event_date.split('T')[0]) : '';
    const timeStr = editedEvt.is_all_day ? 'Dia todo' : `${editedEvt.start_time || ''}${editedEvt.end_time ? ' - ' + editedEvt.end_time : ''}`;

    const editMessage = `## ✏️ Compromisso Atualizado\n\n` +
      `**${editedEvt.title}** foi editado com sucesso!\n\n` +
      `- **Data:** ${dateDisplay}\n` +
      `- **Horário:** ${timeStr}\n` +
      `- **Campos modificados:** ${changeFields.join(', ')}\n\n` +
      `Calendário atualizado!`;

    return {
      success: true,
      operation: 'editar_evento',
      data: result.data,
      message: editMessage,
      debug_entries: debug,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    debug.push({ timestamp: new Date().toISOString(), type: 'error', narrative: errMsg });
    return { success: false, operation: 'editar_evento', data: null, message: errMsg, debug_entries: debug };
  }
}

export async function excluirEvento(params: {
  professor_id: string;
  event_id: string;
}): Promise<SubOperationResult> {
  const debug: DebugEntry[] = [];
  const { event_id } = params;

  debug.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: `Excluindo evento ${event_id.substring(0, 8)}...`,
  });

  try {
    const response = await fetch(`/api/calendar/events/${event_id}`, {
      method: 'DELETE',
    });
    const result = await response.json();

    if (!result.success) {
      return { success: false, operation: 'excluir_evento', data: null, message: `Erro ao excluir: ${result.error}`, debug_entries: debug };
    }

    emitCalendarRefresh([]);

    debug.push({
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      narrative: `Evento excluído com sucesso`,
    });

    const deleteMessage = `## 🗑️ Compromisso Excluído\n\nO compromisso foi **removido** do seu calendário com sucesso.\n\nCalendário atualizado!`;

    return {
      success: true,
      operation: 'excluir_evento',
      data: { deleted_id: event_id },
      message: deleteMessage,
      debug_entries: debug,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    debug.push({ timestamp: new Date().toISOString(), type: 'error', narrative: errMsg });
    return { success: false, operation: 'excluir_evento', data: null, message: errMsg, debug_entries: debug };
  }
}

export async function criarEventos(params: Record<string, any>): Promise<SubOperationResult> {
  const debug: DebugEntry[] = [];

  debug.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: 'Criando evento(s) no calendário',
  });

  try {
    const { criarCompromissoCalendario } = await import('../criar-compromisso-calendario');
    const result = await criarCompromissoCalendario(params);

    debug.push({
      timestamp: new Date().toISOString(),
      type: result.success ? 'confirmation' : 'error',
      narrative: result.message,
    });

    let createMessage: string;
    if (result.success) {
      const eventos = result.eventos || (result.evento ? [result.evento] : []);
      if (eventos.length > 0) {
        const eventItems = eventos.map((evt: any) => {
          const dateDisplay = evt.event_date ? formatDateForDisplay(evt.event_date.split('T')[0]) : '';
          const timeStr = evt.is_all_day ? 'Dia todo' : `${evt.start_time || ''}${evt.end_time ? ' - ' + evt.end_time : ''}`;
          return `- **${evt.title}** — ${dateDisplay} (${timeStr})`;
        });
        createMessage = `## ✅ Compromisso${eventos.length > 1 ? 's' : ''} Criado${eventos.length > 1 ? 's' : ''}\n\n${eventItems.join('\n')}\n\nCalendário atualizado!`;
      } else {
        createMessage = `## ✅ Compromisso Criado\n\n${result.message}\n\nCalendário atualizado!`;
      }
    } else {
      createMessage = result.message;
    }

    return {
      success: result.success,
      operation: 'criar_eventos',
      data: result,
      message: createMessage,
      debug_entries: debug,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    debug.push({ timestamp: new Date().toISOString(), type: 'error', narrative: errMsg });
    return { success: false, operation: 'criar_eventos', data: null, message: errMsg, debug_entries: debug };
  }
}

function emitCalendarRefresh(events: any[]): void {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('calendar-events-updated', {
        detail: { events, source: 'jota_ia_gerenciar', count: events.length }
      }));
    }
  } catch (e) {
    console.warn('⚠️ [SubOps] Não foi possível emitir evento de refresh:', e);
  }
}
