
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  discipline?: string;
  description?: string;
  professor?: string;
  startDate: Date | string;
  endDate?: Date | string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  allDay?: boolean;
  isOnline?: boolean;
  location?: string;
  meetingLink?: string;
  reminders?: string[];
  repeat?: string;
  guests?: string[];
  visibility?: string;
  attachments?: string[];
  color?: string;
  details?: string;
}

// Função para converter o formato do banco de dados para o formato da aplicação
const dbEventToCalendarEvent = (event: any): CalendarEvent => {
  return {
    id: event.id,
    title: event.title,
    type: event.type,
    discipline: event.discipline,
    description: event.description,
    professor: event.professor,
    startDate: new Date(event.start_date),
    endDate: event.end_date ? new Date(event.end_date) : undefined,
    startTime: event.start_time,
    endTime: event.end_time,
    duration: event.duration,
    allDay: event.all_day,
    isOnline: event.is_online,
    location: event.location,
    meetingLink: event.meeting_link,
    reminders: event.reminders || [],
    repeat: event.repeat || 'none',
    guests: event.guests || [],
    visibility: event.visibility || 'private',
    attachments: event.attachments || [],
    color: event.color,
    details: event.details
  };
};

// Função para converter o formato da aplicação para o formato do banco de dados
const calendarEventToDb = (event: CalendarEvent): any => {
  return {
    id: event.id || uuidv4(),
    title: event.title,
    type: event.type,
    discipline: event.discipline,
    description: event.description,
    professor: event.professor,
    start_date: event.startDate,
    end_date: event.endDate,
    start_time: event.startTime,
    end_time: event.endTime,
    duration: event.duration,
    all_day: event.allDay,
    is_online: event.isOnline,
    location: event.location,
    meeting_link: event.meetingLink,
    reminders: event.reminders || [],
    repeat: event.repeat || 'none',
    guests: event.guests || [],
    visibility: event.visibility || 'private',
    attachments: event.attachments || [],
    color: event.color,
    details: event.details
  };
};

// Função para obter todos os eventos do calendário
export const getAllEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar eventos do calendário:', error);
      throw error;
    }

    return data.map(dbEventToCalendarEvent);
  } catch (error) {
    console.error('Erro ao buscar eventos do calendário:', error);
    return [];
  }
};

// Função para obter eventos por período
export const getEventsByDateRange = async (startDate: Date, endDate: Date): Promise<CalendarEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('start_date', startDate.toISOString())
      .lte('start_date', endDate.toISOString())
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar eventos do calendário por período:', error);
      throw error;
    }

    return data.map(dbEventToCalendarEvent);
  } catch (error) {
    console.error('Erro ao buscar eventos do calendário por período:', error);
    return [];
  }
};

// Função para adicionar um novo evento
export const addEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
  try {
    const eventWithId = {
      ...event,
      id: uuidv4()
    };
    
    const dbEvent = calendarEventToDb(eventWithId as CalendarEvent);
    
    const { data, error } = await supabase
      .from('calendar_events')
      .insert([dbEvent])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar evento ao calendário:', error);
      throw error;
    }

    return dbEventToCalendarEvent(data);
  } catch (error) {
    console.error('Erro ao adicionar evento ao calendário:', error);
    throw new Error('Não foi possível adicionar o evento');
  }
};

// Função para atualizar um evento existente
export const updateEvent = async (event: CalendarEvent): Promise<CalendarEvent> => {
  try {
    const dbEvent = calendarEventToDb(event);
    
    const { data, error } = await supabase
      .from('calendar_events')
      .update(dbEvent)
      .eq('id', event.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar evento do calendário:', error);
      throw error;
    }

    return dbEventToCalendarEvent(data);
  } catch (error) {
    console.error('Erro ao atualizar evento do calendário:', error);
    throw new Error('Não foi possível atualizar o evento');
  }
};

// Função para excluir um evento
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Erro ao excluir evento do calendário:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao excluir evento do calendário:', error);
    throw new Error('Não foi possível excluir o evento');
  }
};

// Função para obter um evento específico
export const getEventById = async (eventId: string): Promise<CalendarEvent> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Erro ao buscar evento do calendário:', error);
      throw error;
    }

    return dbEventToCalendarEvent(data);
  } catch (error) {
    console.error('Erro ao buscar evento do calendário:', error);
    throw new Error('Não foi possível encontrar o evento');
  }
};
