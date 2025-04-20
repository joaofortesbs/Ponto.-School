
import React from "react";
import { Move } from "lucide-react";
import ToolCard from "./ToolCard";

export default function ConversorUnidadesCard() {
  return (
    <ToolCard
      title="Conversor de Unidades"
      description="Converta entre diferentes unidades de medida para física, química e matemática"
      icon={<Move className="h-6 w-6 text-white" />}
      buttonText="Converter"
    />
  );
}
