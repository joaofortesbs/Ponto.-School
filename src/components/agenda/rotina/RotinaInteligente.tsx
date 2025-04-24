
import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Settings,
} from "lucide-react";
import DescrevaSuaRotinaModal from "./DescrevaSuaRotinaModal";

// Import the required styles for the calendar
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/rotina-calendar.css";

// Import moment and configure it
import moment from 'moment';
import 'moment/locale/pt-br';

// Configure moment locale
moment.locale('pt-br');

// Create a proper localizer using moment
const localizer = momentLocalizer(moment);

// Custom messages for the calendar
const messages = {
  today: "Hoje",
  next: "Próximo",
  previous: "Anterior",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Hora",
  event: "Evento",
  allDay: "Dia Inteiro",
  noEventsInRange: "Não há eventos neste período",
};

// Define type para eventos do calendário
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  tipo?: string;
  recurringId?: string;
  color?: string;
}

// Função para mapear tipos a cores
const getEventColor = (tipo?: string) => {
  switch (tipo) {
    case "aula":
      return "#2563EB"; // Azul
    case "trabalho":
      return "#FF6B00"; // Laranja
    case "estudo":
      return "#10B981"; // Verde
    case "pessoal":
      return "#8B5CF6"; // Roxo
    default:
      return "#6B7280"; // Cinza
  }
};

// Custom components for the calendar
const EventComponent = ({ event }: { event: CalendarEvent }) => (
  <div 
    className="p-1 rounded text-xs truncate text-white" 
    style={{ backgroundColor: event.color || getEventColor(event.tipo) }}
  >
    {event.title}
  </div>
);

const components = {
  event: EventComponent,
};

const RotinaInteligente: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState(Views.WEEK);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Converter blocos fixos da rotina em eventos do calendário
  useEffect(() => {
    // Carregar dados da rotina do localStorage
    const rotinaString = localStorage.getItem("pontoUserRoutine");
    if (!rotinaString) return;

    try {
      const rotina = JSON.parse(rotinaString);
      const { blocosFixos = [], atividadesRecorrentes = [] } = rotina;
      
      // Lista de dias da semana para criar eventos recorrentes
      const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      
      // Data inicial (começando do domingo da semana atual)
      const dataInicial = startOfWeek(currentDate);
      
      // Array para armazenar os eventos convertidos
      const novosEventos: CalendarEvent[] = [];
      
      // Converter blocos fixos em eventos
      blocosFixos.forEach((bloco: any) => {
        // Para cada dia da semana selecionado no bloco
        bloco.diasSemana.forEach((diaSemana: string) => {
          // Encontrar o índice do dia da semana
          const indexDia = diasSemana.indexOf(diaSemana);
          if (indexDia === -1) return;
          
          // Calcular a data do evento
          const dataEvento = new Date(dataInicial);
          dataEvento.setDate(dataInicial.getDate() + indexDia);
          
          // Definir horário de início
          const [horaInicio, minutoInicio] = bloco.horarioInicio.split(':').map(Number);
          const dataInicio = new Date(dataEvento);
          dataInicio.setHours(horaInicio, minutoInicio, 0);
          
          // Definir horário de fim
          const [horaFim, minutoFim] = bloco.horarioFim.split(':').map(Number);
          const dataFim = new Date(dataEvento);
          dataFim.setHours(horaFim, minutoFim, 0);
          
          // Criar evento
          const evento: CalendarEvent = {
            id: `${bloco.id}-${diaSemana}`,
            title: bloco.nome,
            start: dataInicio,
            end: dataFim,
            tipo: bloco.tipo,
            recurringId: bloco.id,
            color: getEventColor(bloco.tipo),
          };
          
          novosEventos.push(evento);
        });
      });
      
      // Atualizar eventos
      setEvents(novosEventos);
      
    } catch (error) {
      console.error("Erro ao carregar rotina:", error);
    }
  }, [currentDate, showConfigModal]);

  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    if (action === "PREV") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (action === "NEXT") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (action === "TODAY") {
      setCurrentDate(new Date());
    }
  };

  // Format the week range for display
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekRange = `${format(weekStart, "dd 'de' MMMM", { locale: ptBR })} - ${format(
    weekEnd,
    "dd 'de' MMMM, yyyy",
    { locale: ptBR }
  )}`;

  return (
    <div className="container mx-auto p-6 max-w-[1400px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#001427] dark:text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent">
          Minha Rotina Inteligente
        </h2>
        
        <Button
          variant="outline"
          className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors"
          onClick={() => setShowConfigModal(true)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurar Rotina
        </Button>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-lg border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
        {/* Calendar Header */}
        <div className="p-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg shadow-inner">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-base font-bold text-white">{weekRange}</h3>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-white hover:bg-white/20"
              onClick={() => handleNavigate("PREV")}
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Anterior
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-white hover:bg-white/20"
              onClick={() => handleNavigate("TODAY")}
            >
              Hoje
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-white hover:bg-white/20"
              onClick={() => handleNavigate("NEXT")}
            >
              Próximo <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        </div>

        {/* Calendar Container */}
        <div className="p-4" style={{ height: "calc(100vh - 280px)", minHeight: "600px" }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={[Views.WEEK]}
            defaultView={Views.WEEK}
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            messages={messages}
            components={components}
            className="dark:text-white"
          />
        </div>
      </div>

      {/* Modal de Configuração */}
      <DescrevaSuaRotinaModal 
        open={showConfigModal} 
        onOpenChange={setShowConfigModal} 
      />

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-lg hover:shadow-xl transition-all"
          title="Adicionar Bloco"
          onClick={() => setShowConfigModal(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default RotinaInteligente;
