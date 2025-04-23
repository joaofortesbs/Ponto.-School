import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Paperclip, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";

const TurboAdvancedMessageBox: React.FC = () => {
  const [message, setMessage] = useState<string>("");
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
            onKeyDown={handleKeyDown}
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