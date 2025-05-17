import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Video } from "lucide-react";

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
      <div className="p-4 flex items-center justify-center">
        <h3 className="font-bold text-lg capitalize text-gray-800 dark:text-gray-200">{formattedDate}</h3>
      </div>

      <div className="p-4">
        {/* Time slots */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 12 }).map((_, hourIndex) => {
            const hour = hourIndex + 8; // Start from 8 AM

            return (
              <div key={hourIndex} className="flex">
                <div className="w-20 p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                  {hour}:00
                </div>
                <div className="flex-1 p-2 min-h-[80px]">
                  {/* Eventos serão adicionados aqui dinamicamente quando o usuário criar eventos */}
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
```

```typescript
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Video } from "lucide-react";

interface DayViewProps {
  eventData?: any;
  selectedDay: Date | null;
  setSelectedDay?: (date: Date | null) => void;
  onEventClick?: (event: any) => void;
  onAddEvent?: (date: Date) => void;
}

export default function DayView({
  eventData = {},
  selectedDay,
  setSelectedDay,
  onEventClick,
  onAddEvent
}: DayViewProps) {
  // Configurações da visualização
  const hourHeight = 60; // altura em pixels para cada hora
  const dayStart = 6; // hora de início (6 AM)
  const dayEnd = 22; // hora de término (10 PM)

  const selectedDate = selectedDay || new Date();
  const formattedDate = format(selectedDate, "EEEE, d 'de' MMMM", {
    locale: ptBR,
  });

  const numberOfHours = dayEnd - dayStart;

  const dayViewHeight = numberOfHours * hourHeight;

  const timeSlots = Array.from({ length: numberOfHours }, (_, i) => {
    const hour = dayStart + i;
    return {
      hour: hour,
      events: eventData[hour] || []
    };
  });

  const handleTimeSlotClick = (hour: number) => {
    if (selectedDay) {
      const selectedDateTime = new Date(selectedDay);
      selectedDateTime.setHours(hour, 0, 0, 0);
      onAddEvent(selectedDateTime);
    }
  };


  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-md overflow-hidden">
      <div className="p-4 flex items-center justify-center">
        <h3 className="font-bold text-lg capitalize text-gray-800 dark:text-gray-200">{formattedDate}</h3>
      </div>

      <div className="p-4">
        {/* Time slots */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {timeSlots.map((slot, index) => (
            <div key={index} className="flex">
              <div className="w-20 p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                {slot.hour}:00
              </div>
              <div
                className="flex-1 p-2 min-h-[60px] cursor-pointer"
                onClick={() => handleTimeSlotClick(slot.hour)}
              >
                {/* Eventos serão adicionados aqui dinamicamente quando o usuário criar eventos */}
                {slot.events.map((event: any, i: number) => (
                  <div
                    key={i}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 p-1 rounded mb-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```