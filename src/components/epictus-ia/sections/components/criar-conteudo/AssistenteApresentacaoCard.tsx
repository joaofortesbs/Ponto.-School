
import React from "react";
import { Presentation } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ToolCard from "./ToolCard";

const AssistenteApresentacaoCard = () => {
  const { theme } = useTheme();

  const tool = {
    id: "assistente-apresentacao",
    title: "Assistente de Apresentação",
    description: "Estruture sua apresentação oral, receba sugestões de tópicos e visualize como apresentar.",
    icon: <Presentation className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Criar Apresentação"
  };

  return <ToolCard tool={tool} />;
};

export default AssistenteApresentacaoCard;
