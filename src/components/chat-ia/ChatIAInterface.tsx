
import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Paperclip, 
  Mic, 
  Loader2,
  MoreHorizontal,
  ImagePlus,
  RefreshCw,
  Sparkles,
  Zap,
  Settings,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getResponse } from "@/services/epictusIAService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Message = {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
};

const ChatIAInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      sender: "ai",
      content: "Olá! Eu sou a Epictus IA, sua assistente inteligente. Como posso ajudar você hoje?",
      timestamp: new Date()
    }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Como funciona o método científico?",
    "Explique o teorema de Pitágoras",
    "Qual a diferença entre mitose e meiose?",
    "Quais são as principais causas da Revolução Francesa?"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    resizeTextarea();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsLoading(true);
    setIsSuggestionVisible(false);

    try {
      // Usando a API do Gemini através do serviço epictusIAService
      const response = await getResponse(userMessage.content);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: "ai",
        content: "Desculpe, tive um problema ao processar sua mensagem. Poderia tentar novamente?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setIsSuggestionVisible(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: "welcome-message-reset",
      sender: "ai",
      content: "Chat reiniciado. Como posso ajudar você agora?",
      timestamp: new Date()
    }]);
  };

  const formatMessageTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-gradient-to-b from-background to-background/95 dark:from-[#001427] dark:to-[#00080f]">
      {/* Header */}
      <div className="border-b dark:border-gray-800 p-4 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 bg-gradient-to-br from-[#FF6B00] to-[#FF8A3D] shadow-md">
                <AvatarImage src="/images/tempo-image-20250329T044440497Z.png" />
                <AvatarFallback className="bg-[#FF6B00]/20 text-[#FF6B00]">
                  <Bot size={18} />
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
            </div>
            <div>
              <h2 className="font-semibold text-lg leading-none flex items-center gap-2">
                Chat Epictus IA
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/15 transition-colors">
                        <Sparkles size={12} className="mr-1" /> Gemini
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Powered by Google Gemini API</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Assistente inteligente para seus estudos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={clearChat}>
                    <RefreshCw size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reiniciar conversa</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings size={14} /> Configurações
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <HelpCircle size={14} /> Ajuda
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Chat content */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 pr-2 overflow-y-auto" viewportClassName="pb-2">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} group`}
            >
              <div className={`flex gap-3 max-w-[85%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                {message.sender === "ai" && (
                  <Avatar className="h-8 w-8 mt-1 bg-gradient-to-br from-[#FF6B00] to-[#FF8A3D] shadow-md flex-shrink-0">
                    <AvatarImage src="/images/tempo-image-20250329T044440497Z.png" />
                    <AvatarFallback className="bg-[#FF6B00]/20 text-[#FF6B00]">
                      <Bot size={16} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="space-y-1">
                  <Card className={`border-0 shadow-md ${
                    message.sender === "user" 
                      ? "bg-gradient-to-br from-[#FF6B00] to-[#FF7B20] text-white"
                      : "bg-white dark:bg-gray-800/80 backdrop-blur-sm"
                  } overflow-hidden`}>
                    <CardContent className="p-3 pb-2">
                      <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
                      <div className={`text-xs opacity-70 mt-1 text-right ${
                        message.sender === "user" ? "text-white/80" : "text-muted-foreground"
                      }`}>
                        {formatMessageTimestamp(message.timestamp)}
                      </div>
                    </CardContent>
                  </Card>
                  {message.sender === "ai" && (
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                        <Zap size={14} />
                      </Button>
                    </div>
                  )}
                </div>
                {message.sender === "user" && (
                  <Avatar className="h-8 w-8 mt-1 flex-shrink-0 bg-gradient-to-br from-[#29335C] to-[#3A4A8C] shadow-md">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback className="bg-[#29335C]/20 text-[#29335C] dark:bg-[#29335C]/40 dark:text-white">
                      <UserIcon size={16} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <Avatar className="h-8 w-8 mt-1 bg-gradient-to-br from-[#FF6B00] to-[#FF8A3D] shadow-md flex-shrink-0">
                  <AvatarImage src="/images/tempo-image-20250329T044440497Z.png" />
                  <AvatarFallback className="bg-[#FF6B00]/20 text-[#FF6B00]">
                    <Bot size={16} />
                  </AvatarFallback>
                </Avatar>
                <Card className="border-0 shadow-md bg-white dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-3 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <p>A IA está processando sua mensagem...</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          {isSuggestionVisible && messages.length <= 1 && !isLoading && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-3 font-medium">Sugestões de perguntas:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="justify-start text-left h-auto py-2 px-3 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className="truncate">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className="p-4 border-t dark:border-gray-800 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30">
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full shrink-0 h-10 w-10 border-gray-200 dark:border-gray-700">
                  <ImagePlus size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Anexar imagem</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              className="min-h-[40px] max-h-[120px] resize-none pe-10 rounded-xl pl-4 pr-12 py-3 shadow-sm border-gray-200 dark:border-gray-700 focus-visible:ring-[#FF6B00]"
              rows={1}
              onInput={resizeTextarea}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 bottom-2 h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <Mic size={18} />
            </Button>
          </div>
          <Button 
            onClick={handleSendMessage} 
            disabled={inputValue.trim() === "" || isLoading}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white rounded-full h-10 w-10 p-0 shrink-0 shadow-md"
          >
            <Send size={18} />
          </Button>
        </div>
        <div className="mt-2 text-center">
          <p className="text-xs text-muted-foreground">
            As respostas são geradas pela API Gemini. A IA pode cometer erros.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatIAInterface;
