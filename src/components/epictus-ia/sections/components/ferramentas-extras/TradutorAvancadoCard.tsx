import React from "react";
import { Languages } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ToolCard from "./ToolCard";

const TradutorAvancadoCard = () => {
  const tool = {
    id: "tradutor-avancado",
    title: "Tradutor Avançado",
    description: "Traduza textos preservando contexto, termos técnicos e nuances linguísticas específicas.",
    icon: <Languages className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Traduzir"
  };

  return <ToolCard tool={tool} />;
};

export default TradutorAvancadoCard;