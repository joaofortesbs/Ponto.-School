
import React from "react";
import { Lightbulb } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ToolCard from "./ToolCard";

const GeradorIdeiasCard = () => {
  const tool = {
    id: "gerador-ideias",
    title: "Gerador de Ideias",
    description: "Receba sugestões de ideias inovadoras para projetos escolares e acadêmicos",
    icon: <Lightbulb className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Gerar Ideias"
  };

  return <ToolCard tool={tool} />;
};

export default GeradorIdeiasCard;
