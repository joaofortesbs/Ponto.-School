import React from "react";
import { useDrag } from "react-dnd";
import { Video, FileEdit, CheckSquare, Users, Bell, Info } from "lucide-react";

interface DraggableEventProps {
  event: any;
  onClick: () => void;
}

const DraggableEvent: React.FC<DraggableEventProps> = ({ event, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "EVENT",
    item: { event },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getEventIcon = (type: string) => {
    switch (type) {
      case "aula":
        return <Video className="h-3 w-3 text-blue-500" />;
      case "prova":
        return <FileEdit className="h-3 w-3 text-purple-500" />;
      case "tarefa":
      case "trabalho":
        return <CheckSquare className="h-3 w-3 text-red-500" />;
      case "reuniao":
        return <Users className="h-3 w-3 text-green-500" />;
      case "lembrete":
        return <Bell className="h-3 w-3 text-yellow-500" />;
      default:
        return <Info className="h-3 w-3 text-gray-500" />;
    }
  };

  // Define color mapping for event types
  const getEventColor = (type: string) => {
    switch (type) {
      case "aula":
        return {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-800 dark:text-blue-300",
          border: "border-blue-400",
        };
      case "prova":
        return {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-800 dark:text-red-300",
          border: "border-red-400",
        };
      case "trabalho":
        return {
          bg: "bg-amber-100 dark:bg-amber-900/30",
          text: "text-amber-800 dark:text-amber-300",
          border: "border-amber-400",
        };
      case "reuniao":
        return {
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-800 dark:text-green-300",
          border: "border-green-400",
        };
      case "lembrete":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
          text: "text-yellow-800 dark:text-yellow-300",
          border: "border-yellow-400",
        };
      case "evento":
        return {
          bg: "bg-purple-100 dark:bg-purple-900/30",
          text: "text-purple-800 dark:text-purple-300",
          border: "border-purple-400",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-800",
          text: "text-gray-800 dark:text-gray-300",
          border: "border-gray-400",
        };
    }
  };

  const colorClasses = getEventColor(event.type);

  return (
    <div
      ref={drag}
      onClick={onClick}
      className={`flex items-center gap-1.5 text-xs py-1.5 px-2 rounded-md cursor-pointer shadow-sm ${colorClasses.bg} ${colorClasses.text} border-l-2 ${colorClasses.border} hover:shadow-md transition-all duration-200 ${isDragging ? "opacity-50 scale-95" : ""}`}
    >
      <div className="flex-shrink-0">{getEventIcon(event.type)}</div>
      <div className="truncate font-medium">{event.title}</div>
    </div>
  );
};

export default DraggableEvent;
