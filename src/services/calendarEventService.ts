
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

export interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  discipline?: string;
  description?: string;
  startDate: Date | string;
  endDate?: Date | string;
  startTime?: string;
  allDay?: boolean;
  isOnline?: boolean;
  location?: string;
  color?: string;
  details?: string;
}

// Função para converter dados da API para o formato do frontend
const formatEventFromApi = (event: any): CalendarEvent => {
  return {
    id: event.id,
    title: event.title,
    type: event.type,
    discipline: event.discipline,
    description: event.description,
    startDate: new Date(event.start_date),
    endDate: event.end_date ? new Date(event.end_date) : undefined,
    startTime: event.start_time,
    allDay: event.all_day,
    isOnline: event.is_online,
    location: event.location,
    color: event.color,
    details: event.details
  };
};

// Função para converter dados do frontend para o formato da API
const formatEventForApi = (event: CalendarEvent) => {
  return {
    id: event.id,
    title: event.title,
    type: event.type,
    discipline: event.discipline,
    description: event.description,
    start_date: event.startDate,
    end_date: event.endDate,
    start_time: event.startTime,
    all_day: event.allDay,
    is_online: event.isOnline,
    location: event.location,
    color: event.color,
    details: event.details
  };
};

// Função para buscar todos os eventos do usuário
export const getUserEvents = async (): Promise<CalendarEvent[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: true });
  
  if (error) {
    console.error('Erro ao buscar eventos:', error);
    return [];
  }
  
  return data.map(formatEventFromApi);
};

// Função para adicionar um novo evento
export const addEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Usuário não autenticado');
      return null;
    }
    
    // Garantir que temos um ID único
    const eventId = uuidv4();
    console.log('Criando evento com ID:', eventId);
    
    // Preparar o evento para salvar no banco
    const newEvent = {
      ...formatEventForApi({ ...event, id: eventId }),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Evento formatado para API:', newEvent);
    
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(newEvent)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao adicionar evento:', error);
      console.error('Detalhes do erro:', error.details, error.hint, error.message);
      return null;
    }
    
    console.log('Evento salvo com sucesso:', data);
    return formatEventFromApi(data);
  } catch (error) {
    console.error('Exceção ao adicionar evento:', error);
    return null;
  }
};

// Função para atualizar um evento existente
export const updateEvent = async (event: CalendarEvent): Promise<CalendarEvent | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const updateData = formatEventForApi(event);
  updateData.updated_at = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('calendar_events')
    .update(updateData)
    .eq('id', event.id)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao atualizar evento:', error);
    return null;
  }
  
  return formatEventFromApi(data);
};

// Função para excluir um evento
export const deleteEvent = async (eventId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Erro ao excluir evento:', error);
    return false;
  }
  
  return true;
};
