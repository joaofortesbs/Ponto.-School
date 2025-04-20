
import React from "react";
import { Calculator } from "lucide-react";
import ToolCard from "./ToolCard";

export default function CalculadoraFormulasCard() {
  return (
    <ToolCard
      title="Calculadora de Fórmulas"
      description="Solucione equações complexas de física, química e matemática com explicações detalhadas"
      icon={<Calculator className="h-6 w-6 text-white" />}
      buttonText="Calcular"
      badge="Novo"
    />
  );
}
