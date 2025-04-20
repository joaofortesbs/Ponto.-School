
import React from "react";
import { Languages } from "lucide-react";
import ToolCard from "./ToolCard";

export default function TradutorAvancadoCard() {
  return (
    <ToolCard
      title="Tradutor Avançado"
      description="Traduza textos com contexto acadêmico e termos técnicos preservados"
      icon={<Languages className="h-6 w-6 text-white" />}
      buttonText="Traduzir"
    />
  );
}
