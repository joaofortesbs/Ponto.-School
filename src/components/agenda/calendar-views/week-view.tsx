import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarRange, ChevronLeft, ChevronRight, Video } from "lucide-react";

interface WeekViewProps {
  openEventDetails: (event: any) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ openEventDetails }) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = today.getDay();
  startOfWeek.setDate(today.getDate() - day);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-md overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-5 w-5" />
          <h3 className="font-bold text-lg">
            Semana de {format(weekDays[0], "dd/MM")} a{" "}
            {format(weekDays[6], "dd/MM/yyyy")}
          </h3>
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
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
          <div className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
            Hora
          </div>
          {weekDays.map((date, index) => {
            const isToday =
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();

            return (
              <div
                key={index}
                className={`p-2 text-center border-r last:border-r-0 border-gray-200 dark:border-gray-700 ${isToday ? "bg-[#FF6B00]/5" : ""}`}
              >
                <div
                  className={`font-medium text-sm ${isToday ? "text-[#FF6B00]" : "text-gray-700 dark:text-gray-300"}`}
                >
                  {
                    ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][
                      date.getDay()
                    ]
                  }
                </div>
                <div
                  className={`text-xs ${isToday ? "text-[#FF6B00] font-bold" : "text-gray-500 dark:text-gray-400"}`}
                >
                  {date.getDate()}/{date.getMonth() + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time slots */}
        {Array.from({ length: 12 }).map((_, hourIndex) => {
          const hour = hourIndex + 8; // Start from 8 AM
          return (
            <div
              key={hourIndex}
              className="grid grid-cols-8 border-b last:border-b-0 border-gray-200 dark:border-gray-700"
            >
              <div className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                {hour}:00
              </div>
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                // Check if there's an event at this time slot (simplified for demo)
                const hasEvent = hourIndex === 2 && dayIndex === 3; // Example: 10 AM on Wednesday
                return (
                  <div
                    key={dayIndex}
                    className={`p-1 border-r last:border-r-0 border-gray-200 dark:border-gray-700 min-h-[60px] ${hasEvent ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
                  >
                    {hasEvent && (
                      <div
                        className="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded border-l-2 border-blue-500 h-full cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50"
                        onClick={() =>
                          openEventDetails({
                            id: 7,
                            type: "aula",
                            title: "Aula de Matemática",
                            time: "10:00",
                            color: "blue",
                            description: "Estudo de funções trigonométricas",
                            professor: "Prof. Carlos Santos",
                            location: "Sala Virtual 3",
                            status: "confirmado",
                            discipline: "Matemática",
                            isOnline: true,
                          })
                        }
                      >
                        <div className="flex items-center">
                          <Video className="h-3 w-3 mr-1" />
                          <span className="font-medium">
                            Aula de Matemática
                          </span>
                        </div>
                        <div className="text-[10px] mt-1">
                          Prof. Carlos Santos
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
