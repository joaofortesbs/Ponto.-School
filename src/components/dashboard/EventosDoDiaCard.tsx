
import React, { useState, useEffect } from "react";
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
import { CalendarEvent } from "@/services/calendarEventService";

interface EventosDoDiaCardProps {
  className?: string;
}

const EventosDoDiaCard: React.FC<EventosDoDiaCardProps> = ({ className }) => {
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Get event icon based on type
  const getEventIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "aula":
        return <Video className="h-4 w-4" />;
      case "trabalho":
      case "tarefa":
        return <FileEdit className="h-4 w-4" />;
      case "prova":
        return <AlertCircle className="h-4 w-4" />;
      case "reuniao":
        return <Users className="h-4 w-4" />;
      case "lembrete":
        return <Bell className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  // Get event status
  const getEventStatus = (event: CalendarEvent) => {
    if (!event.startTime) return "todo";
    
    const now = new Date();
    const [hours, minutes] = event.startTime.split(':').map(Number);
    const eventTime = new Date();
    eventTime.setHours(hours, minutes, 0, 0);
    
    const timeDiff = eventTime.getTime() - now.getTime();
    
    // Se o evento começou há menos de 1h30m, está acontecendo agora
    if (timeDiff > -5400000 && timeDiff < 0) return "agora";
    // Se o evento já passou há mais de 1h30m
    if (timeDiff < -5400000) return "concluido";
    // Se o evento acontecerá em menos de 1h
    if (timeDiff > 0 && timeDiff < 3600000) return "em_breve";
    // Se o evento acontecerá hoje, mas não tão em breve
    return "pendente";
  };

  // Carregar eventos do dia
  const loadTodayEvents = async () => {
    try {
      setLoading(true);
      
      // Importar serviços necessários
      const { getAllEvents, getEventsByUserId } = await import('@/services/calendarEventService');
      const { getCurrentUser } = await import('@/services/databaseService');
      
      // Tentar obter o usuário atual
      let userId = null;
      try {
        const currentUser = await getCurrentUser();
        if (currentUser && currentUser.id) {
          userId = currentUser.id;
        }
      } catch (error) {
        console.warn("Erro ao obter usuário atual:", error);
      }
      
      // Obter eventos com base no usuário
      let events: CalendarEvent[] = [];
      if (userId) {
        events = await getEventsByUserId(userId);
      } else {
        events = await getAllEvents();
      }
      
      // Filtrar eventos de hoje
      const today = new Date();
      const eventsForToday = events.filter(event => {
        const eventDate = new Date(event.startDate);
        return isToday(eventDate);
      });
      
      // Ordenar por hora de início
      eventsForToday.sort((a, b) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      });
      
      setTodayEvents(eventsForToday);
    } catch (error) {
      console.error("Erro ao carregar eventos do dia:", error);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar eventos na montagem do componente
  useEffect(() => {
    loadTodayEvents();
    
    // Adicionar listener para atualização de eventos
    const handleEventsUpdated = () => {
      loadTodayEvents();
    };
    
    window.addEventListener('agenda-events-updated', handleEventsUpdated);
    return () => {
      window.removeEventListener('agenda-events-updated', handleEventsUpdated);
    };
  }, []);

  const handleAddEvent = (newEvent: CalendarEvent) => {
    if (isToday(new Date(newEvent.startDate))) {
      setTodayEvents(prev => [...prev, newEvent].sort((a, b) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      }));
    }
  };

  const handleViewEventDetails = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  return (
    <Card className={`bg-[#001427] rounded-xl overflow-hidden shadow-lg border border-[#29335C]/30 transform hover:translate-y-[-2px] transition-all duration-300 ${className}`}>
      <CardHeader className="p-4 border-b border-[#29335C]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-[#FF6B00]" />
            <CardTitle className="text-base font-bold text-white">
              Eventos do Dia
            </CardTitle>
          </div>
          <Badge variant="outline" className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/30">
            {todayEvents.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#FF6B00] border-t-transparent animate-spin mb-2"></div>
            <p className="text-gray-400 text-sm">Carregando eventos...</p>
          </div>
        ) : todayEvents.length > 0 ? (
          <div className="divide-y divide-[#29335C]/30">
            {todayEvents.map((event) => (
              <div 
                key={event.id} 
                className="p-3 hover:bg-[#29335C]/20 cursor-pointer transition-colors"
                onClick={() => handleViewEventDetails(event)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${
                    event.type === 'aula' ? 'bg-blue-500/20 text-blue-400' :
                    event.type === 'prova' ? 'bg-red-500/20 text-red-400' :
                    event.type === 'trabalho' || event.type === 'tarefa' ? 'bg-amber-500/20 text-amber-400' :
                    event.type === 'reuniao' ? 'bg-green-500/20 text-green-400' :
                    event.type === 'lembrete' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {getEventIcon(event.type || 'evento')}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm">{event.title}</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(event.startTime || event.endTime) && (
                        <div className="flex items-center text-gray-400 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.startTime && event.endTime 
                            ? `${event.startTime} - ${event.endTime}`
                            : event.startTime || event.endTime
                          }
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="flex items-center text-gray-400 text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </div>
                      )}
                      
                      {event.discipline && (
                        <Badge variant="outline" className="text-xs font-normal bg-[#29335C]/30 text-gray-300 border-[#29335C]/50">
                          {event.discipline}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Badge 
                    className={`px-2 py-0.5 text-[10px] ${
                      getEventStatus(event) === 'agora' ? 'bg-green-500/80 text-white' :
                      getEventStatus(event) === 'em_breve' ? 'bg-yellow-500/80 text-white' :
                      getEventStatus(event) === 'pendente' ? 'bg-blue-500/30 text-blue-300' :
                      getEventStatus(event) === 'concluido' ? 'bg-gray-500/30 text-gray-300' :
                      'bg-gray-500/30 text-gray-300'
                    }`}
                  >
                    {getEventStatus(event) === 'agora' ? 'AGORA' :
                     getEventStatus(event) === 'em_breve' ? 'EM BREVE' :
                     getEventStatus(event) === 'pendente' ? 'PENDENTE' :
                     getEventStatus(event) === 'concluido' ? 'CONCLUÍDO' :
                     'HOJE'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#29335C]/40 flex items-center justify-center mb-3">
              <CalendarIcon className="h-7 w-7 text-gray-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Nenhum evento programado para hoje
            </h4>
            <p className="text-xs text-gray-500 mb-3 text-center">
              Adicione seus eventos para organizar sua rotina acadêmica
            </p>
            <Button
              className="w-full mt-1 bg-[#FF6B00]/90 hover:bg-[#FF8C40] text-white rounded-lg transition-colors text-xs h-8"
              onClick={() => setShowAddEventModal(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Adicionar Evento
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Modal de Adicionar Evento */}
      <AddEventModal
        open={showAddEventModal}
        onOpenChange={setShowAddEventModal}
        onAddEvent={handleAddEvent}
        selectedDate={new Date()}
      />
      
      {/* Modal de Detalhes do Evento */}
      {selectedEvent && (
        <EventDetailsModal
          open={showEventDetails}
          onOpenChange={setShowEventDetails}
          event={selectedEvent}
          onEventUpdated={loadTodayEvents}
          onEventDeleted={loadTodayEvents}
        />
      )}
    </Card>
  );
};

export default EventosDoDiaCard;
