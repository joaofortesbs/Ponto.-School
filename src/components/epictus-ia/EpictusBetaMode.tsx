
import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Loader2,
  Star,
  Zap,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { v4 as uuidv4 } from 'uuid';
import { generateAIResponse } from "@/services/epictusIAService";

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
      // Simulação de resposta (1-2 segundos)
      setTimeout(async () => {
        try {
          const response = await generateAIResponse(trimmedMessage, sessionId);
          
          const aiMessage: Message = {
            id: uuidv4(),
            sender: "ia",
            content: response,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
          console.error("Erro ao gerar resposta:", err);
          const errorMessage: Message = {
            id: uuidv4(),
            sender: "ia",
            content: "Desculpe, algo deu errado. Tente novamente!",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsTyping(false);
        }
      }, Math.random() * 1000 + 1000); // 1-2 segundos
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
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
      <div className="w-full p-4">
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`w-full hub-connected-width bg-gradient-to-r from-[#050e1d] to-[#0d1a30] backdrop-blur-lg py-4 px-5 flex items-center justify-between rounded-xl relative`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-20">
            <div className={`absolute inset-0 bg-gradient-to-r from-[#0D23A0] via-[#1230CC] to-[#4A0D9F] ${isHovered ? 'opacity-60' : 'opacity-30'} transition-opacity duration-700`}></div>
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          </div>

          {/* Glowing orbs */}
          <motion.div 
            className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-[#0D23A0]/10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          <motion.div 
            className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-[#4A0D9F]/10 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.5,
            }}
          />

          {/* Logo and title section */}
          <div className="flex items-center gap-4 z-10 flex-1">
            <div className="relative group mr-3">
              <div className={`absolute inset-0 bg-gradient-to-br from-[#0D23A0] via-[#1230CC] to-[#4A0D9F] rounded-full ${isHovered ? 'blur-[6px]' : 'blur-[3px]'} opacity-80 group-hover:opacity-100 transition-all duration-300 scale-110`}></div>
              <motion.div 
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#4A0D9F] flex items-center justify-center relative z-10 border-2 border-white/10 shadow-xl"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <AnimatePresence>
                  {animationComplete ? (
                    <motion.div
                      key="icon"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center justify-center"
                    >
                      <span className="text-white font-bold text-lg">IA</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center"
                    >
                      <Sparkles className="h-6 w-6 text-white animate-pulse" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Epictus BETA
                </h1>
                <motion.div
                  className="flex items-center px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#0D23A0] to-[#4A0D9F] text-xs font-medium text-white shadow-lg dropdown-isolate personalidades-root"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Premium
                </motion.div>
              </div>
              <p className="text-white/70 text-sm mt-0.5 font-medium tracking-wide">
                Versão beta avançada com recursos experimentais
              </p>
            </div>
          </div>

          {/* New header icons */}
          <div className="flex items-center justify-center z-10 relative gap-3">
            {/* Personalidades dropdown */}
            <div className="relative icon-container mr-5 group" style={{ zIndex: 99999, position: "relative" }}>
              <motion.div
                className="relative w-auto h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow px-3 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={false}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  {profileIcon}
                  <span className="text-white text-sm font-medium">{profileName}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </motion.div>

              {/* Dropdown content - absolute positioning relative to its container */}
              <div className="fixed group-hover:opacity-100 group-hover:visible opacity-0 invisible transition-all duration-300 z-[99999] left-auto mt-2 personalidades-dropdown" style={{ top: "calc(100% + 10px)" }}>
                <div className="w-52 bg-gradient-to-r from-[#0c2341] to-[#0f3562] rounded-lg shadow-xl overflow-hidden border border-white/10 backdrop-blur-md" style={{ position: "relative", zIndex: 99999 }}>
                  <div className="max-h-60 overflow-y-auto py-2">
                    {profileOptions.map((item, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer mb-1 mx-2 rounded-lg hover:bg-white/10 transition-all"
                        whileHover={{ 
                          y: -2, 
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                          scale: 1.02
                        }}
                        onClick={item.onClick}
                      >
                        <div 
                          className="w-7 h-7 rounded-md flex items-center justify-center shadow-inner"
                          style={{ 
                            background: `linear-gradient(135deg, ${item.color}30, ${item.color}50)`,
                            boxShadow: `0 0 15px ${item.color}40`
                          }}
                        >
                          {item.icon}
                        </div>
                        <span className="text-white text-sm">{item.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* History icon */}
            <div className="relative icon-container">
              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={false}
                transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </motion.div>
            </div>

            {/* Favorites icon */}
            <div className="relative icon-container">
              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={false}
                transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </motion.div>
            </div>

            {/* Calendar icon */}
            <div className="relative icon-container">
              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={false}
                transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </motion.div>
            </div>

            {/* Notifications icon */}
            <div className="relative icon-container">
              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={false}
                transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </motion.div>
            </div>

            {/* Profile picture - a bit more spaced */}
            <div className="relative profile-icon-container ml-4">
              <motion.div
                className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] p-[2px] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={false}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-full rounded-full bg-[#0f2a4e] flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-[#0c2341]/80 to-[#0f3562]/80 flex items-center justify-center text-white text-lg font-bold">
                    JF
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Hidden until expansion - will appear when user interaction happens */}
          <div className="absolute bottom-0 left-0 w-full h-1">
            <div className="h-full bg-gradient-to-r from-transparent via-[#1230CC] to-transparent opacity-30"></div>
          </div>
        </motion.header>
      </div>
      
      {/* Cabeçalho original mantido */}
      <div className="border-b bg-[#0A1625] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                Epictus BETA
                <Badge className="bg-[#FF6B00] text-white text-xs">#Beta IA</Badge>
              </h2>
              <p className="text-sm text-white/60">Versão beta avançada com recursos experimentais</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              className="bg-[#1A2634] text-white text-sm rounded-md p-2 border border-gray-700"
              aria-label="Selecionar personalidade"
            >
              <option value="default">Personalidades</option>
              <option value="teacher">Professor</option>
              <option value="programmer">Programador</option>
              <option value="scientist">Cientista</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Área principal do chat */}
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
        
        {/* Barra de ferramentas (botões existentes) */}
        <div className="w-[80%] flex flex-wrap justify-end gap-2 mb-2">
          <Button 
            onClick={() => handleButtonClick("buscar")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Buscar
          </Button>
          <Button 
            onClick={() => handleButtonClick("pensar")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Pensar
          </Button>
          <Button 
            onClick={() => handleButtonClick("gerarImagem")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Gerar Imagem
          </Button>
          <Button 
            onClick={() => handleButtonClick("simuladorProvas")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Simulador de Provas
          </Button>
          <Button 
            onClick={() => handleButtonClick("gerarCaderno")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Gerar Caderno
          </Button>
          <Button 
            onClick={() => handleButtonClick("criarFluxograma")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Criar Fluxograma
          </Button>
          <Button 
            onClick={() => handleButtonClick("reescreverExplicacao")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Reescrever Explicação
          </Button>
          <Button 
            onClick={() => handleButtonClick("analiseRedacao")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Análise de Redação
          </Button>
          <Button 
            onClick={() => handleButtonClick("resumirConteudo")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Resumir Conteúdo
          </Button>
          <Button 
            onClick={() => handleButtonClick("espacosAprendizagem")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Espaços de Aprendizagem
          </Button>
        </div>
        
        {/* Caixa de envio de mensagens */}
        <div className="w-[80%] h-[50px] bg-[#2F3B4C] rounded-lg flex items-center p-2 relative">
          {error && (
            <Alert className="absolute -top-12 left-0 right-0 bg-red-500 text-white border-none">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex-1 h-full flex items-center relative">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem para a IA..."
              className="resize-none h-full bg-[#1A2634] border-none rounded-md text-white text-[14px] placeholder:text-[#A0A0A0] focus:ring-1 focus:ring-[#4A90E2] flex-1 py-2 pl-3 pr-16"
              maxLength={MAX_CHARS}
              disabled={isTyping}
              aria-label="Campo de mensagem"
            />
            <div className="absolute right-3 bottom-1 text-xs text-[#A0A0A0]">
              {charCount}/{MAX_CHARS}
            </div>
            
            <Button
              className="absolute right-0 top-0 bottom-0 w-[40px] h-[40px] rounded-full bg-[#4A90E2] hover:bg-[#5AAEFF] text-white mr-1 flex items-center justify-center transition-transform active:scale-90"
              onClick={handleSendMessage}
              disabled={isTyping || !inputMessage.trim()}
              aria-label="Enviar mensagem"
            >
              {isTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          <Button
            className="ml-2 h-[40px] w-[40px] rounded-full bg-[#1A2634] hover:bg-[#2F3B4C] text-[#A0A0A0] flex items-center justify-center"
            variant="ghost"
            aria-label="Dar feedback"
          >
            <Star className="h-5 w-5" />
          </Button>
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
