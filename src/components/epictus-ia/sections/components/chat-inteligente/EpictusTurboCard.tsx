
import React, { useState } from "react";
import { Zap } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { useNavigate } from "react-router-dom";

export const EpictusTurboCard: React.FC = () => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  
  const handleActivateTurbo = () => {
    console.log("Ativando modo Turbo...");
    // Armazenar no localStorage que o Turbo foi ativado
    localStorage.setItem("epictus_turbo_active", "true");
    // Mostrar animação de feedback antes de recarregar
    setTimeout(() => {
      // Recarregar a página atual para aplicar a interface Turbo
      window.location.reload();
    }, 300);
  };
  
  const assistantData = {
    id: "epictus-turbo",
    title: "Epictus Turbo",
    description: "O único Agente de IA que você precisa para ter o boletim e desempenho dos sonhos, com apenas um comando, a revolução da educação começa aqui!",
    icon: <Zap className="h-6 w-6 text-white" />,
    badge: "Único",
    buttonText: "Usar Turbo",
    highlight: true,
    onButtonClick: handleActivateTurbo,
    customHoverState: isHovering,
    setCustomHoverState: setIsHovering
  };

  return (
    <div 
      className="relative cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-10 rounded-xl pointer-events-none"></div>
      <ChatCard assistant={assistantData} />
    </div>
  );
};
