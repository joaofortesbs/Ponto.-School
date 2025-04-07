import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bell } from "lucide-react";

interface NotificationIndicatorProps {
  count: number;
  type: "message" | "task" | "material" | "general";
  tooltipText?: string;
}

const NotificationIndicator: React.FC<NotificationIndicatorProps> = ({
  count,
  type,
  tooltipText,
}) => {
  if (count === 0) return null;

  const defaultTooltipText = {
    message: `${count} ${count === 1 ? "nova mensagem" : "novas mensagens"} no fórum`,
    task: `${count} ${count === 1 ? "nova tarefa" : "novas tarefas"}`,
    material: `${count} ${count === 1 ? "novo material" : "novos materiais"} disponível`,
    general: `${count} ${count === 1 ? "notificação" : "notificações"}`,
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative inline-flex">
            <Badge className="bg-[#FF6B00] text-white text-xs min-w-5 h-5 flex items-center justify-center rounded-full">
              {count > 9 ? "9+" : count}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText || defaultTooltipText[type]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NotificationIndicator;
