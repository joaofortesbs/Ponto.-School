import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { X, ArrowLeft, Sparkles, Brain, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EpictusModeInterfaceProps {
  onExit?: () => void;
}

const EpictusModeInterface: React.FC<EpictusModeInterfaceProps> = ({ onExit }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isHovered, setIsHovered] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    {
      role: "system",
      content: "Olá! Sou o Epictus IA, seu assistente de estudos avançado. Como posso ajudá-lo hoje?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = () => {
    if (input.trim() === "") return;

    // Adiciona a mensagem do usuário
    setMessages(prev => [...prev, {
      role: "user",
      content: input
    }]);

    // Indica que está carregando
    setIsLoading(true);

    // Simula uma resposta do Epictus (em um app real, seria uma chamada API)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "system",
        content: "Estou processando sua solicitação. Como assistente de estudos, posso ajudar com explicações, resumos, e estratégias de aprendizado personalizado."
      }]);
      setIsLoading(false);
    }, 1000);

    setInput("");
  };

  // Força scroll para baixo quando novas mensagens são adicionadas
  useEffect(() => {
    const chatContainer = document.getElementById('epictus-chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full flex flex-col h-full">
      {/* Header - reproduzindo o mesmo estilo do EpictusIAHeader */}
      <div className="w-full p-4">
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`w-full ${isDark ? 'bg-gradient-to-r from-[#050e1d] to-[#0d1a30]' : 'bg-gradient-to-r from-[#0c2341] to-[#0f3562]'} backdrop-blur-lg z-10 py-4 px-5 flex items-center justify-between rounded-xl relative overflow-hidden`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-20">
            <div className={`absolute inset-0 bg-gradient-to-r from-[#FF6B00] via-[#FF8C40] to-[#FF9D5C] ${isHovered ? 'opacity-60' : 'opacity-30'} transition-opacity duration-700`}></div>
          </div>

          {/* Glowing orbs */}
          <motion.div 
            className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-orange-500/10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          <div className="flex items-center gap-3 z-10">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 text-white hover:bg-white/10"
                onClick={onExit}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9B50] flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-white">Modo Epictus</h1>
              <div className="ml-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                <Sparkles className="h-3 w-3 mr-1" />
                Avançado
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10">
            {onExit && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={onExit}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </motion.header>
      </div>

      {/* Chat Interface */}
      <div className={`w-full max-w-4xl mx-auto flex-1 p-4 rounded-lg ${isDark ? 'bg-gray-800/30' : 'bg-white/70'} backdrop-blur-md shadow-lg mt-2 mb-4 flex flex-col h-[calc(100vh-200px)]`}>
        <div id="epictus-chat-messages" className="flex-1 overflow-y-auto p-4 mb-4 space-y-4 min-h-[200px]">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg max-w-[80%] ${
                message.role === "user" 
                  ? "ml-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white" 
                  : `${isDark ? "bg-gray-700" : "bg-gray-100"} ${isDark ? "text-white" : "text-gray-800"}`
              }`}
            >
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div className={`p-3 rounded-lg max-w-[80%] ${isDark ? "bg-gray-700" : "bg-gray-100"} ${isDark ? "text-white" : "text-gray-800"}`}>
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/10 dark:bg-gray-800/50">
          <input
            type="text"
            placeholder="Digite sua mensagem..."
            className={`flex-1 p-2 rounded bg-transparent outline-none ${isDark ? 'text-white' : 'text-gray-800'}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button 
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:from-[#FF9B50] hover:to-[#FF6B00] text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-1">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Enviando</span>
              </div>
            ) : (
              <>
                Enviar <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EpictusModeInterface;