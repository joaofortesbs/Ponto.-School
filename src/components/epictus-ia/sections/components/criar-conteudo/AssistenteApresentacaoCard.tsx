
import React from "react";
import { Presentation } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { ToolCard } from ".";

const AssistenteApresentacaoCard = () => {
  const { theme } = useTheme();
  
  return (
    <ToolCard
      title="Assistente de Apresentação"
      description="Ajuda na criação e preparação de apresentações acadêmicas de alta qualidade"
      icon={<Presentation className="h-6 w-6 text-white" />}
      iconBgColor="bg-emerald-500"
      href="/epictus-ia/assistente-apresentacao"
    />
  );
};

export default AssistenteApresentacaoCard;
