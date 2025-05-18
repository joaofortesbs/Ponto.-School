
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Plus, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Função para obter cor baseada no tipo de evento
const getEventTypeColor = (type: string): string => {
  switch (type?.toLowerCase()) {
    case "aula":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
    case "trabalho":
    case "tarefa":
      return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
    case "prova":
      return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
    case "reuniao":
      return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
    case "lembrete":
      return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "evento":
      return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

// Função para obter ícone baseado no tipo de evento
const getEventTypeIcon = (type: string) => {
  if (!type) return <Calendar className="h-4 w-4" />;
  
  switch (type.toLowerCase()) {
    case "aula":
      return <Calendar className="h-4 w-4" />;
    case "trabalho":
    case "tarefa":
      return <Tag className="h-4 w-4" />;
    case "prova":
      return <Tag className="h-4 w-4" />;
    case "reuniao":
      return <Calendar className="h-4 w-4" />;
    case "lembrete":
      return <Calendar className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

const EventosDoDiaCard = () => {
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const navigate = useNavigate();
  const today = new Date();

  useEffect(() => {
    // Carregar eventos ao montar o componente
    loadTodayEvents();

    // Adicionar listener para atualizar eventos quando novos forem adicionados
    window.addEventListener('agenda-events-updated', handleAgendaEventsUpdated);
    window.addEventListener('event-added', handleEventAdded);

    return () => {
      // Remover listeners ao desmontar
      window.removeEventListener('agenda-events-updated', handleAgendaEventsUpdated);
      window.removeEventListener('event-added', handleEventAdded);
    };
  }, []);

  // Manipulador para quando eventos são atualizados globalmente
  const handleAgendaEventsUpdated = (event: any) => {
    loadTodayEvents();
  };

  // Manipulador para quando um evento é adicionado
  const handleEventAdded = (event: any) => {
    if (event.detail && event.detail.event) {
      const newEvent = event.detail.event;
      const eventDate = new Date(newEvent.startDate);
      
      // Verificar se o evento é para hoje
      if (isSameDay(eventDate, today)) {
        setTodayEvents(prev => {
          // Evitar duplicatas
          const existingEventIndex = prev.findIndex(e => e.id === newEvent.id);
          if (existingEventIndex >= 0) {
            const updatedEvents = [...prev];
            updatedEvents[existingEventIndex] = newEvent;
            return updatedEvents;
          }
          return [...prev, newEvent];
        });
      }
    }
  };

  // Função para verificar se duas datas são o mesmo dia
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Carregar eventos do dia atual
  const loadTodayEvents = async () => {
    try {
      // Importar serviços necessários
      const { getAllLocalEvents } = await import('@/services/calendarEventService');
      const { getCurrentUser } = await import('@/services/databaseService');
      
      // Verificar se há usuário logado
      let userId = "local";
      try {
        const currentUser = await getCurrentUser();
        if (currentUser?.id) {
          userId = currentUser.id;
        }
      } catch (error) {
        console.warn("Erro ao obter usuário atual:", error);
      }

      // Obter todos os eventos
      const allEvents = await getAllLocalEvents();
      
      // Filtrar eventos para hoje e do usuário correto
      const todayDate = format(today, 'yyyy-MM-dd');
      const filteredEvents = allEvents.filter(event => {
        const eventDate = event.startDate?.substring(0, 10);
        return eventDate === todayDate && (event.userId === userId || !event.userId);
      });

      // Ordenar eventos por hora
      const sortedEvents = filteredEvents.sort((a, b) => {
        const timeA = a.startTime || '23:59';
        const timeB = b.startTime || '23:59';
        return timeA.localeCompare(timeB);
      });

      setTodayEvents(sortedEvents);
    } catch (error) {
      console.error("Erro ao carregar eventos do dia:", error);
      setTodayEvents([]);
    }
  };

  const handleAddEvent = () => {
    // Navegar para a agenda com parâmetro para abrir modal
    navigate("/agenda?action=add-event");
  };

  const handleEventClick = (eventId: string) => {
    // Navegar para a agenda com parâmetro para mostrar detalhes do evento
    navigate(`/agenda?event=${eventId}`);
  };

  return (
    <Card className="h-[100%] bg-white dark:bg-[#001427]/20 border-brand-border dark:border-white/10">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#E0E1DD]/20">
            <Calendar className="h-5 w-5 text-[#29335C] dark:text-[#E0E1DD]" />
          </div>
          <div>
            <CardTitle className="text-base text-[#29335C] dark:text-[#E0E1DD] font-medium">
              Eventos do Dia
            </CardTitle>
            <p className="text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70">
              {format(today, "EEEE, dd 'de' MMMM", { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed border-[#29335C]/30 dark:border-[#E0E1DD]/30 hover:bg-[#29335C]/5 dark:hover:bg-[#E0E1DD]/5"
          onClick={handleAddEvent}
        >
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px] w-full pr-4">
          <div className="space-y-4 p-4">
            {todayEvents.length > 0 ? (
              todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 border border-[#29335C]/10 dark:border-[#E0E1DD]/10 rounded-lg hover:bg-[#29335C]/5 dark:hover:bg-[#E0E1DD]/5 cursor-pointer transition-all duration-200"
                  onClick={() => handleEventClick(event.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getEventTypeColor(event.type)}`}>
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-[#29335C] dark:text-[#E0E1DD] truncate">
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className="text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70 line-clamp-1 mb-1">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center text-xs text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                        {event.startTime && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {event.startTime}
                            {event.endTime && ` - ${event.endTime}`}
                          </div>
                        )}
                        {event.location && (
                          <div className="ml-3 truncate max-w-[120px]">
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-center">
                <Calendar className="h-10 w-10 text-[#29335C]/30 dark:text-[#E0E1DD]/30 mb-2" />
                <p className="text-sm text-[#29335C]/70 dark:text-[#E0E1DD]/70">
                  Nenhum evento para hoje
                </p>
                <p className="text-xs text-[#29335C]/50 dark:text-[#E0E1DD]/50 max-w-[250px] mt-1">
                  Adicione eventos ao seu calendário para organizar seu dia
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EventosDoDiaCard;
