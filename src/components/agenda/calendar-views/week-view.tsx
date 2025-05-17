import React, { useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Video } from "lucide-react";

interface WeekViewProps {
  openEventDetails: (event: any) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ openEventDetails }) => {
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Calculate end date (6 days from start date)
  const endDate = addDays(startDate, 6);

  // Format date range for display
  const dateRangeText = `${format(startDate, "d")} - ${format(endDate, "d")} de ${format(startDate, "MMMM", { locale: ptBR })}`;

  // Generate days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-md overflow-hidden">
      {/* Week Indicator */}
      <div className="p-4 flex items-center justify-center">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Semana: {dateRangeText}</h3>
      </div>

      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
          <div className="p-2 border-r border-gray-200 dark:border-gray-700 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
            Hora
          </div>
          {weekDays.map((date, index) => {
            const currentDate = new Date();
            const isToday =
              date.getDate() === currentDate.getDate() &&
              date.getMonth() === currentDate.getMonth() &&
              date.getFullYear() === currentDate.getFullYear();

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
                return (
                  <div
                    key={dayIndex}
                    className="p-1 border-r last:border-r-0 border-gray-200 dark:border-gray-700 min-h-[60px]"
                  >
                    {/* Eventos serão adicionados aqui dinamicamente quando o usuário criar eventos */}
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