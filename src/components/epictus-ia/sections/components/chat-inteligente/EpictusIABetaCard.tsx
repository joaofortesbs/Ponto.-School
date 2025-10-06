
import React from "react";
import { Sparkles } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { useNavigate } from "react-router-dom";

export const EpictusIABetaCard: React.FC = () => {
  const navigate = useNavigate();

  const handleBetaActivation = () => {
    // Navigate to the Epictus IA page with beta mode parameter
    navigate("/epictus-ia?mode=beta");
    
    // Dispatch a custom event that other components can listen for
    const event = new CustomEvent("activateBetaMode", {
      detail: { mode: "beta" }
    });
    window.dispatchEvent(event);

    // Add a small delay before redirecting to ensure the event is processed
    setTimeout(() => {
      // This forces a reload of the page with the new parameter
      window.location.href = "/epictus-ia?mode=beta";
    }, 100);
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

  return <ChatCard assistant={assistantData} />;
};
