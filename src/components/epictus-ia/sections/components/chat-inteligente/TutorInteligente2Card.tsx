
import React from "react";
import { Zap } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { useNavigate } from "react-router-dom";

export const TutorInteligente2Card: React.FC = () => {
  const navigate = useNavigate();
  
  const handleTurboClick = () => {
    // Navigate to the same page with a query parameter to indicate Turbo mode
    navigate("/epictus-ia?mode=turbo");
  };
  
  const assistantData = {
    id: "epictus-turbo",
    title: "Epictus Turbo",
    description: "O único Agente IA que você precisa para ter o boletim e desempenhos dos sonhos, com apenas um comando, a revolução da educação começa aqui!",
    icon: <Zap className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Usar Turbo",
    onButtonClick: handleTurboClick
  };

  return <ChatCard assistant={assistantData} />;
};
