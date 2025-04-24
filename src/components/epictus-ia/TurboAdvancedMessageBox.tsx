import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizonal, Sparkles, Mic, Bot, User } from "lucide-react";
import { generateAIResponse } from "@/services/epictusIAService";
import { v4 as uuidv4 } from 'uuid';

// Interface para mensagens
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const TurboAdvancedMessageBox: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      content: "Olá! Eu sou o Epictus IA Turbo Avançado. Como posso ajudar você hoje?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageBoxRef = useRef<HTMLDivElement>(null);

  // Função para rolar para a mensagem mais recente
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Rolar para o final quando novas mensagens chegarem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Função para lidar com o envio de mensagem
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Criar e adicionar mensagem do usuário
    const newUserMessage: Message = {
      id: uuidv4(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };

    // Salvar o texto atual e limpar o input
    const currentInput = input;
    setInput("");

    // Adicionar mensagem do usuário ao chat
    setMessages(prev => [...prev, newUserMessage]);

    // Iniciar o carregamento da resposta da IA
    setIsLoading(true);

    try {
      // Obter resposta da IA
      const aiResponse = await generateAIResponse(currentInput);

      // Criar e adicionar mensagem da IA
      const newAIMessage: Message = {
        id: uuidv4(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      // Adicionar mensagem da IA ao chat
      setMessages(prev => [...prev, newAIMessage]);
    } catch (error) {
      console.error("Erro ao gerar resposta da IA:", error);

      // Mensagem de erro em caso de falha
      const errorMessage: Message = {
        id: uuidv4(),
        content: "Desculpe, encontrei um problema ao processar sua solicitação. Por favor, tente novamente.",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Lidar com tecla Enter para enviar (mas Shift+Enter para nova linha)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Ajustar altura do textarea automaticamente
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Reset height para calcular corretamente
    e.target.style.height = 'inherit';

    // Calcular nova altura (max 150px)
    const newHeight = Math.min(e.target.scrollHeight, 150);
    e.target.style.height = `${newHeight}px`;
  };

  return (
    <div className={`w-full h-full flex flex-col`} ref={messageBoxRef}>
      {/* Área de mensagens */}
      <div className={`flex-1 overflow-y-auto mb-4 p-2 rounded-xl ${isDark ? 'bg-[#001a4d]/30' : 'bg-white/50'} backdrop-blur-sm max-h-[300px]`}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-2 mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0047e1] to-[#00a9ff] flex items-center justify-center relative z-10 border-2 border-[#39c2ff]/30 shadow-md">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}

              <div 
                className={`max-w-[80%] rounded-xl p-3 ${
                  message.sender === 'user' 
                    ? `${isDark ? 'bg-[#0066ff]/30 text-white' : 'bg-[#0066ff]/20 text-[#00254d]'} rounded-tr-none` 
                    : `${isDark ? 'bg-[#001a4d]/80 text-white' : 'bg-white text-[#001a4d]'} rounded-tl-none`
                } shadow-sm`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <div className="text-xs mt-1 opacity-60">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#003399] to-[#0066ff] flex items-center justify-center relative z-10 border-2 border-[#39c2ff]/30 shadow-md">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 mb-4"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0047e1] to-[#00a9ff] flex items-center justify-center relative z-10 border-2 border-[#39c2ff]/30 shadow-md">
                <Bot className="h-4 w-4 text-white" />
              </div>

              <div className={`rounded-xl p-3 ${isDark ? 'bg-[#001a4d]/80 text-white' : 'bg-white text-[#001a4d]'} rounded-tl-none shadow-sm`}>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>

      {/* Área de texto */}
      <div className={`w-full rounded-xl ${isDark ? 'bg-gradient-to-r from-[#001a4d]/80 to-[#003399]/80' : 'bg-gradient-to-r from-[#e6f0ff] to-[#f0f7ff]'} backdrop-blur-md p-4 shadow-lg border border-[#39c2ff]/20`}>
        <div className="flex flex-col space-y-3">
          <Textarea 
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem para o Epictus IA..." 
            className={`w-full min-h-24 resize-none text-base ${isDark ? 'bg-[#001a4d]/50 text-white placeholder:text-white/50 border-[#39c2ff]/30' : 'bg-white/90 text-[#001a4d] placeholder:text-[#001a4d]/50 border-[#39c2ff]/20'} focus:border-[#39c2ff] focus:ring-[#39c2ff]/30 rounded-xl`}
          />

          {/* Botões de ação */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-full ${isDark ? 'bg-[#0047e1]/30 hover:bg-[#0047e1]/50' : 'bg-[#0047e1]/10 hover:bg-[#0047e1]/20'} transition-colors`}
              >
                <Mic className={`h-5 w-5 ${isDark ? 'text-white' : 'text-[#0047e1]'}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-full ${isDark ? 'bg-[#0047e1]/30 hover:bg-[#0047e1]/50' : 'bg-[#0047e1]/10 hover:bg-[#0047e1]/20'} transition-colors`}
              >
                <Sparkles className={`h-5 w-5 ${isDark ? 'text-white' : 'text-[#0047e1]'}`} />
              </motion.button>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-[#0047e1] to-[#0080ff] hover:from-[#0047e1] hover:to-[#00a9ff] text-white rounded-full px-5 py-2 flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendHorizonal className="h-4 w-4" />
              <span>Enviar</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurboAdvancedMessageBox;