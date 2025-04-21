
import React from "react";
import { Book } from "lucide-react";
import { ChatCard } from "./ChatCard";

export const TutorInteligente2Card: React.FC = () => {
  const assistantData = {
    id: "epictus-turbo",
    title: "Epictus Turbo",
    description: "O único Agente IA que você precisa para ter o boletim e desempenhos dos sonhos, com apenas um comando, a revolução da educação começa aqui!",
    icon: <Book className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Aprender"
  };

  return <ChatCard assistant={assistantData} />;
};
