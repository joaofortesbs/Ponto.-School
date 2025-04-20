
import React from "react";
import { Move } from "lucide-react";
import { ToolCard } from ".";
import { useTheme } from "@/components/ThemeProvider";

const ConversorUnidadesCard: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ToolCard
      title="Conversor de Unidades"
      description="Converta entre diferentes unidades de medida para física, química e matemática"
      icon={<Move className="h-6 w-6 text-white" />}
      buttonText="Converter"
      onClick={() => console.log("Conversor de Unidades clicked")}
    />
  );
};

export default ConversorUnidadesCard;
