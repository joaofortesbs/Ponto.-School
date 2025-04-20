
import React from "react";
import { Globe } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ToolCard from "./ToolCard";

const TradutorAvancadoCard = () => {
  const tool = {
    id: "tradutor-avancado",
    title: "Tradutor Avançado",
    description: "Traduza textos com contexto acadêmico preservado entre múltiplos idiomas",
    icon: <Globe className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Traduzir"
  };

  return <ToolCard tool={tool} />;
};

export default TradutorAvancadoCard;
