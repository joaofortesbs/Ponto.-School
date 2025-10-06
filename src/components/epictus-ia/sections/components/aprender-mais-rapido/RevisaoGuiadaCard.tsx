
import React from "react";
import { Undo } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import LearningToolCard from "./LearningToolCard";

const RevisaoGuiadaCard = () => {
  const tool = {
    id: "revisao-guiada",
    title: "Revisão Guiada",
    description: "Deixe a IA montar uma rota de revisão personalizada com base nos seus erros passados.",
    icon: <Undo className="h-6 w-6 text-white" />,
    badge: "Novo",
    buttonText: "Revisar"
  };

  return <LearningToolCard {...tool} />;
};

export default RevisaoGuiadaCard;
