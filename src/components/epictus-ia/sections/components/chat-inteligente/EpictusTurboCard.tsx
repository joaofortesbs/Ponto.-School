
import React, { useEffect, useRef } from "react";
import { Zap, Sparkles, Star } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { motion } from "framer-motion";

export const EpictusTurboCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Adicionar partículas animadas ao card
    const createParticles = () => {
      if (!cardRef.current) return;
      
      const card = cardRef.current;
      const numParticles = 12;
      
      // Remover partículas anteriores se existirem
      const existingParticles = card.querySelectorAll('.turbo-particle');
      existingParticles.forEach(particle => particle.remove());
      
      // Criar novas partículas
      for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('turbo-particle');
        
        // Posicionar aleatoriamente
        const size = Math.random() * 6 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Animar
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${Math.random() * 3 + 4}s`;
        
        card.appendChild(particle);
      }
    };
    
    createParticles();
    const interval = setInterval(createParticles, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const assistantData = {
    id: "epictus-turbo",
    title: "Epictus Turbo",
    description: "O único Agente de IA que você precisa para ter o boletim e desempenho dos sonhos, com apenas um comando, a revolução da educação começa aqui!",
    icon: (
      <div className="relative">
        <Zap className="h-6 w-6 text-white z-10 relative" />
        <div className="absolute inset-0 animate-ping-slow opacity-75">
          <Zap className="h-6 w-6 text-white" />
        </div>
      </div>
    ),
    badge: "Premium",
    buttonText: "Usar Turbo",
    highlight: true,
    customClass: "epictus-turbo-card"
  };

  return (
    <div 
      ref={cardRef} 
      className="group relative"
    >
      {/* Aura externa pulsante */}
      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 animate-pulse-slow transition duration-200"></div>
      
      {/* Efeito de estrelas orbitando */}
      <div className="absolute w-full h-full">
        <motion.div 
          className="absolute top-0 right-0"
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Star className="h-4 w-4 text-yellow-300 opacity-80" />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-0 left-0"
          animate={{
            rotate: [0, -360]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Star className="h-3 w-3 text-yellow-300 opacity-70" />
        </motion.div>
        
        <motion.div 
          className="absolute top-1/2 left-1/4"
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Sparkles className="h-3 w-3 text-yellow-300 opacity-60" />
        </motion.div>
      </div>
      
      <motion.div 
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <ChatCard assistant={assistantData} />
      </motion.div>
      
      {/* Badges de "Popular" e "Recomendado" */}
      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold py-1 px-3 rounded-full transform rotate-3 shadow-lg z-20">
        NOVO
      </div>
      
      <div className="absolute -top-2 left-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold py-1 px-3 rounded-full transform -rotate-3 shadow-lg z-20">
        POPULAR
      </div>
    </div>
  );
};
