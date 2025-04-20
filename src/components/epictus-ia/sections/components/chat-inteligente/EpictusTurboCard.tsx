
import React from "react";
import { Zap } from "lucide-react";
import { ChatCard } from "./ChatCard";

export const EpictusTurboCard: React.FC = () => {
  const assistantData = {
    id: "epictus-turbo",
    title: "Epictus Turbo",
    description: "O único Agente de IA que você precisa para ter o boletim e desempenho dos sonhos, com apenas um comando, a revolução da educação começa aqui!",
    icon: <Zap className="h-6 w-6 text-white transform rotate-12 shadow-[0_0_15px_rgba(255,255,255,0.7)] transition-all duration-300 hover:rotate-0 hover:scale-110" />,
    badge: "Único",
    buttonText: "Usar Turbo",
    highlight: true
  };

  return (
    <div className="relative group">
      {/* Efeito de contorno moderno com gradiente animado */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B00] via-[#FF9B50] to-[#FF6B00] rounded-xl opacity-80 blur-sm group-hover:opacity-100 transition-all duration-500 group-hover:blur-md animate-gradient-x"></div>
      
      {/* Card com fundo de grade */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        <ChatCard assistant={assistantData} />
      </div>
    </div>
  );
};
