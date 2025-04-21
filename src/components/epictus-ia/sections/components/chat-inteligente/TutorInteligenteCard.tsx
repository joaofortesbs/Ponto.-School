
import React from "react";
import { Book } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { useTurboMode } from "../../../context/TurboModeContext";

export const TutorInteligenteCard: React.FC = () => {
  const { activateTurboMode } = useTurboMode();

  const handleLearnClick = () => {
    console.log("Botão Aprender clicado no TutorInteligenteCard!");
    // Podemos adicionar funcionalidade específica aqui se necessário
    activateTurboMode(); // Usando a mesma função para manter a consistência
  };

  const assistantData = {
    id: "tutor-inteligente",
    title: "Tutor Inteligente",
    description: "Receba explicações detalhadas sobre qualquer assunto acadêmico, com exemplos e diferentes níveis de profundidade.",
    icon: <Book className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Aprender",
    onButtonClick: handleLearnClick
  };

  return <ChatCard assistant={assistantData} />;
};
