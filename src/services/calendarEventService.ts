import { supabase } from "@/lib/supabase";

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

// Adicionar um novo evento
export const addEvent = async (event: Omit<CalendarEvent, "id" | "createdAt">): Promise<CalendarEvent | null> => {
  try {
    const newEvent = {
      ...event,
      createdAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("calendar_events")
      .insert(newEvent)
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar evento:", error);
      // Fallback para armazenamento local em caso de erro
      saveEventLocally(newEvent);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao adicionar evento:", error);
    // Fallback para armazenamento local em caso de erro
    saveEventLocally(event);
    return null;
  }
};

// Obter todos os eventos de um usuário
export const getEventsByUserId = async (userId: string): Promise<CalendarEvent[]> => {
  try {
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("userId", userId)
      .order("startDate", { ascending: true });

    if (error) {
      console.error("Erro ao buscar eventos:", error);
      // Fallback para armazenamento local em caso de erro
      return getLocalEvents(userId);
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    // Fallback para armazenamento local em caso de erro
    return getLocalEvents(userId);
  }
};

// Atualizar um evento existente
export const updateEvent = async (event: CalendarEvent): Promise<CalendarEvent | null> => {
  try {
    const updatedEvent = {
      ...event,
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("calendar_events")
      .update(updatedEvent)
      .eq("id", event.id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar evento:", error);
      // Fallback para armazenamento local em caso de erro
      updateEventLocally(updatedEvent);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    // Fallback para armazenamento local em caso de erro
    updateEventLocally(event);
    return null;
  }
};

// Remover um evento
export const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error("Erro ao remover evento:", error);
      // Fallback para armazenamento local em caso de erro
      deleteEventLocally(eventId);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao remover evento:", error);
    // Fallback para armazenamento local em caso de erro
    deleteEventLocally(eventId);
    return false;
  }
};

// Funções para armazenamento local como backup
const EVENTS_STORAGE_KEY = "calendar_events";

// Salvar todos os eventos localmente
const saveEventsLocally = (events: CalendarEvent[]) => {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    console.log("Eventos salvos localmente com sucesso", events.length);
  } catch (error) {
    console.error("Erro ao salvar eventos localmente:", error);
  }
};

// Inicializar o armazenamento local se não existir
export const initLocalStorage = () => {
  if (!localStorage.getItem(EVENTS_STORAGE_KEY)) {
    saveEventsLocally([]);
    console.log("Armazenamento local de eventos inicializado");
  }
};

// Obter todos os eventos armazenados localmente
const getLocalEvents = (userId: string): CalendarEvent[] => {
  try {
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
    const events = getLocalEvents(event.userId);
    const newEvent = {
      ...event,
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    saveEventsLocally([...events, newEvent]);
    return newEvent;
  } catch (error) {
    console.error("Erro ao salvar evento localmente:", error);
    return null;
  }
};

// Atualizar um evento localmente
const updateEventLocally = (event: CalendarEvent) => {
  try {
    const events = getLocalEvents(event.userId);
    const updatedEvents = events.map(e => 
      e.id === event.id ? { ...event, updatedAt: new Date().toISOString() } : e
    );

    saveEventsLocally(updatedEvents);
    return event;
  } catch (error) {
    console.error("Erro ao atualizar evento localmente:", error);
    return null;
  }
};

// Remover um evento localmente
const deleteEventLocally = (eventId: string) => {
  try {
    const allEvents = JSON.parse(localStorage.getItem(EVENTS_STORAGE_KEY) || "[]");
    const updatedEvents = allEvents.filter((e: CalendarEvent) => e.id !== eventId);

    saveEventsLocally(updatedEvents);
    return true;
  } catch (error) {
    console.error("Erro ao remover evento localmente:", error);
    return false;
  }
};

// Sincronizar eventos locais com o banco de dados
export const syncLocalEvents = async (userId: string): Promise<void> => {
  try {
    const localEvents = getLocalEvents(userId);
    const localOnlyEvents = localEvents.filter(e => e.id.startsWith('local-'));

    for (const event of localOnlyEvents) {
      const { id, ...eventData } = event;
      await addEvent({ ...eventData, userId });
    }

    // Limpar eventos locais que foram sincronizados
    const remainingEvents = localEvents.filter(e => !e.id.startsWith('local-'));
    saveEventsLocally(remainingEvents);
  } catch (error) {
    console.error("Erro ao sincronizar eventos locais:", error);
  }
};