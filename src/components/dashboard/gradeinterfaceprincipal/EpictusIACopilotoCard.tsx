
import React, { useState, useEffect } from "react";
import { Brain, Lightbulb, Send, ArrowRight, BarChart2, Sparkles, Zap, Check, Star, Wand2, Rocket, BookOpen, LucideIcon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function EpictusIACopilotoCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [pergunta, setPergunta] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const sugestoes = [
    {
      icon: BookOpen,
      texto: "Como posso melhorar meus estudos?",
      categoria: "Estudos"
    },
    {
      icon: BarChart2,
      texto: "Quais são minhas métricas de progresso?",
      categoria: "Progresso"
    },
    {
      icon: Lightbulb,
      texto: "Preciso de dicas para organizar minha rotina",
      categoria: "Organização"
    },
    {
      icon: Rocket,
      texto: "Como acelerar meu aprendizado?",
      categoria: "Produtividade"
    }
  ];

  const handleSuggestionClick = (texto: string) => {
    setPergunta(texto);
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    if (!pergunta.trim()) return;
    
    setIsTyping(true);
    setShowSuggestions(false);
    
    // Simular resposta da IA
    setTimeout(() => {
      setIsTyping(false);
      setPergunta("");
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-6 rounded-2xl shadow-lg border transition-all duration-300 ${
        isLightMode 
          ? "bg-white border-gray-200 shadow-gray-100" 
          : "bg-[#1a1a2e] border-gray-700 shadow-black/20"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
          />
        </div>
        <div>
          <h3 className={`font-semibold text-lg ${isLightMode ? "text-gray-900" : "text-white"}`}>
            Epictus IA
          </h3>
          <p className={`text-sm ${isLightMode ? "text-gray-600" : "text-gray-400"}`}>
            Seu Copiloto Inteligente
          </p>
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
