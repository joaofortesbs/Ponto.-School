
import React from "react";
import { FileText } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { ToolCard } from ".";

const PlanoAulaCard = () => {
  const { theme } = useTheme();
  
  return (
    <ToolCard
      title="Gerador de Planos de Aula"
      description="Crie planos de aula completos com objetivos, metodologia e avaliação"
      icon={<FileText className="h-6 w-6 text-white" />}
      iconBgColor="bg-emerald-500"
      href="/epictus-ia/plano-aula"
    />
  );
};

export default PlanoAulaCard;
