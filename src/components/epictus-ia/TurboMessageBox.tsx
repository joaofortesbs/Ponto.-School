import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, Mic, Send, Brain, BookOpen, FileText, RotateCw, AlignJustify, Zap } from "lucide-react";
import ParticlesBackground from "./components/ParticlesBackground";

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onClick }) => {
  return (
    <motion.button
      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0c2341]/50 to-[#0f3562]/50 
                 text-white rounded-full whitespace-nowrap border border-white/10 backdrop-blur-md"
      whileHover={{ y: -2, scale: 1.05, boxShadow: "0 10px 25px -5px rgba(13, 35, 160, 0.4)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
};

const TurboMessageBox: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Efeito visual quando o input recebe texto
  const inputHasContent = message.trim().length > 0;

  const quickActions = [
    { icon: <Brain size={16} className="text-blue-300" />, label: "Simulador de Provas" },
    { icon: <BookOpen size={16} className="text-emerald-300" />, label: "Gerar Caderno" },
    { icon: <AlignJustify size={16} className="text-purple-300" />, label: "Criar Fluxograma" },
    { icon: <RotateCw size={16} className="text-indigo-300" />, label: "Reescrever Explicação" },
    { icon: <FileText size={16} className="text-amber-300" />, label: "Análise de Redação" },
    { icon: <Zap size={16} className="text-rose-300" />, label: "Resumir Conteúdo" }
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    console.log("Mensagem enviada:", message);
    // Aqui você implementaria a lógica de envio para o backend
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mb-8 px-4">
      <motion.div 
        className="relative bg-gradient-to-r from-[#050e1d]/90 to-[#0d1a30]/90 rounded-2xl shadow-xl 
                   border border-white/5 backdrop-blur-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Partículas de fundo */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>

        {/* Container principal */}
        <div className="relative z-10 p-6">
          {/* Área de input */}
          <div className="flex items-center gap-3">
            <motion.button
              className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                         flex items-center justify-center shadow-lg text-white"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Plus size={24} />
            </motion.button>

            <div className={`relative flex-grow flex items-center overflow-hidden 
                            bg-gradient-to-r from-[#0c2341]/30 to-[#0f3562]/30 
                            rounded-xl border ${isInputFocused ? 'border-[#1230CC]/70' : 'border-white/10'} 
                            transition-all duration-300`}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Digite um comando ou pergunta para o Epictus Turbo..."
                className="w-full bg-transparent text-white py-6 px-5 outline-none placeholder:text-gray-400 text-lg"
              />

              {/* Botão de microfone */}
              <motion.button 
                className="flex-shrink-0 mr-1 p-2 rounded-full text-white/80 hover:text-white/100 
                           transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mic size={20} />
              </motion.button>

              {/* Botão de enviar */}
              <motion.button
                className={`flex-shrink-0 p-2 mr-1 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                            text-white flex items-center justify-center transition-all duration-300
                            ${inputHasContent ? 'opacity-100' : 'opacity-70'}`}
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                animate={inputHasContent ? { 
                  boxShadow: ["0 0 0px rgba(13, 35, 160, 0)", "0 0 15px rgba(13, 35, 160, 0.5)", "0 0 0px rgba(13, 35, 160, 0)"],
                } : {}}
                transition={{ duration: 2, repeat: inputHasContent ? Infinity : 0 }}
                onClick={handleSendMessage}
              >
                <Send size={18} />
              </motion.button>
            </div>
          </div>

          {/* Ações rápidas */}
          <AnimatePresence>
            <motion.div 
              className="quick-actions mt-5 pb-3 flex gap-3 overflow-x-auto scrollbar-hide"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {quickActions.map((action, index) => (
                <QuickAction 
                  key={index} 
                  icon={action.icon} 
                  label={action.label} 
                  onClick={() => console.log(`Ação rápida: ${action.label}`)}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Painel expandido (opcional) */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                className="expanded-panel mt-3 p-3 bg-[#0c2341]/40 rounded-xl border border-white/10"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-wrap gap-2">
                  <div className="text-xs text-white/70 mb-1 w-full">Opções avançadas:</div>
                  <motion.button 
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0c2341]/70 to-[#0f3562]/70 
                               text-white rounded-lg border border-white/10"
                    whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(13, 35, 160, 0.3)" }}
                  >
                    Escolher competência
                  </motion.button>
                  <motion.button 
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0c2341]/70 to-[#0f3562]/70 
                               text-white rounded-lg border border-white/10"
                    whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(13, 35, 160, 0.3)" }}
                  >
                    Modo resposta rápida
                  </motion.button>
                  <motion.button 
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0c2341]/70 to-[#0f3562]/70 
                               text-white rounded-lg border border-white/10"
                    whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(13, 35, 160, 0.3)" }}
                  >
                    Adicionar mídia
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default TurboMessageBox;