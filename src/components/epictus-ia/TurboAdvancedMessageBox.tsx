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
    { id: "simulador", icon: "⌖", label: "Simulador" },
    { id: "caderno", icon: "📓", label: "Caderno" },
    { id: "fluxograma", icon: "⚏", label: "Fluxograma" },
    { id: "explicacao", icon: "📝", label: "Explicação" },
    { id: "redacao", icon: "📑", label: "Redação" },
  ];

  return (
    <div className="w-full py-2 px-3">
      <div className="relative w-full">
        {/* Tools section - mais compacta */}
        <div className="flex items-center justify-start space-x-1 mb-2 overflow-x-auto pb-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className="flex items-center gap-1 bg-gradient-to-r from-[#051c33]/90 to-[#0a2d4e]/90 text-white py-1 px-2 rounded-full text-xs whitespace-nowrap border border-[#0071f0]/30 hover:bg-[#0071f0]/20 transition-all"
            >
              <span>{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}
        </div>

        {/* Message input - mais compacto */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Digite para o Épictus Turbo..."
            className="w-full py-2 px-4 pl-8 pr-8 rounded-full bg-[#051c33]/90 border border-[#0071f0]/50 text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0071f0] text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Left button (add) */}
          <button className="absolute left-2 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          </button>

          {/* Right button (mic) */}
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300">
            <Mic size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TurboAdvancedMessageBox;