import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { generateAIResponse } from "@/services/aiChatService";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import { Send, Paperclip, Mic, ArrowUp, Loader2, User, Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Interface para os tipos de mensagens
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

const TurboAdvancedMessageBox: React.FC = () => {
  const { theme } = useTheme();
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      content: "Olá! Sou o assistente Epictus IA. Como posso ajudar você hoje?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(uuidv4());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Efeito para scrollar para a última mensagem quando uma nova é adicionada
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Função para enviar uma mensagem
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Adiciona a mensagem do usuário à lista
    const userMessage: Message = {
      id: uuidv4(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // Adiciona uma mensagem temporária de carregamento
    setIsTyping(true);

    try {
      // Gera a resposta usando o serviço de IA
      const response = await generateAIResponse(inputMessage, sessionId);

      // Adiciona a resposta da IA à lista
      const aiMessage: Message = {
        id: uuidv4(),
        content: response,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Erro ao gerar resposta:", error);

      // Em caso de erro, adiciona uma mensagem de erro
      const errorMessage: Message = {
        id: uuidv4(),
        content: "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handler para enviar mensagem quando o usuário aperta Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Função para renderizar as mensagens
  const renderMessages = () => {
    return messages.map((message) => (
      <div
        key={message.id}
        className={`flex mb-4 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
      >
        {message.sender === "ai" && (
          <div className="mr-2 flex-shrink-0">
            <Avatar className="h-8 w-8 border border-indigo-200 dark:border-indigo-700">
              <AvatarFallback className="bg-blue-500 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        <div
          className={`rounded-lg px-4 py-2 max-w-[80%] ${
            message.sender === "user"
              ? "bg-blue-500 text-white rounded-tr-none"
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none"
          }`}
        >
          <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2">
            {message.sender === "ai" ? (
              <ReactMarkdown
                components={{
                  p: ({node, ...props}) => <p className="my-1" {...props} />,
                  h1: ({node, ...props}) => <h1 className="my-2 text-lg font-bold" {...props} />,
                  h2: ({node, ...props}) => <h2 className="my-2 text-md font-bold" {...props} />,
                  h3: ({node, ...props}) => <h3 className="my-2 text-sm font-bold" {...props} />,
                  ul: ({node, ...props}) => <ul className="my-1 ml-4 list-disc" {...props} />,
                  ol: ({node, ...props}) => <ol className="my-1 ml-4 list-decimal" {...props} />,
                  li: ({node, ...props}) => <li className="my-0.5" {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline 
                      ? <code className="bg-gray-700/50 px-1 py-0.5 rounded text-sm" {...props} />
                      : <code className="block bg-gray-800/50 p-2 rounded text-sm my-2 overflow-x-auto" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 pl-4 italic text-gray-600 dark:text-gray-400" {...props} />
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              <p className="my-1">{message.content}</p>
            )}
          </div>
          <div className="text-xs opacity-70 mt-1 text-right">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {message.sender === "user" && (
          <div className="ml-2 flex-shrink-0">
            <Avatar className="h-8 w-8 border border-indigo-200 dark:border-indigo-700">
              <AvatarFallback className="bg-blue-500 text-white">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-indigo-950 shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="p-3 border-b border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300">Epictus IA - Chat Avançado</h3>
      </div>

      {/* Área de mensagens */}
      <ScrollArea 
        className="flex-1 p-4 overflow-y-auto"
        ref={scrollAreaRef}
      >
        {renderMessages()}

        {/* Indicador de digitação */}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="mr-2 flex-shrink-0">
              <Avatar className="h-8 w-8 border border-indigo-200 dark:border-indigo-700">
                <AvatarFallback className="bg-blue-500 text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="rounded-lg px-4 py-2 max-w-[80%] bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Área de input */}
      <div className="p-3 border-t border-indigo-200 dark:border-indigo-800 bg-white dark:bg-indigo-950">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-8 w-8 flex-shrink-0"
          >
            <Paperclip className="h-4 w-4 text-blue-500" />
          </Button>

          <div className="relative flex-1">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              className="pr-10 rounded-full border-indigo-200 dark:border-indigo-700 bg-white dark:bg-indigo-900/50 h-9"
            />
          </div>

          <Button
            onClick={handleSendMessage}
            className="rounded-full h-8 w-8 bg-blue-500 hover:bg-blue-600 flex items-center justify-center p-0"
            disabled={isTyping || !inputMessage.trim()}
          >
            {isTyping ? (
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            ) : (
              <Send className="h-4 w-4 text-white" />
            )}
          </Button>

          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-8 w-8 flex-shrink-0"
          >
            <Mic className="h-4 w-4 text-blue-500" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TurboAdvancedMessageBox;