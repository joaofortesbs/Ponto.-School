
import React from "react";
import { Network } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { ToolCard } from ".";

const AtividadesInterdisciplinaresCard = () => {
  const { theme } = useTheme();
  
  return (
    <ToolCard
      title="Gerador de Atividades Interdisciplinares"
      description="Crie atividades que integram diferentes disciplinas para um aprendizado holístico"
      icon={<Network className="h-6 w-6 text-white" />}
      iconBgColor="bg-emerald-500"
      href="/epictus-ia/atividades-interdisciplinares"
    />
  );
};

export default AtividadesInterdisciplinaresCard;
