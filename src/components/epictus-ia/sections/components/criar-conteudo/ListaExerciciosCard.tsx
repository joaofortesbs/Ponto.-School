
import React from "react";
import { FileQuestion } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ToolCard from "./ToolCard";

const ListaExerciciosCard = () => {
  const { theme } = useTheme();

  const tool = {
    id: "lista-exercicios",
    title: "Gerador de Lista de Exercícios",
    description: "Crie listas de exercícios personalizadas (alternativas, dissertativas, V/F) com gabarito.",
    icon: <FileQuestion className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Gerar Exercícios"
  };

  return <ToolCard tool={tool} />;
};

export default ListaExerciciosCard;
