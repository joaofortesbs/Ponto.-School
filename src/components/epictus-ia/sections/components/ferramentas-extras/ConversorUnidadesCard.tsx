
import React from "react";
import { Wrench } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ToolCard from "./ToolCard";

const ConversorUnidadesCard = () => {
  const tool = {
    id: "conversor-unidades",
    title: "Conversor de Unidades",
    description: "Converta facilmente entre diferentes unidades de medida com explicações",
    icon: <Wrench className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Converter"
  };

  return <ToolCard tool={tool} />;
};

export default ConversorUnidadesCard;
