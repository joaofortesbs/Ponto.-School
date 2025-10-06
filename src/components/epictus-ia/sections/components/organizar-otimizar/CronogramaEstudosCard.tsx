import React from "react";
import { Calendar } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import OrganizationToolCard from "./OrganizationToolCard";

const CronogramaEstudosCard = () => {
  const tool = {
    id: "cronograma-estudos",
    title: "Cronograma de Estudos",
    description: "Crie um planejamento personalizado com base em sua rotina, prioridades e metas de aprendizado.",
    icon: <Calendar className="h-6 w-6 text-white" />,
    badge: "Popular",
    buttonText: "Planejar"
  };

  return <OrganizationToolCard tool={tool} />;
};

export default CronogramaEstudosCard;