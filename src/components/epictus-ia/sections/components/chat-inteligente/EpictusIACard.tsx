
import React from "react";
import { Brain } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { useNavigate } from "react-router-dom";

export const EpictusIACard: React.FC = () => {
  const navigate = useNavigate();
  
  const handleActivation = () => {
    // Navegar para a página do Epictus IA
    navigate("/epictus-ia");
  };

  const assistantData = {
    id: "epictus-ia",
    title: "Epictus IA",
    description: "Um assistente IA que pode ajudar com suas dúvidas e criar conteúdos personalizados.",
    icon: <Brain className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Criar",
    onButtonClick: handleActivation
  };

  return <ChatCard assistant={assistantData} />;
};
