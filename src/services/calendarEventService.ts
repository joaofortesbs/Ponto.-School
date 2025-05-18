import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  isOnline?: boolean;
  meetingLink?: string;
  type?: string;
  discipline?: string;
  professor?: string;
  reminders?: string[];
  repeat?: string;
  visibility?: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

// Converter objeto para esquema da tabela
const formatEventForDB = (event: any) => {
  return {
    id: event.id || uuidv4(),
    title: event.title,
    description: event.description || '',
    start_date: event.startDate,
    end_date: event.endDate || event.startDate,
    start_time: event.startTime || '',
    end_time: event.endTime || '',
    location: event.location || '',
    is_online: event.isOnline || false,
    meeting_link: event.meetingLink || '',
    type: event.type || 'evento',
    discipline: event.discipline || '',
    professor: event.professor || '',
    reminders: event.reminders || [],
    repeat: event.repeat || 'none',
    visibility: event.visibility || 'private',
    user_id: event.userId,
    created_at: event.createdAt || new Date().toISOString(),
    updated_at: event.updatedAt || new Date().toISOString()
  };
};

// Converter esquema da tabela para objeto da interface
const formatDBEventForApp = (dbEvent: any): CalendarEvent => {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description,
    startDate: dbEvent.start_date,
    endDate: dbEvent.end_date,
    startTime: dbEvent.start_time,
    endTime: dbEvent.end_time,
    location: dbEvent.location,
    isOnline: dbEvent.is_online,
    meetingLink: dbEvent.meeting_link,
    type: dbEvent.type,
    discipline: dbEvent.discipline,
    professor: dbEvent.professor,
    reminders: dbEvent.reminders,
    repeat: dbEvent.repeat,
    visibility: dbEvent.visibility,
    userId: dbEvent.user_id,
    createdAt: dbEvent.created_at,
    updatedAt: dbEvent.updated_at
  };
};

// Adicionar um novo evento
export const addEvent = async (event: Omit<CalendarEvent, "id" | "createdAt">): Promise<CalendarEvent | null> => {
  try {
    // Garantir um userId válido
    if (!event.userId) {
      console.error("userId é obrigatório ao adicionar um evento");
      return null;
    }

    const eventWithMeta = {
      ...event,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    const dbEvent = formatEventForDB(eventWithMeta);
    console.log("Tentando salvar evento no DB:", dbEvent);

    const { data, error } = await supabase
      .from("calendar_events")
      .insert(dbEvent)
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar evento no DB:", error);
      // Fallback para armazenamento local em caso de erro
      const savedLocally = saveEventLocally(eventWithMeta);
      console.log("Evento salvo localmente como fallback:", savedLocally);
      return eventWithMeta;
    }

    const formattedEvent = formatDBEventForApp(data);
    console.log("Evento salvo com sucesso no DB:", formattedEvent);

    // Notificar a interface sobre o novo evento
    try {
      // Disparar evento específico para "Eventos do Dia"
      window.dispatchEvent(new CustomEvent('event-added', { 
        detail: { event: formattedEvent }
      }));

      // Disparar evento geral de atualização da agenda
      window.dispatchEvent(new CustomEvent('agenda-events-updated'));

      console.log("Eventos de atualização disparados com sucesso");
    } catch (e) {
      console.warn("Não foi possível emitir evento de atualização:", e);
    }

    return formattedEvent;
  } catch (error) {
    console.error("Erro ao adicionar evento:", error);
    // Fallback para armazenamento local em caso de erro
    const eventWithMeta = {
      ...event,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    const savedEvent = saveEventLocally(eventWithMeta);

    // Notificar a interface sobre o novo evento
    try {
      // Disparar evento específico para "Eventos do Dia"
      window.dispatchEvent(new CustomEvent('event-added', { 
        detail: { event: formattedEvent }
      }));

      // Disparar evento geral de atualização da agenda
      window.dispatchEvent(new CustomEvent('agenda-events-updated'));

      console.log("Eventos de atualização disparados com sucesso");
    } catch (e) {
      console.warn("Não foi possível emitir evento de atualização:", e);
    }

    return savedEvent || eventWithMeta;
  }
};

// Obter todos os eventos
export const getAllEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("start_date", { ascending: true });

    if (error) {
      console.error("Erro ao buscar todos os eventos:", error);
      return getAllLocalEvents();
    }

    return (data || []).map(formatDBEventForApp);
  } catch (error) {
    console.error("Erro ao buscar todos os eventos:", error);
    return getAllLocalEvents();
  }
};

