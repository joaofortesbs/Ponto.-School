import React from "react";
import { useDrop } from "react-dnd";
import DraggableEvent from "./draggable-event";

interface DroppableDayProps {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected?: boolean;
  events: any[];
  onEventClick: (event: any) => void;
  onEventDrop: (event: any, day: number) => void;
}

const DroppableDay: React.FC<DroppableDayProps> = ({
  day,
  isCurrentMonth,
  isToday,
  isSelected = false,
  events,
  onEventClick,
  onEventDrop,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "EVENT",
    drop: (item: { event: any }) => {
      onEventDrop(item.event, day);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`min-h-[100px] p-2 rounded-lg transition-all duration-200 ${
        isCurrentMonth
          ? "bg-white dark:bg-[#1E293B] hover:bg-gray-50 dark:hover:bg-[#29335C]/30"
          : "bg-gray-50/70 dark:bg-[#1E293B]/30 text-gray-400 dark:text-gray-600"
      } ${
        isToday
          ? "ring-2 ring-[#FF6B00] dark:ring-[#FF6B00]"
          : isSelected
            ? "ring-2 ring-blue-400 dark:ring-blue-500"
            : "border border-gray-100 dark:border-gray-800"
      } ${
        isOver ? "bg-blue-50/80 dark:bg-blue-900/30 scale-[1.02] shadow-md" : ""
      }`}
    >
      <div
        className={`text-sm font-medium mb-2 ${
          isToday
            ? "text-[#FF6B00] font-bold"
            : isSelected
              ? "text-blue-600 dark:text-blue-400 font-bold"
              : isCurrentMonth
                ? "text-gray-900 dark:text-white"
                : "text-gray-400 dark:text-gray-600"
        }`}
      >
        {day}
      </div>
      <div className="space-y-1.5">
        {events.slice(0, 3).map((event) => (
          <DraggableEvent
            key={event.id}
            event={event}
            onClick={() => onEventClick(event)}
          />
        ))}
        {events.length > 3 && (
          <div className="text-xs text-center py-1 px-2 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-600 dark:text-gray-300 font-medium">
            +{events.length - 3} mais
          </div>
        )}
      </div>
    </div>
  );
};

export default DroppableDay;
