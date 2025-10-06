
import React from "react";
import { Clock } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import OrganizationToolCard from "./OrganizationToolCard";

const TimerPomodoro = () => {
  const tool = {
    id: "tecnica-pomodoro",
    title: "Timer Pomodoro Inteligente",
    description: "Otimize seu tempo de estudo com ciclos de foco e descanso ajustados ao seu perfil cognitivo.",
    icon: <Clock className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Iniciar Timer"
  };

  return <OrganizationToolCard tool={tool} />;
};

export default TimerPomodoro;
