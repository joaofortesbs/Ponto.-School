
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Paperclip } from "lucide-react";
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
      // Implement message sending logic here
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
import React, { useState } from "react";
import { Mic } from "lucide-react";

const TurboAdvancedMessageBox: React.FC = () => {
  const [message, setMessage] = useState<string>("");

  const tools = [
    { id: "simulador", icon: "⌖", label: "Simulador de Provas" },
    { id: "caderno", icon: "📓", label: "Gerar Caderno" },
    { id: "fluxograma", icon: "⚏", label: "Criar Fluxograma" },
    { id: "explicacao", icon: "📝", label: "Reescrever Explicação" },
    { id: "redacao", icon: "📑", label: "Análise de Redação" },
    { id: "resumir", icon: "📋", label: "Resumir Conteúdo" },
  ];

  return (
    <div className="w-full p-4">
      <div className="relative w-full">
        {/* Tools section */}
        <div className="flex items-center justify-start space-x-2 mb-3 overflow-x-auto pb-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className="flex items-center gap-2 bg-gradient-to-r from-[#051c33]/90 to-[#0a2d4e]/90 text-white py-2 px-3 rounded-full text-sm whitespace-nowrap border border-[#0071f0]/30 hover:bg-[#0071f0]/20 transition-all"
            >
              <span>{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}
        </div>

        {/* Message input */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Digite um comando ou pergunta para o Épictus Turbo..."
            className="w-full py-3 px-5 pl-10 pr-12 rounded-full bg-[#051c33]/90 border border-[#0071f0]/50 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071f0]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          
          {/* Left button (add) */}
          <button className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          </button>

          {/* Right button (mic) */}
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300">
            <Mic size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TurboAdvancedMessageBox;
