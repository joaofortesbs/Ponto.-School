
import React from "react";
import { BookOpen } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import LearningToolCard from "./LearningToolCard";

const EstudoCompetenciaCard = () => {
  const tool = {
    id: "estudo-competencia",
    title: "Estudo por Competência (BNCC)",
    description: "Encontre atividades e materiais focados em competências específicas da BNCC.",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Estudar"
  };

  return <LearningToolCard {...tool} />;
};

export default EstudoCompetenciaCard;
