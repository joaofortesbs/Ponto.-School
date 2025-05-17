
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Info, Video, FileEdit, AlertCircle, Users, Bell, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getEventsByUserId } from "@/services/calendarEventService";
import { getCurrentUser } from "@/services/databaseService";

interface EventosMiniCardProps {
  onOpenAddEvent?: () => void;
}

export const EventosMiniCard: React.FC<EventosMiniCardProps> = ({ onOpenAddEvent }) => {
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
        if (!user || !user.id) {
          console.warn("Usuário não autenticado");
          setLoading(false);
          return;
        }
        
        // Buscar eventos do usuário
        const events = await getEventsByUserId(user.id);
        
        // Filtrar eventos para hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const eventsToday = events.filter((event: any) => {
          const eventDate = new Date(event.startDate);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() === today.getTime();
        });
        
        // Ordenar por hora (se disponível)
        eventsToday.sort((a: any, b: any) => {
          if (!a.startTime) return 1;
          if (!b.startTime) return -1;
          return a.startTime.localeCompare(b.startTime);
        });
        
        setTodayEvents(eventsToday);
        console.log(`${eventsToday.length} eventos encontrados para hoje`);
      } catch (error) {
        console.error("Erro ao carregar eventos do dia:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
    
    // Recarregar a cada 5 minutos para manter atualizado
    const interval = setInterval(loadEvents, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
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
    <div className="bg-[#001427] rounded-xl overflow-hidden shadow-lg border border-[#29335C]/30 transform hover:translate-y-[-2px] transition-all duration-300 backdrop-blur-sm">
      <div className="p-3 border-b border-[#29335C]/30 bg-gradient-to-r from-[#FF6B00]/90 to-[#FF8C40]/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-inner">
              <CalendarIcon className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">
              Eventos do Dia
            </h3>
          </div>
          <Badge className="bg-white/20 text-white hover:bg-white/30 transition-colors px-2 py-0.5 text-xs">
            {todayEvents.length}
          </Badge>
        </div>
      </div>
      
      {loading ? (
        <div className="p-4 flex justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-t-[#FF6B00] border-r-[#FF6B00] border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      ) : todayEvents.length > 0 ? (
        <div className="max-h-[180px] overflow-y-auto">
          <div className="p-2 space-y-2">
            {todayEvents.map((event, index) => (
              <div
                key={event.id || index}
                className="p-2 bg-[#29335C]/30 rounded-lg hover:bg-[#29335C]/50 cursor-pointer transition-all duration-200"
                onClick={handleNavigateToCalendar}
              >
                <div className="flex items-center gap-2">
                  <div className={`flex-shrink-0 w-6 h-6 ${getEventStatusClass(event)} rounded-full flex items-center justify-center`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-xs truncate">
                      {event.title}
                    </h4>
                    <div className="flex items-center text-xs text-gray-400">
                      {formatEventTime(event)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-2">
            <Button
              className="w-full bg-[#FF6B00] hover:bg-[#E85D04] text-white text-xs py-1 h-8 rounded-lg"
              onClick={handleAddEvent}
            >
              + Adicionar Evento
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#29335C]/30 flex items-center justify-center mb-2">
            <CalendarIcon className="h-5 w-5 text-gray-500" />
          </div>
          <h4 className="text-sm font-medium text-white mb-1">
            Nenhum evento para hoje
          </h4>
          <p className="text-xs text-gray-400 mb-4">
            Adicione seus eventos para organizar sua rotina acadêmica
          </p>
          <Button
            className="bg-[#FF6B00] hover:bg-[#E85D04] text-white text-xs h-8 rounded-lg"
            onClick={handleAddEvent}
          >
            + Adicionar Evento
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventosMiniCard;
