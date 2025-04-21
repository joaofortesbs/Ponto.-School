import React from "react";
import { Zap } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { useTurboMode } from "../../../context/TurboModeContext";

export const EpictusTurboCard: React.FC = () => {
  const { activateTurboMode } = useTurboMode();

  const handleTurboClick = () => {
    console.log("Clicou em usar Turbo");
    activateTurboMode();
  };

  const assistantData = {
    id: "epictus-turbo",
    title: "Epictus Turbo",
    description: "O único Agente de IA que você precisa para ter o boletim e desempenho dos sonhos, com apenas um comando. A revolução da educação começa aqui!",
    icon: <Zap className="h-5 w-5 text-white" />,
    badge: "Novo",
    buttonText: "Usar Turbo",
    onButtonClick: handleTurboClick
  };

  return <ChatCard assistant={assistantData} />;
};