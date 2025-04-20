
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Send, User, ThumbsUp, ThumbsDown, Copy } from "lucide-react";
import epictusIAService from "@/services/epictusIAService";
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

export default function MiniChatEpictus() {
  const { theme } = useTheme();
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      content: "Olá! Como posso ajudar você hoje?",
      role: "assistant",
      createdAt: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll para o final das mensagens quando novas mensagens são adicionadas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: uuidv4(),
      content: inputMessage,
      role: "user",
      createdAt: new Date(),
    };

    // Salvar a mensagem atual para enviar para API
    const currentMessage = inputMessage;
    
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Buscar resposta da IA usando a API do Gemini
      const aiResponse = await epictusIAService.getResponse(currentMessage);

      // Adicionar resposta da IA
      const assistantMessage: Message = {
        id: uuidv4(),
        content: aiResponse,
        role: "assistant",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erro ao obter resposta da IA:", error);
      
      // Mensagem de erro caso falhe
      const errorMessage: Message = {
        id: uuidv4(),
        content: "Desculpe, tive um problema ao processar sua solicitação. Por favor, tente novamente em alguns instantes.",
        role: "assistant",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      // Focar no input após enviar a mensagem
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Função para formatar a data da mensagem
  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Função para copiar o texto da mensagem
  const copyMessageToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Aqui poderia adicionar um toast para feedback
  };

  return (
    <div className="flex flex-col h-full">
      {/* Área de mensagens */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-2 max-w-[85%] group ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                    message.role === "assistant"
                      ? "bg-[#FF6B00]"
                      : theme === "dark"
                      ? "bg-[#29335C]"
                      : "bg-gray-200"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <Brain className="h-3 w-3 text-white" />
                  ) : (
                    <User className="h-3 w-3 text-white" />
                  )}
                </div>

                {/* Conteúdo da mensagem */}
                <div className="flex flex-col">
                  <div
                    className={`p-2 rounded-lg text-sm ${
                      message.role === "assistant"
                        ? theme === "dark"
                          ? "bg-[#29335C]/50 text-white"
                          : "bg-white text-[#29335C] border border-gray-200"
                        : theme === "dark"
                        ? "bg-[#FF6B00]/90 text-white"
                        : "bg-[#FF6B00] text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    <div
                      className={`flex justify-between items-center mt-1 text-xs ${
                        message.role === "assistant"
                          ? "text-gray-400"
                          : "text-white/70"
                      }`}
                    >
                      <span>{formatMessageTime(message.createdAt)}</span>
                    </div>
                  </div>

                  {/* Ações da mensagem (aparece apenas em hover) */}
                  {message.role === "assistant" && (
                    <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => copyMessageToClipboard(message.content)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Indicador de digitação */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[85%]">
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-[#FF6B00]"
                >
                  <Brain className="h-3 w-3 text-white" />
                </div>
                <div
                  className={`p-2 rounded-lg ${
                    theme === "dark"
                      ? "bg-[#29335C]/50 text-white"
                      : "bg-white text-[#29335C] border border-gray-200"
                  }`}
                >
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Elemento para scroll automático */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Área de input */}
      <div
        className={`p-3 border-t ${
          theme === "dark"
            ? "border-gray-800"
            : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            placeholder="Digite sua mensagem..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`flex-1 text-sm h-9 ${
              theme === "dark"
                ? "bg-[#29335C]/20 border-gray-700 text-white"
                : "bg-white border-gray-200 text-[#29335C]"
            }`}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white h-9 w-9 p-0"
            disabled={!inputMessage.trim() || isTyping}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
