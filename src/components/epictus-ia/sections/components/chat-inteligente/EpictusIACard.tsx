
import React from "react";
import { MessageSquare } from "lucide-react";
import { ChatCard } from "./ChatCard";

export const EpictusIACard: React.FC = () => {
  const assistantData = {
    id: "assistente-pessoal",
    title: "Chat com Epictus IA",
    description: "Tire dúvidas rápidas, peça sugestões, receba ajuda personalizada e execute ações rápidas com comandos de voz ou texto.",
    icon: <MessageSquare className="h-6 w-6 text-white" />,
    badge: "Popular",
    buttonText: "Conversar",
    highlight: true
  };

  return <ChatCard assistant={assistantData} />;
};
