
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { CalendarEvent } from "@/services/calendarEventService";

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const DayView: React.FC<DayViewProps> = ({ 
  currentDate, 
  events = [], 
  onEventClick 
}) => {
  const formatTimeDisplay = (date: Date) => {
    return format(date, "HH:mm");
  };

  // Organiza eventos por hora
  const eventsByHour: Record<number, CalendarEvent[]> = {};
  
  // Inicializa o array para cada hora do dia (0-23)
  for (let hour = 0; hour < 24; hour++) {
    eventsByHour[hour] = [];
  }
  
  // Distribui os eventos pelas respectivas horas
  if (events && Array.isArray(events)) {
    events.forEach(event => {
      if (event && event.start) {
        const hour = new Date(event.start).getHours();
        if (!eventsByHour[hour]) {
          eventsByHour[hour] = [];
        }
        eventsByHour[hour].push(event);
      }
    });
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <h3 className="font-semibold text-lg">
          {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </h3>
      </div>
      
      <div className="p-4 max-h-[calc(100vh-220px)] overflow-y-auto">
        {Object.keys(eventsByHour).map((hour) => {
          const hourNum = parseInt(hour);
          const hourEvents = eventsByHour[hourNum] || [];
          
          return (
            <div key={hour} className="mb-4">
              <div className="flex items-center mb-2">
                <Badge variant="outline" className="mr-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                  {hourNum.toString().padStart(2, '0')}:00
                </Badge>
                <div className="h-px flex-grow bg-gray-200 dark:bg-gray-700"></div>
              </div>
              
              {hourEvents.length > 0 ? (
                <div className="space-y-2">
                  {hourEvents.map((event, index) => (
                    <div 
                      key={index} 
                      className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-colors"
                      onClick={() => onEventClick(event)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300">{event.title}</h4>
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {event.start && formatTimeDisplay(new Date(event.start))}
                          {event.end && ` - ${formatTimeDisplay(new Date(event.end))}`}
                        </span>
                      </div>
                      {event.description && (
                        <p className="mt-1 text-sm text-blue-700 dark:text-blue-200">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 italic px-3 py-2">
                  Sem eventos neste horário
                </div>
              )}
            </div>
          );
        })}
        
        {Object.values(eventsByHour).every(events => events.length === 0) && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Nenhum evento hoje</h4>
            <p className="text-gray-500 dark:text-gray-400">
              Clique no botão "+" para adicionar um novo evento
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;
