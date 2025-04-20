
import React, { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const EpictusTurboCard: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Efeito para atualizar a posição do mouse para efeito 3D
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5
    });
  };

  const assistantData = {
    id: "epictus-turbo",
    title: "Epictus Turbo",
    description: "O único Agente de IA que você precisa para ter o boletim e desempenho dos sonhos, com apenas um comando, a revolução da educação começa aqui!",
    icon: (
      <div className="relative flex items-center justify-center">
        <div className="absolute z-0 w-8 h-8 bg-blue-500/30 rounded-full blur-md animate-pulse"></div>
        <motion.div
          className="relative z-10"
          animate={isHovering ? {
            rotateY: [0, 10, -10, 0],
            rotateX: [0, -10, 10, 0],
            scale: [1, 1.1, 0.95, 1],
          } : {}}
          transition={{ duration: 1.5, repeat: isHovering ? Infinity : 0 }}
          style={{
            transform: isHovering ? `perspective(800px) rotateX(${mousePosition.y * 20}deg) rotateY(${-mousePosition.x * 20}deg)` : 'none',
            transformStyle: 'preserve-3d',
          }}
        >
          <Zap className="h-6 w-6 text-white drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
        </motion.div>
      </div>
    ),
    badge: "Único",
    buttonText: "Usar Turbo",
    highlight: true
  };

  return (
    <div 
      className="relative w-full group perspective"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Grade em movimento no fundo com padrão mais sutil e elegante */}
      <div className="absolute inset-0 rounded-xl overflow-hidden z-0 opacity-20 group-hover:opacity-50 transition-opacity duration-500">
        <div className="absolute inset-0 bg-grid-pattern animate-grid-flow"></div>
        {/* Camada adicional de grade para efeito de profundidade */}
        <div className="absolute inset-0 bg-grid-pattern-large animate-grid-flow-slow opacity-50"></div>
        {/* Brilho sutil nas interseções da grade */}
        <div className="absolute inset-0 grid-glow"></div>
      </div>
      
      {/* Efeito de borda animada sofisticada */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-xl blur-sm opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-500 animate-gradient-x z-0"></div>
      
      {/* Efeito de partículas suaves */}
      {isHovering && (
        <>
          <motion.div
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-300"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 0],
              y: [0, -20, -40],
              x: [0, 10, 20]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
          />
          <motion.div
            className="absolute bottom-5 -right-1 w-1.5 h-1.5 rounded-full bg-cyan-300"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 0],
              y: [0, -15, -30],
              x: [0, -8, -16]
            }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: "loop", delay: 0.5 }}
          />
          <motion.div
            className="absolute top-1/2 -left-1 w-1 h-1 rounded-full bg-blue-200"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 0],
              x: [0, -15, -30]
            }}
            transition={{ duration: 2.2, repeat: Infinity, repeatType: "loop", delay: 1 }}
          />
        </>
      )}
      
      {/* Card com transformação 3D suave */}
      <div
        className={cn(
          "relative z-10 transition-transform duration-500",
          isHovering ? "transform-gpu" : ""
        )}
        style={{
          transform: isHovering 
            ? `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg) scale3d(1.02, 1.02, 1.02)` 
            : 'none',
        }}
      >
        <ChatCard assistant={assistantData} />
      </div>
    </div>
  );
};
