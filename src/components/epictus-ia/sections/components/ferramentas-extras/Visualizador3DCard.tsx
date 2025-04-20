
import React from "react";
import { Cube } from "lucide-react";
import ToolCard from "./ToolCard";

export default function Visualizador3DCard() {
  return (
    <ToolCard
      title="Visualizador 3D"
      description="Visualize modelos 3D interativos para melhor compreensão de conceitos complexos"
      icon={<Cube className="h-6 w-6 text-white" />}
      buttonText="Visualizar"
      badge="Beta"
    />
  );
}
