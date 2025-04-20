
import React from "react";
import { Zap } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { useNavigate } from "react-router-dom";

export const EpictusTurboCard: React.FC = () => {
  const navigate = useNavigate();
  
  const handleActivateTurbo = () => {
    // Armazenar no localStorage que o Turbo foi ativado
    localStorage.setItem("epictus_turbo_active", "true");
    // Recarregar a página atual para aplicar a interface Turbo
    window.location.reload();
  };
  
  const assistantData = {
    id: "epictus-turbo",
    title: "Epictus Turbo",
    description: "O único Agente de IA que você precisa para ter o boletim e desempenho dos sonhos, com apenas um comando, a revolução da educação começa aqui!",
    icon: <Zap className="h-6 w-6 text-white" />,
    badge: "Único",
    buttonText: "Usar Turbo",
    highlight: true,
    onButtonClick: handleActivateTurbo
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 rounded-xl pointer-events-none"></div>
      <ChatCard assistant={assistantData} />
    </div>
  );
};
