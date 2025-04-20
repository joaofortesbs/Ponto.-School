import React from "react";
import { Calculator } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ToolCard from "./ToolCard";

const CalculadoraFormulasCard = () => {
  const tool = {
    id: "calculadora-formulas",
    title: "Calculadora de Fórmulas",
    description: "Resolva equações matemáticas, físicas e químicas com explicações detalhadas de cada passo.",
    icon: <Calculator className="h-6 w-6 text-white" />,
    badge: "Popular",
    buttonText: "Calcular"
  };

  return <ToolCard tool={tool} />;
};

export default CalculadoraFormulasCard;