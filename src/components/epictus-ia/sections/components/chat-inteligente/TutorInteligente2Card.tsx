
import React from "react";
import { Zap } from "lucide-react";
import { ChatCard } from "./ChatCard";

export const TutorInteligente2Card: React.FC = () => {
  const assistantData = {
    id: "epictus-turbo",
    title: "Epictus Turbo",
    description: "O único Agente IA que você precisa para ter o boletim e desempenhos dos sonhos, com apenas um comando, a revolução da educação começa aqui!",
    icon: <Zap className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Usar Turbo",
    onClick: () => {
      // Navigate to the Epictus IA page with the turbo mode
      window.location.href = "/epictus-ia?mode=turbo";
    }
  };

  return <ChatCard assistant={assistantData} />;
};
