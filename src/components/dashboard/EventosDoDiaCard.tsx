import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Info, 
  Video, 
  FileEdit, 
  AlertCircle, 
  Users, 
  Bell, 
  CheckSquare,
  Clock,
  MapPin,
  Plus
} from "lucide-react";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import AddEventModal from "@/components/agenda/modals/add-event-modal";
import EventDetailsModal from "@/components/agenda/modals/event-details-modal";

// Interface para um evento do calendário
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  type: string;
  location?: string;
  isOnline?: boolean;
  meetingLink?: string;
  discipline?: string;
  professor?: string;
}

const EventosDoDiaCard = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const today = new Date();

  useEffect(() => {
    // Função para carregar eventos do dia atual
    const loadTodayEvents = () => {
      try {
        // Busca eventos do localStorage
        const eventsJson = localStorage.getItem('calendar_events');
        if (!eventsJson) return;

        const allEvents: CalendarEvent[] = JSON.parse(eventsJson);

        // Filtra eventos para mostrar apenas os de hoje
        const todayEvents = allEvents.filter(event => {
          const eventDate = new Date(event.startDate);
          return isToday(eventDate);
        });

        // Ordena eventos por hora
        todayEvents.sort((a, b) => {
          if (!a.startTime) return 1;
          if (!b.startTime) return -1;
          return a.startTime.localeCompare(b.startTime);
        });

        setEvents(todayEvents);
      } catch (error) {
        console.error("Erro ao carregar eventos do dia:", error);
      }
    };

    // Carregar eventos quando o componente montar
    loadTodayEvents();

    // Adicionar listener para atualizar eventos quando novos forem adicionados
    window.addEventListener('agenda-events-updated', loadTodayEvents);

    // Remover listener ao desmontar
    return () => {
      window.removeEventListener('agenda-events-updated', loadTodayEvents);
    };
  }, []);

  // Função para abrir o modal de detalhes do evento
  const openEventDetails = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  // Adicionar um novo evento
  const handleAddEvent = (newEvent: CalendarEvent) => {
    if (isToday(new Date(newEvent.startDate))) {
      setEvents(prevEvents => [...prevEvents, newEvent]);
    }

    // Dispara evento para outros componentes
    window.dispatchEvent(new CustomEvent('agenda-events-updated'));
  };

  // Obter ícone baseado no tipo do evento
  const getEventIcon = (type: string) => {
    switch (type) {
      case "aula":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "trabalho":
        return <FileEdit className="h-4 w-4 text-amber-500" />;
      case "prova":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "reuniao":
        return <Users className="h-4 w-4 text-green-500" />;
      case "lembrete":
        return <Bell className="h-4 w-4 text-yellow-500" />;
      case "tarefa":
        return <CheckSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <CalendarIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <>
      <Card className="bg-[#001427] shadow-lg border-[#29335C]/30">
        <CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-[#FF6B00]/90 to-[#FF8C40]/90 rounded-t-lg border-b border-[#29335C]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-white" />
              <CardTitle className="text-sm font-bold text-white">Eventos do Dia</CardTitle>
            </div>
            <Badge className="bg-white/20 text-white hover:bg-white/30 px-2 py-0.5 text-xs">
              {events.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {events.length > 0 ? (
            <div className="divide-y divide-[#29335C]/20 max-h-[300px] overflow-y-auto">
              {events.map((event) => (
                <div 
                  key={event.id}
                  className="p-3 hover:bg-[#29335C]/10 cursor-pointer transition-colors"
                  onClick={() => openEventDetails(event)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div className="w-8 h-8 rounded-full bg-[#29335C]/20 flex items-center justify-center">
                        {getEventIcon(event.type)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-white text-sm">{event.title}</h4>
                      {event.startTime && (
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <Clock className="h-3 w-3 mr-1 text-[#FF6B00]" />
                          {event.startTime} {event.endTime && `- ${event.endTime}`}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <MapPin className="h-3 w-3 mr-1 text-[#FF6B00]" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#29335C]/40 flex items-center justify-center mb-3">
                <CalendarIcon className="h-7 w-7 text-gray-400" />
              </div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Nenhum evento programado para hoje
              </h4>
              <p className="text-xs text-gray-500 mb-4">
                Adicione seus eventos para organizar sua rotina acadêmica
              </p>
              <Button
                className="w-full bg-[#FF6B00]/90 hover:bg-[#FF8C40] text-white rounded-lg transition-colors text-xs h-8"
                onClick={() => setShowAddEventModal(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Evento
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      {showAddEventModal && (
        <AddEventModal
          open={showAddEventModal}
          onOpenChange={setShowAddEventModal}
          onAddEvent={handleAddEvent}
          selectedDate={today}
        />
      )}

      {showEventDetailsModal && selectedEvent && (
        <EventDetailsModal
          open={showEventDetailsModal}
          onOpenChange={setShowEventDetailsModal}
          event={selectedEvent}
        />
      )}
    </>
  );
};

export default EventosDoDiaCard;