import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWeekend,
  getDay,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { 
  getAllEvents, 
  addEvent, 
  updateEvent, 
  deleteEvent,
  CalendarEvent 
} from "@/services/calendarEventService";

export default function CalendarMiniSection() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar eventos do banco de dados ao carregar o componente
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const fetchedEvents = await getAllEvents();
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Erro ao buscar eventos do calendário:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDay = getDay(startOfMonth(currentMonth));

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);

    // Filtrar eventos do dia selecionado
    const eventsOnDay = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, date);
    });

    setSelectedDayEvents(eventsOnDay);
    setShowEventDetails(eventsOnDay.length > 0);
  };

  const navigateToAgenda = () => {
    navigate("/agenda");
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "aula_ao_vivo":
        return "#FF6B00";
      case "tarefa":
        return "#F59E0B";
      case "prova":
        return "#EF4444";
      case "grupo_estudo":
        return "#10B981";
      default:
        return "#6366F1";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Calendário
        </h3>
        <Button size="sm" variant="ghost" onClick={navigateToAgenda}>
          <Plus className="h-4 w-4 mr-1" />
          <span className="text-xs">Ver agenda</span>
        </Button>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h4>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={prevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
            <div
              key={i}
              className="text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-7 rounded-md"></div>
          ))}

          {daysInMonth.map((day) => {
            // Verificar se existem eventos neste dia
            const hasEvents = events.some(event => {
              const eventDate = new Date(event.startDate);
              return isSameDay(eventDate, day);
            });

            return (
              <div
                key={day.toString()}
                className={cn(
                  "h-7 rounded-md flex items-center justify-center text-xs cursor-pointer transition-colors",
                  isSameMonth(day, currentMonth)
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-400 dark:text-gray-600",
                  isWeekend(day) && !isSameDay(day, selectedDate)
                    ? "text-gray-500 dark:text-gray-400"
                    : "",
                  isSameDay(day, selectedDate)
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-medium"
                    : hasEvents
                    ? "hover:bg-gray-100 dark:hover:bg-gray-800"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
                onClick={() => handleDateClick(day)}
              >
                {day.getDate()}
                {hasEvents && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showEventDetails && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
          <h4 className="text-sm font-medium mb-2">
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedDayEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start py-2 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div
                  className="w-2 h-2 rounded-full mt-1.5 mr-2"
                  style={{ backgroundColor: event.color || getEventColor(event.type) }}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {event.startTime || "Todo o dia"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showEventDetails && !isLoading && events.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
          <h4 className="text-sm font-medium mb-2">Próximos eventos</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {events
              .filter(event => {
                const eventDate = new Date(event.startDate);
                return eventDate >= new Date();
              })
              .sort((a, b) => {
                const dateA = new Date(a.startDate);
                const dateB = new Date(b.startDate);
                return dateA.getTime() - dateB.getTime();
              })
              .slice(0, 3)
              .map((event) => (
                <div
                  key={event.id}
                  className="flex items-start py-2 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 mr-2"
                    style={{ backgroundColor: event.color || getEventColor(event.type) }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {format(new Date(event.startDate), "dd/MM")} • {event.startTime || "Todo o dia"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
          <div className="text-center py-3">
            <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4 mx-auto"></div>
            <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2 mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
}