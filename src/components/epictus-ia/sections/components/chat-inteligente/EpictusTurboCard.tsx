
import React, { useEffect, useRef } from "react";
import { Zap, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";

export const EpictusTurboCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  // Efeito para inicializar as partículas
  useEffect(() => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const createParticles = () => {
      for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-2 h-2 rounded-full bg-orange-400 opacity-0';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.bottom = '0';
        particle.style.animation = `float-particle ${2 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 2}s`;
        card.appendChild(particle);
      }
    };
    
    createParticles();
    
    // Cleanup
    return () => {
      const particles = card.querySelectorAll('.bg-orange-400');
      particles.forEach(particle => particle.remove());
    };
  }, []);

  // Handler para efeito de luz no hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    card.style.setProperty('--x', `${x * 100}%`);
    card.style.setProperty('--y', `${y * 100}%`);
  };

  return (
    <div ref={cardRef} className="perspective relative group">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.1
        }}
        className="w-full"
      >
        <Card
          className={`
            p-5 h-full overflow-hidden relative
            border-2 animate-pulse-border
            ${theme === "dark" 
              ? "bg-gradient-to-br from-orange-900/50 via-orange-800/30 to-orange-900/50 border-orange-500/50" 
              : "bg-gradient-to-br from-orange-50 via-white to-orange-50 border-orange-400/50"}
            hover:shadow-2xl transition-all duration-500
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-400/0 
            before:via-orange-400/20 before:to-orange-400/0 before:animate-gradient-x
            transform-gpu group-hover:scale-[1.02] group-hover:-translate-y-1
          `}
          onMouseMove={handleMouseMove}
          style={{ 
            transformStyle: 'preserve-3d',
            boxShadow: theme === 'dark' 
              ? '0 0 20px rgba(249, 115, 22, 0.2), 0 0 30px rgba(249, 115, 22, 0.1)' 
              : '0 10px 30px -10px rgba(249, 115, 22, 0.3)'
          }}
        >
          {/* Fundo animado */}
          <div className="absolute inset-0 opacity-20 bg-grid-pattern"></div>
          
          {/* Gradiente de brilho no hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-radial-gradient" 
               style={{ 
                 background: 'radial-gradient(circle at var(--x) var(--y), rgba(249, 115, 22, 0.7), transparent 60%)',
                 transition: 'opacity 0.5s ease-out'
               }}></div>
          
          {/* Ícone superior animado */}
          <div className="relative z-10 flex justify-between items-start mb-4">
            <motion.div
              whileHover={{ 
                scale: 1.1, 
                rotate: [0, -5, 5, -5, 0],
                transition: { duration: 0.5 }
              }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: 'translateZ(20px)'
              }}
            >
              <div className="absolute w-full h-full rounded-full animate-pulse-slow opacity-50 bg-orange-500"></div>
              <div className="relative flex items-center justify-center">
                <Zap className="h-6 w-6 text-white drop-shadow-md" />
                <Sparkles className="h-3 w-3 text-yellow-200 absolute top-0 right-0 animate-pulse" />
              </div>
            </motion.div>

            <Badge 
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 
                       text-white font-semibold py-1 px-2 shadow-md shadow-orange-500/20
                       animate-pulse-slow transform-gpu z-10"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: 'translateZ(15px)'
              }}
            >
              <Star className="h-3 w-3 text-yellow-200 mr-1 inline-block" />
              Novo
            </Badge>
          </div>

          {/* Título com efeito de destaque */}
          <motion.h3 
            className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"} inline-block relative z-10`}
            style={{ 
              transformStyle: 'preserve-3d',
              transform: 'translateZ(25px)',
              textShadow: theme === 'dark' ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
            }}
            whileHover={{ scale: 1.05 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-400 animate-gradient-x">
              Epictus Turbo
            </span>
            <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-orange-500 to-orange-300 transition-all duration-500 mt-1"></div>
          </motion.h3>

          {/* Descrição com animação */}
          <motion.p 
            className={`text-sm mb-5 ${theme === "dark" ? "text-gray-300" : "text-gray-600"} relative z-10 leading-relaxed`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ 
              transformStyle: 'preserve-3d',
              transform: 'translateZ(15px)'
            }}
          >
            O único Agente de IA que você precisa para ter o boletim e desempenho dos sonhos, com apenas um comando, a revolução da educação começa aqui!
          </motion.p>

          {/* Botão com efeitos */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="relative z-10"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: 'translateZ(30px)'
            }}
          >
            <Button 
              className="mt-auto w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 
                       text-white flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 
                       border border-orange-400/20 overflow-hidden group relative py-6"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-400/0 via-orange-400/40 to-orange-400/0 
                           -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              <Zap className="h-5 w-5 text-white group-hover:animate-bounce" />
              <span className="font-medium tracking-wide">Usar Turbo</span>
            </Button>
          </motion.div>

          {/* Partículas brilhantes */}
          <div className="absolute bottom-0 left-0 w-full h-20 pointer-events-none z-0">
            {/* As partículas são criadas dinamicamente pelo useEffect */}
          </div>
          
          {/* Destaque de borda */}
          <div className="absolute inset-0 border-2 border-orange-400/0 group-hover:border-orange-400/50 
                        rounded-lg transition-colors duration-700"></div>
          
          {/* Efeito de brilho do canto */}
          <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-orange-500/20 blur-2xl rounded-full 
                        group-hover:bg-orange-500/30 transition-all duration-700"></div>
        </Card>
      </motion.div>
    </div>
  );
};
