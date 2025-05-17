import React, { useEffect, useState } from "react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Video, MapPin } from "lucide-react";
import { CalendarEvent } from "@/services/calendarEventService";

interface DayViewProps {
  selectedDay: Date | null;
  openEventDetails: (event: any) => void;
}

const DayView: React.FC<DayViewProps> = ({ selectedDay, openEventDetails }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedDate = selectedDay || new Date();
  const formattedDate = format(selectedDate, "EEEE, d 'de' MMMM", {
    locale: ptBR,
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        // Importar serviços necessários
        const { getEventsByUserId } = await import('@/services/calendarEventService');
        const { getCurrentUser } = await import('@/services/databaseService');

        // Obter usuário atual
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          console.warn("Usuário não autenticado, carregando eventos do armazenamento local");
          setEvents([]);
          setLoading(false);
          return;
        }

        // Buscar eventos do usuário
        const userEvents = await getEventsByUserId(currentUser.id);
        setEvents(userEvents);
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedDay]); // Recarregar quando o dia selecionado mudar

  // Filtrar eventos para o dia selecionado
  const eventsForSelectedDay = events.filter(event => {
    const eventDate = new Date(event.startDate);
    return isSameDay(eventDate, selectedDate);
  });

  // Agrupar eventos por hora
  const eventsByHour: { [hour: number]: CalendarEvent[] } = {};
  eventsForSelectedDay.forEach(event => {
    const hour = event.startTime 
      ? parseInt(event.startTime.split(':')[0]) 
      : 8; // Default to 8 AM if no start time

    if (!eventsByHour[hour]) {
      eventsByHour[hour] = [];
    }
    eventsByHour[hour].push(event);
  });

  // Renderizar um evento na linha do tempo
  const renderEvent = (event: CalendarEvent) => {
    const backgroundColor = event.type === 'aula' 
      ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700' 
      : event.type === 'prova' 
        ? 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700'
        : 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700';

    return (
      <div 
        key={event.id}
        className={`p-2 my-1 ${backgroundColor} border rounded-md cursor-pointer hover:shadow-md transition-shadow`}
        onClick={() => openEventDetails(event)}
      >
        <div className="font-medium text-sm">{event.title}</div>
        {event.startTime && event.endTime && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {event.startTime} - {event.endTime}
          </div>
        )}
        {event.location && (
          <div className="text-xs flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <MapPin className="h-3 w-3" />
            {event.location}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-md overflow-hidden">
      <div className="p-4 flex items-center justify-center">
        <h3 className="font-bold text-lg capitalize text-gray-800 dark:text-gray-200">{formattedDate}</h3>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 12 }).map((_, hourIndex) => {
              const hour = hourIndex + 8; // Start from 8 AM
              const hourEvents = eventsByHour[hour] || [];

              return (
                <div key={hourIndex} className="flex">
                  <div className="w-20 p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                    {hour}:00
                  </div>
                  <div className="flex-1 p-2 min-h-[80px]">
                    {hourEvents.map(event => renderEvent(event))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;