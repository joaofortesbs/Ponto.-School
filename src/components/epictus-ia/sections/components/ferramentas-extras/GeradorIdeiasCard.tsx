
import React from "react";
import { Lightbulb } from "lucide-react";
import ToolCard from "./ToolCard";

export default function GeradorIdeiasCard() {
  return (
    <ToolCard
      title="Gerador de Ideias"
      description="Obtenha inspiração para projetos, redações e trabalhos escolares"
      icon={<Lightbulb className="h-6 w-6 text-white" />}
      buttonText="Gerar ideias"
    />
  );
}
