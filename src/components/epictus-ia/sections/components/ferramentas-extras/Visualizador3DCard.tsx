
import React from "react";
import { Share2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ToolCard from "./ToolCard";

const Visualizador3DCard = () => {
  const tool = {
    id: "visualizador-3d",
    title: "Visualizador 3D",
    description: "Visualize conceitos complexos em modelos tridimensionais interativos",
    icon: <Share2 className="h-6 w-6 text-white" />,
    badge: "Experimental",
    buttonText: "Visualizar"
  };

  return <ToolCard tool={tool} />;
};

export default Visualizador3DCard;
