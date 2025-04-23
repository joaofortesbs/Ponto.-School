
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Paperclip, Mic, Brain, BookOpen, AlignJustify, RotateCw, FileText, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";

const TurboAdvancedMessageBox: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      console.log("Sending message:", message);
      // Implementar lógica de envio de mensagem aqui
      setMessage("");
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: <Brain size={16} className="text-blue-300" />, label: "Simulador de Provas" },
    { icon: <BookOpen size={16} className="text-emerald-300" />, label: "Gerar Caderno" },
    { icon: <AlignJustify size={16} className="text-purple-300" />, label: "Criar Fluxograma" },
    { icon: <RotateCw size={16} className="text-indigo-300" />, label: "Reescrever Explicação" },
    { icon: <FileText size={16} className="text-amber-300" />, label: "Análise de Redação" },
    { icon: <Zap size={16} className="text-rose-300" />, label: "Resumir Conteúdo" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full hub-connected-width px-4 pb-6"
    >
      <div className="relative w-full">
        <div className="relative rounded-xl bg-gradient-to-r from-[#0c2341] to-[#0f3562] p-[1px] shadow-lg">
          {/* Background glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#0D23A0]/20 via-[#1230CC]/20 to-[#4A0D9F]/20 rounded-xl blur-lg opacity-70"></div>
          
          <div className="relative flex items-center bg-gradient-to-r from-[#0c2341] to-[#0f3562] rounded-xl px-4 py-2">
            {/* Left icon */}
            <div className="flex-shrink-0 mr-3">
              <motion.div 
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0]/80 to-[#4A0D9F]/80 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
            </div>
            
            {/* Input field */}
            <div className="flex-grow relative">
              <Input
                type="text"
                placeholder="Digite sua mensagem para o Epictus Turbo..."
                className="w-full border-none bg-transparent text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0 text-base py-6"
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
            </div>
            
            {/* Right actions */}
            <div className="flex-shrink-0 flex items-center space-x-2 ml-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-transparent hover:bg-white/10 transition-colors"
              >
                <Paperclip className="h-5 w-5 text-white/70" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-full transition-colors ${isTyping ? 'bg-gradient-to-r from-[#0D23A0] to-[#4A0D9F]' : 'bg-white/10'}`}
                onClick={handleSendMessage}
              >
                <Send className={`h-5 w-5 ${isTyping ? 'text-white' : 'text-white/70'}`} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TurboAdvancedMessageBox;
