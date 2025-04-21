
import React from "react";
import { Book } from "lucide-react";
import { ChatCard } from "./ChatCard";

export const TutorInteligenteCard: React.FC = () => {
  const assistantData = {
    id: "tutor-inteligente",
    title: "Tutor Inteligente",
    description: "Receba explicações detalhadas sobre qualquer assunto acadêmico, com exemplos e diferentes níveis de profundidade.",
    icon: <Book className="h-5 w-5 text-white" />,
    badge: null,
    buttonText: "Aprender"
  };

  return <ChatCard assistant={assistantData} />;
};
