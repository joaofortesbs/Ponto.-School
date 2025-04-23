
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizonal, Mic, PaperclipIcon, Sparkles } from "lucide-react";

const IAMessageBox: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Mensagem enviada:", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && message.trim()) {
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <motion.div 
      className="w-full px-4 pb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div 
        className="relative rounded-xl bg-gradient-to-r from-[#0c2341] to-[#0f3562] shadow-lg p-1 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-r from-[#0D23A0]/30 via-[#1230CC]/40 to-[#4A0D9F]/30 opacity-${isHovered ? '80' : '50'} transition-opacity duration-300`}></div>
        
        {/* Inner container with blur backdrop */}
        <div className="relative rounded-lg backdrop-blur-sm p-3 border border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex-grow relative">
              <Input
                value={message}
                onChange={handleMessageChange}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta ou comando..."
                className="bg-[#0c2341]/80 border-white/10 text-white placeholder-white/50 rounded-lg pl-4 pr-12 py-6 text-base focus:ring-2 focus:ring-[#1230CC] focus:border-transparent transition-all"
              />
              
              {/* Attachments button */}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white hover:bg-[#1230CC]/20"
              >
                <PaperclipIcon className="h-5 w-5" />
              </Button>
              
              {/* Enhanced microphone button with animation */}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className={`absolute right-1 top-1/2 transform -translate-y-1/2 ${isRecording ? 'text-red-500 bg-red-500/10' : 'text-white/70 hover:text-white hover:bg-[#1230CC]/20'} transition-all`}
                onClick={toggleRecording}
              >
                <Mic className={`h-5 w-5 ${isRecording ? 'animate-pulse' : ''}`} />
                {isRecording && (
                  <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75"></span>
                )}
              </Button>
            </div>
            
            {/* Enhanced send button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!message.trim()}
              onClick={handleSendMessage}
              className={`relative rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 ${message.trim() ? 'bg-gradient-to-r from-[#0D23A0] to-[#4A0D9F] text-white cursor-pointer' : 'bg-[#0c2341]/80 text-white/40 cursor-not-allowed'} shadow-lg transition-all duration-200`}
            >
              <span className="font-medium">Enviar</span>
              <SendHorizonal className="h-4 w-4" />
              {message.trim() && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-lg overflow-hidden"
                  style={{ zIndex: -1 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0D23A0] via-[#1230CC] to-[#4A0D9F] opacity-80"></div>
                  <div className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] bg-repeat opacity-20"></div>
                </motion.div>
              )}
            </motion.button>
          </div>
          
          {/* Quick suggestions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <QuickSuggestion text="Como posso implementar um gerador de QR Code?" />
            <QuickSuggestion text="Explique o conceito de métodos ágeis" />
            <QuickSuggestion text="Crie exemplos de fluxograma para controle de estoque" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Quick suggestion component
const QuickSuggestion: React.FC<{ text: string }> = ({ text }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="rounded-full px-3 py-1.5 flex items-center gap-1 bg-[#1230CC]/20 border border-[#1230CC]/30 text-white/90 text-sm cursor-pointer hover:bg-[#1230CC]/30 transition-colors"
    >
      <Sparkles className="h-3 w-3 text-[#4A0D9F]" />
      <span className="truncate max-w-[180px]">{text}</span>
    </motion.div>
  );
};

export default IAMessageBox;
