import React from "react";
import { ListChecks } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import AnalyticToolCard from "./AnalyticToolCard";

const ChecklistPreparacaoCard = () => {
  const tool = {
    id: "checklist-preparação",
    title: "Checklist de Preparação",
    description: "Lista personalizada de verificação para provas e trabalhos, com base em seu histórico.",
    icon: <ListChecks className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Gerar Checklist"
  };

  return <AnalyticToolCard {...tool} />;
};

export default ChecklistPreparacaoCard;