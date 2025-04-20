import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Languages } from "lucide-react";
import { tools } from "./toolsData.tsx";

const TradutorAvancadoCard: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ToolCard
      title="Tradutor Avançado"
      description="Traduza textos com contexto acadêmico e termos técnicos preservados"
      icon={<Languages className="h-6 w-6 text-white" />}
      buttonText="Traduzir"
      onClick={() => console.log("Tradutor Avançado clicked")}
    />
  );
};

export default TradutorAvancadoCard;