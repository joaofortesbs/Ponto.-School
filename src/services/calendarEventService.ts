
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
  icon?: string;
  labels?: string[];
  labelColors?: { [key: string]: string };
  linkedActivities?: Array<{ id: string; tipo: string; titulo: string; createdAt?: string }>;
  isAllDay?: boolean;
  createdBy?: string;
}

const API_BASE_URL = '/api/calendar/events';

const formatDBToApp = (dbEvent: any): CalendarEvent => {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    startDate: dbEvent.event_date,
    endDate: dbEvent.event_date,
    startTime: dbEvent.start_time || '',
    endTime: dbEvent.end_time || '',
    isAllDay: dbEvent.is_all_day || false,
    repeat: dbEvent.repeat || 'none',
    icon: dbEvent.icon || 'pencil',
    labels: dbEvent.labels || [],
    labelColors: dbEvent.label_colors || {},
    linkedActivities: dbEvent.linked_activities || [],
    userId: dbEvent.user_id,
    createdAt: dbEvent.created_at,
    updatedAt: dbEvent.updated_at,
    createdBy: dbEvent.created_by || 'user',
    type: 'evento',
    visibility: 'private',
  };
};

export const addEvent = async (event: Omit<CalendarEvent, "id" | "createdAt">): Promise<CalendarEvent | null> => {
  try {
    if (!event.userId) {
      console.error("userId é obrigatório para criar evento");
      return saveEventLocally({ ...event, id: uuidv4(), createdAt: new Date().toISOString() });
    }

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: event.userId,
        title: event.title,
        eventDate: event.startDate,
        startTime: event.startTime || null,
        endTime: event.endTime || null,
        isAllDay: event.isAllDay || false,
        repeat: event.repeat || 'none',
        icon: event.icon || 'pencil',
        labels: event.labels || [],
        labelColors: event.labelColors || {},
        linkedActivities: event.linkedActivities || [],
        createdBy: event.createdBy || 'user',
      }),
    });

    const result = await response.json();

    if (!result.success) {
      console.error("Erro ao adicionar evento no Neon:", result.error);
      return saveEventLocally({ ...event, id: uuidv4(), createdAt: new Date().toISOString() });
    }

    const formattedEvent = formatDBToApp(result.data);

    try {
      window.dispatchEvent(new CustomEvent('event-added', { detail: { event: formattedEvent } }));
      window.dispatchEvent(new CustomEvent('agenda-events-updated'));
      window.dispatchEvent(new CustomEvent('calendar-events-updated'));
    } catch (e) {
      console.warn("Não foi possível emitir evento de atualização:", e);
    }

    return formattedEvent;
  } catch (error) {
    console.error("Erro ao adicionar evento:", error);
    return saveEventLocally({ ...event, id: uuidv4(), createdAt: new Date().toISOString() });
  }
};

export const getEventsByUserId = async (userId?: string, month?: number, year?: number): Promise<CalendarEvent[]> => {
  try {
    if (!userId) {
      console.log("userId não fornecido, carregando eventos locais");
      return getLocalEvents('anonymous');
    }

    let url = `${API_BASE_URL}/${userId}`;
    if (month !== undefined && year !== undefined) {
      url += `?month=${month}&year=${year}`;
    }

    const response = await fetch(url);
    const result = await response.json();

    if (!result.success) {
      console.error("Erro ao buscar eventos do Neon:", result.error);
      return getLocalEvents(userId);
    }

    const formattedEvents = (result.data || []).map(formatDBToApp);

    const localEvents = getLocalEvents(userId);
    const localOnlyEvents = localEvents.filter(le =>
      !formattedEvents.some((fe: CalendarEvent) => fe.id === le.id)
    );

    return [...formattedEvents, ...localOnlyEvents];
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    return getLocalEvents(userId || 'anonymous');
  }
};

export const getAllEvents = async (): Promise<CalendarEvent[]> => {
  return getEventsByUserId();
};

