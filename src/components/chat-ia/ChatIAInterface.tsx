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
  HelpCircle,
  Copy,
  CheckCircle,
  AlertCircle,
  BrainCircuit,
  Waypoints
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
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { getResponse } from "@/services/epictusIAService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/ThemeProvider";

type Message = {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
};

const ChatIAInterface = () => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      sender: "ai",
      content: "Olá! Eu sou a Epictus IA, sua assistente inteligente. Como posso ajudar você hoje? Estou integrada com o Google Gemini para fornecer as melhores respostas para suas dúvidas.",
      timestamp: new Date()
    }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Como funciona o método científico?",
    "Explique o teorema de Pitágoras",
    "Qual a diferença entre mitose e meiose?",
    "Quais são as principais causas da Revolução Francesa?",
    "Como posso melhorar minha concentração nos estudos?",
    "O que é inteligência artificial e como funciona?"
  ];

  useEffect(() => {
    scrollToBottom();

    // Verificar conectividade com a API
    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch("https://generativelanguage.googleapis.com/v1/models?key=AIzaSyBSRpPQPyK6H96Z745ICsFtKzsTFdKpxWU", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log("Conectado com sucesso à API Gemini");
          setIsConnected(true);
        } else {
          console.warn("API Gemini respondeu com status:", response.status);
          setIsConnected(false);
        }
      } catch (error) {
        console.error("Erro ao verificar conectividade:", error);
        setIsConnected(false);
      }
    };

    // Verificar conectividade ao carregar e a cada 2 minutos
    checkConnection();

    // Programar verificações periódicas de conectividade para manter o status atualizado
    const intervalId = setInterval(checkConnection, 120000); // A cada 2 minutos

    return () => clearInterval(intervalId); // Limpar o intervalo ao desmontar o componente
  }, []);

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

  const copyMessageToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopiedMessageId(id);
        toast({
          title: "Texto copiado!",
          description: "O conteúdo da mensagem foi copiado para a área de transferência.",
          duration: 3000,
        });

        // Reset copied state after 3 seconds
        setTimeout(() => {
          setCopiedMessageId(null);
        }, 3000);
      })
      .catch(err => {
        console.error("Erro ao copiar texto:", err);
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o texto. Tente novamente.",
          variant: "destructive",
          duration: 3000,
        });
      });
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
      console.log("Enviando solicitação para a API Gemini...");
      
      // Estamos usando a API do Gemini para processar a mensagem do usuário
      const response = await getResponse(userMessage.content);
      
      // Validamos que a resposta não é vazia
      if (!response || response.trim() === "") {
        throw new Error("A API retornou uma resposta vazia");
      }
      
      // Verificar se é uma mensagem de erro da nossa função de API
      const isErrorResponse = response.startsWith("⚠️");
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Se for uma resposta de erro, mantemos o contador de tentativas
      if (isErrorResponse) {
        setRetryCount(prev => prev + 1);
      } else {
        // Caso contrário, resetamos o contador
        setRetryCount(0);
      }
    } catch (error) {
      console.error("Erro crítico ao processar resposta da API:", error);
      
      // Mostrar mensagem de erro técnico
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: "ai",
        content: "⚠️ Ocorreu um erro técnico ao processar sua solicitação. Nossos servidores estão tentando se reconectar à API do Gemini. Este é um erro real, não uma resposta pré-definida.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setRetryCount(prev => prev + 1);
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
    setIsSuggestionVisible(true);
    setRetryCount(0);
  };

  const formatMessageTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const retryLastMessage = async () => {
    if (messages.length < 2) return;

    // Find the last user message
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.sender === "user");
    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = [...messages].reverse()[lastUserMessageIndex];

    // Remove the last AI response if it was an error
    if (messages[messages.length - 1].sender === "ai") {
      setMessages(prev => prev.slice(0, -1));
    }

    setIsLoading(true);
    
    // Adicionar uma mensagem indicando que estamos tentando novamente
    const retryingMessage: Message = {
      id: `retrying-${Date.now()}`,
      sender: "ai",
      content: "Estou tentando novamente conectar com a API do Gemini...",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, retryingMessage]);

    try {
      // Fazemos uma pausa breve antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remover a mensagem de tentativa
      setMessages(prev => prev.filter(msg => msg.id !== retryingMessage.id));
      
      // Diretamente chamar a API do Gemini sem fallbacks
      console.log("Tentando novamente com a API do Gemini...");
      const response = await getResponse(lastUserMessage.content);

      const aiMessage: Message = {
        id: `ai-retry-${Date.now()}`,
        sender: "ai",
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Se a resposta não é de erro, resetar contador
      if (!response.startsWith("⚠️")) {
        setRetryCount(0);
      }
    } catch (error) {
      console.error("Erro ao processar mensagem na tentativa:", error);

      // Remover a mensagem de tentativa
      setMessages(prev => prev.filter(msg => msg.id !== retryingMessage.id));

      const errorMessage: Message = {
        id: `error-retry-${Date.now()}`,
        sender: "ai",
        content: "⚠️ A API do Gemini continua inacessível. Este é um erro real com a API, não uma resposta local. Por favor, tente novamente em alguns instantes.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-gradient-to-b from-background to-background/95 dark:from-[#001427] dark:to-[#00080f]">
      {/* Header */}
      <div className="border-b dark:border-gray-800 p-4 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 bg-gradient-to-br from-[#FF6B00] to-[#FF8A3D] shadow-md">
                <AvatarImage src="/images/tempo-image-20250329T044440497Z.png" />
                <AvatarFallback className="bg-[#FF6B00]/20 text-[#FF6B00]">
                  <BrainCircuit size={18} />
                </AvatarFallback>
              </Avatar>
              <span className={`absolute bottom-0 right-0 w-3 h-3 ${isConnected ? 'bg-green-500' : 'bg-amber-500'} border-2 border-white dark:border-gray-900 rounded-full transition-colors duration-300`}></span>
            </div>
            <div>
              <h2 className="font-semibold text-lg leading-none flex items-center gap-2">
                Chat Epictus IA
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/15 transition-colors">
                        <Sparkles size={12} className="mr-1" /> Gemini Pro
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Powered by Google Gemini API</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                {isConnected ? 'Conectado à API do Gemini' : 'Modo local - tentando reconectar'}
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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Settings size={14} /> Configurações do chat
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => setIsSuggestionVisible(true)}>
                  <Waypoints size={14} /> Mostrar sugestões
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <HelpCircle size={14} /> Ajuda e suporte
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
                      <BrainCircuit size={16} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="space-y-1">
                  <Card className={`border-0 shadow-md ${
                    message.sender === "user" 
                      ? "bg-gradient-to-br from-[#FF6B00] to-[#FF7B20] text-white"
                      : message.content.includes("Desculpe, tive um problema") || message.content.includes("Não foi possível conectar") 
                        ? "bg-white dark:bg-gray-800/80 backdrop-blur-sm border-l-4 border-l-amber-500"
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                              onClick={() => copyMessageToClipboard(message.content, message.id)}
                            >
                              {copiedMessageId === message.id ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>{copiedMessageId === message.id ? "Copiado!" : "Copiar mensagem"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {message.content.includes("Desculpe, tive um problema") || 
                       message.content.includes("Não foi possível conectar") && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={retryLastMessage}
                              >
                                <RefreshCw size={14} className="text-amber-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>Tentar novamente</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
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
                    <BrainCircuit size={16} />
                  </AvatarFallback>
                </Avatar>
                <Card className="border-0 shadow-md bg-white dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-3 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <p>Processando sua solicitação...</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          {isSuggestionVisible && messages.length <= 3 && !isLoading && (
            <div className="mt-6 mb-2">
              <p className="text-sm text-muted-foreground mb-3 font-medium flex items-center gap-1">
                <Sparkles size={14} className="text-amber-500" /> 
                Sugestões de perguntas:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="justify-start text-left h-auto py-2 px-3 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-all"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className="truncate">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          {!isConnected && !isLoading && messages.length <= 1 && (
            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 mb-4 mt-4">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-800 dark:text-amber-400 mb-1">Conectividade limitada</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Detectamos que a conexão com a API do Gemini pode estar instável. 
                    Suas perguntas ainda serão processadas, mas pode haver algum atraso nas respostas.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className="p-4 border-t dark:border-gray-800 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 sticky bottom-0">
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full shrink-0 h-10 w-10 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                >
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
              className="min-h-[40px] max-h-[120px] resize-none pe-10 rounded-xl pl-4 pr-12 py-3 shadow-md border-gray-200 dark:border-gray-700 focus-visible:ring-[#FF6B00] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
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
            className={`${
              inputValue.trim() === "" || isLoading
                ? "bg-gray-400 dark:bg-gray-700"
                : "bg-gradient-to-r from-[#FF6B00] to-[#FF8A3D]"
            } text-white rounded-full h-10 w-10 p-0 shrink-0 shadow-md transition-all duration-200 hover:shadow-lg`}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </div>
        <div className="mt-2 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-amber-500'}`}></span>
            Respostas geradas pela API Gemini Pro {isConnected ? '- Conectado' : '- Reconectando...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatIAInterface;