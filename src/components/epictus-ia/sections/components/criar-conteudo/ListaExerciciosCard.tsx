
import React from "react";
import { ListChecks } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { ToolCard } from ".";

const ListaExerciciosCard = () => {
  const { theme } = useTheme();
  
  return (
    <ToolCard
      title="Gerador de Lista de Exercícios"
      description="Crie listas de exercícios personalizadas com diferentes níveis de dificuldade"
      icon={<ListChecks className="h-6 w-6 text-white" />}
      iconBgColor="bg-emerald-500"
      href="/epictus-ia/lista-exercicios"
    />
  );
};

export default ListaExerciciosCard;
