
import React from "react";
import { UsersRound } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ToolCard from "./ToolCard";

const AtividadesInterdisciplinaresCard = () => {
  const { theme } = useTheme();

  const tool = {
    id: "atividades-interdisciplinares",
    title: "Gerador de Atividades Interdisciplinares",
    description: "Desenvolva propostas de atividades que conectam duas ou mais disciplinas.",
    icon: <UsersRound className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Gerar Atividade"
  };

  return <ToolCard tool={tool} />;
};

export default AtividadesInterdisciplinaresCard;
