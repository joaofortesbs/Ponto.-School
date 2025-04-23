
import React from "react";
import { Zap } from "lucide-react";
import { ChatCard } from "./ChatCard";

export const EpictusTurboAdvancedCard: React.FC = () => {
  const handleTurboAdvancedActivation = () => {
    // Set a URL parameter to indicate Turbo Advanced mode is active
    window.history.pushState({}, "", "/epictus-ia?mode=turbo-advanced");
    
    // Dispatch a custom event that the parent component can listen for
    const event = new CustomEvent("activateTurboAdvancedMode", {
      detail: { mode: "turbo-advanced" }
    });
    window.dispatchEvent(event);
  };

  const assistantData = {
    id: "epictus-turbo-advanced",
    title: "Epictus Turbo Advanced",
    description: "O único Agente IA que você precisa para ter o boletim e desempenhos dos sonhos, com apenas um comando, a revolução da educação começa aqui!",
    icon: <Zap className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Usar Turbo Advanced",
    onButtonClick: handleTurboAdvancedActivation
  };

  return <ChatCard assistant={assistantData} />;
};

export default EpictusTurboAdvancedCard;
