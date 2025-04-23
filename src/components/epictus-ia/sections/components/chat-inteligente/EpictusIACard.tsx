import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { AnimatePresence, motion } from "framer-motion";
import { triggerEpictusModeRendering } from "@/lib/force-render";
import {
  Sparkles,
  Zap,
  ArrowRight
} from "lucide-react";

interface CardProps {
  active?: boolean;
}

export default function EpictusIACard({ active = false }: CardProps) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const handleUseEpictus = () => {
    // Disparar um evento para ativar o modo Epictus IA
    const event = new CustomEvent('activateEpictusMode', { 
      detail: { activated: true } 
    });
    window.dispatchEvent(event);

    // Atualizar a URL para indicar o modo
    window.history.pushState({}, "", "/epictus-ia?mode=epictus");

    // Forçar atualização da interface com timeout mais longo para garantir o processamento
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      
      // Forçar refresh da DOM para garantir renderização
      document.body.classList.add('epictus-mode-active');
      
      // Usar utilitário dedicado para garantir renderização
      triggerEpictusModeRendering();
      
      setTimeout(() => {
        document.body.classList.remove('epictus-mode-active');
        // Forçar um segundo disparo do evento após um tempo maior
        const refreshEvent = new CustomEvent('activateEpictusMode', { 
          detail: { activated: true, forced: true } 
        });
        window.dispatchEvent(refreshEvent);
      }, 150);
    }, 200);
  };

  return (
    <motion.div
      className={`relative rounded-xl overflow-hidden h-[360px] transition-all duration-300 ${
        active ? "border-2 border-blue-500" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D23A0] to-[#4A0D9F] z-0"></div>

      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] bg-repeat opacity-20 z-0"></div>

      {/* Animated gradient transition */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-[#1230CC] to-[#5B21BD] z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.8 : 0 }}
        transition={{ duration: 0.5 }}
      ></motion.div>

      {/* Glow effects */}
      <motion.div
        className="absolute -inset-[100px] bg-gradient-to-br from-[#0D23A0]/40 via-transparent to-[#5B21BD]/40 blur-3xl z-0"
        animate={{
          rotate: isHovered ? 15 : 0,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      ></motion.div>

      {/* Content container */}
      <div className="relative z-10 h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full blur-[8px] bg-white/30 group-hover:bg-white/40 transition-all"></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1230CC] to-[#4A0D9F] flex items-center justify-center relative border border-white/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-white flex items-center">
                Epictus IA
                <div className="ml-2 px-1.5 py-0.5 bg-gradient-to-r from-[#1230CC] to-[#4A0D9F] rounded-md text-[10px] font-semibold text-white flex items-center">
                  <Zap className="w-3 h-3 mr-0.5" />
                  PRO
                </div>
              </div>
              <div className="text-white/70 text-sm">Assistente avançado</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-5 text-white text-sm leading-relaxed">
          <p>O Epictus IA é nossa IA mais avançada, com acesso a recursos premium exclusivos e capacidades aprimoradas de processamento.</p>
        </div>

        {/* Features */}
        <div className="mt-4 space-y-3">
          <FeatureItem text="Processamento ultra-rápido com otimização neuronal" />
          <FeatureItem text="Acesso a fontes de dados exclusivas e atualizadas" />
          <FeatureItem text="Suporte a consultas complexas com análise profunda" />
          <FeatureItem text="Geração de conteúdo avançado em múltiplos formatos" />
          <FeatureItem text="Análise e correção de trabalhos com feedback detalhado" />
        </div>

        {/* Buttons */}
        <div className="mt-auto">
          <Button
            className="w-full bg-gradient-to-r from-[#1230CC] to-[#4A0D9F] hover:from-[#0D23A0] hover:to-[#5B21BD] text-white border-none"
            onClick={handleUseEpictus}
          >
            Usar Epictus
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sparkle animations */}
      <AnimatePresence>
        {isHovered && (
          <>
            <SparkleEffect 
              top="20%" 
              left="10%" 
              delay={0.1} 
              size={3} 
            />
            <SparkleEffect 
              top="70%" 
              left="20%" 
              delay={0.3} 
              size={2} 
            />
            <SparkleEffect 
              top="10%" 
              left="80%" 
              delay={0.2} 
              size={2.5} 
            />
            <SparkleEffect 
              top="50%" 
              left="85%" 
              delay={0.4} 
              size={3.5} 
            />
            <SparkleEffect 
              top="80%" 
              left="75%" 
              delay={0.5} 
              size={3} 
            />
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface FeatureItemProps {
  text: string;
}

function FeatureItem({ text }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-1 min-w-[16px]">
        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#1230CC] to-[#4A0D9F] flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3 h-3 text-white"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>
      <p className="text-white/80 text-sm">{text}</p>
    </div>
  );
}

interface SparkleEffectProps {
  top: string;
  left: string;
  delay: number;
  size: number;
}

function SparkleEffect({ top, left, delay, size }: SparkleEffectProps) {
  return (
    <motion.div
      className="absolute z-10 opacity-0"
      style={{
        top,
        left,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, size, 0],
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        repeatDelay: 3,
      }}
    >
      <Sparkles className="text-white/70" size={size} />
    </motion.div>
  );
}