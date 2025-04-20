
import React from "react";
import { Calculator } from "lucide-react";
import { ToolCard } from ".";
import { useTheme } from "@/components/ThemeProvider";

const CalculadoraFormulasCard: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ToolCard
      title="Calculadora de Fórmulas"
      description="Solucione equações complexas de física, química e matemática com explicações detalhadas"
      icon={<Calculator className="h-6 w-6 text-white" />}
      buttonText="Calcular"
      badge="Novo"
      onClick={() => console.log("Calculadora de Fórmulas clicked")}
    />
  );
};

export default CalculadoraFormulasCard;
