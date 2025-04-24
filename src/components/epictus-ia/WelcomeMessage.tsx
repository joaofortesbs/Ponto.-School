
import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const WelcomeMessage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-3xl mx-auto px-4 text-center"
    >
      <div className="bg-gradient-to-r from-[#001e59]/80 to-[#003399]/80 p-6 rounded-xl border border-[#39c2ff]/20 shadow-lg backdrop-blur-sm relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        {/* Glowing orbs */}
        <motion.div 
          className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-[#0099ff]/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 0.5,
          }}
        />
        
        {/* Icon and title */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative mr-3">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0047e1] via-[#0064ff] to-[#00a9ff] rounded-full blur-[3px] opacity-80 scale-110"></div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0047e1] to-[#00a9ff] flex items-center justify-center relative z-10 border border-[#39c2ff]/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">Bem-vindo ao Epictus IA</h2>
        </div>
        
        {/* Welcome text */}
        <p className="text-white/90 mb-4">
          Aqui você encontrará recursos poderosos de inteligência artificial para otimizar seus estudos.
          Faça perguntas, obtenha explicações detalhadas e explore novos conhecimentos.
        </p>
        
        {/* Quick suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
          <SuggestionButton text="Como elaborar um plano de estudos?" />
          <SuggestionButton text="Explique um conceito difícil" />
          <SuggestionButton text="Auxílio com resolução de exercícios" />
          <SuggestionButton text="Sugestões de material complementar" />
        </div>
      </div>
    </motion.div>
  );
};

// Componente auxiliar para os botões de sugestão
const SuggestionButton: React.FC<{ text: string }> = ({ text }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white/10 hover:bg-white/15 text-white text-sm py-2 px-3 rounded-lg border border-white/20 text-left transition-all"
    >
      {text}
    </motion.button>
  );
};

export default WelcomeMessage;
