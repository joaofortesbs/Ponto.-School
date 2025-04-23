
import React from "react";
import { GraduationCap } from "lucide-react";
import { ChatCard } from "./ChatCard";

export const EspacosAprendizadoCard: React.FC = () => {
  const handleEspacosAprendizadoActivation = () => {
    // Set a URL parameter to indicate Espaços de aprendizado mode is active
    window.history.pushState({}, "", "/epictus-ia?mode=espacos-aprendizado");
    
    // Dispatch a custom event that the parent component can listen for
    const event = new CustomEvent("activateEspacosAprendizadoMode", {
      detail: { mode: "espacos-aprendizado" }
    });
    window.dispatchEvent(event);
  };

  const assistantData = {
    id: "espacos-aprendizado",
    title: "Espaços de aprendizado",
    description: "Descubra ambientes virtuais de aprendizado imersivo e colaborativo que potencializam o conhecimento através de experiências interativas.",
    icon: <GraduationCap className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Explorar Espaços",
    onButtonClick: handleEspacosAprendizadoActivation
  };

  return <ChatCard assistant={assistantData} />;
};

export default EspacosAprendizadoCard;
