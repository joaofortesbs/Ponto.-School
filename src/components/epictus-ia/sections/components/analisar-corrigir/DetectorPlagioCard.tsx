import React from "react";
import { Eye } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import AnalyticToolCard from "./AnalyticToolCard";

const DetectorPlagioCard = () => {
  const tool = {
    id: "detector-plágio",
    title: "Detector de Plágio",
    description: "Verifique originalidade de textos com detecção avançada de conteúdo similar.",
    icon: <Eye className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Verificar Plágio"
  };

  return <AnalyticToolCard {...tool} />;
};

export default DetectorPlagioCard;