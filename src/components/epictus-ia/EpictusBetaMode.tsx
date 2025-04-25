import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  User, 
  Trash2, 
  Loader2,
  Star,
  Search,
  FileText,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EpictusMessageBox from "./message-box/EpictusMessageBox";
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
        <div className="w-[80%] h-[85%] relative mb-4">
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
            className="w-full h-full bg-gradient-to-b from-[#111827]/90 to-[#0F172A]/95 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl border border-[#1E293B]/40"
            ref={chatContainerRef}
          >
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#4A90E2]/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#4338CA]/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="p-5 space-y-8 relative z-10">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {message.sender === "ia" && (
                      <div className="avatar-container relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#4A90E2]/20 to-[#7579E7]/20 rounded-full blur-md transform scale-110 animate-pulse-soft"></div>
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1A1F35] to-[#2A3349] flex items-center justify-center mr-3 shadow-[0_4px_15px_rgba(0,0,0,0.25)] border border-[#3D4663]/40 relative z-10">
                          <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-[#1A1F35] to-[#2A3349] opacity-80"></div>
                          <Bot size={19} className="text-[#4A90E2] relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                        </div>
                      </div>
                    )}

                    <div
                      className={`group max-w-[80%] rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)] ${
                        message.sender === "user"
                          ? "bg-gradient-to-br from-[#3662A9]/90 via-[#3A78C9]/90 to-[#4A90E2]/90 text-white border border-[#5AA0F2]/30"
                          : "bg-gradient-to-br from-[#1A1F35]/90 via-[#232942]/90 to-[#2A3349]/90 text-white border border-[#3D4663]/30"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed font-light tracking-wide">{message.content}</p>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10">
                        <div className="flex items-center space-x-2">
                          {message.sender === "ia" && (
                            <Badge variant="outline" className="text-[10px] bg-[#2A3349]/70 text-[#A9B5D9] border-[#3D4663]/40 px-2 py-0.5 rounded-full transition-all group-hover:bg-[#3D4663]/70 group-hover:border-[#4A90E2]/40">
                              <Sparkles size={9} className="mr-1 text-[#4A90E2]" /> Epictus IA
                            </Badge>
                          )}
                        </div>
                        <p className="text-right text-[11px] text-[#D0D0D0]/80 font-mono tracking-tight">
                          {formatTimestamp(new Date(message.timestamp))}
                        </p>
                      </div>
                      
                      {/* Interactive elements on hover */}
                      <div className={`absolute ${message.sender === "user" ? "left-2" : "right-2"} top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                        {message.sender === "user" ? (
                          <button className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white/90 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
                          </button>
                        ) : (
                          <button className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white/90 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"></path></svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {message.sender === "user" && (
                      <div className="avatar-container relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#3662A9]/20 to-[#4A90E2]/20 rounded-full blur-md transform scale-110 animate-pulse-soft"></div>
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#3662A9] to-[#4A90E2] flex items-center justify-center ml-3 shadow-[0_4px_15px_rgba(0,0,0,0.25)] border border-[#5AA0F2]/30 relative z-10">
                          <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-[#3662A9] to-[#4A90E2] opacity-80"></div>
                          <User size={19} className="text-white relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="avatar-container relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#4A90E2]/20 to-[#7579E7]/20 rounded-full blur-md transform scale-110 animate-pulse-soft"></div>
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1A1F35] to-[#2A3349] flex items-center justify-center mr-3 shadow-[0_4px_15px_rgba(0,0,0,0.25)] border border-[#3D4663]/40 relative z-10">
                        <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-[#1A1F35] to-[#2A3349] opacity-80"></div>
                        <Bot size={19} className="text-[#4A90E2] relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-[#1A1F35]/90 via-[#232942]/90 to-[#2A3349]/90 p-5 rounded-2xl flex items-center shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#3D4663]/30">
                      <div className="typing-indicator flex space-x-2">
                        <div className="typing-circle w-2.5 h-2.5 rounded-full bg-[#4A90E2] animate-pulse" style={{ animationDelay: "0ms" }}></div>
                        <div className="typing-circle w-2.5 h-2.5 rounded-full bg-[#4A90E2] animate-pulse" style={{ animationDelay: "300ms" }}></div>
                        <div className="typing-circle w-2.5 h-2.5 rounded-full bg-[#4A90E2] animate-pulse" style={{ animationDelay: "600ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Área para botões removida */}

        {/* Caixa de envio de mensagens idêntica ao TurboMessageBox */}
        <div className="w-full flex justify-center">
          <EpictusMessageBox 
            inputMessage={inputMessage} 
            setInputMessage={setInputMessage} 
            handleSendMessage={handleSendMessage} 
            handleKeyDown={handleKeyDown} 
            charCount={charCount} 
            MAX_CHARS={MAX_CHARS} 
            isTyping={isTyping} 
            handleButtonClick={handleButtonClick}
          />
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