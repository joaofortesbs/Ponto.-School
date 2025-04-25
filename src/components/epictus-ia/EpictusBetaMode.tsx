import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  User, 
  Trash2, 
  Loader2,
  Star,
  Search,
  FileText,
  PenLine,
  Share, 
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EpictusMessageBox from "./message-box/EpictusMessageBox";
import PromptSuggestionsModal from "./message-box/PromptSuggestionsModal";
import ExportShareModal from "./export-modal/ExportShareModal";
import TurboHeader from "./turbo-header/TurboHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { v4 as uuidv4 } from 'uuid';
import { generateAIResponse, addMessageToHistory, createMessage } from "@/services/epictusIAService";
import { toast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  sender: "user" | "ia";
  content: string;
  timestamp: Date;
  isEdited?: boolean;
  feedback?: 'positive' | 'negative';
  needsImprovement?: boolean; 
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
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [exportMessageData, setExportMessageData] = useState<Message | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const MAX_CHARS = 1000;
  const [sessionId] = useState(() => localStorage.getItem('epictus_beta_session_id') || uuidv4());
  const [isReformulating, setIsReformulating] = useState(false); 

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('epictus_beta_chat', JSON.stringify(messages));
      localStorage.setItem('epictus_beta_session_id', sessionId);
    }
  }, [messages, sessionId]);

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

    if (isTyping) return;

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
      const typingTimeout = setTimeout(() => {
        setIsTyping(true);
      }, 300);

      try {
        console.log("Enviando mensagem para Gemini:", trimmedMessage);
        const response = await generateAIResponse(trimmedMessage, sessionId);
        console.log("Resposta recebida de Gemini");

        const aiMessage: Message = {
          id: uuidv4(),
          sender: "ia",
          content: response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
      } catch (err) {
        console.error("Erro ao gerar resposta com Gemini:", err);

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

  const startEditingMessage = (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (message && message.sender === "ia") {
      setEditingMessageId(messageId);
    }
  };

  const saveEditedMessage = (messageId: string, newContent: string) => {
    if (!newContent.trim()) {
      return;
    }

    const updatedMessages = messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: newContent, isEdited: true } 
        : msg
    );

    setMessages(updatedMessages);
    setEditingMessageId(null);

    localStorage.setItem('epictus_beta_chat', JSON.stringify(updatedMessages));

    toast({
      title: "Mensagem editada",
      description: "A mensagem da IA foi atualizada com sucesso.",
      duration: 3000,
    });
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
  };

  // Simplificado para remover os botões de ação rápida


  const handleExportMessage = (message: Message) => {
    setExportMessageData(message);
    setIsExportModalOpen(true);
  };

  const handleFeedback = (messageId: string, feedbackType: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const newFeedback = msg.feedback === feedbackType ? undefined : feedbackType;

        if (newFeedback) {
          console.log(`Feedback ${newFeedback} registrado para mensagem ${messageId}`);
          toast({
            title: newFeedback === 'positive' ? "Feedback positivo enviado" : "Feedback negativo enviado",
            description: "Obrigado por nos ajudar a melhorar a Epictus IA!",
            duration: 3000,
          });
        }

        return { ...msg, feedback: newFeedback };
      }
      return msg;
    }));
  };

  const reformulateMessage = async (messageId: string) => {
    setIsReformulating(true);
    try {
      const messageToReformulate = messages.find(msg => msg.id === messageId);
      if (messageToReformulate) {
        const reformulatedResponse = await generateAIResponse(`Reformule a seguinte resposta de forma mais detalhada: ${messageToReformulate.content}`, sessionId);
        const updatedMessages = messages.map(msg =>
          msg.id === messageId
            ? { ...msg, content: reformulatedResponse, isEdited: true, needsImprovement: false }
            : msg
        );
        setMessages(updatedMessages);
      }
    } catch (error) {
      console.error("Erro ao reformular mensagem:", error);
      toast({
        title: "Erro ao reformular",
        description: "Não foi possível reformular a resposta. Por favor, tente novamente.",
        duration: 3000,
      });
    } finally {
      setIsReformulating(false);
    }
  };

  const summarizeMessage = async (messageId: string) => {
    setIsReformulating(true);
    try {
      const messageToSummarize = messages.find(msg => msg.id === messageId);
      if (messageToSummarize) {
        const summarizedResponse = await generateAIResponse(`Resuma a seguinte resposta de forma mais concisa: ${messageToSummarize.content}`, sessionId);
        const updatedMessages = messages.map(msg =>
          msg.id === messageId
            ? { ...msg, content: summarizedResponse, isEdited: true, needsImprovement: false }
            : msg
        );
        setMessages(updatedMessages);
      }
    } catch (error) {
      console.error("Erro ao resumir mensagem:", error);
      toast({
        title: "Erro ao resumir",
        description: "Não foi possível resumir a resposta. Por favor, tente novamente.",
        duration: 3000,
      });
    } finally {
      setIsReformulating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TurboHeader profileOptions={profileOptions} initialProfileIcon={profileIcon} initialProfileName={profileName} />

      <div className="flex-1 flex flex-col items-center justify-between p-4 overflow-hidden bg-transparent">
        <div className="w-[80%] h-[85%] relative mb-4 flex-grow overflow-hidden">
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
            className="w-full h-full bg-transparent rounded-lg overflow-hidden shadow-lg"
            ref={chatContainerRef}
          >
            <div className="p-4 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  {message.sender === "ia" && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E293B] to-[#2F3B4C] flex items-center justify-center mr-3 shadow-md border border-[#3A4B5C]/30">
                      <Bot size={18} className="text-[#4A90E2]" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-xl p-4 shadow-md backdrop-blur-sm transition-all duration-300 ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-[#3A7BD5] to-[#4A90E2] text-white border border-[#5AA0F2]/20"
                        : message.needsImprovement 
                          ? "bg-gradient-to-r from-[#1E293B]/70 to-[#2F3B4C]/70 text-white/70 border border-[#3A4B5C]/20 line-through"
                          : "bg-gradient-to-r from-[#1E293B] to-[#2F3B4C] text-white border border-[#3A4B5C]/30"
                    }`}
                  >
                    {editingMessageId === message.id ? (
                      <div className="w-full">
                        <textarea
                          className="w-full bg-[#1A2634]/80 text-white p-2 rounded-md border border-blue-500/30 mb-2 resize-none min-h-[100px]"
                          defaultValue={message.content}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              cancelEditing();
                            }
                          }}
                          id={`edit-textarea-${message.id}`}
                        />
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => cancelEditing()}
                            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={() => {
                              const textarea = document.getElementById(`edit-textarea-${message.id}`) as HTMLTextAreaElement;
                              if (textarea) {
                                saveEditedMessage(message.id, textarea.value);
                              }
                            }}
                            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed font-light">{message.content}</p>
                    )}
                    <div className="flex justify-between items-center mt-2 pt-1 border-t border-white/10">
                      <div className="flex items-center space-x-2">
                        {message.sender === "ia" && (
                          <>
                            <Badge variant="outline" className="text-[10px] bg-[#2A3645]/50 text-[#A0A0A0] border-[#3A4B5C]/30 px-1.5 py-0">
                              Epictus IA
                            </Badge>
                            {!editingMessageId && (
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => startEditingMessage(message.id)}
                                  className="text-gray-400 hover:text-blue-400 transition-colors"
                                  title="Editar mensagem"
                                >
                                  <PenLine size={12} />
                                </button>
                                <button 
                                  onClick={() => handleExportMessage(message)}
                                  className="text-gray-400 hover:text-blue-400 transition-colors"
                                  title="Exportar/Compartilhar mensagem"
                                >
                                  <Share size={12} />
                                </button>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(message.content);
                                    toast({
                                      title: "Mensagem copiada",
                                      description: "O conteúdo foi copiado para a área de transferência",
                                      duration: 3000,
                                    });
                                  }}
                                  className="text-gray-400 hover:text-blue-400 transition-colors"
                                  title="Copiar mensagem"
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                            )}
                            {message.isEdited && (
                              <span className="text-[9px] text-gray-500 italic">(editado)</span>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {message.sender === "ia" && (
                          <div className="flex items-center gap-1 mr-2">
                            <button
                              onClick={() => handleFeedback(message.id, 'positive')}
                              className="text-gray-400 hover:text-green-500 transition-colors p-1"
                              title="Feedback positivo"
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="14" 
                                height="14" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={message.feedback === 'positive' ? 'text-green-500' : ''}
                              >
                                <path d="M7 10v12"></path>
                                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleFeedback(message.id, 'negative')}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              title="Feedback negativo"
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="14" 
                                height="14" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={message.feedback === 'negative' ? 'text-red-500' : ''}
                              >
                                <path d="M17 14V2"></path>
                                <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
                              </svg>
                            </button>
                          </div>
                        )}
                        {message.sender === "user" && (
                          <div className="flex items-center gap-1 mr-2">
                            <button 
                              onClick={() => {
                                // Implementar edição de mensagem do usuário futuramente
                                toast({
                                  title: "Editar mensagem",
                                  description: "Esta funcionalidade será implementada em breve",
                                  duration: 3000,
                                });
                              }}
                              className="text-[#001427] hover:text-blue-400 transition-colors"
                              title="Editar mensagem"
                            >
                              <PenLine size={12} />
                            </button>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(message.content);
                                toast({
                                  title: "Mensagem copiada",
                                  description: "O conteúdo foi copiado para a área de transferência",
                                  duration: 3000,
                                });
                              }}
                              className="text-[#001427] hover:text-blue-400 transition-colors"
                              title="Copiar mensagem"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        )}
                        <p className="text-right text-[11px] text-[#8f97a4] font-mono">
                          {formatTimestamp(message.timestamp)}
                        </p>
                      </div>
                    </div>

                    {message.sender === "ia" && message.feedback === 'negative' && (
                      <div className="mt-2 flex flex-col gap-2 w-full animate-fadeIn">
                        <div className="text-xs text-gray-400 mb-1">Como podemos melhorar esta resposta?</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => reformulateMessage(message.id)}
                            disabled={isReformulating}
                            className="bg-[#1A202C] text-xs py-1 px-2 rounded-md border border-[#3A4B5C]/30 hover:bg-[#2D3748] transition-colors flex items-center gap-1"
                          >
                            {isReformulating ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Reformulando...</span>
                              </>
                            ) : (
                              <>
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="12" 
                                  height="12" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                                  <path d="M3 3v5h5"></path>
                                </svg>
                                <span>Reformular (mais detalhado)</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => summarizeMessage(message.id)}
                            disabled={isReformulating}
                            className="bg-[#1A202C] text-xs py-1 px-2 rounded-md border border-[#3A4B5C]/30 hover:bg-[#2D3748] transition-colors flex items-center gap-1"
                          >
                            {isReformulating ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Resumindo...</span>
                              </>
                            ) : (
                              <>
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="12" 
                                  height="12" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                >
                                  <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                                  <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                                  <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                                  <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                                </svg>
                                <span>Resumir (mais direto)</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {message.sender === "user" && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3A7BD5] to-[#4A90E2] flex items-center justify-center ml-3 shadow-md border border-[#5AA0F2]/20">
                      <User size={18} className="text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E293B] to-[#2F3B4C] flex items-center justify-center mr-3 shadow-md border border-[#3A4B5C]/30">
                    <Bot size={18} className="text-[#4A90E2]" />
                  </div>
                  <div className="bg-gradient-to-r from-[#1E293B] to-[#2F3B4C] p-4 rounded-xl flex items-center shadow-md border border-[#3A4B5C]/30">
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

        <div className="w-full h-auto mt-2 flex-shrink-0">
          <EpictusMessageBox 
            inputMessage={inputMessage} 
            setInputMessage={setInputMessage} 
            handleSendMessage={handleSendMessage} 
            handleKeyDown={handleKeyDown} 
            charCount={charCount} 
            MAX_CHARS={MAX_CHARS} 
            isTyping={isTyping}
          />

          <PromptSuggestionsModal 
            isOpen={isPromptModalOpen}
            onClose={() => setIsPromptModalOpen(false)}
            onSelectPrompt={(prompt) => {
              setInputMessage(prompt);
              setTimeout(() => {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                  textarea.focus();
                }
              }, 100);
            }}
            currentContext="estudos"
          />
        </div>
      </div>

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

      {exportMessageData && (
        <ExportShareModal
          open={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          message={{
            content: exportMessageData.content,
            sender: exportMessageData.sender,
            timestamp: exportMessageData.timestamp
          }}
        />
      )}
    </div>
  );
};

export default EpictusBetaMode;