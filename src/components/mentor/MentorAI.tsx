
import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Brain, Send, X, Sparkles, DownloadCloud, Image, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const MentorAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Sou o Mentor IA da Ponto.School. Como posso ajudar você hoje? Posso responder dúvidas sobre matérias, explicar conceitos ou ajudar com exercícios.",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Estou processando sua pergunta sobre "${inputMessage}". Como Mentor IA, posso ajudar com explicações detalhadas, exemplos práticos e sugestões de estudo personalizadas.`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start gap-2 max-w-[80%] ${
                  message.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {message.sender === "ai" && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src="/images/mentor-ai-avatar.png" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400">
                      <Brain className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-[#FF6B00] text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
                {message.sender === "user" && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-[#FF6B00] text-white">
                      {localStorage.getItem('userFirstName')?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[80%]">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400">
                    <Brain className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-9 w-9 flex-shrink-0"
          >
            <Image className="h-5 w-5" />
          </Button>
          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder="Digite sua pergunta..."
              className="w-full h-10 px-4 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] text-sm"
            />
            {inputMessage && (
              <Button
                onClick={handleSendMessage}
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-[#FF6B00] text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-9 w-9 flex-shrink-0"
          >
            <Sparkles className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MentorAI;
