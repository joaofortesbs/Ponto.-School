
import React, { useState } from "react";
import { Zap, Sparkles, Star } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const EpictusTurboCard: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);

  const assistantData = {
    id: "epictus-turbo",
    title: "Epictus Turbo",
    description: "O único Agente de IA que você precisa para ter o boletim e desempenho dos sonhos, com apenas um comando, a revolução da educação começa aqui!",
    icon: <Zap className="h-6 w-6 text-white" />,
    badge: "Novo",
    buttonText: "Usar Turbo",
    highlight: true
  };

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background effect elements */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 rounded-xl opacity-30 blur-xl group-hover:opacity-70 transition-all duration-700 group-hover:duration-500"></div>
      
      {/* Particle effects */}
      {isHovering && (
        <>
          <motion.div
            className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-blue-400"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1.5, 0],
              y: [0, -20, -40],
              x: [0, 10, 20]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
          />
          <motion.div
            className="absolute -top-2 -left-2 w-3 h-3 rounded-full bg-blue-300"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1.2, 0],
              y: [0, -15, -30],
              x: [0, -8, -16]
            }}
            transition={{ duration: 1.7, repeat: Infinity, repeatType: "loop", delay: 0.3 }}
          />
          <motion.div
            className="absolute top-1/2 -right-2 w-2 h-2 rounded-full bg-blue-200"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1.1, 0],
              x: [0, 15, 30]
            }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", delay: 0.6 }}
          />
        </>
      )}

      {/* Glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-xl bg-blue-500/20 opacity-0 transition-opacity duration-500",
        isHovering ? "opacity-100" : ""
      )}></div>

      {/* Star decorations */}
      <motion.div 
        className="absolute -top-1 -right-1 text-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        animate={isHovering ? { 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 0.9, 1] 
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles size={16} />
      </motion.div>
      
      <motion.div 
        className="absolute -bottom-1 -left-1 text-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        animate={isHovering ? { 
          rotate: [0, -10, 10, 0],
          scale: [1, 0.9, 1.1, 1] 
        } : {}}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        <Star size={16} />
      </motion.div>

      {/* Enhanced card */}
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.7)] group-hover:translate-y-[-5px]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-300 to-blue-500"></div>
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-300 to-blue-500"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-300"></div>
        
        <ChatCard assistant={assistantData} className="turbo-card" />
        
        {/* Pulse effect */}
        <motion.div 
          className="absolute inset-0 bg-blue-400 rounded-xl opacity-0"
          animate={isHovering ? { 
            opacity: [0, 0.2, 0],
            scale: [0.8, 1.05, 0.8],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </div>
  );
};
