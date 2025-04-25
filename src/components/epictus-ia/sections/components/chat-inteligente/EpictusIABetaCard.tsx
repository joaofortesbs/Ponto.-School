
import React from "react";
import { Sparkles } from "lucide-react";
import { ChatCard } from "./ChatCard";

export const EpictusIABetaCard: React.FC = () => {
  const handleBetaActivation = () => {
    // Set a URL parameter to indicate Beta mode is active
    window.history.pushState({}, "", "/epictus-ia?mode=beta");
    
    // Dispatch a custom event that the parent component can listen for
    const event = new CustomEvent("activateBetaMode", {
      detail: { mode: "beta" }
    });
    window.dispatchEvent(event);
  };

  const assistantData = {
    id: "epictus-beta",
    title: "Epictus IA BETA",
    description: "Experimente como é receber uma aula de conteúdos que nem as instituições mais renomadas do Brasil conseguiriam te entregar, personalizado para você!",
    icon: <Sparkles className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Experimentar",
    onButtonClick: handleBetaActivation
  };

  return <ChatCard assistant={assistantData} />
};
