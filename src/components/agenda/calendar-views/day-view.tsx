import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight, Video } from "lucide-react";

interface DayViewProps {
  selectedDay: Date | null;
  openEventDetails: (event: any) => void;
}

const DayView: React.FC<DayViewProps> = ({ selectedDay, openEventDetails }) => {
  const selectedDate = selectedDay || new Date();
  const formattedDate = format(selectedDate, "EEEE, d 'de' MMMM", {
    locale: ptBR,
  });

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-md overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          <h3 className="font-bold text-lg capitalize">{formattedDate}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-white hover:bg-white/20"
          >
            Hoje
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Time slots */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 12 }).map((_, hourIndex) => {
            const hour = hourIndex + 8; // Start from 8 AM
            const hasEvent = hour === 10; // Example: Event at 10 AM

            return (
              <div key={hourIndex} className="flex">
                <div className="w-20 p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                  {hour}:00
                </div>
                <div
                  className={`flex-1 p-2 min-h-[80px] ${hasEvent ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
                >
                  {hasEvent && (
                    <div
                      className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded border-l-2 border-blue-500 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      onClick={() =>
                        openEventDetails({
                          id: 8,
                          type: "aula",
                          title: "Aula de Matemática",
                          time: "10:00 - 11:30",
                          color: "blue",
                          description:
                            "Estudo de funções trigonométricas e suas aplicações em problemas práticos",
                          professor: "Prof. Carlos Santos",
                          location: "Sala Virtual 3",
                          status: "confirmado",
                          discipline: "Matemática",
                          isOnline: true,
                        })
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Video className="h-4 w-4 mr-2" />
                          <span className="font-medium">
                            Aula de Matemática
                          </span>
                        </div>
                        <span className="text-xs">10:00 - 11:30</span>
                      </div>
                      <div className="mt-1 text-xs">
                        Prof. Carlos Santos • Sala Virtual 3
                      </div>
                      <div className="mt-2 text-xs">
                        Estudo de funções trigonométricas e suas aplicações em
                        problemas práticos
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DayView;