export const updateEvent = async (event: CalendarEvent): Promise<CalendarEvent | null> => {
  try {
    if (!event.id) {
      console.error("ID é obrigatório para atualizar um evento");
      return null;
    }

    if (event.id.startsWith('local-')) {
      return updateEventLocally(event);
    }

    const response = await fetch(`${API_BASE_URL}/${event.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: event.title,
        eventDate: event.startDate,
        startTime: event.startTime || null,
        endTime: event.endTime || null,
        isAllDay: event.isAllDay || false,
        repeat: event.repeat || 'none',
        icon: event.icon || 'pencil',
        labels: event.labels || [],
        labelColors: event.labelColors || {},
        linkedActivities: event.linkedActivities || [],
      }),
    });

    const result = await response.json();

    if (!result.success) {
      console.error("Erro ao atualizar evento:", result.error);
      return updateEventLocally(event);
    }

    return formatDBToApp(result.data);
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    return updateEventLocally(event);
  }
};

export const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    if (!eventId) {
      console.error("ID é obrigatório para excluir um evento");
      return false;
    }

    if (eventId.startsWith('local-')) {
      return deleteEventLocally(eventId);
    }

    const response = await fetch(`${API_BASE_URL}/${eventId}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!result.success) {
      console.error("Erro ao remover evento:", result.error);
      return deleteEventLocally(eventId);
    }

    return true;
  } catch (error) {
    console.error("Erro ao remover evento:", error);
    return deleteEventLocally(eventId);
  }
};

const EVENTS_STORAGE_KEY = "calendar_events";

const saveEventsLocally = (events: CalendarEvent[]) => {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    return true;
  } catch (error) {
    console.error("Erro ao salvar eventos localmente:", error);
    return false;
  }
};

export const initLocalStorage = () => {
  if (!localStorage.getItem(EVENTS_STORAGE_KEY)) {
    saveEventsLocally([]);
  }
};

export const getAllLocalEvents = (): CalendarEvent[] => {
  try {
    const eventsJson = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!eventsJson) return [];
    return JSON.parse(eventsJson);
  } catch (error) {
    console.error("Erro ao obter todos os eventos locais:", error);
    return [];
  }
};

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

const saveEventLocally = (event: any) => {
  try {
    const allEvents = getAllLocalEvents();
    const newEvent = {
      ...event,
      id: event.id || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: event.createdAt || new Date().toISOString(),
    };

    const filteredEvents = allEvents.filter(e => e.id !== newEvent.id);
    saveEventsLocally([...filteredEvents, newEvent]);
    return newEvent;
  } catch (error) {
    console.error("Erro ao salvar evento localmente:", error);
    return null;
  }
};

const updateEventLocally = (event: CalendarEvent) => {
  try {
    const allEvents = getAllLocalEvents();
    const updatedEvents = allEvents.map(e =>
      e.id === event.id ? { ...event, updatedAt: new Date().toISOString() } : e
    );
    saveEventsLocally(updatedEvents);
    return event;
  } catch (error) {
    console.error("Erro ao atualizar evento localmente:", error);
    return null;
  }
};

const deleteEventLocally = (eventId: string) => {
  try {
    const allEvents = getAllLocalEvents();
    const updatedEvents = allEvents.filter(e => e.id !== eventId);
    saveEventsLocally(updatedEvents);
    return true;
  } catch (error) {
    console.error("Erro ao remover evento localmente:", error);
    return false;
  }
};

export const syncLocalEvents = async (): Promise<void> => {
  try {
    const localEvents = getAllLocalEvents();
    const localOnlyEvents = localEvents.filter(e => e.id.startsWith('local-'));

    for (const event of localOnlyEvents) {
      const { id, ...eventData } = event;
      const result = await addEvent(eventData);
      if (result) {
        console.log("Evento sincronizado:", id, "->", result.id);
      }
    }

    if (localOnlyEvents.length > 0) {
      const allEvents = getAllLocalEvents();
      const remainingEvents = allEvents.filter(e => !e.id.startsWith('local-'));
      saveEventsLocally(remainingEvents);
    }
  } catch (error) {
    console.error("Erro ao sincronizar eventos locais:", error);
  }
};
