import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, X, PauseCircle, PlayCircle, XCircle } from "lucide-react";
import { simulateAIResponse, cancelResponse, pauseResponse, resumeResponse } from "@/services/aiChatService";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const FloatingChatSupport: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [partialResponse, setPartialResponse] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const loadingPhrases = [
    "Formulando resposta",
    "Preparando explicação",
    "Te deixando mais inteligente",
    "Conectando você com o futuro"
  ];

  const [currentLoadingPhrase, setCurrentLoadingPhrase] = useState(loadingPhrases[0]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTyping) {
      let index = 0;
      interval = setInterval(() => {
        index = (index + 1) % loadingPhrases.length;
        setCurrentLoadingPhrase(loadingPhrases[index]);
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTyping]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // If no welcome message, add one
      if (messages.length === 0) {
        setMessages([
          {
            id: "welcome",
            content: "Olá! Sou o assistente de suporte da Ponto.School. Como posso ajudar você hoje?",
            sender: "ai",
            timestamp: new Date(),
          },
        ]);
      }
    }
  };

  const scrollToBottom = () => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, partialResponse]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const bottomTolerance = 30;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < bottomTolerance;
      setAutoScroll(isAtBottom);
    }
  };

  const handleCancel = () => {
    cancelResponse();
    setIsTyping(false);
    setPartialResponse("");
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeResponse();
      setIsPaused(false);
    } else {
      pauseResponse();
      setIsPaused(true);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);
    setPartialResponse("");

    try {
      const aiMessageId = `ai-${Date.now()}`;

      simulateAIResponse(
        newMessage,
        (partialContent) => {
          setPartialResponse(partialContent);
        },
        (finalContent) => {
          setIsTyping(false);
          setPartialResponse("");
          setIsPaused(false);

          const aiMessage: Message = {
            id: aiMessageId,
            content: finalContent,
            sender: "ai",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, aiMessage]);
        }
      );
    } catch (error) {
      console.error("Error generating AI response:", error);
      setIsTyping(false);
      setPartialResponse("");

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "Desculpe, houve um erro ao processar sua mensagem. Por favor, tente novamente.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const formatMessageContent = (content: string) => {
    let formattedContent = content;

    // Replace markdown-style bold with HTML bold
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Replace markdown-style headers
    formattedContent = formattedContent.replace(/^# (.*?)$/gm, '<h1 class="text-xl font-bold mb-2 text-[#FF6B00]">$1</h1>');
    formattedContent = formattedContent.replace(/^## (.*?)$/gm, '<h2 class="text-lg font-bold mb-2 text-[#FF6B00]">$1</h2>');
    formattedContent = formattedContent.replace(/^### (.*?)$/gm, '<h3 class="text-md font-bold mb-2 text-[#FF6B00]">$1</h3>');

    // Replace markdown-style lists
    formattedContent = formattedContent.replace(/^\- (.*?)$/gm, '<li class="ml-4">• $1</li>');
    formattedContent = formattedContent.replace(/^(\d+)\. (.*?)$/gm, '<li class="ml-4"><span class="font-bold text-[#FF6B00]">$1.</span> $2</li>');

    // Replace markdown-style links
    formattedContent = formattedContent.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-500 underline" target="_blank">$1</a>');

    // Replace line breaks with <br>
    formattedContent = formattedContent.replace(/\n/g, '<br>');

    return formattedContent;
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
      <div
        className={`bg-white dark:bg-slate-950 rounded-lg shadow-lg transition-all duration-300 overflow-hidden ${
          isOpen ? "w-80 h-[500px] opacity-100" : "w-0 h-0 opacity-0"
        }`}
      >
        {isOpen && (
          <div className="flex flex-col h-full">
            <div className="p-2 border-b bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/images/ponto-school-logo.png" alt="AI" />
                    <AvatarFallback className="bg-[#FF6B00] text-white">AI</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">Assistente de Suporte</p>
                    <p className="text-xs opacity-80">Ponto.School</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleChat}
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs">
                Assistente alimentado pela Ponto.School, aqui para responder suas dúvidas.
              </p>
            </div>

            <div 
              className="flex-1 overflow-y-auto p-3 space-y-4" 
              ref={chatContainerRef}
              onScroll={handleScroll}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-[#FF6B00] text-white"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-200"
                    }`}
                  >
                    {message.sender === "ai" ? (
                      <div
                        className="text-sm prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                      />
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <div
                      className={`text-xs mt-1 ${
                        message.sender === "user"
                          ? "text-white/70"
                          : "text-slate-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-200">
                    {partialResponse ? (
                      <div
                        className="text-sm prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: formatMessageContent(partialResponse),
                        }}
                      />
                    ) : (
                      <div className="flex items-center">
                        <span className="mr-2">{currentLoadingPhrase}</span>
                        <div className="text-[#FF6B00]">
                          <div className="loading-dots flex items-center">
                            <span>.</span>
                            <span>.</span>
                            <span>.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isTyping && (
                <div className="flex justify-center my-2 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCancel}
                    className="bg-red-100 text-red-600 hover:bg-red-200 border-red-300"
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Cancelar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePauseResume}
                    className={isPaused 
                      ? "bg-green-100 text-green-600 hover:bg-green-200 border-green-300" 
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200 border-blue-300"
                    }
                  >
                    {isPaused ? (
                      <>
                        <PlayCircle className="h-4 w-4 mr-1" /> Retomar
                      </>
                    ) : (
                      <>
                        <PauseCircle className="h-4 w-4 mr-1" /> Pausar
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-2 border-t dark:border-slate-800 bg-white dark:bg-slate-950"
            >
              <div className="relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="pr-10"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newMessage.trim() || isTyping}
                  className={`absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 ${
                    !newMessage.trim() ? "opacity-50" : "opacity-100"
                  }`}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      <Button
        onClick={toggleChat}
        className={`mt-4 w-12 h-12 rounded-full bg-[#FF6B00] hover:bg-[#f97316] text-white shadow-lg p-0 ${
          isOpen ? "rotate-180" : ""
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default FloatingChatSupport;