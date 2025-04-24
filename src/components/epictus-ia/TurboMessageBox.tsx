import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send } from "lucide-react";
import { Input } from "@/components/ui/input";

const TurboMessageBox: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleSendMessage = () => {
    // Implementação futura: enviar a mensagem
    console.log("Mensagem enviada:", message);
    setMessage("");
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && message.trim() !== "") {
      handleSendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gradient-to-r from-[#001a4d] to-[#003399] rounded-xl p-4 border border-[#39c2ff]/20 shadow-lg relative overflow-hidden"
    >
      {/* Background gradients */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0055ff]/20 via-[#0080ff]/20 to-[#007bff]/20 opacity-60"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-15"></div>
      </div>

      {/* Glowing orb */}
      <motion.div 
        className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full bg-[#0066ff]/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Message input container */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex-grow relative">
          <Input
            type="text"
            placeholder="Digite uma mensagem para o Epictus IA..."
            className="w-full bg-white/10 border-[#39c2ff]/30 text-white placeholder-white/50 focus:border-[#39c2ff] focus:ring-1 focus:ring-[#39c2ff] h-12 px-4 pr-12 rounded-lg"
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
          />
          <motion.div 
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            animate={{ 
              opacity: isTyping ? 1 : 0.7,
              scale: isTyping ? 1.1 : 1
            }}
            transition={{ duration: 0.2 }}
          >
            {isTyping ? (
              <Send 
                className="h-5 w-5 text-white cursor-pointer hover:text-[#39c2ff] transition-colors" 
                onClick={handleSendMessage}
              />
            ) : (
              <Sparkles className="h-5 w-5 text-white/70" />
            )}
          </motion.div>
        </div>

        {/* Profile selection (simplified) */}
        <motion.div 
          className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0047e1] to-[#0099ff] flex items-center justify-center cursor-pointer shadow-lg border border-[#39c2ff]/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TurboMessageBox;