
import React from "react";
import { Zap } from "lucide-react";
import { ChatCard } from "./ChatCard";

export const EpictusTurboCard: React.FC = () => {
  const assistantData = {
    id: "epictus-turbo",
    title: "Epictus Turbo",
    description: "O único Agente de IA que você precisa para ter o boletim e desempenho dos sonhos, com apenas um comando, a revolução da educação começa aqui!",
    icon: <Zap className="h-6 w-6 text-white transform rotate-12 drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]" />,
    badge: "Único",
    buttonText: "Usar Turbo",
    highlight: true
  };

  return (
    <div className="relative group">
      {/* Efeito moderno em volta do card - pulso suave */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] rounded-xl opacity-70 blur-md group-hover:opacity-100 transition duration-700 group-hover:duration-200 animate-pulse-slow"></div>
      
      {/* Fundo com padrão de grade sutil */}
      <div className="relative bg-white dark:bg-[#0A2540] rounded-xl p-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ 
            backgroundImage: "url('/images/pattern-grid.svg')", 
            backgroundSize: "20px 20px"
          }}
        ></div>
        
        <ChatCard assistant={assistantData} />
      </div>
    </div>
  );
};
