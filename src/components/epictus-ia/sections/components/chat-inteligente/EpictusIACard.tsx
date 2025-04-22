
import React from "react";
import { Brain } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { useNavigate } from "react-router-dom";

export const EpictusIACard: React.FC = () => {
  const navigate = useNavigate();
  
  const handleActivation = () => {
    // Dispatch um evento personalizado para ativar o modo Epictus IA
    // similar ao que é feito com o Turbo mode
    window.history.pushState({}, "", "/epictus-ia?mode=epictus");
    
    // Dispatch um evento customizado que o componente pai pode ouvir
    const event = new CustomEvent("activateEpictusMode", {
      detail: { mode: "epictus" }
    });
    window.dispatchEvent(event);
  };

  const assistantData = {
    id: "epictus-ia",
    title: "Epictus IA",
    description: "Experimente como é receber uma aula de conteúdos que nem as instituições mais renomadas do Brasil conseguiriam te entregar, personalizado para você!",
    icon: <Brain className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Usar Epictus",
    onButtonClick: handleActivation
  };

  return <ChatCard assistant={assistantData} />;
};
