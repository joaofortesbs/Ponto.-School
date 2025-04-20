
import React from "react";
import { Lightbulb } from "lucide-react";
import { ToolCard } from ".";
import { useTheme } from "@/components/ThemeProvider";

const GeradorIdeiasCard: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ToolCard
      title="Gerador de Ideias"
      description="Obtenha inspiração para projetos, redações e trabalhos escolares"
      icon={<Lightbulb className="h-6 w-6 text-white" />}
      buttonText="Gerar ideias"
      onClick={() => console.log("Gerador de Ideias clicked")}
    />
  );
};

export default GeradorIdeiasCard;
