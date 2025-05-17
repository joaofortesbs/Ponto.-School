
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Info, Video, FileEdit, AlertCircle, Users, Bell, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getEventsByUserId } from "@/services/calendarEventService";
import { getCurrentUser } from "@/services/databaseService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventosDoDiaCardProps {
  onOpenAddEvent?: () => void;
}

export const EventosDoDiaCard: React.FC<EventosDoDiaCardProps> = ({ onOpenAddEvent }) => {
  const navigate = useNavigate();
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para obter o ícone com base no tipo do evento
  const getEventIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "aula":
      case "aula_ao_vivo":
        return <Video className="h-4 w-4" />;
      case "trabalho":
      case "tarefa":
        return <FileEdit className="h-4 w-4" />;
      case "prova":
      case "exame":
        return <AlertCircle className="h-4 w-4" />;
      case "reuniao":
      case "grupo_estudo":
        return <Users className="h-4 w-4" />;
      case "lembrete":
        return <Bell className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  // Obter classe de cor com base no tipo do evento
  const getEventStatusClass = (event: any) => {
    // Verificar se o horário já passou
    const now = new Date();
    const eventTime = event.startTime ? new Date(`${event.startDate}T${event.startTime}`) : null;
    
    if (eventTime) {
      if (eventTime < now) {
        return "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"; // Já passou
      } else if (eventTime.getTime() - now.getTime() < 60 * 60 * 1000) {
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"; // Próxima hora
      }
    }
    
    switch (event.type?.toLowerCase()) {
      case "aula":
      case "aula_ao_vivo":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "trabalho":
      case "tarefa":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300";
      case "prova":
      case "exame":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "reuniao":
      case "grupo_estudo":
        return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300";
      case "lembrete":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300";
      default:
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300";
    }
  };

  // Formatar hora do evento
  const formatEventTime = (event: any) => {
    if (event.startTime && event.endTime) {
      return `${event.startTime} - ${event.endTime}`;
    } else if (event.startTime) {
      return `às ${event.startTime}`;
    } else if (event.allDay) {
      return "Todo o dia";
    } else {
      return "Horário não definido";
    }
  };

  // Carregar eventos do dia
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        
        // Obter usuário atual
        const user = await getCurrentUser();
        let userId = "local";
        
        if (user?.id) {
          userId = user.id;
        } else {
          console.warn("Usuário não autenticado, usando ID local");
        }
        
        // Buscar eventos do usuário (incluindo locais)
        const events = await getEventsByUserId(userId);
        console.log("Todos os eventos carregados:", events.length);
        
        // Obter todos os eventos locais como fallback
        const localEvents = getAllLocalEvents();
        console.log("Eventos locais encontrados:", localEvents.length);
        
        // Combinar eventos (garantindo que não haja duplicatas)
        const allEvents = [...events];
        localEvents.forEach(localEvent => {
          if (!allEvents.some(e => e.id === localEvent.id)) {
            allEvents.push(localEvent);
          }
        });
        
        // Filtrar eventos para hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const eventsToday = allEvents.filter((event: any) => {
          if (!event.startDate) return false;
          
          let eventDate;
          try {
            eventDate = new Date(event.startDate);
            eventDate.setHours(0, 0, 0, 0);
          } catch (err) {
            console.warn("Data inválida para evento:", event.id, event.startDate);
            return false;
          }
          
          // Verificar se a data é hoje
          return eventDate.getTime() === today.getTime();
        });
        
        // Ordenar por hora (se disponível)
        eventsToday.sort((a: any, b: any) => {
          if (!a.startTime) return 1;
          if (!b.startTime) return -1;
          return a.startTime.localeCompare(b.startTime);
        });
        
        console.log(`${eventsToday.length} eventos encontrados para hoje em EventosDoDiaCard`);
        setTodayEvents(eventsToday);
      } catch (error) {
        console.error("Erro ao carregar eventos do dia:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Carregar eventos inicialmente
    loadEvents();
    
    // Escutar por atualizações de eventos do calendário
    const handleEventUpdate = () => {
      console.log("EventosDoDiaCard: Detectada atualização de eventos, recarregando...");
      loadEvents();
    };
    
    // Registrar listeners para eventos de atualização
    window.addEventListener('agenda-events-updated', handleEventUpdate);
    window.addEventListener('event-added', handleEventUpdate);
    window.addEventListener('event-edited', handleEventUpdate);
    window.addEventListener('event-deleted', handleEventUpdate);
    window.addEventListener('dashboard-refresh', handleEventUpdate);
    
    // Recarregar a cada 5 minutos para manter atualizado
    const interval = setInterval(loadEvents, 5 * 60 * 1000);
    
    // Carregar eventos após um curto atraso para garantir que dados de outros componentes estejam prontos
    const initialLoadTimeout = setTimeout(loadEvents, 1000);
    
    return () => {
      // Limpar listeners e intervalos
      window.removeEventListener('agenda-events-updated', handleEventUpdate);
      window.removeEventListener('event-added', handleEventUpdate);
      window.removeEventListener('event-edited', handleEventUpdate);
      window.removeEventListener('event-deleted', handleEventUpdate);
      window.removeEventListener('dashboard-refresh', handleEventUpdate);
      clearInterval(interval);
      clearTimeout(initialLoadTimeout);
    };
  }, []);

  // Navegar para a página de agenda no modo calendário
  const handleNavigateToCalendar = () => {
    navigate("/agenda?view=calendario");
  };

  // Abrir modal para adicionar evento
  const handleAddEvent = () => {
    if (onOpenAddEvent) {
      onOpenAddEvent();
    } else {
      navigate("/agenda?view=calendario&action=add");
    }
  };

  return (
    <div className="bg-[#001427] rounded-xl overflow-hidden shadow-lg mb-8 border border-[#29335C]/30 transform hover:translate-y-[-2px] transition-all duration-300">
      <div className="p-4 border-b border-[#29335C]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-[#FF6B00]" />
            <h3 className="text-base font-bold text-white">
              Eventos do Dia
            </h3>
            {todayEvents.length > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 ml-1 text-xs font-medium rounded-full bg-[#FF6B00]/20 text-[#FF6B00]">
                {todayEvents.length}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#29335C]/50 rounded-full"
            onClick={handleNavigateToCalendar}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="p-6 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-t-[#FF6B00] border-r-[#FF6B00] border-b-transparent border-l-transparent animate-spin"></div>
          <p className="mt-3 text-gray-400 text-sm">Carregando eventos...</p>
        </div>
      ) : todayEvents && todayEvents.length > 0 ? (
        <div className="p-4">
          <div className="space-y-3">
            {todayEvents.map((event, index) => (
              <div
                key={event.id || `today-event-${index}`}
                className="p-3 bg-[#29335C]/30 rounded-lg hover:bg-[#29335C]/50 cursor-pointer transition-all duration-200"
                onClick={handleNavigateToCalendar}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 ${getEventStatusClass(event)} rounded-full flex items-center justify-center`}>
                    {getEventIcon(event.type || 'evento')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-sm mb-1 truncate">
                      {event.title || 'Evento sem título'}
                    </h4>
                    <div className="flex items-center text-xs text-gray-400">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {formatEventTime(event)}
                      {event.location && (
                        <span className="ml-2 truncate">• {event.location}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Button
            className="w-full mt-3 bg-[#FF6B00] hover:bg-[#E85D04] text-white rounded-lg"
            onClick={handleAddEvent}
          >
            + Adicionar Evento
          </Button>
        </div>
      ) : (
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-[#29335C]/30 flex items-center justify-center mb-4">
            <CalendarIcon className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Nenhum evento programado para hoje
          </h3>
          <p className="text-gray-400 text-sm text-center mb-6">
            Adicione seus eventos para organizar sua rotina acadêmica
          </p>
          <Button
            className="bg-[#FF6B00] hover:bg-[#E85D04] text-white rounded-lg"
            onClick={handleAddEvent}
          >
            + Adicionar Evento
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventosDoDiaCard;
