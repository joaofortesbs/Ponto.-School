
import React from "react";
import { Zap } from "lucide-react";
import { ChatCard } from "./ChatCard";

export const EpictusTurboCard: React.FC = () => {
  const assistantData = {
    id: "epictus-turbo",
    title: "Epictus Turbo",
    description: "O único Agente de IA que você precisa para ter o boletim e desempenho dos sonhos, com apenas um comando, a revolução da educação começa aqui!",
    icon: <Zap className="h-6 w-6 text-white transform rotate-12 shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-300 hover:scale-110" />,
    badge: "Único",
    buttonText: "Usar Turbo",
    highlight: true
  };

  return (
    <div className="relative">
      {/* Card com fundo de grade */}
      <div className="relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none rounded-xl"></div>
        <ChatCard assistant={assistantData} />
      </div>
    </div>
  );
};
