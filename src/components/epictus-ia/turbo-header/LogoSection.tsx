import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sparkles } from "lucide-react";

interface LogoSectionProps {
  isHovered: boolean;
  animationComplete: boolean;
  description?: string;
}

const LogoSection: React.FC<LogoSectionProps> = ({ isHovered, animationComplete, description = "IA para geração de conversas impecáveis para o público estudantil!" }) => {
  return (
    <div className="flex items-center gap-4 z-10 flex-1">
      <div className="relative group mr-3">
        <div className={`absolute inset-0 bg-gradient-to-br from-[#0055B8] via-[#00A7FF] to-[#4A0D9F] rounded-full ${isHovered ? 'blur-[6px]' : 'blur-[3px]'} opacity-80 group-hover:opacity-100 transition-all duration-300 scale-110`}></div>
        <motion.div 
          className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0055B8] to-[#00A7FF] flex items-center justify-center relative z-10 border-2 border-white/10 shadow-xl"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <AnimatePresence>
            {animationComplete ? (
              <motion.div
                key="icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center justify-center"
              >
                <span className="text-white font-bold text-lg">IA</span>
              </motion.div>
            ) : (
              <motion.div
                key="loading"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center"
              >
                <Sparkles className="h-6 w-6 text-white animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Epictus BETA
          </h1>
          <motion.div
            className="flex items-center px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#0078FF] to-[#00C2FF] text-xs font-medium text-white shadow-lg dropdown-isolate personalidades-root"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Zap className="h-3 w-3 mr-1" />
            Premium
          </motion.div>
        </div>
        <p className="text-white/70 text-sm mt-0.5 font-medium tracking-wide">
          {description}
        </p>
      </div>
    </div>
  );
};

export default LogoSection;