import React from "react";
import { BarChart2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import AnalyticToolCard from "./AnalyticToolCard";

const AnaliseDesempenhoCard = () => {
  const tool = {
    id: "analise-desempenho",
    title: "Análise de Desempenho",
    description: "Visualize estatísticas e tendências de suas avaliações, identificando pontos fortes e fracos.",
    icon: <BarChart2 className="h-6 w-6 text-white" />,
    badge: "Beta",
    buttonText: "Ver Análise"
  };

  return <AnalyticToolCard {...tool} />;
};

export default AnaliseDesempenhoCard;