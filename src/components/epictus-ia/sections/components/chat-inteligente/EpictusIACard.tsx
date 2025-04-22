
import React from "react";
import { Brain } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { useNavigate } from "react-router-dom";

interface EpictusIACardProps {
  onActivateEpictus?: () => void;
}

export const EpictusIACard: React.FC<EpictusIACardProps> = ({ onActivateEpictus }) => {
  const navigate = useNavigate();
  
  const handleActivation = () => {
    // Dispatch um evento personalizado para ativar o modo Epictus IA
    window.history.pushState({}, "", "/epictus-ia?mode=epictus");
    
    console.log("Ativando modo Epictus IA via card");
    
    // Aciona callback se fornecido
    if (onActivateEpictus) {
      onActivateEpictus();
    }
    
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
