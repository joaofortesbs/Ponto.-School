
import React from "react";
import { Calculator } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ToolCard from "./ToolCard";

const CalculadoraFormulasCard = () => {
  const tool = {
    id: "calculadora-formulas",
    title: "Calculadora de Fórmulas",
    description: "Calcule resultados de fórmulas complexas com explicações passo a passo",
    icon: <Calculator className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Calcular"
  };

  return <ToolCard tool={tool} />;
};

export default CalculadoraFormulasCard;
