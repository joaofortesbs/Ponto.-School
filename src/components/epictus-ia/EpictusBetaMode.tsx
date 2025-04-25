import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Loader2,
  Star,
  Plus,
  Mic,
  Brain,
  BookOpen,
  AlignJustify,
  RotateCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TurboHeader from "./turbo-header/TurboHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { v4 as uuidv4 } from 'uuid';
import { generateAIResponse, addMessageToHistory, createMessage } from "@/services/epictusIAService";

interface Message {
  id: string;
  sender: "user" | "ia";
  content: string;
  timestamp: Date;
}

const EpictusBetaMode: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [profileIcon, setProfileIcon] = useState(
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
  const [profileName, setProfileName] = useState("Personalidades");
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedMessages = localStorage.getItem('epictus_beta_chat');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages) as Message[];
        return parsedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar histórico do chat:", error);
    }

    // Mensagem inicial padrão
    return [{
      id: uuidv4(),
      sender: "ia",
      content: "Olá, João! Eu sou o Epicus IA, seu assistente para aprendizado e programação. Como posso te ajudar hoje?",
      timestamp: new Date()
    }];
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 1000;
  const [sessionId] = useState(() => localStorage.getItem('epictus_beta_session_id') || uuidv4());

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Definir opções para o dropdown de personalidades
  const profileOptions = [
    { 
      id: "estudante",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0D23A0]"><path d="M12 10v-2a2 2 0 0 0-2-2V4"></path><path d="M10 4H8a2 2 0 0 0-2 2v1a2 2 0 0 0-2 2v1"></path><path d="M14 4h2a2 2 0 0 1 2 2v1a2 2 0 0 1 2 2v1"></path><path d="M18 15v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2h-1a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2Z"></path></svg>, 
      color: "#0D23A0", 
      name: "Estudante",
      onClick: () => {
        setSelectedProfile("Estudante");
        setProfileName("Estudante");
        setProfileIcon(<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 10v-2a2 2 0 0 0-2-2V4"></path><path d="M10 4H8a2 2 0 0 0-2 2v1a2 2 0 0 0-2 2v1"></path><path d="M14 4h2a2 2 0 0 1 2 2v1a2 2 0 0 1 2 2v1"></path><path d="M18 15v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2h-1a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2Z"></path></svg>);
      }
    },
    { 
      id: "professor",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5B21BD]"><path d="M8 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.93a2 2 0 0 1-1.66-.9L15.12 4a2 2 0 0 0-1.66-.9H8.83A3 3 0 0 0 6 5.17V17"></path><path d="M2 14h7"></path><path d="M6 10 2 14l4 4"></path></svg>, 
      color: "#5B21BD", 
      name: "Professor",
      onClick: () => {
        setSelectedProfile("Professor");
        setProfileName("Professor");
        setProfileIcon(<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M8 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.93a2 2 0 0 1-1.66-.9L15.12 4a2 2 0 0 0-1.66-.9H8.83A3 3 0 0 0 6 5.17V17"></path><path d="M2 14h7"></path><path d="M6 10 2 14l4 4"></path></svg>);
      }
    },
    { 
      id: "coordenador",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1230CC]"><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"></path><path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8"></path><path d="M15 2v5h5"></path></svg>, 
      color: "#1230CC", 
      name: "Coordenador",
      onClick: () => {
        setSelectedProfile("Coordenador");
        setProfileName("Coordenador");
        setProfileIcon(<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"></path><path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8"></path><path d="M15 2v5h5"></path></svg>);
      }
    },
    { 
      id: "expert",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4A0D9F]"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M7 14v.01"></path></svg>, 
      color: "#4A0D9F", 
      name: "Expert",
      onClick: () => {
        setSelectedProfile("Expert");
        setProfileName("Expert");
        setProfileIcon(<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M7 14v.01"></path></svg>);
      }
    }
  ];

  // Configurar efeito de animação ao carregar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Autofoco no campo de texto ao carregar
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Persistir mensagens no localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('epictus_beta_chat', JSON.stringify(messages));
      localStorage.setItem('epictus_beta_session_id', sessionId);
    }
  }, [messages, sessionId]);

  // Rolar para o final quando novas mensagens são adicionadas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setInputMessage(value);
      setCharCount(value.length);
    }
  };

  const handleSendMessage = async () => {
    const trimmedMessage = inputMessage.trim();

    if (!trimmedMessage) {
      setError("Por favor, digite uma mensagem.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (isTyping) return; // Prevenir duplicação

    const userMessage: Message = {
      id: uuidv4(),
      sender: "user",
      content: trimmedMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setCharCount(0);
    setIsTyping(true);

    try {
      // Indicador de digitação antes de receber a resposta da API
      const typingTimeout = setTimeout(() => {
        // Se a API demorar muito, mostrar indicador de digitação
        setIsTyping(true);
      }, 300);

      try {
        // Chamada para a API Gemini através do nosso serviço
        console.log("Enviando mensagem para Gemini:", trimmedMessage);
        const response = await generateAIResponse(trimmedMessage, sessionId);
        console.log("Resposta recebida de Gemini");

        // Criar mensagem com a resposta da IA
        const aiMessage: Message = {
          id: uuidv4(),
          sender: "ia",
          content: response,
          timestamp: new Date()
        };

        // Adicionar a resposta ao estado
        setMessages(prev => [...prev, aiMessage]);
      } catch (err) {
        console.error("Erro ao gerar resposta com Gemini:", err);
        
        // Mensagem de erro para o usuário
        const errorMessage: Message = {
          id: uuidv4(),
          sender: "ia",
          content: "Desculpe, encontrei um problema ao processar sua solicitação. Por favor, tente novamente em alguns instantes.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        clearTimeout(typingTimeout);
        setIsTyping(false);
      }
    } catch (err) {
      console.error("Erro no processo de envio de mensagem:", err);
      setIsTyping(false);
      setError("Houve um erro ao processar sua mensagem. Tente novamente.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    const initialMessage: Message = {
      id: uuidv4(),
      sender: "ia",
      content: "Olá, João! Eu sou o Epicus IA, seu assistente para aprendizado e programação. Como posso te ajudar hoje?",
      timestamp: new Date()
    };

    setMessages([initialMessage]);
    setIsConfirmOpen(false);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Simulação de funcionalidades dos botões existentes
  const handleButtonClick = (action: string) => {
    const actionMap: Record<string, string> = {
      "buscar": "Iniciando busca com base na conversa atual...",
      "pensar": "Analisando a conversa para gerar insights...",
      "gerarImagem": "Gerando imagem baseada no contexto da conversa...",
      "simuladorProvas": "Preparando simulado com base no conteúdo discutido...",
      "gerarCaderno": "Criando caderno com o conteúdo da nossa conversa...",
      "criarFluxograma": "Gerando fluxograma visual do conteúdo...",
      "reescreverExplicacao": "Reescrevendo a última explicação em formato diferente...",
      "analiseRedacao": "Pronto para analisar sua redação. Por favor, envie o texto...",
      "resumirConteudo": "Resumindo o conteúdo da nossa conversa...",
      "espacosAprendizagem": "Abrindo espaços de aprendizagem relacionados..."
    };

    const responseMessage = actionMap[action] || "Executando ação...";

    const botMessage: Message = {
      id: uuidv4(),
      sender: "ia",
      content: responseMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho do Modo Epictus Turbo */}
      <TurboHeader profileOptions={profileOptions} initialProfileIcon={profileIcon} initialProfileName={profileName} />

      {/* Interface de Chat */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden bg-[#0A1625]">
        {/* Área de conversas */}
        <div className="w-[80%] h-[60%] relative mb-4">
          <div className="absolute top-0 right-0 z-10 p-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-[#A0A0A0] hover:text-[#FF4D4D] hover:bg-transparent"
              onClick={() => setIsConfirmOpen(true)}
              aria-label="Limpar chat"
            >
              <Trash2 size={24} />
            </Button>
          </div>

          <ScrollArea 
            className="w-full h-full bg-[#1A2634] rounded-lg overflow-hidden"
            ref={chatContainerRef}
          >
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "ia" && (
                    <div className="w-8 h-8 rounded-full bg-[#2F3B4C] flex items-center justify-center mr-2">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-md p-3 ${
                      message.sender === "user"
                        ? "bg-[#4A90E2] text-white"
                        : "bg-[#2F3B4C] text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <p className="text-right text-[12px] text-[#A0A0A0] mt-1">
                      {formatTimestamp(new Date(message.timestamp))}
                    </p>
                  </div>

                  {message.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-[#4A90E2] flex items-center justify-center ml-2">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-[#2F3B4C] flex items-center justify-center mr-2">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-[#2F3B4C] p-3 rounded-md flex items-center">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-[#4A90E2] animate-pulse" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-[#4A90E2] animate-pulse" style={{ animationDelay: "300ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-[#4A90E2] animate-pulse" style={{ animationDelay: "600ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Área para botões removida */}

        {/* Caixa de envio de mensagens idêntica ao TurboMessageBox */}
        <div className="w-[80%] mx-auto mb-2 p-1">
          {error && (
            <Alert className="absolute -top-12 left-0 right-0 bg-red-500 text-white border-none">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <motion.div 
            className="relative bg-gradient-to-r from-[#050e1d]/90 to-[#0d1a30]/90 rounded-2xl shadow-xl 
                     border border-white/5 backdrop-blur-sm overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Partículas de fundo */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            </div>

            {/* Container principal */}
            <div className="relative z-10 p-4">
              {/* Área de input */}
              <div className="flex items-center gap-2">
                <motion.button
                  className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                           flex items-center justify-center shadow-lg text-white"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {}}
                >
                  <Plus size={22} />
                </motion.button>

                <div className={`relative flex-grow overflow-hidden 
                                bg-gradient-to-r from-[#0c2341]/30 to-[#0f3562]/30 
                                rounded-xl border ${isTyping ? 'border-[#1230CC]/70' : 'border-white/10'} 
                                transition-all duration-300`}>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => {
                      handleInputChange({
                        target: { value: e.target.value }
                      } as React.ChangeEvent<HTMLTextAreaElement>);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite um comando ou pergunta para o Epictus Turbo..."
                    className="w-full bg-transparent text-white py-4 px-4 outline-none placeholder:text-gray-400"
                    disabled={isTyping}
                  />
                  
                  <div className="absolute right-3 bottom-1.5 text-xs text-gray-400 bg-[#0c2341]/50 px-1.5 py-0.5 rounded-md">
                    {charCount}/{MAX_CHARS}
                  </div>
                </div>

                {/* Botão de microfone (quando não há texto) */}
                {!inputMessage.trim() ? (
                  <motion.button 
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                             flex items-center justify-center shadow-lg text-white"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mic size={20} />
                  </motion.button>
                ) : (
                  /* Botão de enviar - Visível apenas quando há conteúdo no input */
                  <motion.button
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                             flex items-center justify-center shadow-lg text-white"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ 
                      boxShadow: ["0 0 0px rgba(13, 35, 160, 0)", "0 0 15px rgba(13, 35, 160, 0.5)", "0 0 0px rgba(13, 35, 160, 0)"],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    onClick={handleSendMessage}
                    disabled={isTyping}
                  >
                    {isTyping ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                      <Send size={20} />
                    )}
                  </motion.button>
                )}
              </div>

              {/* Ações rápidas */}
              <motion.div 
                className="quick-actions mt-3 pb-1 flex gap-2 overflow-x-auto scrollbar-hide"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <motion.button
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0c2341]/50 to-[#0f3562]/50 
                           text-white rounded-full whitespace-nowrap border border-white/10 backdrop-blur-md"
                  whileHover={{ y: -2, scale: 1.05, boxShadow: "0 10px 25px -5px rgba(13, 35, 160, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Brain size={16} className="text-blue-300" />
                  <span className="text-sm font-medium">Simulador de Provas</span>
                </motion.button>
                <motion.button
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0c2341]/50 to-[#0f3562]/50 
                           text-white rounded-full whitespace-nowrap border border-white/10 backdrop-blur-md"
                  whileHover={{ y: -2, scale: 1.05, boxShadow: "0 10px 25px -5px rgba(13, 35, 160, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <BookOpen size={16} className="text-emerald-300" />
                  <span className="text-sm font-medium">Gerar Caderno</span>
                </motion.button>
                <motion.button
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0c2341]/50 to-[#0f3562]/50 
                           text-white rounded-full whitespace-nowrap border border-white/10 backdrop-blur-md"
                  whileHover={{ y: -2, scale: 1.05, boxShadow: "0 10px 25px -5px rgba(13, 35, 160, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <AlignJustify size={16} className="text-purple-300" />
                  <span className="text-sm font-medium">Criar Fluxograma</span>
                </motion.button>
                <motion.button
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0c2341]/50 to-[#0f3562]/50 
                           text-white rounded-full whitespace-nowrap border border-white/10 backdrop-blur-md"
                  whileHover={{ y: -2, scale: 1.05, boxShadow: "0 10px 25px -5px rgba(13, 35, 160, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <RotateCw size={16} className="text-indigo-300" />
                  <span className="text-sm font-medium">Reescrever Explicação</span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal de confirmação */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="bg-[#1A2634] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Limpar chat</DialogTitle>
            <DialogDescription className="text-gray-400">
              Deseja limpar o chat? Isso não pode ser desfeito.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              className="bg-transparent text-white border-gray-700 hover:bg-[#2F3B4C]"
            >
              Cancelar
            </Button>
            <Button
              onClick={clearChat}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EpictusBetaMode;