
import React from "react";
import { PenTool, ArrowRight } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ToolCard from "./ToolCard";

const PlanoAulaCard = () => {
  const { theme } = useTheme();

  const tool = {
    id: "planos-aula",
    title: "Gerador de Planos de Aula",
    description: "Crie planos de aula completos em minutos, baseados no tema, ano escolar e BNCC.",
    icon: <PenTool className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Gerar Plano"
  };

  return <ToolCard tool={tool} />;
};

export default PlanoAulaCard;
