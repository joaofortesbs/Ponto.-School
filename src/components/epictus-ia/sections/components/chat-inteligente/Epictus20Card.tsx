
import React from "react";
import { Sparkles } from "lucide-react";
import { ChatCard } from "./ChatCard";

export const Epictus20Card: React.FC = () => {
  const assistantData = {
    id: "epictus-2.0",
    title: "Epictus 2.0",
    description: "Agente de IA super Aprimorado",
    icon: <Sparkles className="h-6 w-6 text-white" />,
    badge: "Novo",
    buttonText: "Experimentar",
    highlight: true
  };

  return <ChatCard assistant={assistantData} />;
};
