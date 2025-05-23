import React, { useState } from "react";
import { Brain, Lightbulb, Send, ArrowRight, BarChart2, Sparkles } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function EpictusIACopilotoCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [pergunta, setPergunta] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Tratar envio de pergunta rápida para a IA
  const handleEnviarPergunta = (e) => {
    e.preventDefault();
    if (pergunta.trim()) {
      console.log("Pergunta enviada para IA:", pergunta);
      // Aqui seria implementada a lógica para enviar a pergunta para a IA
      // e abrir o modal ou chat flutuante com a resposta
      // window.location.href = "/epictus-ia?pergunta=" + encodeURIComponent(pergunta);
      setPergunta("");
    }
  };

  // Detectar quando o usuário está digitando
  const handleInputChange = (e) => {
    setPergunta(e.target.value);
    setIsTyping(true);

    // Desativar o estado de digitação após um tempo
    setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl bg-white dark:bg-gradient-to-br dark:from-[#0c1425] dark:to-[#0a1a2e] h-full w-full relative flex flex-col"
    >
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-full blur-2xl"></div>
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-3xl"></div>

        {/* Partículas decorativas */}
        <div className="absolute top-1/4 right-10 w-2 h-2 bg-[#FF6B00]/40 rounded-full"></div>
        <div className="absolute top-1/3 left-10 w-3 h-3 bg-blue-400/30 dark:bg-blue-400/20 rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-purple-400/30 dark:bg-purple-400/20 rounded-full"></div>
      </div>

      {/* Header elegante com gradiente - estilo igual ao FocoDoDiaCard */}
      <div className={`p-5 ${isLightMode ? 'bg-gradient-to-r from-orange-50 to-orange-100/50' : 'bg-gradient-to-r from-[#0A2540]/80 to-[#001427]'} border-b ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg flex items-center justify-center ${isLightMode ? 'bg-white shadow-sm border border-orange-200' : 'bg-[#FF6B00]/10 border border-[#FF6B00]/30'}`}>
              <Brain className={`h-5 w-5 text-[#FF6B00]`} />
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                Epictus IA: Seu Copiloto
              </h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                <span className="font-medium">Assistente inteligente</span>
              </p>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-xs font-medium ${isLightMode ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
            onClick={() => window.location.href = "/epictus-ia"}
          >
            <span>Modo completo</span>
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Conteúdo principal com design premium */}
      <div className="p-6 flex-grow flex flex-col justify-between relative z-10">
        <div className="space-y-5">
          {/* Título e dica de uso */}
          <div className="flex items-start gap-3 mb-2">
            <div className={`mt-0.5 p-1.5 rounded-md ${isLightMode ? 'bg-orange-100' : 'bg-[#FF6B00]/10'}`}>
              <Sparkles className={`h-4 w-4 ${isLightMode ? 'text-[#FF6B00]' : 'text-[#FF6B00]'}`} />
            </div>
            <div>
              <p className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                Use a Epictus IA para tirar dúvidas, resumir conteúdos ou receber orientações personalizadas sobre seus estudos.
              </p>
            </div>
          </div>
        </div>

        {/* Campo de entrada de pergunta com efeitos especiais */}
        <div className="mt-4">
          <form onSubmit={handleEnviarPergunta} className="relative">
            <div className={`relative overflow-hidden rounded-xl border ${isLightMode ? 'border-gray-200 shadow-sm' : 'border-gray-700'} transition-all duration-300 ${isTyping ? (isLightMode ? 'ring-2 ring-[#FF6B00]/30' : 'ring-2 ring-[#FF6B00]/30') : ''}`}>
              <input
                type="text"
                value={pergunta}
                onChange={handleInputChange}
                placeholder="Digite sua pergunta..."
                className={`w-full py-3 px-4 pr-12 ${isLightMode ? 'bg-white text-gray-800' : 'bg-gray-800/50 text-white backdrop-blur-sm'} placeholder-gray-400 focus:outline-none text-sm`}
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!pergunta.trim()}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md ${pergunta.trim() ? (isLightMode ? 'bg-[#FF6B00] text-white' : 'bg-[#FF6B00] text-white') : (isLightMode ? 'bg-gray-100 text-gray-400' : 'bg-gray-700 text-gray-400')}`}
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
          </form>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isLightMode ? 'bg-green-400' : 'bg-green-500'} animate-pulse`}></div>
              <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>IA pronta para ajudar</span>
            </div>

            <a 
              href="/epictus-ia?view=estatisticas" 
              className={`text-xs flex items-center gap-1 ${isLightMode ? 'text-gray-500 hover:text-[#FF6B00]' : 'text-gray-400 hover:text-[#FF6B00]'} transition-colors duration-200`}
            >
              <BarChart2 className="h-3 w-3" />
              <span>Estatísticas</span>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}