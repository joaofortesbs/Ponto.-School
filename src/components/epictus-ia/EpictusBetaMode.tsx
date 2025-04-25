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
  Share, // Added import for Share icon
  Download,
  File
} from "lucide-react";
// Note: html2pdf.js and docx are dynamically imported in the export functions
import { motion, AnimatePresence } from "framer-motion";
import EpictusMessageBox from "./message-box/EpictusMessageBox";
import PromptSuggestionsModal from "./message-box/PromptSuggestionsModal";
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
  const MAX_CHARS = 1000;
  const [sessionId] = useState(() => localStorage.getItem('epictus_beta_session_id') || uuidv4());

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

  const handleButtonClick = (action: string) => {
    if (action === 'SugestaoPrompts') {
      setIsPromptModalOpen(true);
      return;
    }

    if (action === 'PromptAprimorado') {
      if (!inputMessage.trim()) {
        return;
      }

      const originalMessage = inputMessage;

      toast({
        title: "Aprimorando seu prompt...",
        description: "Estamos melhorando sua mensagem com IA",
        duration: 3000,
      });

    const showImprovedPromptModal = (improvedPromptText: string) => {
      const modalHTML = `
        <div id="improved-prompt-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div class="bg-[#1a1d2d] text-white rounded-lg w-[90%] max-w-md shadow-xl overflow-hidden border border-gray-700 animate-fadeIn">
            <div class="bg-gradient-to-r from-[#0D23A0] to-[#5B21BD] p-4 flex justify-between items-center">
              <h3 class="text-lg font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Prompt Aprimorado com IA
              </h3>
              <button id="close-improved-prompt-modal" class="text-white hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>

            <div class="p-5">
              <div class="mb-4">
                <div class="mb-3">
                  <p class="text-sm text-gray-400 mb-2">Sua mensagem original:</p>
                  <div class="p-3 bg-gray-800 rounded-lg text-sm text-gray-300">
                    ${originalMessage}
                  </div>
                </div>

                <div>
                  <p class="text-sm text-gray-400 mb-2">Versão aprimorada pela Epictus IA:</p>
                  <div class="p-3 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-800 rounded-lg text-sm text-gray-200 max-h-[150px] overflow-y-auto scrollbar-hide">
                    ${improvedPromptText}
                  </div>
                </div>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button 
                  id="cancel-improved-prompt" 
                  class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  id="accept-improved-prompt" 
                  class="px-4 py-2 bg-gradient-to-r from-[#0D23A0] to-[#5B21BD] hover:from-[#0D23A0]/90 hover:to-[#5B21BD]/90 text-white rounded-md transition-colors"
                >
                  Usar Prompt Aprimorado
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      const existingModal = document.getElementById('improved-prompt-modal');
      if (existingModal) {
        existingModal.remove();
      }

      document.body.insertAdjacentHTML('beforeend', modalHTML);

      setTimeout(() => {
        const modal = document.getElementById('improved-prompt-modal');
        const closeButton = document.getElementById('close-improved-prompt-modal');
        const cancelButton = document.getElementById('cancel-improved-prompt');
        const acceptButton = document.getElementById('accept-improved-prompt');

        const closeModal = () => {
          if (modal) {
            modal.classList.add('animate-fadeOut');
            setTimeout(() => modal?.remove(), 200);
          }
        };

        if (closeButton) {
          closeButton.addEventListener('click', closeModal);
        }

        if (cancelButton) {
          cancelButton.addEventListener('click', closeModal);
        }

        if (acceptButton) {
          acceptButton.addEventListener('click', () => {
            setInputMessage(improvedPromptText);
            toast({
              title: "Prompt aplicado!",
              description: "O prompt aprimorado foi aplicado com sucesso.",
              duration: 3000
            });
            closeModal();
          });
        }

        if (modal) {
          modal.addEventListener('click', (e) => {
            if (e.target === modal) {
              closeModal();
            }
          });
        }
      }, 50);
    };

    const aprimorarPrompt = async () => {
      try {
        const promptSessionId = `prompt-improvement-${Date.now()}`;

        const loadingModalHTML = `
          <div id="loading-prompt-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div class="bg-[#1a1d2d] text-white rounded-lg w-[90%] max-w-md shadow-xl overflow-hidden border border-gray-700 animate-fadeIn">
              <div class="bg-gradient-to-r from-[#0D23A0] to-[#5B21BD] p-4 flex justify-between items-center">
                <h3 class="text-lg font-semibold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  Prompt Aprimorado com IA
                </h3>
              </div>
              <div class="p-5 flex flex-col items-center justify-center">
                <div class="flex items-center justify-center mb-4">
                  <div class="w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                </div>
                <p class="text-center text-gray-300">Aprimorando sua pergunta com IA...</p>
              </div>
            </div>
          </div>
        `;

        const existingLoadingModal = document.getElementById('loading-prompt-modal');
        if (existingLoadingModal) {
          existingLoadingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', loadingModalHTML);

        let improvedPromptText = "";

        try {
          improvedPromptText = await generateAIResponse(
            `Você é um assistente especializado em melhorar prompts educacionais. 
            Analise o seguinte prompt e melhore-o para obter uma resposta mais detalhada, completa e educacional.

            Melhore o seguinte prompt para obter uma resposta mais detalhada, completa e educacional. 
            NÃO responda a pergunta, apenas melhore o prompt adicionando:
            1. Mais contexto e especificidade
            2. Solicite exemplos, comparações e aplicações práticas
            3. Peça explicações claras de conceitos fundamentais
            4. Solicite visualizações ou analogias quando aplicável
            5. Adicione pedidos para que sejam mencionados fatos históricos relevantes

            Original: "${originalMessage}"

            Retorne APENAS o prompt melhorado, sem comentários adicionais.`,
            promptSessionId,
            {
              intelligenceLevel: 'advanced',
              languageStyle: 'formal',
              detailedResponse: true
            }
          );
        } catch (error) {
          console.error("Erro ao chamar API para aprimorar prompt:", error);

          const loadingModal = document.getElementById('loading-prompt-modal');
          if (loadingModal) {
            loadingModal.remove();
          }

          const enhancementMap: Record<string, string> = {
            "explique": "Explique detalhadamente, com exemplos e analogias simples, ",
            "como": "Poderia detalhar de forma estruturada e passo a passo ",
            "resumo": "Elabore um resumo conciso dos principais pontos sobre ",
            "diferença": "Compare e contraste, destacando as principais diferenças e semelhanças entre ",
            "exemplo": "Forneça exemplos práticos e aplicáveis de ",
            "o que é": "Defina e explique de maneira abrangente o conceito de ",
            "significado": "Esclareça o significado e a importância de ",
            "calcular": "Apresente o método passo a passo para calcular ",
            "resolver": "Demonstre de forma detalhada como resolver ",
            "analisar": "Faça uma análise crítica e aprofundada sobre ",
          };

          let enhancedPrompt = originalMessage;
          let wasEnhanced = false;

          Object.entries(enhancementMap).forEach(([keyword, enhancement]) => {
            if (originalMessage.toLowerCase().includes(keyword) && !wasEnhanced) {
              const regex = new RegExp(`\\b${keyword}\\b`, 'i');
              enhancedPrompt = originalMessage.replace(regex, enhancement);
              wasEnhanced = true;
            }
          });

          if (!wasEnhanced) {
            enhancedPrompt = `Explique detalhadamente, com exemplos claros: ${originalMessage}`;
          }

          if (!enhancedPrompt.includes("estruturado") && !enhancedPrompt.includes("passo a passo")) {
            enhancedPrompt += ". Por favor, estruture sua resposta em tópicos e forneça exemplos práticos.";
          }

          improvedPromptText = enhancedPrompt;
        }

        improvedPromptText = improvedPromptText
          .replace(/^(Prompt melhorado:|Aqui está uma versão melhorada:|Versão melhorada:)/i, '')
          .replace(/^["']|["']$/g, '')
          .trim();

        const loadingModal = document.getElementById('loading-prompt-modal');
        if (loadingModal) {
          loadingModal.remove();
        }

        showImprovedPromptModal(improvedPromptText);

      } catch (error) {
        console.error("Erro ao aprimorar prompt:", error);

        const loadingModal = document.getElementById('loading-prompt-modal');
        if (loadingModal) {
          loadingModal.remove();
        }

        toast({
          title: "Erro ao aprimorar prompt",
          description: "Não foi possível melhorar o prompt. Por favor, tente novamente.",
          duration: 3000,
        });
      }
    };

    aprimorarPrompt();

    return;
  }

  const actionMap: Record<string, string> = {
    "Buscar": "Iniciando busca com base na conversa atual...",
    "Pensar": "Analisando a conversa para gerar insights...",
    "Gerar Imagem": "Gerando imagem baseada no contexto da conversa...",
    "Simulador de Provas": "Preparando simulado com base no conteúdo discutido...",
    "Gerar Caderno": "Criando caderno com o conteúdo da nossa conversa...",
    "Criar Fluxograma": "Gerando fluxograma visual do conteúdo...",
    "Reescrever Explicação": "Reescrevendo a última explicação em formato diferente...",
    "Análise de Redação": "Pronto para analisar sua redação. Por favor, envie o texto...",
    "Resumir Conteúdo": "Resumindo o conteúdo da nossa conversa...",
    "Espaços de Aprendizagem": "Abrindo espaços de aprendizagem relacionados..."
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


  const handleExportMessage = (message: Message) => {
    const showExportShareModal = (messageContent: string) => {
      const modalHTML = `
        <div id="export-share-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div class="bg-[#1a1d2d] text-white rounded-lg w-[200px] max-w-md shadow-xl overflow-hidden border border-gray-700 animate-fadeIn">
            <div class="flex flex-col">
              <button id="export-option" class="flex items-center gap-2 p-3 hover:bg-[#252a3d] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Exportar
              </button>
              <button id="share-option" class="flex items-center gap-2 p-3 hover:bg-[#252a3d] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-400">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      `;

      const existingModal = document.getElementById('export-share-modal');
      if (existingModal) {
        existingModal.remove();
      }

      document.body.insertAdjacentHTML('beforeend', modalHTML);

      setTimeout(() => {
        const modal = document.getElementById('export-share-modal');
        const exportOption = document.getElementById('export-option');
        const shareOption = document.getElementById('share-option');

        const closeModal = () => {
          if (modal) {
            modal.classList.add('animate-fadeOut');
            setTimeout(() => modal?.remove(), 200);
          }
        };

        if (exportOption) {
          exportOption.addEventListener('click', () => {
            closeModal();
            showExportFormatModal(messageContent);
          });
        }

        if (shareOption) {
          shareOption.addEventListener('click', () => {
            try {
              navigator.clipboard.writeText(messageContent);
              toast({
                title: "Conteúdo copiado!",
                description: "O texto foi copiado para a área de transferência.",
                duration: 3000,
              });
            } catch (error) {
              console.error("Erro ao copiar para a área de transferência:", error);
              toast({
                title: "Erro ao copiar",
                description: "Não foi possível copiar o texto para a área de transferência.",
                duration: 3000,
              });
            }
            closeModal();
          });
        }

        if (modal) {
          modal.addEventListener('click', (e) => {
            if (e.target === modal) {
              closeModal();
            }
          });
        }
      }, 50);
    };

    const showExportFormatModal = (messageContent: string) => {
      const modalHTML = `
        <div id="export-format-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div class="bg-[#1a1d2d] text-white rounded-lg w-[200px] max-w-md shadow-xl overflow-hidden border border-gray-700 animate-fadeIn">
            <div class="flex flex-col">
              <button id="export-txt" class="flex items-center gap-2 p-3 hover:bg-[#252a3d] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <line x1="10" y1="9" x2="8" y2="9"></line>
                </svg>
                Texto (.txt)
              </button>
              <button id="export-pdf" class="flex items-center gap-2 p-3 hover:bg-[#252a3d] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <line x1="10" y1="9" x2="8" y2="9"></line>
                </svg>
                PDF (.pdf)
              </button>
              <button id="export-docx" class="flex items-center gap-2 p-3 hover:bg-[#252a3d] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <line x1="10" y1="9" x2="8" y2="9"></line>
                </svg>
                Word (.docx)
              </button>
            </div>
          </div>
        </div>
      `;

      const existingModal = document.getElementById('export-format-modal');
      if (existingModal) {
        existingModal.remove();
      }

      document.body.insertAdjacentHTML('beforeend', modalHTML);

      setTimeout(() => {
        const modal = document.getElementById('export-format-modal');
        const exportTxt = document.getElementById('export-txt');
        const exportPdf = document.getElementById('export-pdf');
        const exportDocx = document.getElementById('export-docx');

        const closeModal = () => {
          if (modal) {
            modal.classList.add('animate-fadeOut');
            setTimeout(() => modal?.remove(), 200);
          }
        };

        // Função para gerar e baixar um arquivo
        const downloadFile = (content: string, filename: string, contentType: string) => {
          const blob = new Blob([content], { type: contentType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);

          toast({
            title: "Arquivo exportado",
            description: `O arquivo ${filename} foi baixado com sucesso.`,
            duration: 3000,
          });
        };

        if (exportTxt) {
          exportTxt.addEventListener('click', () => {
            downloadFile(messageContent, 'epictus_conversa.txt', 'text/plain');
            closeModal();
          });
        }

        if (exportPdf) {
          exportPdf.addEventListener('click', () => {
            // Para PDF, vamos usar uma biblioteca simples de HTML para PDF
            import('html2pdf.js')
              .then(html2pdfModule => {
                const html2pdf = html2pdfModule.default;
                const element = document.createElement('div');
                element.innerHTML = `
                  <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h1 style="color: #3a7bd5; margin-bottom: 20px;">Conversa Epictus IA</h1>
                    <div style="white-space: pre-wrap; line-height: 1.5;">
                      ${messageContent}
                    </div>
                    <p style="margin-top: 20px; color: #888; font-size: 12px;">
                      Exportado via Epictus IA em ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}
                    </p>
                  </div>
                `;
                document.body.appendChild(element);
                
                const opt = {
                  margin: 1,
                  filename: 'epictus_conversa.pdf',
                  image: { type: 'jpeg', quality: 0.98 },
                  html2canvas: { scale: 2 },
                  jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
                };
                
                html2pdf().set(opt).from(element).save().then(() => {
                  document.body.removeChild(element);
                  toast({
                    title: "PDF gerado",
                    description: "O arquivo PDF foi baixado com sucesso.",
                    duration: 3000,
                  });
                });
              })
              .catch(error => {
                console.error("Erro ao carregar a biblioteca html2pdf:", error);
                toast({
                  title: "Erro na exportação",
                  description: "Não foi possível gerar o arquivo PDF. Tente novamente.",
                  duration: 3000,
                });
              });
            closeModal();
          });
        }

        if (exportDocx) {
          exportDocx.addEventListener('click', () => {
            // Para DOCX, vamos usar docx.js
            import('docx')
              .then(docxModule => {
                const { Document, Paragraph, Packer, TextRun } = docxModule;
                
                // Criar um novo documento
                const doc = new Document({
                  sections: [{
                    properties: {},
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Conversa Epictus IA",
                            bold: true,
                            size: 36,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                          }),
                        ],
                      }),
                      ...messageContent.split('\n').map(line => 
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: line,
                              size: 24,
                            }),
                          ],
                        })
                      ),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Exportado via Epictus IA em ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`,
                            size: 20,
                            color: "808080",
                          }),
                        ],
                      }),
                    ],
                  }],
                });

                // Gerar o arquivo DOCX
                Packer.toBlob(doc).then(blob => {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'epictus_conversa.docx';
                  a.click();
                  URL.revokeObjectURL(url);

                  toast({
                    title: "DOCX gerado",
                    description: "O arquivo Word foi baixado com sucesso.",
                    duration: 3000,
                  });
                });
              })
              .catch(error => {
                console.error("Erro ao carregar a biblioteca docx:", error);
                toast({
                  title: "Erro na exportação",
                  description: "Não foi possível gerar o arquivo Word. Tente novamente.",
                  duration: 3000,
                });
              });
            closeModal();
          });
        }

        if (modal) {
          modal.addEventListener('click', (e) => {
            if (e.target === modal) {
              closeModal();
            }
          });
        }
      }, 50);
    };

    // Iniciar o processo de exportação/compartilhamento
    showExportShareModal(message.content);
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
                              </div>
                            )}
                            {message.isEdited && (
                              <span className="text-[9px] text-gray-500 italic">(editado)</span>
                            )}
                          </>
                        )}
                      </div>
                      <p className="text-right text-[11px] text-[#D0D0D0]/70 font-mono">
                        {formatTimestamp(new Date(message.timestamp))}
                      </p>
                    </div>
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
            handleButtonClick={handleButtonClick}
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
    </div>
  );
};

export default EpictusBetaMode;