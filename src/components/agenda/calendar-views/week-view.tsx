import React, { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Video, MapPin } from "lucide-react";
import { CalendarEvent } from "@/services/calendarEventService";

interface WeekViewProps {
  openEventDetails: (event: any) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ openEventDetails }) => {
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate end date (6 days from start date)
  const endDate = addDays(startDate, 6);

  // Format date range for display
  const dateRangeText = `${format(startDate, "d")} - ${format(endDate, "d")} de ${format(startDate, "MMMM", { locale: ptBR })}`;

  // Generate days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  // Carregar eventos ao inicializar
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        console.log("Carregando eventos para visualização semanal...");

        // Usar os eventos já carregados na página principal
        try {
          // Primeiro tentar obter eventos da página Agenda (que já carregou os eventos)
          const agendaEventData = window.agendaEventData || {};
          if (Object.keys(agendaEventData).length > 0) {
            // Converter formato de dados (de dias para array de eventos)
            const allEvents: CalendarEvent[] = [];
            
            Object.keys(agendaEventData).forEach(day => {
              const dayEvents = agendaEventData[parseInt(day)] || [];
              dayEvents.forEach(event => {
                // Garantir que todos os eventos tenham os campos necessários
                if (event.startDate) {
                  allEvents.push({
                    id: event.id,
                    title: event.title,
                    description: event.description || "",
                    startDate: event.startDate,
                    endDate: event.endDate || event.startDate,
                    startTime: event.startTime || "00:00",
                    endTime: event.endTime || "23:59",
                    location: event.location || "",
                    isOnline: event.isOnline || false,
                    meetingLink: event.meetingLink || "",
                    type: event.type || "evento",
                    discipline: event.discipline || "Geral",
                    professor: event.professor || "",
                    userId: event.userId || "local",
                    createdAt: event.createdAt || new Date().toISOString()
                  });
                }
              });
            });
            
            if (allEvents.length > 0) {
              console.log(`Carregados ${allEvents.length} eventos da página Agenda`);
              setEvents(allEvents);
              setLoading(false);
              return;
            }
          }
        } catch (windowError) {
          console.warn("Erro ao obter eventos da página Agenda:", windowError);
        }

        // Se não conseguir obter eventos da página Agenda, buscar do armazenamento local
        try {
          const eventsJson = localStorage.getItem("calendar_events");
          if (eventsJson) {
            const localEvents = JSON.parse(eventsJson);
            setEvents(localEvents);
            console.log("Eventos carregados do localStorage como fallback:", localEvents.length);
          } else {
            console.warn("Nenhum evento encontrado no localStorage");
            setEvents([]);
          }
        } catch (e) {
          console.error("Erro ao ler eventos do localStorage:", e);
          setEvents([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Verificar se um evento ocorre em um determinado dia e hora
  const getEventsForDayAndHour = (day: Date, hour: number): CalendarEvent[] => {
    return events.filter(event => {
      // Verificar se o evento ocorre neste dia
      const eventDate = new Date(event.startDate);
      if (!isSameDay(eventDate, day)) return false;
      
      // Verificar se o evento ocorre nesta hora
      const startTimeHour = event.startTime ? parseInt(event.startTime.split(':')[0]) : 0;
      return startTimeHour === hour;
    });
  };

  // Obter cor baseada no tipo de evento
  const getEventColor = (type: string) => {
    switch (type) {
      case "aula":
        return "bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700";
      case "prova":
        return "bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700";
      case "trabalho":
      case "tarefa":
        return "bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700";
      case "reuniao":
        return "bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700";
      case "lembrete":
        return "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700";
      default:
        return "bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700";
    }
  };

  const handlePrevWeek = () => {
    setStartDate(prevDate => addDays(prevDate, -7));
  };

  const handleNextWeek = () => {
    setStartDate(prevDate => addDays(prevDate, 7));
  };

  const handleCurrentWeek = () => {
    setStartDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-md overflow-hidden">
      {/* Week Indicator */}
      <div className="p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevWeek}
          className="h-8 w-8 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-col items-center">
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Semana: {dateRangeText}</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCurrentWeek}
            className="mt-2 h-7 text-xs"
          >
            Semana Atual
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextWeek}
          className="h-8 w-8 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
        </div>
      ) : (
        <div className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
            <div className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
              Hora
            </div>
            {weekDays.map((date, index) => {
              const currentDate = new Date();
              const isToday =
                date.getDate() === currentDate.getDate() &&
                date.getMonth() === currentDate.getMonth() &&
                date.getFullYear() === currentDate.getFullYear();

              return (
                <div
                  key={index}
                  className={`p-2 text-center border-r last:border-r-0 border-gray-200 dark:border-gray-700 ${isToday ? "bg-[#FF6B00]/5" : ""}`}
                >
                  <div
                    className={`font-medium text-sm ${isToday ? "text-[#FF6B00]" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    {
                      ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][
                        date.getDay()
                      ]
                    }
                  </div>
                  <div
                    className={`text-xs ${isToday ? "text-[#FF6B00] font-bold" : "text-gray-500 dark:text-gray-400"}`}
                  >
                    {date.getDate()}/{date.getMonth() + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time slots */}
          {Array.from({ length: 12 }).map((_, hourIndex) => {
            const hour = hourIndex + 8; // Start from 8 AM
            return (
              <div
                key={hourIndex}
                className="grid grid-cols-8 border-b last:border-b-0 border-gray-200 dark:border-gray-700"
              >
                <div className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                  {hour}:00
                </div>
                {weekDays.map((day, dayIndex) => {
                  const eventsForSlot = getEventsForDayAndHour(day, hour);
                  return (
                    <div
                      key={dayIndex}
                      className="p-1 border-r last:border-r-0 border-gray-200 dark:border-gray-700 min-h-[70px] overflow-hidden"
                    >
                      {eventsForSlot.length > 0 ? (
                        <div className="space-y-1">
                          {eventsForSlot.map(event => (
                            <div 
                              key={event.id}
                              className={`${getEventColor(event.type || "evento")} p-1 text-xs rounded border cursor-pointer hover:shadow-md transition-shadow`}
                              onClick={() => openEventDetails(event)}
                            >
                              <div className="font-medium truncate">{event.title}</div>
                              {event.startTime && event.endTime && (
                                <div className="text-[10px] text-gray-600 dark:text-gray-400">
                                  {event.startTime} - {event.endTime}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeekView;