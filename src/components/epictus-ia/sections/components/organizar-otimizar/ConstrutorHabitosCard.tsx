
import React from "react";
import { Hammer } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import OrganizationToolCard from "./OrganizationToolCard";

const ConstrutorHabitosCard = () => {
  const tool = {
    id: "construtor-habitos",
    title: "Construtor de Hábitos de Estudo",
    description: "Desenvolva rotinas consistentes de estudo com estratégias comprovadas de formação de hábitos.",
    icon: <Hammer className="h-6 w-6 text-white" />,
    badge: "Novo",
    buttonText: "Criar Hábito"
  };

  return <OrganizationToolCard tool={tool} />;
};

export default ConstrutorHabitosCard;