// Obter todos os eventos de um usuário
export const getEventsByUserId = async (userId: string): Promise<CalendarEvent[]> => {
  if (!userId) {
    console.error("UserId inválido:", userId);
    return [];
  }

  try {
    console.log("Buscando eventos para o usuário:", userId);

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .order("start_date", { ascending: true });

    if (error) {
      console.error("Erro ao buscar eventos do usuário no DB:", error);
      // Fallback para armazenamento local em caso de erro
      const localEvents = getLocalEvents(userId);
      console.log("Eventos obtidos localmente:", localEvents.length);
      return localEvents;
    }

    const formattedEvents = (data || []).map(formatDBEventForApp);
    console.log(`${formattedEvents.length} eventos encontrados para o usuário ${userId}`);

    // Mesclar com eventos locais
    const localEvents = getLocalEvents(userId);
    const localOnlyEvents = localEvents.filter(le => 
      !formattedEvents.some(fe => fe.id === le.id)
    );

    return [...formattedEvents, ...localOnlyEvents];
  } catch (error) {
    console.error("Erro ao buscar eventos do usuário:", error);
    // Fallback para armazenamento local em caso de erro
    return getLocalEvents(userId);
  }
};

// Atualizar um evento existente
export const updateEvent = async (event: CalendarEvent): Promise<CalendarEvent | null> => {
  try {
    if (!event.id) {
      console.error("ID é obrigatório para atualizar um evento");
      return null;
    }

    if (event.id.startsWith('local-')) {
      // Para eventos locais, atualizar apenas no localStorage
      updateEventLocally(event);
      return event;
    }

    const dbEvent = formatEventForDB({
      ...event,
      updatedAt: new Date().toISOString()
    });

    const { data, error } = await supabase
      .from("calendar_events")
      .update(dbEvent)
      .eq("id", event.id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar evento:", error);
      // Fallback para armazenamento local em caso de erro
      updateEventLocally(event);
      return event;
    }

    return formatDBEventForApp(data);
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    // Fallback para armazenamento local em caso de erro
    updateEventLocally(event);
    return event;
  }
};

// Remover um evento
export const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    if (!eventId) {
      console.error("ID é obrigatório para excluir um evento");
      return false;
    }

    if (eventId.startsWith('local-')) {
      // Para eventos locais, excluir apenas no localStorage
      return deleteEventLocally(eventId);
    }

    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error("Erro ao remover evento:", error);
      // Fallback para armazenamento local em caso de erro
      deleteEventLocally(eventId);
      return true; // Retornar sucesso mesmo em caso de erro no DB, já que o evento foi removido localmente
    }

    return true;
  } catch (error) {
    console.error("Erro ao remover evento:", error);
    // Fallback para armazenamento local em caso de erro
    deleteEventLocally(eventId);
    return true; // Consideramos sucesso já que removemos localmente
  }
};

// Funções para armazenamento local como backup
const EVENTS_STORAGE_KEY = "calendar_events";

// Salvar todos os eventos localmente
const saveEventsLocally = (events: CalendarEvent[]) => {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    console.log("Eventos salvos localmente com sucesso", events.length);
    return true;
  } catch (error) {
    console.error("Erro ao salvar eventos localmente:", error);
    return false;
  }
};

