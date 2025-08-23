"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TopHeaderProps {
  isDarkTheme?: boolean;
  isQuizMode?: boolean;
}

const TopHeader: React.FC<TopHeaderProps> = ({ isDarkTheme = true, isQuizMode = false }) => {
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
    <div className="flex flex-col items-center justify-center min-h-full bg-transparent p-2 gap-2">
      <div className="relative">
        {/* Aura externa */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, rgba(249, 115, 22, 0.05) 50%, transparent 70%)",
            transform: "scale(0.9)",
            filter: "blur(25px)",
            animation: "pulse 4s ease-in-out infinite alternate",
          }}
        />

        {/* Aura média */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, rgba(251, 146, 60, 0.1) 60%, transparent 80%)",
            transform: "scale(0.7)",
            filter: "blur(18px)",
            animation: "pulse 3s ease-in-out infinite alternate",
          }}
        />

        {/* Círculo principal */}
        <div
          className="relative w-20 h-20 rounded-full overflow-hidden"
          style={{
            background: "#111827",
            border: "3px solid transparent",
            backgroundImage: `
              linear-gradient(#111827, #111827),
              linear-gradient(45deg,
                #f97316 0%,
                #fb923c 20%,
                #fdba74 40%,
                #fbbf24 60%,
                #fb923c 80%,
                #f97316 100%
              )
            `,
            backgroundOrigin: "border-box",
            backgroundClip: "content-box, border-box",
            boxShadow: `
              0 0 12px rgba(249, 115, 22, 0.12),
              0 0 25px rgba(249, 115, 22, 0.06),
              inset 0 0 30px rgba(249, 115, 22, 0.03),
              inset 0 -15px 30px rgba(0, 0, 0, 0.4),
              inset 0 15px 30px rgba(255, 255, 255, 0.15),
              0 8px 25px rgba(0, 0, 0, 0.3),
              0 -8px 25px rgba(249, 115, 22, 0.03)
            `,
            transform: "perspective(1000px) rotateX(15deg)",
          }}
        >
          {/* Imagem quadrada */}
          <div className="w-full h-full flex items-center justify-center p-3">
            <div className="w-14 h-14 overflow-hidden pointer-events-none select-none">
              <img
                src="/lovable-uploads/Logo-Ponto.School-Icone.png"
                alt="Logo Ponto School"
                className="w-full h-full object-contain"
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
            </div>
          </div>

          {/* Reflexo 3D */}
          <div
            className="absolute top-1 left-1 w-5 h-5 rounded-full opacity-30"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, transparent 70%)",
              filter: "blur(6px)",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px) scale(1);
          }
          100% {
            transform: translateY(-8px) scale(1.1);
          }
        }
      `}</style>

      {/* Texto com FlipWords abaixo do círculo */}
      <div className="text-center max-w-2xl space-y-0.5">
        {/* Primeira linha: Saudação */}
        <div
          className="text-xl font-bold tracking-tight leading-tight"
          style={{
            fontFamily:
              "'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'",
            fontWeight: "700",
            letterSpacing: "-0.02em",
            color: isDarkTheme ? "white" : "#1f2937",
          }}
        >
          <span
            className={
              isDarkTheme
                ? "bg-gradient-to-r from-slate-100 via-white to-slate-100 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-gray-900 via-black to-gray-900 bg-clip-text text-transparent"
            }
          >
            {isQuizMode ? "Bom dia, professor!" : `Bom dia, João!`}
          </span>
        </div>

        {/* Segunda linha: Pergunta com FlipWords */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 text-lg font-semibold tracking-tight"
          style={{
            fontFamily:
              "'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'",
            fontWeight: "600",
            letterSpacing: "-0.01em",
            color: isDarkTheme ? "white" : "#374151",
          }}
        >
          <span
            className={
              isDarkTheme
                ? "bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 bg-clip-text text-transparent"
            }
          >
            O que vamos
          </span>
          <FlipWords
            words={flipWords}
            duration={5000}
            className={`font-bold text-lg ${isDarkTheme ? "text-orange-500" : "text-orange-700"}`}
            style={{
              fontFamily:
                "'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'",
              fontWeight: "700",
              letterSpacing: "-0.02em",
            }}
          />
          <span
            className={
              isDarkTheme
                ? "bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 bg-clip-text text-transparent"
            }
          >
            hoje?
          </span>
        </div>
      </div>
    </div>
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