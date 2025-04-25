
import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Clock, Target, Plus, Brain } from "lucide-react";
import moment from 'moment';
import 'moment/locale/pt-br';
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/rotina-calendar.css";

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

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  tipo?: string;
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

// Custom EventComponent for the calendar
const EventComponent = ({ event }: { event: CalendarEvent }) => (
  <div 
    className="p-1 rounded text-xs truncate text-white flex items-center" 
    style={{ backgroundColor: event.color || getEventColor(event.tipo) }}
  >
    <span className="truncate">{event.title}</span>
  </div>
);

// Custom Toolbar for the calendar
const CustomToolbar = ({ onNavigate, date }: any) => {
  const goToPrev = () => onNavigate("PREV");
  const goToNext = () => onNavigate("NEXT");
  const goToToday = () => onNavigate("TODAY");

  return (
    <div className="p-2 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold">{format(date, 'MMMM yyyy')}</h3>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
          onClick={goToPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
          onClick={goToToday}
        >
          Hoje
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
          onClick={goToNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Format date helper
const format = (date: Date, formatStr: string) => {
  return moment(date).format(formatStr);
};

const components = {
  event: EventComponent,
  toolbar: CustomToolbar,
};

const RotinaContent: React.FC = () => {
  const [currentDate] = useState<Date>(new Date());
  
  // Mock events for demonstration
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Aula de Matemática',
      start: moment().set({hour: 10, minute: 0}).toDate(),
      end: moment().set({hour: 12, minute: 0}).toDate(),
      tipo: 'aula'
    },
    {
      id: '2',
      title: 'Almoço',
      start: moment().set({hour: 12, minute: 0}).toDate(),
      end: moment().set({hour: 13, minute: 0}).toDate(),
      tipo: 'pessoal'
    },
    {
      id: '3',
      title: 'Estudar Física',
      start: moment().set({hour: 14, minute: 0}).toDate(),
      end: moment().set({hour: 16, minute: 0}).toDate(),
      tipo: 'estudo'
    },
    {
      id: '4',
      title: 'Projeto em Grupo',
      start: moment().add(1, 'days').set({hour: 15, minute: 0}).toDate(),
      end: moment().add(1, 'days').set({hour: 17, minute: 0}).toDate(),
      tipo: 'trabalho'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          views={['week']}
          defaultView="week"
          messages={messages}
          components={components}
          date={currentDate}
          eventPropGetter={(event: any) => ({
            style: {
              backgroundColor: event.color || getEventColor(event.tipo),
            }
          })}
        />
      </div>

      <div className="flex flex-col space-y-4">
        <Card className="p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold flex items-center">
              <Clock className="h-4 w-4 mr-2 text-[#FF6B00]" />
              Blocos Fixos
            </h3>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="h-[200px] pr-3">
            <div className="space-y-3">
              {["Aula de Matemática", "Almoço", "Estudar Física", "Projeto em Grupo"].map((item, index) => (
                <div 
                  key={index}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item}</p>
                      <p className="text-xs text-gray-500">
                        {["Seg, Qua, Sex", "Todos os dias", "Ter, Qui", "Segunda-feira"][index]}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {["10:00-12:00", "12:00-13:00", "14:00-16:00", "15:00-17:00"][index]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold flex items-center">
              <Target className="h-4 w-4 mr-2 text-[#FF6B00]" />
              Sugestões IA
            </h3>
            <Badge variant="secondary" className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/30">
              Novo
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-lg">
              <div className="flex items-start">
                <Brain className="h-5 w-5 text-[#FF6B00] mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Otimize seu horário de estudo</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Suas melhores horas de produtividade parecem ser pela manhã. Considere mover seus blocos de estudo para o período de 8h-11h.
                  </p>
                </div>
              </div>
              <Button variant="link" size="sm" className="text-[#FF6B00] p-0 h-auto mt-2">
                Aplicar sugestão
              </Button>
            </div>
          </div>

          <Button className="w-full mt-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
            <Sparkles className="h-4 w-4 mr-2" />
            Solicitar mais sugestões da IA
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default RotinaContent;
