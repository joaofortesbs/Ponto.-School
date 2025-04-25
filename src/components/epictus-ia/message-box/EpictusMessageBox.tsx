import React from "react";
import { Send, Plus, Mic, Loader2, Brain, BookOpen, AlignJustify, RotateCw, Search, Image } from "lucide-react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import QuickActionButton from "./QuickActionButton";


interface EpictusMessageBoxProps {
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleSendMessage: () => void;
  isTyping: boolean;
  charCount: number;
  MAX_CHARS: number;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleButtonClick: (action: string) => void;
}

const EpictusMessageBox: React.FC<EpictusMessageBoxProps> = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isTyping,
  charCount,
  MAX_CHARS,
  handleKeyDown,
  handleButtonClick
}) => {
  return (
    <motion.div 
      className="relative w-[60%] h-auto mx-auto bg-transparent rounded-2xl shadow-xl 
                border border-white/5 backdrop-blur-sm overflow-hidden flex-shrink-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '120px' }}
    >
      {/* Partículas de fundo */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>

      {/* Container principal */}
      <div className="relative z-10 p-4">
        {/* Opções superiores */}
        <div className="flex items-center gap-2 mb-3">
          <button className="flex items-center gap-1.5 bg-[#11213f] rounded-md py-1.5 px-3 text-sm text-white/80 hover:bg-[#192c4e] transition-colors">
            <Search size={14} className="text-white/70" />
            <span>Buscar</span>
          </button>
          <button className="flex items-center gap-1.5 bg-[#11213f] rounded-md py-1.5 px-3 text-sm text-white/80 hover:bg-[#192c4e] transition-colors">
            <Brain size={14} className="text-white/70" />
            <span>Pensar</span>
          </button>
          <button className="flex items-center gap-1.5 bg-[#11213f] rounded-md py-1.5 px-3 text-sm text-white/80 hover:bg-[#192c4e] transition-colors">
            <Image size={14} className="text-white/70" />
            <span>Gerar Imagem</span>
          </button>
        </div>
        
        {/* Área de input */}
        <div className="flex items-center gap-2">
          <motion.button
            className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                     flex items-center justify-center shadow-lg text-white"
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {}}
          >
            <Plus size={18} />
          </motion.button>

          <div className={`relative flex-grow overflow-hidden 
                          bg-gradient-to-r from-[#0c2341]/30 to-[#0f3562]/30 
                          rounded-xl border ${isTyping ? 'border-[#1230CC]/70' : 'border-white/10'} 
                          transition-all duration-300`}>
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite um comando ou pergunta para o Epictus Turbo..."
              className="w-full bg-transparent text-white py-3 px-3 text-sm outline-none placeholder:text-gray-400"
              disabled={isTyping}
            />

            <div className="absolute right-3 bottom-1.5 text-xs text-gray-400 bg-[#0c2341]/50 px-1.5 py-0.5 rounded-md">
              {charCount}/{MAX_CHARS}
            </div>
          </div>

          {/* Botão de microfone (quando não há texto) */}
          {!inputMessage.trim() ? (
            <motion.button 
              className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                       flex items-center justify-center shadow-lg text-white"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic size={16} />
            </motion.button>
          ) : (
            /* Botão de enviar - Visível apenas quando há conteúdo no input */
            <motion.button
              className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                       flex items-center justify-center shadow-lg text-white"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: ["0 0 0px rgba(13, 35, 160, 0)", "0 0 15px rgba(13, 35, 160, 0.5)", "0 0 0px rgba(13, 35, 160, 0)"],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              onClick={handleSendMessage}
              disabled={isTyping}
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Send size={16} />
              )}
            </motion.button>
          )}
        </div>

        {/* Ações rápidas */}
        <motion.div 
          className="quick-actions mt-2 pb-1 flex gap-1.5 overflow-x-auto scrollbar-hide"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <QuickActionButton 
            icon={<Brain size={16} className="text-blue-300" />}
            text="Simulador de Provas"
            onClick={() => handleButtonClick('Simulador de Provas')}
          />
          <QuickActionButton 
            icon={<BookOpen size={16} className="text-emerald-300" />}
            text="Gerar Caderno"
            onClick={() => handleButtonClick('Gerar Caderno')}
          />
          <QuickActionButton 
            icon={<AlignJustify size={16} className="text-purple-300" />}
            text="Criar Fluxograma"
            onClick={() => handleButtonClick('Criar Fluxograma')}
          />
          <QuickActionButton 
            icon={<RotateCw size={16} className="text-indigo-300" />}
            text="Reescrever Explicação"
            onClick={() => handleButtonClick('Reescrever Explicação')}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EpictusMessageBox;