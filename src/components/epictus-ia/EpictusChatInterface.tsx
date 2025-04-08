
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Sparkles, Send, User, Brain, ThumbsUp, ThumbsDown, Copy, Link, Download } from "lucide-react";
import epictusIAService, { IAMessage } from "@/services/epictusIAService";
import { v4 as uuidv4 } from 'uuid';

interface EpictusChatInterfaceProps {
  onBack?: () => void;
}

export default function EpictusChatInterface({ onBack }: EpictusChatInterfaceProps) {
  const { theme } = useTheme();
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<IAMessage[]>([
    {
      id: uuidv4(),
      content: "Olá! Sou o Epictus IA, seu assistente de estudos pessoal. Como posso ajudar você hoje?",
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
    const userMessage: IAMessage = {
      id: uuidv4(),
      content: inputMessage,
      role: "user",
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Buscar resposta da IA
      const aiResponse = await epictusIAService.getResponse(inputMessage);

      // Adicionar resposta da IA
      const assistantMessage: IAMessage = {
        id: uuidv4(),
        content: aiResponse,
        role: "assistant",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erro ao obter resposta da IA:", error);
      
      // Mensagem de erro caso falhe
      const errorMessage: IAMessage = {
        id: uuidv4(),
        content: "Desculpe, tive um problema ao processar sua solicitação. Por favor, tente novamente.",
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
    <div
      className={`flex flex-col h-full ${
        theme === "dark" ? "bg-[#001427]" : "bg-[#f7f9fa]"
      }`}
    >
      {/* Cabeçalho */}
      <div
        className={`flex items-center justify-between p-4 border-b ${
          theme === "dark" ? "border-gray-800 bg-[#0A2540]" : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2
              className={`font-medium ${
                theme === "dark" ? "text-white" : "text-[#29335C]"
              } flex items-center gap-2`}
            >
              Epictus IA
              <Badge className="bg-[#FF6B00] text-white text-xs">
                <Sparkles className="h-3 w-3 mr-1" /> Online
              </Badge>
            </h2>
            <p
              className={`text-xs ${
                theme === "dark" ? "text-white/60" : "text-[#64748B]"
              }`}
            >
              Seu assistente de estudos pessoal
            </p>
          </div>
        </div>
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className={`${
              theme === "dark"
                ? "text-white/60 hover:text-white hover:bg-[#29335C]/20"
                : "text-[#64748B] hover:text-[#29335C] hover:bg-gray-100"
            }`}
          >
            Voltar
          </Button>
        )}
      </div>

      {/* Área de mensagens */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-3 max-w-[80%] group ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <Avatar
                  className={`w-8 h-8 rounded-full flex-shrink-0 ${
                    message.role === "assistant"
                      ? "bg-[#FF6B00]"
                      : theme === "dark"
                      ? "bg-[#29335C]"
                      : "bg-gray-200"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <Brain className="h-4 w-4 text-white" />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </Avatar>

                {/* Conteúdo da mensagem */}
                <div>
                  <div
                    className={`relative p-3 rounded-lg ${
                      message.role === "assistant"
                        ? theme === "dark"
                          ? "bg-[#29335C]/50 text-white"
                          : "bg-white text-[#29335C] border border-gray-200"
                        : theme === "dark"
                        ? "bg-[#FF6B00]/90 text-white"
                        : "bg-[#FF6B00] text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div
                      className={`flex justify-between items-center mt-2 text-xs ${
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
                        className="h-6 w-6"
                        onClick={() => copyMessageToClipboard(message.content)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
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
              <div className="flex gap-3 max-w-[80%]">
                <Avatar className="w-8 h-8 rounded-full flex-shrink-0 bg-[#FF6B00]">
                  <Brain className="h-4 w-4 text-white" />
                </Avatar>
                <div
                  className={`p-3 rounded-lg ${
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
        className={`p-4 border-t ${
          theme === "dark"
            ? "border-gray-800 bg-[#0A2540]"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            placeholder="Digite sua mensagem..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`flex-1 ${
              theme === "dark"
                ? "bg-[#29335C]/20 border-gray-700 text-white"
                : "bg-white border-gray-200 text-[#29335C]"
            }`}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            disabled={!inputMessage.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Sugestões rápidas */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            "Como criar um plano de estudos?",
            "Explique a fotossíntese",
            "Fórmulas de Física",
            "Dicas para o ENEM",
          ].map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => {
                setInputMessage(suggestion);
                inputRef.current?.focus();
              }}
              className={`text-xs ${
                theme === "dark"
                  ? "text-white/60 border-gray-700 hover:bg-[#29335C]/20"
                  : "text-[#64748B] border-gray-200 hover:bg-gray-100"
              }`}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
