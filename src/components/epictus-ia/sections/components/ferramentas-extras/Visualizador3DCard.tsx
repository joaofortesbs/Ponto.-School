import React from "react";
import { Cube } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ToolCard from "./ToolCard";

const Visualizador3DCard = () => {
  const tool = {
    id: "visualizador-3d",
    title: "Visualizador 3D",
    description: "Crie e manipule modelos tridimensionais para visualização de conceitos complexos e estruturas.",
    icon: <Cube className="h-6 w-6 text-white" />,
    badge: "Novo",
    buttonText: "Visualizar"
  };

  return <ToolCard tool={tool} />;
};

export default Visualizador3DCard;