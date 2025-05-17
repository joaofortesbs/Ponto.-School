import React, { useState } from "react";
import { ChevronDown, ChevronUp, CalendarDays, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Event {
  id: string;
  type: string;
  title: string;
  day: string;
  discipline: string;
  location?: string;
  isOnline: boolean;
}

interface UpcomingEventsProps {
  events?: Event[];
  onViewEvent?: (eventId: string) => void;
  isNewUser?: boolean;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events = [], onViewEvent, isNewUser = true }) => {
  const [expanded, setExpanded] = useState<boolean>(true);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Get event type icon based on type
  const getEventIcon = (type: string) => {
    switch (type) {
      case "aula":
        return <span className="text-blue-500">📹</span>;
      case "trabalho":
        return <span className="text-amber-500">📝</span>;
      case "prova":
        return <span className="text-red-500">📊</span>;
      case "reuniao":
        return <span className="text-green-500">👥</span>;
      default:
        return <span className="text-purple-500">📅</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-[#001427] rounded-xl border border-[#29335C]/10 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center text-[#001427] dark:text-white">
          <CalendarDays className="w-5 h-5 mr-2 text-[#FF6B00]" />
          Próximos Eventos
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleExpand}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 flex-grow overflow-hidden">
          {events.length === 0 || isNewUser ? (
            <div className="text-center py-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-3">
                <CalendarDays className="w-6 h-6 text-[#FF6B00]" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">Nenhum evento próximo</p>
              <p className="text-sm mt-1 text-gray-500 dark:text-gray-400 max-w-xs">
                Adicione eventos ao seu calendário para visualizá-los aqui
              </p>
              <Button 
                className="mt-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar Evento
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100%-2rem)] overflow-y-auto pr-1">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-[#29335C]/10 rounded-lg p-3 bg-white dark:bg-[#001427]/60 hover:bg-gray-50 dark:hover:bg-[#001427]/80 transition-all cursor-pointer"
                  onClick={() => onViewEvent && onViewEvent(event.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-xl">{getEventIcon(event.type)}</div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-[#001427] dark:text-white">
                        {event.title}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <div className="flex items-center mb-1 sm:mb-0">
                          <span className="inline-flex items-center mr-3">
                            <span className="inline-block w-2 h-2 rounded-full bg-[#FF6B00] mr-1"></span>
                            {event.discipline}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs font-medium">
                            {event.day}
                          </span>
                          {event.isOnline && (
                            <Badge className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              Online
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-[#29335C]/10">
        <Button
          variant="ghost"
          className="w-full justify-center text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
          onClick={() => {
            // Handle view all
          }}
        >
          Ver Calendário <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default UpcomingEvents;