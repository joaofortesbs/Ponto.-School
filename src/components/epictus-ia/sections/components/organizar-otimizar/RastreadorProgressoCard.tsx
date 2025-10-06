
import React from "react";
import { LineChart } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import OrganizationToolCard from "./OrganizationToolCard";

const RastreadorProgressoCard = () => {
  const tool = {
    id: "rastreador-progresso",
    title: "Rastreador de Progresso",
    description: "Visualize e acompanhe seu avanço em matérias, habilidades e projetos ao longo do tempo.",
    icon: <LineChart className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Monitorar Progresso"
  };

  return <OrganizationToolCard tool={tool} />;
};

export default RastreadorProgressoCard;
