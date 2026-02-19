import type { CapabilityInput, CapabilityOutput, DebugEntry } from '../shared/types';
import { addEventProgrammatic, getEventsByUserIdDirect } from '@/services/calendarEventService';
import { v4 as uuidv4 } from 'uuid';

export interface CompromissoParams {
  titulo: string;
  data: string;
  hora_inicio?: string;
  hora_fim?: string;
  dia_todo?: boolean;
  repeticao?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  icone?: string;
  etiquetas?: string[];
  atividades_vinculadas?: Array<{
    id: string;
    tipo: string;
    titulo: string;
  }>;
  descricao?: string;
}

export interface CompromissoCriadoResult {
  compromissos_criados: Array<{
    id: string;
    titulo: string;
    data: string;
    hora_inicio?: string;
    hora_fim?: string;
    dia_todo: boolean;
    repeticao: string;
    atividades_vinculadas: number;
    sucesso: boolean;
    erro?: string;
  }>;
  total_criados: number;
  total_erros: number;
  resumo: string;
}

export async function criarCompromissoCalendarioV2(input: CapabilityInput): Promise<CapabilityOutput> {
  const startTime = Date.now();
  const debugLog: DebugEntry[] = [];

  const userId = input.context.user_id || input.context.professor_id;
  const compromissos: CompromissoParams[] = input.context.compromissos || [];
  const compromissoUnico = input.context.compromisso;

  if (compromissoUnico && compromissos.length === 0) {
    compromissos.push(compromissoUnico);
  }

  if (!compromissos || compromissos.length === 0) {
    const titulo = input.context.titulo;
    const data = input.context.data;
    if (titulo && data) {
      compromissos.push({
        titulo,
        data,
        hora_inicio: input.context.hora_inicio,
        hora_fim: input.context.hora_fim,
        dia_todo: input.context.dia_todo,
        repeticao: input.context.repeticao || 'none',
        icone: input.context.icone,
        etiquetas: input.context.etiquetas,
        atividades_vinculadas: input.context.atividades_vinculadas,
        descricao: input.context.descricao,
      });
    }
  }

  debugLog.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: `Iniciando criação de ${compromissos.length} compromisso(s) no calendário para userId=${userId}`,
    technical_data: { userId, totalCompromissos: compromissos.length }
  });

  if (!userId) {
    return {
      success: false,
      capability_id: input.capability_id,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: null,
      error: {
        code: 'MISSING_USER_ID',
        message: 'user_id é obrigatório para criar compromissos no calendário',
        severity: 'critical',
        recoverable: false,
        recovery_suggestion: 'Fornecer user_id no contexto da capability'
      },
      debug_log: debugLog,
      metadata: {
        duration_ms: Date.now() - startTime,
        retry_count: 0,
        data_source: 'none'
      }
    };
  }

  if (compromissos.length === 0) {
    return {
      success: false,
      capability_id: input.capability_id,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: null,
      error: {
        code: 'NO_COMPROMISSOS',
        message: 'Nenhum compromisso foi especificado para criação',
        severity: 'medium',
        recoverable: true,
        recovery_suggestion: 'Fornecer ao menos um compromisso com titulo e data'
      },
      debug_log: debugLog,
      metadata: {
        duration_ms: Date.now() - startTime,
        retry_count: 0,
        data_source: 'none'
      }
    };
  }

  let eventosExistentes: any[] = [];
  try {
    eventosExistentes = await getEventsByUserIdDirect(userId);
    debugLog.push({
      timestamp: new Date().toISOString(),
      type: 'info',
      narrative: `Encontrados ${eventosExistentes.length} eventos existentes no calendário do professor`,
      technical_data: { existingCount: eventosExistentes.length }
    });
  } catch (e) {
    debugLog.push({
      timestamp: new Date().toISOString(),
      type: 'warning',
      narrative: 'Não foi possível consultar eventos existentes — prosseguindo sem verificação de conflitos'
    });
  }

  const resultado: CompromissoCriadoResult = {
    compromissos_criados: [],
    total_criados: 0,
    total_erros: 0,
    resumo: ''
  };

  for (const comp of compromissos) {
    try {
      if (!comp.titulo || !comp.data) {
        resultado.compromissos_criados.push({
          id: '',
          titulo: comp.titulo || 'Sem título',
          data: comp.data || 'Sem data',
          dia_todo: comp.dia_todo ?? true,
          repeticao: comp.repeticao || 'none',
          atividades_vinculadas: 0,
          sucesso: false,
          erro: 'Título e data são obrigatórios'
        });
        resultado.total_erros++;
        continue;
      }

      const hasConflict = eventosExistentes.some(ev => {
        if (ev.startDate !== comp.data) return false;
        if (comp.dia_todo || ev.isAllDay) return false;
        if (!comp.hora_inicio || !ev.startTime) return false;
        const compStart = comp.hora_inicio;
        const compEnd = comp.hora_fim || comp.hora_inicio;
        const evStart = ev.startTime;
        const evEnd = ev.endTime || ev.startTime;
        return compStart < evEnd && compEnd > evStart;
      });

      if (hasConflict) {
        debugLog.push({
          timestamp: new Date().toISOString(),
          type: 'warning',
          narrative: `Possível conflito de horário para "${comp.titulo}" em ${comp.data}. Criando mesmo assim.`
        });
      }

      const eventId = uuidv4();
      const eventData = {
        id: eventId,
        title: comp.titulo,
        description: comp.descricao || '',
        startDate: comp.data,
        endDate: comp.data,
        startTime: comp.dia_todo ? '' : (comp.hora_inicio || ''),
        endTime: comp.dia_todo ? '' : (comp.hora_fim || ''),
        isAllDay: comp.dia_todo ?? (!comp.hora_inicio),
        repeat: comp.repeticao || 'none',
        type: 'compromisso',
        icon: comp.icone || '📋',
        labels: comp.etiquetas || [],
        linkedActivities: (comp.atividades_vinculadas || []).map(a => ({
          id: a.id,
          tipo: a.tipo,
          titulo: a.titulo
        })),
        userId: userId,
      };

      const savedEvent = await addEventProgrammatic(eventData);

      if (savedEvent) {
        resultado.compromissos_criados.push({
          id: savedEvent.id || eventId,
          titulo: comp.titulo,
          data: comp.data,
          hora_inicio: comp.hora_inicio,
          hora_fim: comp.hora_fim,
          dia_todo: eventData.isAllDay,
          repeticao: eventData.repeat,
          atividades_vinculadas: (comp.atividades_vinculadas || []).length,
          sucesso: true
        });
        resultado.total_criados++;

        eventosExistentes.push({
          id: savedEvent.id || eventId,
          startDate: comp.data,
          startTime: comp.hora_inicio,
          endTime: comp.hora_fim,
          isAllDay: eventData.isAllDay,
          title: comp.titulo
        });

        debugLog.push({
          timestamp: new Date().toISOString(),
          type: 'action',
          narrative: `✅ Compromisso "${comp.titulo}" criado com sucesso para ${comp.data}`,
          technical_data: { eventId: savedEvent.id || eventId }
        });
      } else {
        resultado.compromissos_criados.push({
          id: '',
          titulo: comp.titulo,
          data: comp.data,
          dia_todo: eventData.isAllDay,
          repeticao: eventData.repeat,
          atividades_vinculadas: 0,
          sucesso: false,
          erro: 'Falha ao salvar evento no banco de dados'
        });
        resultado.total_erros++;

        debugLog.push({
          timestamp: new Date().toISOString(),
          type: 'error',
          narrative: `❌ Falha ao criar compromisso "${comp.titulo}" para ${comp.data}`
        });
      }
    } catch (error) {
      resultado.compromissos_criados.push({
        id: '',
        titulo: comp.titulo || 'Erro',
        data: comp.data || '',
        dia_todo: comp.dia_todo ?? true,
        repeticao: comp.repeticao || 'none',
        atividades_vinculadas: 0,
        sucesso: false,
        erro: error instanceof Error ? error.message : String(error)
      });
      resultado.total_erros++;

      debugLog.push({
        timestamp: new Date().toISOString(),
        type: 'error',
        narrative: `❌ Erro ao processar compromisso "${comp.titulo}": ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }

  resultado.resumo = resultado.total_erros === 0
    ? `✅ ${resultado.total_criados} compromisso(s) criado(s) com sucesso no calendário!`
    : `${resultado.total_criados} compromisso(s) criado(s), ${resultado.total_erros} erro(s).`;

  try {
    window.dispatchEvent(new CustomEvent('calendar-events-batch-added', {
      detail: {
        events: resultado.compromissos_criados.filter(c => c.sucesso),
        source: 'jota_capability'
      }
    }));
    window.dispatchEvent(new CustomEvent('agenda-events-updated'));
  } catch (e) {
    debugLog.push({
      timestamp: new Date().toISOString(),
      type: 'warning',
      narrative: 'Não foi possível emitir eventos de atualização do calendário'
    });
  }

  return {
    success: resultado.total_criados > 0,
    capability_id: input.capability_id,
    execution_id: input.execution_id,
    timestamp: new Date().toISOString(),
    data: resultado,
    error: resultado.total_erros > 0 ? {
      code: 'PARTIAL_FAILURE',
      message: `${resultado.total_erros} compromisso(s) falharam`,
      severity: 'medium',
      recoverable: true,
      recovery_suggestion: 'Verifique os erros individuais e tente novamente'
    } : null,
    debug_log: debugLog,
    metadata: {
      duration_ms: Date.now() - startTime,
      retry_count: 0,
      data_source: 'calendar_event_service'
    }
  };
}
