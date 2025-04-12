
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const AnimatedBackground: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cursorRef.current || !containerRef.current) return;

    // Função para manipular a animação do cursor
    const handleMouseAnimation = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const keyframes = [
        { x: container.clientWidth * 0.2, y: container.clientHeight * 0.3, scale: 1 },
        { x: container.clientWidth * 0.7, y: container.clientHeight * 0.2, scale: 1.2 },
        { x: container.clientWidth * 0.5, y: container.clientHeight * 0.6, scale: 1 },
        { x: container.clientWidth * 0.3, y: container.clientHeight * 0.7, scale: 1.2 },
        { x: container.clientWidth * 0.2, y: container.clientHeight * 0.3, scale: 1 }
      ];
      
      let currentKeyframe = 0;
      
      // Implementação manual da animação
      const animateCursor = () => {
        if (!cursorRef.current) return;
        
        const cursor = cursorRef.current;
        const target = keyframes[currentKeyframe];
        
        // Calcula a posição atual do cursor
        const rect = cursor.getBoundingClientRect();
        const currentX = rect.left;
        const currentY = rect.top;
        
        // Calcula a nova posição
        const dx = (target.x - currentX) * 0.05;
        const dy = (target.y - currentY) * 0.05;
        
        // Atualiza a posição do cursor
        cursor.style.transform = `translate(${currentX + dx}px, ${currentY + dy}px) scale(${target.scale})`;
        
        // Verifica se chegou próximo do alvo
        if (Math.abs(currentX - target.x) < 5 && Math.abs(currentY - target.y) < 5) {
          currentKeyframe = (currentKeyframe + 1) % keyframes.length;
          
          // Simula um clique quando muda de keyframe
          cursor.classList.add("click");
          setTimeout(() => {
            if (cursor) cursor.classList.remove("click");
          }, 300);
        }
        
        requestAnimationFrame(animateCursor);
      };
      
      animateCursor();
    };
    
    handleMouseAnimation();
    
    // Limpa a animação quando o componente é desmontado
    return () => {
      cancelAnimationFrame(0); // Cancela qualquer animação pendente
    };
  }, []);

  return (
    <div className="banner absolute inset-0 z-0 overflow-hidden" ref={containerRef}>
      {/* Gradiente animado de fundo */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-blue-900/70 to-blue-800/60"
        animate={{ 
          background: [
            "linear-gradient(135deg, rgba(8,27,75,0.8) 0%, rgba(15,35,95,0.7) 50%, rgba(25,55,125,0.6) 100%)",
            "linear-gradient(135deg, rgba(15,35,95,0.8) 0%, rgba(25,55,125,0.7) 50%, rgba(8,27,75,0.6) 100%)",
            "linear-gradient(135deg, rgba(25,55,125,0.8) 0%, rgba(8,27,75,0.7) 50%, rgba(15,35,95,0.6) 100%)"
          ]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      {/* Padrão de grade */}
      <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
      
      {/* Círculos decorativos */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full filter blur-3xl opacity-70" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl opacity-70" />
      
      {/* Animação do cursor */}
      <div className="mouse-animation">
        <div 
          ref={cursorRef} 
          className="cursor w-8 h-8 rounded-full bg-white/80 shadow-lg shadow-blue-400/20 transition-transform duration-75"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-80 animate-pulse-soft" />
        </div>
      </div>
      
      {/* Partículas flutuantes */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-white/30"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Linhas de conexão */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
        <motion.line 
          x1="10%" y1="30%" x2="40%" y2="50%" 
          stroke="white" 
          strokeWidth="0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.line 
          x1="30%" y1="10%" x2="70%" y2="40%" 
          stroke="white" 
          strokeWidth="0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        />
        <motion.line 
          x1="70%" y1="20%" x2="90%" y2="60%" 
          stroke="white" 
          strokeWidth="0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 2 }}
        />
      </svg>
      
      <style jsx>{`
        .cursor.click {
          transform: scale(1.5);
          opacity: 0.9;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .bg-grid-white {
          background-size: 25px 25px;
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;
