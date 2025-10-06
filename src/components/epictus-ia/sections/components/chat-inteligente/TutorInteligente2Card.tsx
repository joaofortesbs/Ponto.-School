
import React from "react";
import { Zap } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { useNavigate } from "react-router-dom";

export const TutorInteligente2Card: React.FC = () => {
  const handleTurboActivation = () => {
    // Set a URL parameter to indicate Turbo mode is active
    window.history.pushState({}, "", "/epictus-ia?mode=turbo");
    
    // Dispatch a custom event that the parent component can listen for
    const event = new CustomEvent("activateTurboMode", {
      detail: { mode: "turbo" }
    });
    window.dispatchEvent(event);
  };

  const assistantData = {
    id: "epictus-turbo",
    title: "Epictus Turbo",
    description: "O único Agente IA que você precisa para ter o boletim e desempenhos dos sonhos, com apenas um comando, a revolução da educação começa aqui!",
    icon: <Zap className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Usar Turbo",
    onButtonClick: handleTurboActivation
  };

  return <ChatCard assistant={assistantData} />;
};
