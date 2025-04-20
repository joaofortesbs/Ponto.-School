
import React from "react";
import { FileQuestion } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import LearningToolCard from "./LearningToolCard";

const SimuladorProvasCard = () => {
  const tool = {
    id: "simulador-provas",
    title: "Simulador de Provas",
    description: "Faça quizzes e simulados com feedback instantâneo e análise de desempenho.",
    icon: <FileQuestion className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Simular Prova"
  };

  return <LearningToolCard {...tool} />;
};

export default SimuladorProvasCard;
