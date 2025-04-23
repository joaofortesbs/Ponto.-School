
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
    <div className="w-full bg-[#070e22]">
      <div className="pb-3">
        {/* Tools section */}
        <div className="flex items-center justify-start space-x-2 px-4 py-2 overflow-x-auto">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className="flex items-center gap-1.5 bg-[#0a1431] hover:bg-[#132052] text-white py-2 px-3 rounded-full text-xs whitespace-nowrap transition-all"
            >
              <span>{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}
        </div>

        {/* Message input */}
        <div className="relative w-full px-4 mt-1">
          <input
            type="text"
            placeholder="Digite um comando ou pergunta para o Epictus Turbo..."
            className="w-full py-3 px-4 pl-10 pr-10 rounded-full bg-[#0a1431] text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />

          {/* Left button (add) */}
          <button className="absolute left-8 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          </button>

          {/* Right button (mic) */}
          <button className="absolute right-8 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white">
            <Mic size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TurboAdvancedMessageBox;