// Inicializar o armazenamento local se não existir
export const initLocalStorage = () => {
  if (!localStorage.getItem(EVENTS_STORAGE_KEY)) {
    saveEventsLocally([]);
    console.log("Armazenamento local de eventos inicializado");
  } else {
    console.log("Armazenamento local de eventos já existe");
  }
};

// Obter todos os eventos armazenados localmente
export const getAllLocalEvents = (): CalendarEvent[] => {
  try {
    const eventsJson = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!eventsJson) return [];

    const events: CalendarEvent[] = JSON.parse(eventsJson);
    return events;
  } catch (error) {
    console.error("Erro ao obter todos os eventos locais:", error);
    return [];
  }
};

// Obter todos os eventos armazenados localmente para um usuário específico
const getLocalEvents = (userId: string): CalendarEvent[] => {
  try {
    if (!userId) return [];

    const eventsJson = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!eventsJson) return [];

    const events: CalendarEvent[] = JSON.parse(eventsJson);
    return events.filter(event => event.userId === userId);
  } catch (error) {
    console.error("Erro ao obter eventos locais:", error);
    return [];
  }
};

// Salvar um evento localmente
const saveEventLocally = (event: any) => {
  try {
    const allEvents = getAllLocalEvents();

    const newEvent = {
      ...event,
      id: event.id || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: event.createdAt || new Date().toISOString(),
    };

    // Remover qualquer duplicata
    const filteredEvents = allEvents.filter(e => e.id !== newEvent.id);

    saveEventsLocally([...filteredEvents, newEvent]);

    console.log("Evento salvo localmente com ID:", newEvent.id);
    return newEvent;
  } catch (error) {
    console.error("Erro ao salvar evento localmente:", error);
    return null;
  }
};

// Atualizar um evento localmente
const updateEventLocally = (event: CalendarEvent) => {
  try {
    const allEvents = getAllLocalEvents();
    const updatedEvents = allEvents.map(e => 
      e.id === event.id ? { ...event, updatedAt: new Date().toISOString() } : e
    );

    saveEventsLocally(updatedEvents);
    console.log("Evento atualizado localmente:", event.id);
    return event;
  } catch (error) {
    console.error("Erro ao atualizar evento localmente:", error);
    return null;
  }
};

// Remover um evento localmente
const deleteEventLocally = (eventId: string) => {
  try {
    const allEvents = getAllLocalEvents();
    const updatedEvents = allEvents.filter(e => e.id !== eventId);

    saveEventsLocally(updatedEvents);
    console.log("Evento removido localmente:", eventId);
    return true;
  } catch (error) {
    console.error("Erro ao remover evento localmente:", error);
    return false;
  }
};

// Sincronizar eventos locais com o banco de dados
export const syncLocalEvents = async (userId: string): Promise<void> => {
  try {
    if (!userId) {
      console.error("UserId é necessário para sincronizar eventos");
      return;
    }

    console.log("Iniciando sincronização de eventos locais para o usuário:", userId);
    const localEvents = getLocalEvents(userId);
    const localOnlyEvents = localEvents.filter(e => e.id.startsWith('local-'));

    console.log(`${localOnlyEvents.length} eventos locais encontrados para sincronização`);

    for (const event of localOnlyEvents) {
      const { id, ...eventData } = event;
      const result = await addEvent({ ...eventData, userId });

      if (result) {
        console.log("Evento sincronizado com sucesso:", id, "->", result.id);
      }
    }

    // Limpar eventos locais que foram sincronizados
    if (localOnlyEvents.length > 0) {
      const allEvents = getAllLocalEvents();
      const remainingEvents = allEvents.filter(e => !e.id.startsWith('local-') || e.userId !== userId);
      saveEventsLocally(remainingEvents);
      console.log("Eventos locais sincronizados foram removidos do armazenamento local");
    }
  } catch (error) {
    console.error("Erro ao sincronizar eventos locais:", error);
  }
};