
import React from "react";
import { Network } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import LearningToolCard from "./LearningToolCard";

const MapasMentaisCard = () => {
  const tool = {
    id: "mapas-mentais",
    title: "Mapas Mentais",
    description: "Transforme qualquer conteúdo em um mapa mental visual e navegável para facilitar a compreensão.",
    icon: <Network className="h-6 w-6 text-white" />,
    badge: "Popular",
    buttonText: "Criar Mapa"
  };

  return <LearningToolCard {...tool} />;
};

export default MapasMentaisCard;
