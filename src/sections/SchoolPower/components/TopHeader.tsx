"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TopHeaderProps {
  isDarkTheme?: boolean;
  isQuizMode?: boolean;
  isMobile?: boolean;
}

const TopHeader: React.FC<TopHeaderProps> = ({ isDarkTheme = true, isQuizMode = false, isMobile = false }) => {
  const flipWords = [
    "estudar",
    "planejar",
    "programar",
    "construir",
    "compartilhar",
  ];

  // Função para obter a saudação baseada no horário atual
  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    // 00:01 até 05:00
    if (timeInMinutes >= 1 && timeInMinutes <= 300) {
      return "Boa madrugada";
    }
    // 05:01 até 11:59
    else if (timeInMinutes >= 301 && timeInMinutes <= 719) {
      return "Bom dia";
    }
    // 12:00 até 18:30
    else if (timeInMinutes >= 720 && timeInMinutes <= 1110) {
      return "Boa tarde";
    }
    // 18:31 até 00:00
    else {
      return "Boa noite";
    }
  };

  const [greeting, setGreeting] = useState(getGreeting());

  // Atualizar a saudação a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border-b border-white/10 ${isMobile ? 'px-3 py-3' : 'px-6 py-4'}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo e título */}
        <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
          <motion.div
            whileHover={{ scale: isMobile ? 1.02 : 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`${isMobile ? 'p-2' : 'p-3'} bg-gradient-to-br from-orange-500 to-orange-600 ${isMobile ? 'rounded-xl' : 'rounded-2xl'} shadow-lg`}
          >
            <img
              src="/lovable-uploads/Logo-Ponto.School-Icone.png"
              alt="Logo Ponto School"
              className={`${isMobile ? 'w-5 h-5' : 'w-7 h-7'} object-contain`}
              style={{
                filter: "brightness(1.1) contrast(1.1)",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                WebkitUserDrag: "none",
                WebkitTouchCallout: "none",
              }}
              draggable={false}
            />
          </motion.div>

          <div>
            <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white tracking-tight`}>
              School Power
            </h1>
            <p className={`text-orange-300 ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
              IA Pedagógica Avançada
            </p>
          </div>
        </div>

        {/* Badge de status */}
        <motion.div
          whileHover={{ scale: isMobile ? 1.01 : 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'} bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-full ${isMobile ? 'px-2 py-1' : 'px-4 py-2'}`}
        >
          <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-green-400 rounded-full animate-pulse`}></div>
          <span className={`text-green-300 ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
            {isMobile ? 'Ativo' : 'Sistema Ativo'}
          </span>
          <Sparkles className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-green-400`} />
        </motion.div>
      </div>
    </motion.div>
  );
};

// FlipWords component
export const FlipWords = ({ words, duration = 3000, className, style }: any) => {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = React.useCallback(() => {
    const word = words[words.indexOf(currentWord) + 1] || words[0];
    setCurrentWord(word);
    setIsAnimating(true);
  }, [currentWord, words]);

  useEffect(() => {
    if (!isAnimating)
      setTimeout(() => {
        startAnimation();
      }, duration);
  }, [isAnimating, duration, startAnimation]);

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 60,
        damping: 15,
      }}
      exit={{
        opacity: 0,
        y: -20,
        x: 20,
        filter: "blur(4px)",
        scale: 1.2,
        position: "absolute",
      }}
      className={`z-10 inline-block relative text-center px-2 ${className}`}
      style={style}
      key={currentWord}
      onAnimationComplete={() => setIsAnimating(false)}
    >
      {currentWord.split(" ").map((word: string, wordIndex: number) => (
        <motion.span
          key={word + wordIndex}
          initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: wordIndex * 0.4,
            duration: 0.5,
          }}
          className="inline-block whitespace-nowrap"
        >
          {word.split("").map((letter: string, letterIndex: number) => (
            <motion.span
              key={word + letterIndex}
              initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                delay: wordIndex * 0.4 + letterIndex * 0.08,
                duration: 0.4,
              }}
              className="inline-block"
            >
              {letter}
            </motion.span>
          ))}
          <span className="inline-block">&nbsp;</span>
        </motion.span>
      ))}
    </motion.div>
  );
};

export default TopHeader;