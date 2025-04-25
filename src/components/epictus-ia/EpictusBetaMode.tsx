import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  User, 
  Trash2, 
  Loader2,
  Star,
  Search,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EpictusMessageBox from "./message-box/EpictusMessageBox";
import PromptSuggestionsModal from "./message-box/PromptSuggestionsModal"; // Added import
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
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false); // Added state
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
    // Verificar se é a ação de sugestão de prompts
    if (action === 'SugestaoPrompts') {
      setIsPromptModalOpen(true);
      return;
    }

    // Verificar se é a ação de prompt aprimorado
    if (action === 'PromptAprimorado') {
      if (!inputMessage.trim()) {
        return;
      }

      const originalMessage = inputMessage;

      // Mostrar mensagem de processamento
      toast({
        title: "Aprimorando seu prompt...",
        description: "Estamos melhorando sua mensagem com IA",
        duration: 3000,
      });

    // Função para gerar modal interativo
    const showImprovedPromptModal = (improvedPromptText: string) => {
      // Criar e adicionar o modal diretamente ao DOM
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

      // Remover qualquer modal existente
      const existingModal = document.getElementById('improved-prompt-modal');
      if (existingModal) {
        existingModal.remove();
      }

      // Adicionar o novo modal ao DOM
      document.body.insertAdjacentHTML('beforeend', modalHTML);

      // Adicionar event listeners ao modal
      setTimeout(() => {
        const modal = document.getElementById('improved-prompt-modal');
        const closeButton = document.getElementById('close-improved-prompt-modal');
        const cancelButton = document.getElementById('cancel-improved-prompt');
        const acceptButton = document.getElementById('accept-improved-prompt');

        // Função para fechar o modal
        const closeModal = () => {
          if (modal) {
            modal.classList.add('animate-fadeOut');
            setTimeout(() => modal?.remove(), 200);
          }
        };

        // Event listener para fechar o modal
        if (closeButton) {
          closeButton.addEventListener('click', closeModal);
        }

        // Event listener para cancelar
        if (cancelButton) {
          cancelButton.addEventListener('click', closeModal);
        }

        // Event listener para aceitar o prompt aprimorado
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

        // Event listener para clicar fora do modal e fechar
        if (modal) {
          modal.addEventListener('click', (e) => {
            if (e.target === modal) {
              closeModal();
            }
          });
        }
      }, 50);
    };

    // Função para aprimorar o prompt
    const aprimorarPrompt = async () => {
      try {
        // Gerar um ID de sessão único para esta interação
        const promptSessionId = `prompt-improvement-${Date.now()}`;

        // Mostrar o modal de carregamento
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

        // Remover qualquer modal existente
        const existingLoadingModal = document.getElementById('loading-prompt-modal');
        if (existingLoadingModal) {
          existingLoadingModal.remove();
        }

        // Adicionar o modal de carregamento ao DOM
        document.body.insertAdjacentHTML('beforeend', loadingModalHTML);

        // Chamar a API para obter uma versão aprimorada do prompt
        let improvedPromptText = "";

        try {
          // Chamar a API Gemini para melhorar o prompt
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

          // Remover o modal de carregamento se existe
          const loadingModal = document.getElementById('loading-prompt-modal');
          if (loadingModal) {
            loadingModal.remove();
          }

          // Fallback para melhorias locais se a API falhar
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

          // Verificar palavras-chave e aprimorar se encontradas
          Object.entries(enhancementMap).forEach(([keyword, enhancement]) => {
            if (originalMessage.toLowerCase().includes(keyword) && !wasEnhanced) {
              const regex = new RegExp(`\\b${keyword}\\b`, 'i');
              enhancedPrompt = originalMessage.replace(regex, enhancement);
              wasEnhanced = true;
            }
          });

          // Se nenhuma palavra-chave foi encontrada, adicione uma introdução geral
          if (!wasEnhanced) {
            enhancedPrompt = `Explique detalhadamente, com exemplos claros: ${originalMessage}`;
          }

          // Adicionar estrutura ao final do prompt se não tiver
          if (!enhancedPrompt.includes("estruturado") && !enhancedPrompt.includes("passo a passo")) {
            enhancedPrompt += ". Por favor, estruture sua resposta em tópicos e forneça exemplos práticos.";
          }

          improvedPromptText = enhancedPrompt;
        }

        // Limpar formatação extra que possa ter vindo na resposta
        improvedPromptText = improvedPromptText
          .replace(/^(Prompt melhorado:|Aqui está uma versão melhorada:|Versão melhorada:)/i, '')
          .replace(/^["']|["']$/g, '')
          .trim();

        // Remover o modal de carregamento se existe
        const loadingModal = document.getElementById('loading-prompt-modal');
        if (loadingModal) {
          loadingModal.remove();
        }

        // Mostrar o modal com o prompt aprimorado
        showImprovedPromptModal(improvedPromptText);

      } catch (error) {
        console.error("Erro ao aprimorar prompt:", error);
        
        // Remover o modal de carregamento se existe
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

    // Iniciar o processo de aprimoramento
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

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho do Modo Epictus Turbo */}
      <TurboHeader profileOptions={profileOptions} initialProfileIcon={profileIcon} initialProfileName={profileName} />

      {/* Interface de Chat */}
      <div className="flex-1 flex flex-col items-center justify-between p-4 overflow-hidden bg-transparent">
        {/* Área de conversas */}
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
                    <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed font-light">{message.content}</p>
                    <div className="flex justify-between items-center mt-2 pt-1 border-t border-white/10">
                      <div className="flex items-center space-x-1">
                        {message.sender === "ia" && (
                          <Badge variant="outline" className="text-[10px] bg-[#2A3645]/50 text-[#A0A0A0] border-[#3A4B5C]/30 px-1.5 py-0">
                            Epictus IA
                          </Badge>
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

        {/* Caixa de envio de mensagens com posição fixa */}
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

          {/* Modal de Sugestão de Prompts */}
          <PromptSuggestionsModal 
            isOpen={isPromptModalOpen}
            onClose={() => setIsPromptModalOpen(false)}
            onSelectPrompt={(prompt) => {
              setInputMessage(prompt);
              // Focar no input após selecionar o prompt
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