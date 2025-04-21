
import React from "react";
import { Lightbulb } from "lucide-react";
import { ChatCard } from "./ChatCard";

export const BrainstormCard: React.FC = () => {
  const assistantData = {
    id: "brainstorm",
    title: "Tempestade de Ideias (Brainstorm)",
    description: "Gere ideias criativas, explore conceitos e estruture seus projetos com a ajuda da IA.",
    icon: <Lightbulb className="h-5 w-5 text-white" />,
    badge: null,
    buttonText: "Criar"
  };

  return <ChatCard assistant={assistantData} />;
};
