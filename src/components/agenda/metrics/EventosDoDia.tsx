
import React, { useState, useEffect } from "react";
import { CalendarIcon, PlusIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Evento {
  id: string;
  title: string;
  type: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  discipline?: string;
  isOnline?: boolean;
}

interface EventosDoDiaProps {
  onAddEvent?: () => void;
  onViewAllEvents?: () => void;
}

const EventosDoDia: React.FC<EventosDoDiaProps> = ({ 
  onAddEvent, 
  onViewAllEvents 
}) => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buscarEventosDeHoje = () => {
    setIsLoading(true);
    try {
      // Obter todos os eventos
      let todosEventos: Evento[] = [];
      
      // Verificar se existe a variável global de eventos
      if (window.agendaEventData) {
        // Converter os eventos para um formato simples
        Object.values(window.agendaEventData).forEach((diasEventos: any[]) => {
          diasEventos.forEach(evento => {
            todosEventos.push(evento);
          });
        });
      } else {
        // Tentar buscar do localStorage como fallback
        const eventsJson = localStorage.getItem("calendar_events");
        if (eventsJson) {
          const localEvents = JSON.parse(eventsJson);
          todosEventos = localEvents;
        }
      }
      
      // Filtrar apenas eventos de hoje
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);
      
      const eventosDeHoje = todosEventos.filter(evento => {
        if (!evento.startDate) return false;
        
        const dataEvento = new Date(evento.startDate);
        dataEvento.setHours(0, 0, 0, 0);
        
        return dataEvento.getTime() === hoje.getTime();
      });
      
      // Ordenar por horário
      eventosDeHoje.sort((a, b) => {
        const timeA = a.startTime || "00:00";
        const timeB = b.startTime || "00:00";
        return timeA.localeCompare(timeB);
      });
      
      setEventos(eventosDeHoje);
    } catch (error) {
      console.error("Erro ao buscar eventos do dia:", error);
      setEventos([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar eventos ao montar o componente
  useEffect(() => {
    buscarEventosDeHoje();
    
    // Escutar por atualizações de eventos
    const handleEventUpdate = () => {
      console.log("EventosDoDia: Evento de atualização recebido");
      buscarEventosDeHoje();
    };
    
    window.addEventListener('event-added', handleEventUpdate);
    window.addEventListener('agenda-events-updated', handleEventUpdate);
    
    return () => {
      window.removeEventListener('event-added', handleEventUpdate);
      window.removeEventListener('agenda-events-updated', handleEventUpdate);
    };
  }, []);
  
  // Função para renderizar o status do evento
  const renderStatus = (evento: Evento) => {
    const agora = new Date();
    const [horaInicio, minutoInicio] = (evento.startTime || "").split(":").map(Number);
    const [horaFim, minutoFim] = (evento.endTime || "").split(":").map(Number);
    
    if (isNaN(horaInicio) || isNaN(minutoInicio)) return null;
    
    const inicioHoje = new Date();
    inicioHoje.setHours(horaInicio, minutoInicio, 0);
    
    const fimHoje = new Date();
    if (!isNaN(horaFim) && !isNaN(minutoFim)) {
      fimHoje.setHours(horaFim, minutoFim, 0);
    } else {
      // Se não tiver horário de fim, assume 1 hora após o início
      fimHoje.setHours(horaInicio + 1, minutoInicio, 0);
    }
    
    if (agora >= inicioHoje && agora <= fimHoje) {
      return <Badge className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-500 dark:to-green-600 text-white ml-auto font-medium text-[10px] px-2 shadow-sm">Agora</Badge>;
    } else if (agora < inicioHoje) {
      return <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 dark:from-amber-400 dark:to-amber-500 text-white ml-auto font-medium text-[10px] px-2 shadow-sm">Pendente</Badge>;
    } else {
      return <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600 text-white ml-auto font-medium text-[10px] px-2 shadow-sm">Concluído</Badge>;
    }
  };

  // Função para obter ícone do tipo de evento
  const getEventIcon = (type: string) => {
    switch (type) {
      case "aula":
      case "aula_ao_vivo":
      case "aula_gravada":
        return <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/30 p-2 rounded-full shadow-sm">
          <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-300" />
        </div>;
      default:
        return <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/30 p-2 rounded-full shadow-sm">
          <CalendarIcon className="h-4 w-4 text-orange-600 dark:text-orange-300" />
        </div>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gradient-to-b dark:from-[#001427] dark:to-[#001a2f] rounded-xl overflow-hidden relative shadow-md border border-gray-200 dark:border-[#0D2238]/50 metrics-card light-mode-card">
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <div className="bg-white/10 p-1.5 rounded-lg mr-2">
            <CalendarIcon className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-white font-semibold text-sm">Eventos do Dia</h3>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-xs text-white font-semibold shadow-inner">
          {eventos.length}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col p-0">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-[#FF6B00]"></div>
          </div>
        ) : eventos.length > 0 ? (
          <div className="flex-1 flex flex-col relative">
            {/* Scrollable area for events */}
            <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: "130px", height: "130px" }}>
              {eventos.map((evento) => (
                <div key={evento.id} className="p-2.5 hover:bg-gray-50 dark:hover:bg-[#0D2238]/90 transition-all duration-300 border-b border-gray-100 dark:border-[#0D2238]">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getEventIcon(evento.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-gray-800 dark:text-white text-sm font-medium truncate">{evento.title}</h4>
                        {renderStatus(evento)}
                      </div>
                      <div className="text-gray-500 dark:text-[#8393A0] text-xs flex items-center mt-1">
                        <span className="inline-flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {evento.startTime || ""} {evento.endTime ? `- ${evento.endTime}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Fixed button - alinhado com o botão do card de Desempenho Semanal */}
            <div className="mt-4 p-4 border-t border-gray-100 dark:border-[#0D2238]/40 z-10 w-full">
              <Button 
                className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF7B20] hover:to-[#FF9C50] text-white rounded-md shadow-md transition-all duration-300"
                onClick={onViewAllEvents}
              >
                <ExternalLink className="h-4 w-4 mr-2" /> Ver Todos
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-gray-100 dark:bg-gradient-to-br dark:from-[#0D2238] dark:to-[#0D2238]/70 p-4 rounded-full mb-3 shadow-inner">
              <CalendarIcon className="h-8 w-8 text-gray-400 dark:text-[#8393A0]" />
            </div>
            <p className="text-gray-800 dark:text-white text-sm font-medium mb-1">Nenhum evento programado para hoje</p>
            <p className="text-gray-500 dark:text-[#8393A0] text-xs mb-4">
              Adicione seus eventos para organizar sua rotina acadêmica
            </p>
            <Button 
              onClick={onAddEvent}
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF7B20] hover:to-[#FF9C50] text-white rounded-md w-full shadow-md transition-all duration-300"
            >
              <PlusIcon className="h-4 w-4 mr-2" /> Adicionar Evento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventosDoDia;
