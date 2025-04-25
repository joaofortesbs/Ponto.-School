
import React, { useState, useEffect, useRef } from "react";
import { Send, Trash2, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateAIResponse, createMessage, addMessageToHistory, getChatHistory, clearChatHistory } from "@/services/epictusIAService";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
};

const EpictusBetaChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Initialize with welcome message
  useEffect(() => {
    const initialMessages = getChatHistory();
    if (initialMessages.length === 0) {
      // If no history, add welcome message
      const welcomeMessage = createMessage(
        "Olá, João! Eu sou o Epicus IA, seu assistente para aprendizado e programação. Como posso te ajudar hoje?",
        "ai"
      );
      addMessageToHistory(welcomeMessage);
      setMessages([welcomeMessage]);
    } else {
      // Load chat history
      setMessages(initialMessages);
    }
    
    // Auto focus on input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isAiResponding) return;

    // Create user message
    const userMessage = createMessage(inputValue.trim(), "user");
    
    // Update state and history
    addMessageToHistory(userMessage);
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsAiResponding(true);
    
    try {
      // Get AI response
      const aiResponse = await generateAIResponse(inputValue.trim());
      const aiMessage = createMessage(aiResponse, "ai");
      
      // Update state and history
      addMessageToHistory(aiMessage);
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage = createMessage(
        "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        "ai"
      );
      addMessageToHistory(errorMessage);
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setShowClearDialog(true);
  };

  const confirmClearChat = () => {
    clearChatHistory();
    const welcomeMessage = createMessage(
      "Chat limpo. Como posso te ajudar agora?",
      "ai"
    );
    addMessageToHistory(welcomeMessage);
    setMessages([welcomeMessage]);
    setShowClearDialog(false);
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6">
      <div className="w-4/5 max-w-[900px] flex flex-col">
        {/* Chat history area */}
        <div className="relative mb-4">
          <ScrollArea className="h-[400px] rounded-lg bg-[#1A2634] p-4 border border-[#2F3B4C]/50 shadow-lg">
            <div className="space-y-4 pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-lg ${
                      message.sender === "user"
                        ? "bg-[#4A90E2] text-white"
                        : "bg-[#2F3B4C] text-white"
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p className="text-xs text-[#A0A0A0] mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isAiResponding && (
                <div className="flex justify-start">
                  <div className="bg-[#2F3B4C] text-white px-4 py-3 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <motion.div
                        className="w-2 h-2 bg-[#4A90E2] rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1,
                          times: [0, 0.5, 1] 
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-[#4A90E2] rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1,
                          delay: 0.3,
                          times: [0, 0.5, 1] 
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-[#4A90E2] rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1,
                          delay: 0.6,
                          times: [0, 0.5, 1] 
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Clear chat button */}
          <Button
            onClick={handleClearChat}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-[#A0A0A0] hover:text-[#FF4D4D] hover:bg-transparent"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Buttons area */}
        <div className="flex flex-wrap gap-2 mb-4 justify-end">
          <Button size="sm" variant="outline" className="h-10 text-xs font-medium bg-[#2F3B4C] text-white border-[#4A5568] hover:bg-[#3A4B5C] hover:text-white">
            Simulador de Provas
          </Button>
          <Button size="sm" variant="outline" className="h-10 text-xs font-medium bg-[#2F3B4C] text-white border-[#4A5568] hover:bg-[#3A4B5C] hover:text-white">
            Gerar Caderno
          </Button>
          <Button size="sm" variant="outline" className="h-10 text-xs font-medium bg-[#2F3B4C] text-white border-[#4A5568] hover:bg-[#3A4B5C] hover:text-white">
            Criar Fluxograma
          </Button>
          <Button size="sm" variant="outline" className="h-10 text-xs font-medium bg-[#2F3B4C] text-white border-[#4A5568] hover:bg-[#3A4B5C] hover:text-white">
            Análise de Redação
          </Button>
          <Button size="sm" variant="outline" className="h-10 text-xs font-medium bg-[#2F3B4C] text-white border-[#4A5568] hover:bg-[#3A4B5C] hover:text-white">
            Resumir Conteúdo
          </Button>
        </div>

        {/* Message input area */}
        <div className="flex bg-[#2F3B4C] rounded-lg p-2 shadow-lg">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem para a IA..."
            className="flex-1 bg-[#1A2634] text-white rounded-md px-4 py-3 mr-2 focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
          />
          <motion.button
            onClick={handleSendMessage}
            disabled={inputValue.trim() === "" || isAiResponding}
            className="w-10 h-10 bg-[#4A90E2] rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ backgroundColor: "#5AAEFF" }}
            whileTap={{ scale: 0.9 }}
          >
            {isAiResponding ? (
              <Loader2 className="h-5 w-5 text-white animate-spin" />
            ) : (
              <Send className="h-5 w-5 text-white" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="sm:max-w-[425px] bg-[#1A2634] text-white border-[#2F3B4C]">
          <DialogHeader>
            <DialogTitle>Limpar Conversa</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              Deseja limpar o chat? Isso não pode ser desfeito.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowClearDialog(false)}
              className="border-[#4A5568] text-white hover:bg-[#2F3B4C]"
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmClearChat}
              className="bg-[#FF4D4D] hover:bg-[#FF6B6B] text-white"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EpictusBetaChat;
