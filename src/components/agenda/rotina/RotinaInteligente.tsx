
import React, { useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
} from "lucide-react";

// Import the required styles for the calendar
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/rotina-calendar.css";

// Create a localizer for the calendar using momentLocalizer
import moment from 'moment';
import 'moment/locale/pt-br';

// Configurar o moment para usar o locale português brasileiro
moment.locale('pt-br');

// Criar um localizer usando momentLocalizer
const localizer = momentLocalizer({
  moment,
  culture: 'pt-br',
  firstDayOfWeek: 0 // Domingo como primeiro dia da semana
});

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

// Custom components for the calendar
const components = {
  event: (props: any) => (
    <div className="p-1 bg-[#FF6B00]/20 rounded text-xs truncate">
      {props.title}
    </div>
  ),
};

const RotinaInteligente: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState(Views.WEEK);

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
      <h2 className="text-2xl font-bold text-[#001427] dark:text-white mb-6 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent">
        Minha Rotina Inteligente
      </h2>

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
            localizer={localizer as any}
            events={[]}
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

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-lg hover:shadow-xl transition-all"
          title="Adicionar Bloco"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default RotinaInteligente;
