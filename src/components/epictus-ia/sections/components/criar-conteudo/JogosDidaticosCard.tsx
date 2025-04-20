
import React from "react";
import { Gamepad2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ToolCard from "./ToolCard";

const JogosDidaticosCard = () => {
  const { theme } = useTheme();

  const tool = {
    id: "jogos-didaticos",
    title: "Gerador de Jogos Didáticos",
    description: "Crie caça-palavras, forcas e outros jogos interativos baseados no seu conteúdo.",
    icon: <Gamepad2 className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Criar Jogo"
  };

  return <ToolCard tool={tool} />;
};

export default JogosDidaticosCard;
