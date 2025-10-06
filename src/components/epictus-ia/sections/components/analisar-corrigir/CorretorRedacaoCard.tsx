import React from "react";
import { Pen } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import AnalyticToolCard from "./AnalyticToolCard";

const CorretorRedacaoCard = () => {
  const tool = {
    id: "corretor-redacao",
    title: "Corretor de Redação",
    description: "Analise sua redação com feedback por competências, correção gramatical e sugestões de melhoria.",
    icon: <Pen className="h-6 w-6 text-white" />,
    badge: "Popular",
    buttonText: "Analisar Redação"
  };

  return <AnalyticToolCard {...tool} />;
};

export default CorretorRedacaoCard;