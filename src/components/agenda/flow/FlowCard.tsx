import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface FlowCardProps {
  title: string;
  description: string;
  status: "in-progress" | "planned" | "completed";
  timeRemaining?: string;
  scheduledTime?: string;
  completionTime?: string;
  progress: number;
  totalMinutes: number;
  completedMinutes: number;
  onClick?: () => void;
}

const FlowCard: React.FC<FlowCardProps> = ({
  title,
  description,
  status,
  timeRemaining,
  scheduledTime,
  completionTime,
  progress,
  totalMinutes,
  completedMinutes,
  onClick,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case "in-progress":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Em andamento
          </Badge>
        );
      case "planned":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Planejado
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            Concluído
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTimeInfo = () => {
    if (status === "in-progress" && timeRemaining) {
      return timeRemaining;
    } else if (status === "planned" && scheduledTime) {
      return scheduledTime;
    } else if (status === "completed" && completionTime) {
      return completionTime;
    }
    return "";
  };

  return (
    <div
      className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10 hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        {getStatusBadge()}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {getTimeInfo()}
        </div>
      </div>
      <h4 className="text-lg font-semibold text-[#29335C] dark:text-white mb-2">
        {title}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        {description}
      </p>
      <Progress value={progress} className="h-1.5 mb-2 bg-[#FF6B00]/10" />
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span>{progress}% concluído</span>
        <span>
          {completedMinutes}/{totalMinutes} min
        </span>
      </div>
    </div>
  );
};

export default FlowCard;
