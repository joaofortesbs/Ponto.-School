import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, MessageSquare, Lightbulb, Sparkles, Zap, ChevronRight, Star, ArrowRight, Play, Users, BookOpen, Target, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EpictusIACopilotoCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  // Estados para controlar diferentes aspectos do card
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome = useState(true);
  const [isInteractive, setIsInteractive] = useState(false);

  return (
    <motion.div 
      className={`rounded-xl overflow-hidden ${isLightMode ? 'bg-white' : 'bg-gradient-to-br from-[#001e3a] to-[#00162b]'} shadow-lg ${isLightMode ? 'border border-gray-200' : 'border border-white/10'} h-full self-start flex flex-col overflow-y-auto grid-cell`}
      style={{ minHeight: '600px' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header elegante com gradiente personalizado para Epictus IA */}
      <div className={`p-6 relative ${isLightMode ? 'bg-gradient-to-r from-orange-50 to-orange-100/50' : 'bg-gradient-to-r from-[#0A2540]/80 to-[#001427]'} border-b ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg flex items-center justify-center ${isLightMode ? 'bg-white shadow-sm border border-orange-200' : 'bg-[#FF6B00]/15 shadow-lg shadow-[#FF6B00]/5 border border-[#FF6B00]/30'}`}>
              <Brain className={`h-5 w-5 text-[#FF6B00]`} />
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                Epictus IA
              </h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                <span className="font-medium">Seu copiloto inteligente</span>
              </p>
            </div>
          </div>

          <div className="hidden md:flex">
            <motion.button 
              className={`rounded-full p-2 ${isLightMode ? 'bg-orange-50 hover:bg-orange-100' : 'bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20'} transition-colors`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className={`h-4 w-4 ${isLightMode ? 'text-[#FF6B00]' : 'text-[#FF6B00]'}`} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Como posso te ajudar hoje?"
            className={`w-full p-4 rounded-xl border resize-none transition-all duration-200 ${
              isLightMode
                ? "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-orange-500"
                : "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-700 focus:border-orange-500"
            } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
            rows={3}
          />

          <Button
            onClick={handleSubmit}
            disabled={!pergunta.trim() || isTyping}
            className="absolute bottom-3 right-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg px-4 py-2 disabled:opacity-50"
          >
            {isTyping ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <p className={`text-sm font-medium ${isLightMode ? "text-gray-700" : "text-gray-300"}`}>
                Sugestões rápidas:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {sugestoes.map((sugestao, index) => {
                  const IconComponent = sugestao.icon;
                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSuggestionClick(sugestao.texto)}
                      className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                        isLightMode
                          ? "bg-gray-50 border-gray-200 hover:bg-orange-50 hover:border-orange-300 text-gray-700"
                          : "bg-gray-800 border-gray-600 hover:bg-orange-900/20 hover:border-orange-500 text-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-medium text-orange-500">
                          {sugestao.categoria}
                        </span>
                      </div>
                      <p className="text-sm leading-tight">
                        {sugestao.texto}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-orange-500"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-orange-500 rounded-full"
            />
            <span className="text-sm">Epictus está pensando...</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}