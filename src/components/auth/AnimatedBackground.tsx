
import React, { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";

export function AnimatedBackground() {
  const cursorRef = useRef(null);
  const controls = useAnimation();
  
  useEffect(() => {
    // Sequência de animação usando framer-motion
    const animateCursor = async () => {
      // Simular o caminho do cursor
      await controls.start({
        x: "20%",
        y: "30%",
        transition: { duration: 2, ease: "easeInOut" }
      });
      
      // Simular clique
      await controls.start({
        scale: 1.3,
        transition: { duration: 0.2, ease: "easeIn" }
      });
      
      await controls.start({
        scale: 1,
        transition: { duration: 0.2, ease: "easeOut" }
      });
      
      // Continuar o caminho
      await controls.start({
        x: "70%",
        y: "40%",
        transition: { duration: 2, ease: "easeInOut", delay: 0.2 }
      });
      
      // Simular outro clique
      await controls.start({
        scale: 1.3,
        transition: { duration: 0.2, ease: "easeIn" }
      });
      
      await controls.start({
        scale: 1,
        transition: { duration: 0.2, ease: "easeOut" }
      });
      
      // Continuar o caminho
      await controls.start({
        x: "10%",
        y: "60%",
        transition: { duration: 2, ease: "easeInOut", delay: 0.2 }
      });
      
      await controls.start({
        x: "40%",
        y: "20%",
        transition: { duration: 1.5, ease: "easeInOut" }
      });
      
      // Repetir a animação
      animateCursor();
    };
    
    animateCursor();
    
    return () => {
      controls.stop();
    };
  }, [controls]);
  
  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      {/* Círculos com gradiente animados para criar efeito visual no fundo */}
      <motion.div 
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-[#FF6B00]/5 to-[#FF8C40]/10 blur-3xl"
        animate={{
          x: ["-20%", "10%", "-10%"],
          y: ["-20%", "10%", "-10%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
        style={{ top: "10%", left: "30%" }}
      />
      
      <motion.div 
        className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-[#0064FF]/5 to-[#0097FB]/10 blur-3xl"
        animate={{
          x: ["10%", "-20%", "10%"],
          y: ["10%", "-10%", "5%"],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
        style={{ bottom: "20%", right: "10%" }}
      />
      
      {/* Grid pattern para dar profundidade */}
      <div className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] opacity-5" />
      
      {/* O cursor animado */}
      <motion.div 
        ref={cursorRef}
        className="absolute w-6 h-6 rounded-full border-2 border-[#FF6B00] bg-white/80 shadow-md transform-gpu z-10"
        style={{ filter: "drop-shadow(0 0 3px rgba(255, 107, 0, 0.5))" }}
        animate={controls}
        initial={{ x: "5%", y: "5%" }}
      >
        <motion.div 
          className="absolute inset-0.5 rounded-full bg-[#FF6B00]/30"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7] 
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  );
}
