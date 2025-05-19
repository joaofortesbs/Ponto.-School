
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
      return <span className="metrics-status-badge status-agora">Agora</span>;
    } else if (agora < inicioHoje) {
      return <span className="metrics-status-badge status-pendente">Pendente</span>;
    } else {
      return <span className="metrics-status-badge status-concluido">Concluído</span>;
    }
  };

  // Função para obter ícone do tipo de evento
  const getEventIcon = (type: string) => {
    const iconClasses = "h-4 w-4";
    
    switch (type) {
      case "aula":
      case "aula_ao_vivo":
      case "aula_gravada":
        return (
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/40 p-2 rounded-full">
            <CalendarIcon className={`${iconClasses} text-blue-500`} />
          </div>
        );
      default:
        return (
          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/40 p-2 rounded-full">
            <CalendarIcon className={`${iconClasses} text-orange-500`} />
          </div>
        );
    }
  };

  return (
    <div className="metrics-card h-full flex flex-col">
      <div className="metrics-card-header flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-white" />
          <h3 className="text-white font-medium text-sm">Eventos do Dia</h3>
        </div>
        <div className="flex items-center justify-center w-6 h-6 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-medium">
          {eventos.length}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#FF6B00] animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-t-2 border-r-2 border-[#FF8C40] animate-spin" style={{animationDuration: '1.2s'}}></div>
            </div>
          </div>
        ) : eventos.length > 0 ? (
          <div className="flex-1 flex flex-col">
            <div className="overflow-y-auto custom-scrollbar flex-1" style={{ maxHeight: "130px", height: "130px" }}>
              {eventos.map((evento) => (
                <div key={evento.id} className="metrics-event-item group">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 group-hover:scale-110 transition-transform">
                      {getEventIcon(evento.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white text-sm font-medium truncate group-hover:text-[#FF8C40] transition-colors">
                          {evento.title}
                        </h4>
                        {renderStatus(evento)}
                      </div>
                      <div className="text-[#8393A0] text-xs flex items-center mt-1">
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
            
            <div className="p-4 mt-auto">
              <Button 
                className="metrics-card-button w-full text-white rounded-md font-medium"
                onClick={onViewAllEvents}
              >
                <ExternalLink className="h-4 w-4 mr-2" /> Ver Todos
              </Button>
            </div>
          </div>
        ) : (
          <div className="metrics-empty-state flex-1">
            <div className="metrics-empty-icon">
              <CalendarIcon className="h-8 w-8 text-[#8393A0]" />
            </div>
            <p className="text-white text-sm font-medium mb-1">Nenhum evento programado para hoje</p>
            <p className="text-[#8393A0] text-xs mb-4">
              Adicione seus eventos para organizar sua rotina acadêmica
            </p>
            <Button 
              onClick={onAddEvent}
              className="metrics-card-button w-full text-white rounded-md"
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
