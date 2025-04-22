
import React from "react";
import { Brain } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { useNavigate } from "react-router-dom";

export const EpictusIACard: React.FC = () => {
  const navigate = useNavigate();
  
  const handleActivation = () => {
    // Disparar um evento personalizado para ativar o modo Epictus IA
    // que o componente pai (ChatInteligente) está ouvindo
    const event = new CustomEvent("activateEpictusMode", {
      detail: { activated: true }
    });
    window.dispatchEvent(event);
    
    // Modificar a URL sem navegar (opcional)
    window.history.pushState({}, "", "/epictus-ia?mode=epictus");
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
