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
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { getEventsByUserId, CalendarEvent } from "@/services/calendarEventService";

// Sample events data
const events = [
  {
    id: 1,
    title: "Aula de Matemática",
    date: new Date(2024, new Date().getMonth(), new Date().getDate()),
    time: "10:00 - 11:30",
    type: "aula_ao_vivo",
    subject: "Matemática",
    professor: "Prof. Carlos Silva",
    isOnline: true,
    color: "#FF6B00",
  },
  {
    id: 2,
    title: "Entrega de Trabalho",
    date: new Date(2024, new Date().getMonth(), new Date().getDate() + 1),
    time: "23:59",
    type: "tarefa",
    subject: "Química",
    color: "#F59E0B",
  },
  {
    id: 3,
    title: "Prova de Física",
    date: new Date(2024, new Date().getMonth(), new Date().getDate() + 3),
    time: "14:00 - 16:00",
    type: "prova",
    subject: "Física",
    professor: "Profa. Ana Martins",
    isOnline: false,
    location: "Sala 302",
    color: "#EF4444",
  },
  {
    id: 4,
    title: "Grupo de Estudos",
    date: new Date(2024, new Date().getMonth(), new Date().getDate() + 5),
    time: "15:30 - 17:00",
    type: "grupo_estudo",
    subject: "Biologia",
    isOnline: true,
    color: "#10B981",
  },
];

