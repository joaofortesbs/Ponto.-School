/**
 * CAPABILITY: criar_compromisso_calendario
 * 
 * Responsabilidade: Criar compromissos/eventos no calendário do professor
 * diretamente a partir do chat com o Jota, sem necessidade de interação manual.
 * 
 * Input: Parâmetros parseados pelo LLM (título, data, horário, etc.)
 * Output: Evento criado e calendário atualizado automaticamente
 * 
 * ARQUITETURA:
 * 1. Recebe parâmetros do LLM (título, data, hora_inicio, hora_fim, etc.)
 * 2. Valida os campos obrigatórios
 * 3. Chama a API POST /api/calendar/events
 * 4. Emite CustomEvent 'calendar-events-updated' para refresh do calendário
 * 5. Retorna confirmação com dados do evento criado
 */

interface CriarCompromissoParams {
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
  professor_id: string;
}

interface CriarCompromissoResult {
  success: boolean;
  evento?: any;
  message: string;
  error?: string;
}

const ICON_MAP: Record<string, string> = {
  'aula': 'pencil',
  'prova': 'check',
  'reuniao': 'camera',
  'evento': 'star',
  'atividade': 'pencil',
  'default': 'pencil',
};

function inferIcon(titulo: string, tipo?: string): string {
  const tituloLower = titulo.toLowerCase();
  if (tipo && ICON_MAP[tipo]) return ICON_MAP[tipo];
  if (tituloLower.includes('prova') || tituloLower.includes('avaliação') || tituloLower.includes('teste')) return 'check';
  if (tituloLower.includes('reunião') || tituloLower.includes('reuniao') || tituloLower.includes('conselho')) return 'camera';
  if (tituloLower.includes('evento') || tituloLower.includes('festa') || tituloLower.includes('celebração')) return 'star';
  return 'pencil';
}

function normalizeDateFormat(dateStr: string): string {
  const ddmmMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmMatch) {
    return `${ddmmMatch[3]}-${ddmmMatch[2]}-${ddmmMatch[1]}`;
  }
  const ddmmShort = dateStr.match(/^(\d{2})\/(\d{2})$/);
  if (ddmmShort) {
    const year = new Date().getFullYear();
    return `${year}-${ddmmShort[2]}-${ddmmShort[1]}`;
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

export async function criarCompromissoCalendario(params: Record<string, any>): Promise<CriarCompromissoResult> {
  console.log('📅 [Capability] criar_compromisso_calendario - Iniciando...', params);

  const {
    titulo,
    data,
    hora_inicio,
    hora_fim,
    dia_todo,
    repeticao,
    icone,
    labels,
    label_colors,
    linked_activity_ids,
    professor_id,
  } = params as CriarCompromissoParams;

  if (!titulo || !data) {
    return {
      success: false,
      message: 'Título e data são obrigatórios para criar um compromisso.',
      error: 'MISSING_REQUIRED_FIELDS',
    };
  }

  if (!professor_id) {
    return {
      success: false,
      message: 'ID do professor é obrigatório.',
      error: 'MISSING_PROFESSOR_ID',
    };
  }

  const normalizedDate = normalizeDateFormat(data);

  if (!validateDate(normalizedDate)) {
    return {
      success: false,
      message: `Data inválida: "${data}". Use o formato YYYY-MM-DD ou DD/MM/YYYY.`,
      error: 'INVALID_DATE_FORMAT',
    };
  }

  if (hora_inicio && !validateTime(hora_inicio)) {
    return {
      success: false,
      message: `Hora de início inválida: "${hora_inicio}". Use o formato HH:MM.`,
      error: 'INVALID_TIME_FORMAT',
    };
  }

  if (hora_fim && !validateTime(hora_fim)) {
    return {
      success: false,
      message: `Hora de fim inválida: "${hora_fim}". Use o formato HH:MM.`,
      error: 'INVALID_TIME_FORMAT',
    };
  }

  if (hora_inicio && hora_fim && hora_fim <= hora_inicio) {
    return {
      success: false,
      message: `Hora de fim (${hora_fim}) deve ser posterior à hora de início (${hora_inicio}).`,
      error: 'INVALID_TIME_RANGE',
    };
  }

  const resolvedIcon = icone || inferIcon(titulo);
  const isAllDay = dia_todo !== undefined ? dia_todo : (!hora_inicio && !hora_fim);

  const eventPayload = {
    userId: professor_id,
    title: titulo,
    eventDate: normalizedDate,
    startTime: isAllDay ? null : (hora_inicio || null),
    endTime: isAllDay ? null : (hora_fim || null),
    isAllDay,
    repeat: repeticao || 'none',
    icon: resolvedIcon,
    labels: labels || [],
    labelColors: label_colors || {},
    linkedActivities: linked_activity_ids || [],
    createdBy: 'jota_ia',
  };

  try {
    const response = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
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

    try {
      window.dispatchEvent(new CustomEvent('calendar-events-updated', {
        detail: { event: result.data, source: 'jota_ia' }
      }));
    } catch (e) {
      console.warn('⚠️ [Capability] Não foi possível emitir evento de refresh:', e);
    }

    const dayNum = new Date(normalizedDate + 'T00:00:00').getDate();
    const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const eventMonth = monthNames[new Date(normalizedDate + 'T00:00:00').getMonth()];
    const timeStr = isAllDay ? 'dia todo' : `${hora_inicio || ''}${hora_fim ? ' até ' + hora_fim : ''}`;

    return {
      success: true,
      evento: result.data,
      message: `Compromisso "${titulo}" criado com sucesso para o dia ${dayNum} de ${eventMonth} (${timeStr}). O calendário já foi atualizado automaticamente!`,
    };
  } catch (error) {
    console.error('❌ [Capability] Erro na requisição:', error);
    return {
      success: false,
      message: `Erro ao criar compromisso: ${error instanceof Error ? error.message : String(error)}`,
      error: 'NETWORK_ERROR',
    };
  }
}

export default criarCompromissoCalendario;
