
import React, { useState } from "react";
import { Zap } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { useNavigate } from "react-router-dom";

export const EpictusTurboCard: React.FC = () => {
  const navigate = useNavigate();
  
  const handleUseTurbo = () => {
    // Store state in localStorage to persist across page refresh
    localStorage.setItem("epictus-turbo-active", "true");
    // Force a refresh or redirect to the main Epictus IA page
    navigate("/epictus-ia?turbo=active");
    // Alternative: we could also use window.location.reload() to refresh the current page
  };

  const assistantData = {
    id: "epictus-turbo",
    title: "Epictus Turbo",
    description: "O único Agente de IA que você precisa para ter o boletim e desempenho dos sonhos, com apenas um comando, a revolução da educação começa aqui!",
    icon: <Zap className="h-6 w-6 text-white" />,
    badge: "Único",
    buttonText: "Usar Turbo",
    highlight: true,
    onButtonClick: handleUseTurbo
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 rounded-xl pointer-events-none"></div>
      <ChatCard assistant={assistantData} />
    </div>
  );
};