export default function CalendarMiniSection() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Carregar eventos do banco de dados
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const userEvents = await getEventsByUserId();
        setEvents(userEvents.map(event => ({
          ...event,
          date: new Date(event.startDate),
          time: event.startTime || "Sem horário",
          color: getEventTypeColor(event.type || 'evento'),
          subject: event.discipline
        })));
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      }
    };

    loadEvents();

    // Escutar eventos de atualização
    const handleEventUpdate = () => {
      loadEvents();
    };

    window.addEventListener('event-added', handleEventUpdate);
    window.addEventListener('agenda-events-updated', handleEventUpdate);

    return () => {
      window.removeEventListener('event-added', handleEventUpdate);
      window.removeEventListener('agenda-events-updated', handleEventUpdate);
    };
  }, []);

  // Add resize event listener
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
    const todayEvents = getEventsForDay(new Date());
    setSelectedDayEvents(todayEvents);
    setShowEventDetails(todayEvents.length > 0);
  };

  // Get days in current month with padding for first day of month
  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Add padding for the first day of the month
    const firstDayOfMonth = getDay(start); // 0 for Sunday, 1 for Monday, etc.
    const paddingDays = Array(firstDayOfMonth).fill(null);

    return [...paddingDays, ...days];
  };

  // Check if a day has events
  const hasEvents = (day: Date | null) => {
    if (!day) return false;
    return events.some((event) => isSameDay(event.date, day));
  };

  // Get number of events for a day
  const getEventCountForDay = (day: Date | null) => {
    if (!day) return 0;
    return events.filter((event) => isSameDay(event.date, day)).length;
  };

  // Get events for a specific day
  const getEventsForDay = (day: Date | null): CalendarEvent[] => {
    if (!day) return [];
    return events.filter((event) => isSameDay(event.date, day));
  };

  // Handle day click
  const handleDayClick = (day: Date | null) => {
    if (!day) return;
    setSelectedDate(day);
    const dayEvents = getEventsForDay(day);
    setSelectedDayEvents(dayEvents);
    setShowEventDetails(dayEvents.length > 0);
  };

  // Get event type icon color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "aula_ao_vivo":
        return "#4F46E5";
      case "tarefa":
        return "#F59E0B";
      case "prova":
        return "#EF4444";
      case "grupo_estudo":
        return "#10B981";
      default:
        return "#FF6B00";
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-[#FF6B00] font-montserrat">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR }).replace(
            /^\w/,
            (c) => c.toUpperCase(),
          )}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 text-[#FF6B00] hover:bg-[#FF6B00]/10"
            onClick={prevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 py-0 text-xs text-[#FF6B00] hover:bg-[#FF6B00]/10 font-medium"
            onClick={goToToday}
          >
            Hoje
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 text-[#FF6B00] hover:bg-[#FF6B00]/10"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isMobile ? (
        // Mobile List View
        <div className="space-y-2">
          {events
            .filter((event) => isSameMonth(event.date, currentMonth))
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/30 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer"
                onClick={() =>
                  navigate(`/agenda?view=calendario&event=${event.id}`)
                }
              >
                <div
                  className="w-2 h-full rounded-full"
                  style={{ backgroundColor: event.color }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#29335C] dark:text-white truncate">
                      {event.title}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {format(event.date, "dd/MM")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      {event.time}
                    </span>
                    {event.subject && (
                      <Badge
                        variant="outline"
                        className="h-4 px-1 text-[10px] border-gray-300 dark:border-gray-600"
                      >
                        {event.subject}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          {events.filter((event) => isSameMonth(event.date, currentMonth))
            .length === 0 && (
            <div className="text-center py-4 text-xs text-gray-500 dark:text-gray-400">
              Nenhum evento neste mês
            </div>
          )}
        </div>
      ) : (
        // Desktop Calendar View
        <>
          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-1 text-center">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
              <div
                key={index}
                className="text-xs font-semibold text-[#29335C] dark:text-gray-300"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((day, i) => {
              if (!day)
                return <div key={`empty-${i}`} className="h-7 w-7"></div>;

              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const dayHasEvents = hasEvents(day);
              const eventCount = getEventCountForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isWeekendDay = isWeekend(day);

              return (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 w-7 p-0 text-xs font-medium rounded-full relative",
                    !isCurrentMonth ? "opacity-30" : "",
                    isWeekendDay ? "bg-gray-50 dark:bg-gray-800/30" : "",
                    isToday
                      ? "bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90"
                      : "",
                    isSelected && !isToday
                      ? "border border-[#FF6B00] text-[#FF6B00]"
                      : "",
                    !isToday && !isSelected
                      ? "text-[#29335C] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      : "",
                  )}
                  onClick={() => handleDayClick(day)}
                >
                  {format(day, "d")}
                  {dayHasEvents && !isToday && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      {eventCount > 1 ? (
                        <div className="flex gap-0.5">
                          {Array.from({ length: Math.min(eventCount, 3) }).map(
                            (_, idx) => (
                              <div
                                key={idx}
                                className="w-1 h-1 rounded-full bg-[#FF6B00]"
                              ></div>
                            ),
                          )}
                          {eventCount > 3 && (
                            <span className="text-[8px] text-[#FF6B00] ml-0.5">
                              +{eventCount - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-1 h-1 rounded-full bg-[#FF6B00]"></div>
                      )}
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </>
      )}

      {/* Event Details Section */}
      {showEventDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-[#29335C] dark:text-white font-montserrat">
              {format(selectedDate, "EEEE, dd/MM", { locale: ptBR }).replace(
                /^\w/,
                (c) => c.toUpperCase(),
              )}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setShowEventDetails(false)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
            {selectedDayEvents.map((event) => (
              <div
                key={event.id}
                className="p-2 bg-gray-50 dark:bg-gray-800/30 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                onClick={() =>
                  navigate(`/agenda?view=calendario&event=${event.id}`)
                }
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-full rounded-full"
                    style={{ backgroundColor: event.color }}
                  ></div>
                  <span className="text-xs font-medium text-[#29335C] dark:text-white truncate">
                    {event.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 ml-4">
                  <div className="flex items-center text-[10px] text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {event.time}
                  </div>
                  {event.subject && (
                    <Badge
                      variant="outline"
                      className="h-4 px-1 text-[10px] border-gray-300 dark:border-gray-600"
                    >
                      {event.subject}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-[#29335C] dark:text-white mb-2 font-montserrat">
          Próximos Eventos
        </h4>
        <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
          {events
            .filter((event) => event.date >= new Date())
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 3)
            .map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/30 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                onClick={() =>
                  navigate(`/agenda?view=calendario&event=${event.id}`)
                }
              >
                <div
                  className="w-2 h-full rounded-full"
                  style={{ backgroundColor: event.color }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#29335C] dark:text-white truncate">
                      {event.title}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {format(event.date, "dd/MM")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      {event.time}
                    </span>
                    {event.subject && (
                      <Badge
                        variant="outline"
                        className="h-4 px-1 text-[10px] border-gray-300 dark:border-gray-600"
                      >
                        {event.subject}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          {events.filter((event) => event.date >= new Date()).length === 0 && (
            <div className="text-center py-2 text-xs text-gray-500 dark:text-gray-400">
              Nenhum evento próximo
            </div>
          )}
        </div>
      </div>

      {/* Add Event Button */}
      <Button
        className="w-full mt-3 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-xs h-8 font-medium"
        onClick={() => navigate("/agenda?view=adicionar")}
      >
        <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Evento
      </Button>
    </div>
  );
}
