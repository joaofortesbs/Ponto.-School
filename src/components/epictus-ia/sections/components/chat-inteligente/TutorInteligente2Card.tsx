
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
      // Ativar o modo turbo sem redirecionar
      if (window.activateTurboMode) {
        window.activateTurboMode();
      } else {
        // Evento customizado para ativar o modo turbo
        const event = new CustomEvent('activate-turbo-mode');
        window.dispatchEvent(event);
      }
    }
  };

  return <ChatCard assistant={assistantData} />;
};
