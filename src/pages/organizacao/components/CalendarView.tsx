import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Event, eventTypeColors } from "../types";
import EventTypeIcon from "./EventTypeIcon";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  MapPin,
  Plus,
} from "lucide-react";

interface CalendarViewProps {
  events: Event[];
  setSelectedEvent: (event: Event) => void;
  setShowEventDetails: (show: boolean) => void;
  handleAddEvent: () => void;
}

export default function CalendarView({
  events,
  setSelectedEvent,
  setShowEventDetails,
  handleAddEvent,
}: CalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month");

  // Função para verificar se duas datas são o mesmo dia
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Função para gerar os dias da semana
  const generateWeekDays = (currentDate: Date) => {
    const days: Date[] = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Domingo como início da semana

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const weekDays = date ? generateWeekDays(date) : [];

  return (
    <div className="border border-[#778DA9]/30 dark:border-[#778DA9]/20 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-[#E0E1DD]/30 dark:bg-[#29335C]/30 p-4 border-b border-[#778DA9]/20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold font-montserrat text-[#29335C] dark:text-[#E0E1DD]">
            Calendário
          </h3>
          <Badge
            variant="outline"
            className="ml-2 bg-[#778DA9]/10 text-[#778DA9] border-[#778DA9]/30"
          >
            {date ? format(date, "MMMM yyyy", { locale: ptBR }) : ""}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex border border-[#778DA9]/30 rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 rounded-none ${viewMode === "day" ? "bg-[#778DA9] text-white" : "hover:bg-[#778DA9]/10"}`}
              onClick={() => setViewMode("day")}
            >
              Dia
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 rounded-none ${viewMode === "week" ? "bg-[#778DA9] text-white" : "hover:bg-[#778DA9]/10"}`}
              onClick={() => setViewMode("week")}
            >
              Semana
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 rounded-none ${viewMode === "month" ? "bg-[#778DA9] text-white" : "hover:bg-[#778DA9]/10"}`}
              onClick={() => setViewMode("month")}
            >
              Mês
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-[#778DA9]/30 text-[#778DA9] hover:bg-[#778DA9]/10 hover:text-[#778DA9]"
              onClick={() => {
                const newDate = new Date(date || new Date());
                if (viewMode === "day") {
                  newDate.setDate(newDate.getDate() - 1);
                } else if (viewMode === "week") {
                  newDate.setDate(newDate.getDate() - 7);
                } else {
                  newDate.setMonth(newDate.getMonth() - 1);
                }
                setDate(newDate);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-[#778DA9]/30 text-[#778DA9] hover:bg-[#778DA9]/10 hover:text-[#778DA9]"
              onClick={() => setDate(new Date())}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-[#778DA9]/30 text-[#778DA9] hover:bg-[#778DA9]/10 hover:text-[#778DA9]"
              onClick={() => {
                const newDate = new Date(date || new Date());
                if (viewMode === "day") {
                  newDate.setDate(newDate.getDate() + 1);
                } else if (viewMode === "week") {
                  newDate.setDate(newDate.getDate() + 7);
                } else {
                  newDate.setMonth(newDate.getMonth() + 1);
                }
                setDate(newDate);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-[#29335C]/10">
        {viewMode === "month" && (
          <div className="flex flex-col">
            <div className="flex justify-center mb-6">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border border-[#778DA9]/30"
                locale={ptBR}
                classNames={{
                  day_selected:
                    "bg-[#778DA9] text-white hover:bg-[#778DA9]/90 focus:bg-[#778DA9]/90",
                  day_today: "bg-[#778DA9]/10 text-[#29335C] dark:text-white",
                  day: "hover:bg-[#778DA9]/10",
                }}
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-[#29335C] dark:text-[#E0E1DD] font-montserrat">
                  Eventos do dia
                </h4>
                <Badge className="bg-[#778DA9]/10 text-[#778DA9] border border-[#778DA9]/30">
                  {date ? format(date, "d 'de' MMMM", { locale: ptBR }) : ""}
                </Badge>
              </div>

              {events
                .filter((event) => date && isSameDay(event.start, date))
                .map((event) => (
                  <div
                    key={event.id}
                    className="mb-3 p-3 border border-[#778DA9]/30 rounded-lg hover:bg-[#778DA9]/5 dark:hover:bg-[#29335C]/30 cursor-pointer transition-all duration-200 hover:shadow-sm"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowEventDetails(true);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`${eventTypeColors[event.type].bg} ${eventTypeColors[event.type].text} p-2 rounded-md`}
                      >
                        <EventTypeIcon type={event.type} />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-[#29335C] dark:text-[#E0E1DD] font-montserrat">
                          {event.title}
                        </h5>
                        <div className="flex items-center text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70 mt-1">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {format(event.start, "HH:mm")} -{" "}
                          {format(event.end, "HH:mm")}
                        </div>
                        {event.description && (
                          <p className="text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70 mt-1 line-clamp-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {event.subject && (
                          <Badge
                            variant="outline"
                            className="text-xs border-[#778DA9]/30 text-[#778DA9]"
                          >
                            {event.subject}
                          </Badge>
                        )}
                        {event.isOnline ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">
                            <Video className="h-3 w-3 mr-1" /> Online
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                            <MapPin className="h-3 w-3 mr-1" /> Presencial
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {events.filter((event) => date && isSameDay(event.start, date))
                .length === 0 && (
                <div className="text-center p-8 text-[#29335C]/50 dark:text-[#E0E1DD]/50 bg-white dark:bg-[#29335C]/5 rounded-lg border border-dashed border-[#778DA9]/30">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-[#778DA9]/50" />
                  <h3 className="text-lg font-medium mb-1 font-montserrat">
                    Nenhum evento para este dia
                  </h3>
                  <p className="text-sm mb-4">
                    Adicione um novo evento ou selecione outra data
                  </p>
                  <Button
                    className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white"
                    onClick={handleAddEvent}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Adicionar Evento
                  </Button>
                </div>
              )}

              <div className="mt-6">
                <h4 className="font-medium text-[#29335C] dark:text-[#E0E1DD] font-montserrat mb-3">
                  Próximos Eventos
                </h4>
                <div className="space-y-2">
                  {events
                    .filter(
                      (event) =>
                        date &&
                        event.start > date &&
                        !isSameDay(event.start, date),
                    )
                    .sort((a, b) => a.start.getTime() - b.start.getTime())
                    .slice(0, 3)
                    .map((event) => (
                      <div
                        key={event.id}
                        className="p-2 border border-[#778DA9]/20 rounded-lg hover:bg-[#778DA9]/5 dark:hover:bg-[#29335C]/30 cursor-pointer transition-all duration-200 flex items-center gap-3"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventDetails(true);
                        }}
                      >
                        <div
                          className={`${eventTypeColors[event.type].bg} ${eventTypeColors[event.type].text} p-1.5 rounded-md`}
                        >
                          <EventTypeIcon
                            type={event.type}
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm text-[#29335C] dark:text-[#E0E1DD] font-montserrat">
                            {event.title}
                          </h5>
                          <div className="flex items-center text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(event.start, "d 'de' MMM", {
                              locale: ptBR,
                            })}{" "}
                            • {format(event.start, "HH:mm")}
                          </div>
                        </div>
                      </div>
                    ))}

                  {events.filter(
                    (event) =>
                      date &&
                      event.start > date &&
                      !isSameDay(event.start, date),
                  ).length === 0 && (
                    <div className="text-center p-4 text-[#29335C]/50 dark:text-[#E0E1DD]/50 bg-white dark:bg-[#29335C]/5 rounded-lg border border-dashed border-[#778DA9]/20">
                      <p className="text-sm">
                        Não há eventos futuros agendados
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === "week" && (
          <div className="flex flex-col">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70 mb-1">
                    {format(day, "EEE", { locale: ptBR })}.
                  </div>
                  <Button
                    variant="ghost"
                    className={`w-10 h-10 rounded-full ${isSameDay(day, new Date()) ? "bg-[#778DA9]/20" : ""} ${date && isSameDay(day, date) ? "bg-[#778DA9] text-white" : ""}`}
                    onClick={() => setDate(day)}
                  >
                    {format(day, "d")}
                  </Button>
                </div>
              ))}
            </div>

            <div className="border border-[#778DA9]/20 rounded-lg p-4 bg-white dark:bg-[#29335C]/5">
              <h4 className="font-medium text-[#29335C] dark:text-[#E0E1DD] font-montserrat mb-3">
                Eventos da semana
              </h4>

              {weekDays.map((day, dayIndex) => {
                const dayEvents = events.filter((event) =>
                  isSameDay(event.start, day),
                );

                return dayEvents.length > 0 ? (
                  <div key={dayIndex} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#778DA9]"></div>
                      <h5 className="text-sm font-medium text-[#29335C] dark:text-[#E0E1DD]">
                        {format(day, "EEEE, d 'de' MMMM", { locale: ptBR })}
                      </h5>
                    </div>

                    <div className="ml-4 space-y-2">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-2 border border-[#778DA9]/20 rounded-lg hover:bg-[#778DA9]/5 dark:hover:bg-[#29335C]/30 cursor-pointer transition-all duration-200 flex items-center gap-3"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventDetails(true);
                          }}
                        >
                          <div
                            className={`${eventTypeColors[event.type].bg} ${eventTypeColors[event.type].text} p-1.5 rounded-md`}
                          >
                            <EventTypeIcon
                              type={event.type}
                              className="h-4 w-4"
                            />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-sm text-[#29335C] dark:text-[#E0E1DD] font-montserrat">
                              {event.title}
                            </h5>
                            <div className="flex items-center text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(event.start, "HH:mm")} -{" "}
                              {format(event.end, "HH:mm")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })}

              {weekDays.every(
                (day) =>
                  events.filter((event) => isSameDay(event.start, day))
                    .length === 0,
              ) && (
                <div className="text-center p-8 text-[#29335C]/50 dark:text-[#E0E1DD]/50 bg-white dark:bg-[#29335C]/5 rounded-lg border border-dashed border-[#778DA9]/30">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-[#778DA9]/50" />
                  <h3 className="text-lg font-medium mb-1 font-montserrat">
                    Nenhum evento para esta semana
                  </h3>
                  <p className="text-sm mb-4">
                    Adicione um novo evento ou selecione outra semana
                  </p>
                  <Button
                    className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white"
                    onClick={handleAddEvent}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Adicionar Evento
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === "day" && (
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-[#29335C] dark:text-[#E0E1DD] font-montserrat">
                {date
                  ? format(date, "EEEE, d 'de' MMMM", { locale: ptBR })
                  : ""}
              </h4>
              <Badge className="bg-[#778DA9]/10 text-[#778DA9] border border-[#778DA9]/30">
                {date ? format(date, "yyyy") : ""}
              </Badge>
            </div>

            <div className="border border-[#778DA9]/20 rounded-lg p-4 bg-white dark:bg-[#29335C]/5">
              <div className="space-y-3">
                {Array.from({ length: 24 }).map((_, hour) => {
                  const hourEvents = events.filter((event) => {
                    return (
                      date &&
                      isSameDay(event.start, date) &&
                      event.start.getHours() === hour
                    );
                  });

                  return (
                    <div key={hour} className="flex items-start gap-3">
                      <div className="w-12 text-right text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70 pt-1">
                        {hour.toString().padStart(2, "0")}:00
                      </div>
                      <div className="flex-1 min-h-[40px] border-t border-[#778DA9]/10 pt-1">
                        {hourEvents.map((event) => (
                          <div
                            key={event.id}
                            className="p-2 mb-1 border border-[#778DA9]/20 rounded-lg hover:bg-[#778DA9]/5 dark:hover:bg-[#29335C]/30 cursor-pointer transition-all duration-200 flex items-center gap-3"
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowEventDetails(true);
                            }}
                          >
                            <div
                              className={`${eventTypeColors[event.type].bg} ${eventTypeColors[event.type].text} p-1.5 rounded-md`}
                            >
                              <EventTypeIcon
                                type={event.type}
                                className="h-4 w-4"
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-sm text-[#29335C] dark:text-[#E0E1DD] font-montserrat">
                                {event.title}
                              </h5>
                              <div className="flex items-center text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(event.start, "HH:mm")} -{" "}
                                {format(event.end, "HH:mm")}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {events.filter((event) => date && isSameDay(event.start, date))
                .length === 0 && (
                <div className="text-center p-8 text-[#29335C]/50 dark:text-[#E0E1DD]/50 bg-white dark:bg-[#29335C]/5 rounded-lg border border-dashed border-[#778DA9]/30 mt-4">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-[#778DA9]/50" />
                  <h3 className="text-lg font-medium mb-1 font-montserrat">
                    Nenhum evento para este dia
                  </h3>
                  <p className="text-sm mb-4">
                    Adicione um novo evento ou selecione outra data
                  </p>
                  <Button
                    className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white"
                    onClick={handleAddEvent}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Adicionar Evento
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
