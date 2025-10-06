
import React, { useState } from "react";
import { Brain, Settings, Sparkles } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";

export default function EpictusIACard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  return (
    <motion.div 
      className={`rounded-xl overflow-hidden ${isLightMode ? 'bg-white' : 'bg-gradient-to-br from-[#001e3a] to-[#00162b]'} shadow-lg ${isLightMode ? 'border border-gray-200' : 'border border-white/10'} flex-shrink-0 flex flex-col h-full w-full`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header personalizado para Epictus IA */}
      <div className={`p-5 relative ${isLightMode ? 'bg-gradient-to-r from-purple-50 to-purple-100/50' : 'bg-gradient-to-r from-[#0A2540]/80 to-[#001427]'} border-b ${isLightMode ? 'border-purple-100' : 'border-purple-500/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg flex items-center justify-center ${isLightMode ? 'bg-white shadow-sm border border-purple-200' : 'bg-purple-500/15 shadow-lg shadow-purple-500/5 border border-purple-500/30'}`}>
              <Brain className={`h-5 w-5 text-purple-500`} />
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                Epictus IA
              </h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                Seu copiloto inteligente
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex">
            <motion.button 
              className={`rounded-full p-2 ${isLightMode ? 'bg-purple-50 hover:bg-purple-100' : 'bg-purple-500/10 hover:bg-purple-500/20'} transition-colors`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className={`h-4 w-4 ${isLightMode ? 'text-purple-500' : 'text-purple-500'}`} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center space-y-4">
            <div className={`w-16 h-16 rounded-full ${isLightMode ? 'bg-purple-100' : 'bg-purple-500/20'} flex items-center justify-center mx-auto`}>
              <Sparkles className={`h-8 w-8 ${isLightMode ? 'text-purple-500' : 'text-purple-400'}`} />
            </div>
            <div>
              <h4 className={`text-lg font-semibold ${isLightMode ? 'text-gray-800' : 'text-white'} mb-2`}>
                Epictus IA disponível
              </h4>
              <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'} max-w-xs mx-auto`}>
                Converse com sua IA pessoal para tirar dúvidas, criar conteúdos e muito mais.
              </p>
            </div>
            <motion.button
              className={`px-6 py-2.5 rounded-lg font-medium text-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm hover:shadow-md transition-all`}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => window.location.href = "/epictus-ia"}
            >
              Abrir Epictus IA
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
