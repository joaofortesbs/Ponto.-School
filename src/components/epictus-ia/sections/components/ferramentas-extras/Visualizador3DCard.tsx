import React from "react";
import { Cube } from "lucide-react";
import { ToolCard } from ".";
import { useTheme } from "@/components/ThemeProvider";
import { tools } from "./toolsData.tsx";

const Visualizador3DCard: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ToolCard
      title="Visualizador 3D"
      description="Visualize modelos 3D interativos para melhor compreensão de conceitos complexos"
      icon={<Cube className="h-6 w-6 text-white" />}
      buttonText="Visualizar"
      badge="Beta"
      onClick={() => console.log("Visualizador 3D clicked")}
    />
  );
};

export default Visualizador3DCard;