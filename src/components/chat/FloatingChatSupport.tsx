import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  X,
  Maximize2,
  Paperclip,
  SmilePlus,
  Search,
  Trash,
  Home,
  MessageCircle,
  TicketIcon,
  HelpCircle,
  Clock,
  User,
  Bot,
  FileText,
  Plus,
  Bell,
  Lightbulb,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Vote,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Headphones,
  BookOpen,
  Settings,
  Zap,
  LifeBuoy,
  Rocket,
  Star,
  History,
  RefreshCw,
  Image,
  Video,
  Mic,
  Square,
  Download,
  File,
  Music
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateAIResponse } from "@/services/aiChatService";

// Interface para arquivos em mensagens
interface MessageFile {
  name: string;
  size: number;
  type: string;
  url: string;
}

// Interface para mensagens
interface ChatMessage {
  id: number;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  files?: MessageFile[];
  feedback?: 'positive' | 'negative';
  showFeedbackOptions?: boolean;
  feedbackText?: string;
  isImproved?: boolean;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  category: string;
  createdAt: Date;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SuggestionItem {
  id: string;
  title: string;
  description: string;
  votes: number;
  status: "pending" | "reviewing" | "approved" | "implemented";
  createdAt: Date;
  userVoted: boolean;
}

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  timestamp: Date;
}

interface CommonQuestion {
  id: string;
  question: string;
  icon: React.ReactNode;
}

const defaultMessages: ChatMessage[] = [
  {
    id: 1,
    content: "Oi! Sou o Epictus IA, seu assistente descolado aqui na Ponto.School! 😊 Tô pronto pra te ajudar com o que precisar, é só mandar! Como posso facilitar sua vida hoje?",
    sender: "assistant",
    timestamp: new Date(),
  },
];

const defaultTickets: Ticket[] = [
  {
    id: "1",
    title: "Problema ao acessar curso de Física",
    description:
      "Não consigo acessar as aulas do módulo 3 do curso de Física Quântica.",
    status: "in_progress",
    category: "Acesso e Conteúdo",
    createdAt: new Date("2024-02-28"),
  },
  {
    id: "2",
    title: "Dúvida sobre certificado",
    description: "Completei o curso mas não recebi meu certificado por email.",
    status: "open",
    category: "Certificados",
    createdAt: new Date("2024-02-28"),
  },
];

const defaultFaqs: FaqItem[] = [
  {
    id: "1",
    question: "Como funciona o sistema de pontos?",
    answer:
      "O sistema de School Points permite que você acumule pontos ao completar cursos, participar de fóruns e realizar outras atividades na plataforma. Esses pontos podem ser trocados por recompensas como cursos premium, mentorias e materiais exclusivos.",
    category: "Pontos e Recompensas",
  },
  {
    id: "2",
    question: "Como recuperar minha senha?",
    answer:
      "Para recuperar sua senha, clique em 'Esqueci minha senha' na tela de login. Você receberá um email com instruções para criar uma nova senha. Se não receber o email, verifique sua pasta de spam.",
    category: "Conta e Acesso",
  },
  {
    id: "3",
    question: "Como obter um certificado?",
    answer:
      "Os certificados são emitidos automaticamente após a conclusão de um curso. Você pode acessá-los na seção 'Meus Certificados' do seu perfil. Caso tenha problemas, abra um ticket de suporte.",
    category: "Certificados",
  },
];

const defaultSuggestions: SuggestionItem[] = [
  {
    id: "1",
    title: "Modo escuro para o aplicativo móvel",
    description:
      "Seria ótimo ter um modo escuro no aplicativo móvel para reduzir o cansaço visual durante estudos noturnos.",
    votes: 42,
    status: "approved",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    userVoted: true,
  },
  {
    id: "2",
    title: "Integração com Google Calendar",
    description:
      "Gostaria que a plataforma sincronizasse eventos e prazos com o Google Calendar automaticamente.",
    votes: 28,
    status: "reviewing",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    userVoted: false,
  },
  {
    id: "3",
    title: "Opção para baixar vídeos para assistir offline",
    description:
      "Seria muito útil poder baixar as aulas para assistir quando estiver sem internet.",
    votes: 56,
    status: "implemented",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    userVoted: true,
  },
];

const defaultChatHistory: ChatHistory[] = [
  {
    id: "1",
    title: "Suporte Técnico",
    lastMessage: "Obrigado por sua mensagem. Como posso ajudar você hoje?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unread: false,
  },
  {
    id: "2",
    title: "Dúvidas sobre Curso",
    lastMessage:
      "Os certificados são emitidos automaticamente após a conclusão do curso.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    unread: true,
  },
  {
    id: "3",
    title: "Problemas de Pagamento",
    lastMessage: "Seu pagamento foi confirmado com sucesso!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    unread: false,
  },
];

const defaultNotifications: Notification[] = [
  {
    id: "1",
    title: "Nova promoção disponível",
    message:
      "Aproveite 50% de desconto em cursos de Física até o final da semana!",
    type: "info",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "2",
    title: "Ticket respondido",
    message:
      "Seu ticket sobre certificados foi respondido pela equipe de suporte.",
    type: "success",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: "3",
    title: "Lembrete de aula",
    message: "Sua aula de Matemática Avançada começa em 30 minutos.",
    type: "warning",
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
];

const commonQuestions: CommonQuestion[] = [
  {
    id: "1",
    question: "Como acessar o produto que comprei",
    icon: <ChevronRight className="h-4 w-4" />,
  },
  {
    id: "2",
    question:
      "Onde encontro os dados de contato do infoprodutor que me vendeu?",
    icon: <ChevronRight className="h-4 w-4" />,
  },
  {
    id: "3",
    question: "Cadastrando o seu produto",
    icon: <ChevronRight className="h-4 w-4" />,
  },
  {
    id: "4",
    question: "Como liberar meu produto para afiliação?",
    icon: <ChevronRight className="h-4 w-4" />,
  },
];

const suggestionStatusColors = {
  pending: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
  reviewing: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
  approved:
    "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300",
  implemented:
    "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
};

const FloatingChatSupport: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [tickets, setTickets] = useState(defaultTickets);
  const [faqs, setFaqs] = useState(defaultFaqs);
  const [suggestions, setSuggestions] = useState(defaultSuggestions);
  const [chatHistory, setChatHistory] = useState(defaultChatHistory);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [isCreatingSuggestion, setIsCreatingSuggestion] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "Acesso e Conteúdo",
  });
  const [newSuggestion, setNewSuggestion] = useState({
    title: "",
    description: "",
  });
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState("Usuário");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isMessageEmpty, setIsMessageEmpty] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true); // Adicione o estado para habilitar/desabilitar sons


  // Configurações da IA
  const [aiIntelligenceLevel, setAIIntelligenceLevel] = useState<'basic' | 'normal' | 'advanced'>('normal');
  const [aiLanguageStyle, setAILanguageStyle] = useState<'casual' | 'formal' | 'technical'>('casual');
  const [enableNotificationSounds, setEnableNotificationSounds] = useState(true);
  const [isShowingAISettings, setIsShowingAISettings] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);

  // Estado para armazenar arquivos selecionados
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Estado para melhorar prompt
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [promptImprovementLoading, setPromptImprovementLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para gravar áudio
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  // Estado para abrir/fechar o menu de anexos
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);


  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Add blur effect to the rest of the page when chat is open
  useEffect(() => {
    const mainContent = document.querySelector("main");
    if (mainContent) {
      if (isOpen) {
        mainContent.classList.add("blur-sm", "pointer-events-none");
      } else {
        mainContent.classList.remove("blur-sm", "pointer-events-none");
      }
    }
    return () => {
      if (mainContent) {
        mainContent.classList.remove("blur-sm", "pointer-events-none");
      }
    };
  }, [isOpen]);

  useEffect(() => {
    // Obter o primeiro nome do usuário
    const getFirstName = () => {
      // Verifica se tem um nome completo e extrai o primeiro nome
      if (userName && userName.includes(' ')) {
        return userName.split(' ')[0];
      }
      return userName || 'Usuário';
    };
    
    const firstName = getFirstName();
    setUserName(firstName);
    
    // Gerar uma ID de sessão baseada no usuário atual ou criar uma nova
    const newSessionId = userName || 'anonymous-' + Date.now().toString();
    setSessionId(newSessionId);

    // Tentar carregar mensagens salvas para este usuário
    const loadSavedMessages = async () => {
      try {
        const chatService = await import('@/services/aiChatService');

        // Usar a nova função getConversationHistory para obter histórico
        const history = chatService.getConversationHistory(newSessionId);

        // Se houver histórico com mensagens de usuário e IA, exibir as últimas mensagens
        if (history && history.length > 1) {
          // Converter de ChatMessage para o formato Message do componente
          const convertedMessages: ChatMessage[] = history
            .filter(msg => msg.role !== 'system') // Excluir mensagens do sistema
            .slice(-6) // Pegar apenas as últimas 6 mensagens para não sobrecarregar
            .map(msg => ({
              id: Date.now() + Math.random().toString(),
              content: msg.content,
              sender: msg.role === 'user' ? 'user' : 'assistant',
              timestamp: new Date(),
            }));

          if (convertedMessages.length > 0) {
            setMessages(prev => {
              // Manter a primeira mensagem (boas-vindas) e adicionar o histórico
              return [prev[0], ...convertedMessages];
            });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar histórico de mensagens:', error);
      }
    };

    loadSavedMessages();
  }, [userName]);

  useEffect(() => {
    setIsMessageEmpty(message.trim() === '');
  }, [message]);

  // Função para melhorar o prompt com IA
  const improvePrompt = async () => {
    if (!inputMessage.trim()) return;
    
    setPromptImprovementLoading(true);
    setIsImprovingPrompt(true);
    
    try {
      // Importando o serviço dinamicamente
      const aiService = await import('@/services/aiChatService');
      
      // Chamar a API para melhorar o prompt
      const improvedPromptText = await aiService.generateAIResponse(
        `Melhore o seguinte prompt para obter uma resposta mais detalhada e completa. NÃO responda a pergunta, apenas melhore o prompt para torná-lo mais específico e detalhado: "${inputMessage}"`,
        `improve_prompt_${Date.now()}`,
        {
          intelligenceLevel: 'advanced',
          languageStyle: 'formal'
        }
      );
      
      // Limpar qualquer formatação que possa ter vindo da resposta
      const cleanedImprovedPrompt = improvedPromptText
        .replace(/^(Prompt melhorado:|Aqui está uma versão melhorada:|Versão melhorada:)/i, '')
        .replace(/^["']|["']$/g, '')
        .trim();
      
      setImprovedPrompt(cleanedImprovedPrompt);
    } catch (error) {
      console.error('Erro ao melhorar o prompt:', error);
      setImprovedPrompt(inputMessage);
    } finally {
      setPromptImprovementLoading(false);
    }
  };

  // Função para aceitar o prompt melhorado
  const acceptImprovedPrompt = () => {
    setInputMessage(improvedPrompt);
    setIsImprovingPrompt(false);
    setImprovedPrompt("");
  };

  // Função para cancelar a melhoria do prompt
  const cancelImprovedPrompt = () => {
    setIsImprovingPrompt(false);
    setImprovedPrompt("");
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) return;

    // Criar uma mensagem combinada com texto e informações sobre arquivos anexados
    let fullMessage = inputMessage.trim();

    // Se houver arquivos selecionados, adicionar informações sobre eles à mensagem
    if (selectedFiles.length > 0) {
      // Incluir informações sobre os arquivos na mensagem para análise da IA
      const fileInfos = selectedFiles.map(file => 
        `- ${file.name} (${(file.size / 1024).toFixed(2)} KB, tipo: ${file.type})`
      ).join('\n');

      if (fullMessage) {
        fullMessage += `\n\nArquivos anexados:\n${fileInfos}`;
      } else {
        fullMessage = `Arquivos anexados:\n${fileInfos}`;
      }
    }

    // Criar um objeto para a mensagem do usuário que inclui arquivos
    const userMessage: ChatMessage = {
      id: Date.now(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      files: selectedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }))
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setSelectedFiles([]);
    setIsTyping(true);

    try {
      // Gerar sessão única para este chat
      if (!sessionId) {
        const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
        localStorage.setItem('chatSessionId', newSessionId);
      }

      // Chamar a API para obter resposta com opções personalizadas
      const aiResponse = await generateAIResponse(
        fullMessage,
        sessionId || 'default_session',
        {
          intelligenceLevel: aiIntelligenceLevel,
          languageStyle: aiLanguageStyle
        }
      );

      // Reproduzir som se estiver ativado
      if (soundEnabled) {
        // playMessageSound(); // Função playMessageSound ainda não implementada
        console.log('Sound would play here if implemented')
      }

      setMessages(prevMessages => [
        ...prevMessages,
        { 
          id: Date.now(), 
          content: aiResponse, 
          sender: 'assistant', 
          timestamp: new Date() 
        }
      ]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          id: Date.now(), 
          content: 'Desculpe, estou enfrentando problemas no momento. Por favor, tente novamente mais tarde.', 
          sender: 'assistant', 
          timestamp: new Date() 
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Função para lidar com upload de arquivos
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setShowAttachmentOptions(false);

    // Armazenar o arquivo selecionado
    setSelectedFiles(prev => [...prev, file]);

    // Limpar o input de arquivo para permitir selecionar o mesmo arquivo novamente
    if (e.target) {
      e.target.value = '';
    }
  };
  
  // Função para abrir o seletor de arquivos
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Função para lidar com a seleção de arquivos
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Adicionar os arquivos selecionados à lista
    const newFiles = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...newFiles]);
    
    // Limpar o input para permitir selecionar os mesmos arquivos novamente
    if (e.target) {
      e.target.value = '';
    }
  };
  
  // Função para remover um arquivo da lista
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Função para iniciar gravação de áudio
  const startVoiceRecording = () => {
    setShowAttachmentOptions(false);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const recorder = new MediaRecorder(stream);
          setAudioRecorder(recorder);
          setAudioChunks([]);

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              setAudioChunks(prev => [...prev, e.data]);
            }
          };

          recorder.onstop = () => {
            // Processar áudio quando parar a gravação
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);

            // Adicionar mensagem com áudio
            const newMessage: ChatMessage = {
              id: Date.now(),
              content: `Áudio gravado\n<audio src="${audioUrl}" controls></audio>`,
              sender: "user",
              timestamp: new Date(),
              files: [{name: 'audio.wav', size: audioBlob.size, type: 'audio/wav', url: audioUrl}]
            };

            setMessages((prev) => [...prev, newMessage]);
            setIsLoading(true);

            // Gerar resposta da IA
            // Importar dinamicamente o serviço de IA
            import('@/services/aiChatService').then(aiService => {
              setIsTyping(true);
              aiService.generateAIResponse("Analisando áudio enviado", sessionId)
                .then(response => {
                  const aiMessage: ChatMessage = {
                    id: Date.now() + 1,
                    content: response,
                    sender: "assistant",
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, aiMessage]);
                })
            })
              .catch(error => {
                console.error("Erro ao processar áudio:", error);
                const errorMessage: ChatMessage = {
                  id: Date.now() + 1,
                  content: "Desculpe, encontrei um problema ao processar seu áudio. Por favor, tente novamente mais tarde.",
                  sender: "assistant",
                  timestamp: new Date(),
                };
                setMessages((prev) => [...prev, errorMessage]);
              })
              .finally(() => {
                setIsLoading(false);
              });

            // Parar todos os tracks da stream
            stream.getTracks().forEach(track => track.stop());
          };

          recorder.start();
          setIsRecordingAudio(true);
        })
        .catch(err => {
          console.error("Erro ao acessar microfone:", err);
          alert("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
        });
    } else {
      alert("Seu navegador não suporta gravação de áudio. Por favor, use um navegador mais recente.");
    }
  };

  // Função para parar gravação de áudio
  const stopVoiceRecording = () => {
    if (audioRecorder && audioRecorder.state !== 'inactive') {
      audioRecorder.stop();
      setIsRecordingAudio(false);
    }
  };

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description) return;

    const ticket: Ticket = {
      id: (tickets.length + 1).toString(),
      title: newTicket.title,
      description: newTicket.description,
      status: "open",
      category: newTicket.category,
      createdAt: new Date(),
    };

    setTickets((prev) => [ticket, ...prev]);
    setNewTicket({
      title: "",
      description: "",
      category: "Acesso e Conteúdo",
    });
    setIsCreatingTicket(false);
  };

  const handleCreateSuggestion = () => {
    if (!newSuggestion.title || !newSuggestion.description) return;

    const suggestion: SuggestionItem = {
      id: (suggestions.length + 1).toString(),
      title: newSuggestion.title,
      description: newSuggestion.description,
      votes: 1,
      status: "pending",
      createdAt: new Date(),
      userVoted: true,
    };

    setSuggestions((prev) => [suggestion, ...prev]);
    setNewSuggestion({
      title: "",
      description: "",
    });
    setIsCreatingSuggestion(false);
  };

  const handleVote = (id: string) => {
    setSuggestions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              votes: item.userVoted ? item.votes - 1 : item.votes + 1,
              userVoted: !item.userVoted,
            }
          : item,
      ),
    );
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredChatHistory = chatHistory.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderHomeContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-br from-orange-600 to-orange-800 overflow-y-auto custom-scrollbar">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
            <img src="/vite.svg" alt="Logo" className="w-4 h-4" />
          </div>
          <span className="text-white font-semibold text-sm">Ponto.School</span>
        </div>
        <div className="flex -space-x-2">
          <div className="relative">
            <Avatar className="border-2 border-orange-800 w-6 h-6 transition-transform hover:scale-110 hover:z-10">
              <AvatarImage
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alice"
                alt="Support Agent"
              />
              <AvatarFallback className="text-[8px]">A</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-400 rounded-full border border-orange-800"></span>
          </div>
          <div className="relative">
            <Avatar className="border-2 border-orange-800 w-6 h-6 transition-transform hover:scale-110 hover:z-10">
              <AvatarImage
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Bob"
                alt="Support Agent"
              />
              <AvatarFallback className="text-[8px]">B</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-400 rounded-full border border-orange-800"></span>
          </div>
          <div className="relative">
            <Avatar className="border-2 border-orange-800 w-6 h-6 transition-transform hover:scale-110 hover:z-10">
              <AvatarImage
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie"
                alt="Support Agent"
              />
              <AvatarFallback className="text-[8px]">C</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-gray-400 rounded-full border border-orange-800"></span>
          </div>
        </div>
      </div>

      <div className="p-3 flex flex-col items-start">
        <div className="mb-3 w-full">
          <h2 className="text-xl font-bold text-white mb-1 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent truncate">
            E AÍ, {userName.split(/[_\s]/)[0].toUpperCase()} 👋
          </h2>
          <p className="text-white/70 text-sm">Bora trocar uma ideia? Como posso te ajudar hoje?</p>
        </div>

        <Button
          variant="outline"
          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 mb-4 flex justify-between items-center group p-2 h-auto rounded-lg backdrop-blur-sm"
          onClick={() => {
            setActiveTab("chat");
            setSelectedChat(null);
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center">
              <MessageCircle className="h-3.5 w-3.5 text-orange-400" />
            </div>
            <span className="text-xs font-medium">Envie uma mensagem</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </Button>

        <div className="w-full">
          <h3 className="text-white/80 text-xs mb-2 flex items-center gap-1 font-medium">
            <Search className="h-3.5 w-3.5 text-orange-400" />
            Qual é a sua dúvida?
          </h3>

          <div className="space-y-2 w-full">
            {commonQuestions.map((q, index) => (
              <Button
                key={q.id}
                variant="outline"
                className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 flex justify-between items-center text-left p-2 h-auto rounded-lg transition-all duration-300 hover:translate-x-1"
                onClick={() => {
                  setActiveTab("chat");
                  setInputMessage(q.question);
                  // Usar async/await com setTimeout para garantir que a mensagem seja atualizada antes de enviar
                  setTimeout(async () => {
                    await handleSendMessage();
                  }, 100);
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center">
                    {index === 0 && (
                      <Rocket className="h-3 w-3 text-orange-400" />
                    )}
                    {index === 1 && (
                      <LifeBuoy className="h-3 w-3 text-orange-400" />
                    )}
                    {index === 2 && <Zap className="h-3 w-3 text-orange-400" />}
                    {index === 3 && (
                      <Star className="h-3 w-3 text-orange-400" />
                    )}
                  </div>
                  <span className="text-xs truncate max-w-[200px]">
                    {q.question}
                  </span>
                </div>
                <ChevronRight className="h-3 w-3 text-orange-400 flex-shrink-0" />
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto p-2 border-t border-white/10 flex items-center justify-between bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-400 flex items-center justify-center">
            <CheckCircle2 className="h-2 w-2 text-white" />
          </div>
          <span className="text-[10px] text-white/70">
            Status: Todos os sistemas operacionais
          </span>
        </div>
        <span className="text-[10px] text-white/50 truncate">
          Atualizado em {new Date().toLocaleDateString()}
        </span>
      </div>
    </div>
  );

  const renderChatHistoryContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <History className="h-3.5 w-3.5 text-orange-500" />
            <h3 className="text-sm font-semibold">Histórico de Conversas</h3>
          </div>
          <Button
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-2 py-0 h-6 text-xs"
            onClick={() => {
              setActiveTab("chat");
              setSelectedChat(null);
            }}
          >
            <Plus className="h-3 w-3 mr-1" /> Nova
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            className="pl-7 py-1 h-6 text-xs rounded-full border-orange-200 dark:border-orange-700 bg-white dark:bg-orange-900/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {selectedChat ? (
        renderChatContent()
      ) : (
        <ScrollArea
          className="flex-1 custom-scrollbar"
          style={{ maxHeight: "calc(100% - 60px)" }}
        >
          <div className="p-4 space-y-4">
            {filteredChatHistory.length > 0 ? (
              filteredChatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="border border-orange-200 dark:border-orange-700 rounded-xl p-4 hover:bg-orange-50 dark:hover:bg-orange-900/50 transition-all duration-300 cursor-pointer hover:shadow-md hover:translate-y-[-2px]"
                  onClick={() => {
                    setSelectedChat(chat.id);
                    setActiveTab("chat");
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Support"
                          alt="Support"
                        />
                        <AvatarFallback className="bg-orange-100 text-orange-800">
                          SP
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">
                          {chat.title}
                        </h4>
                        {chat.unread && (
                          <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            Nova mensagem
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground bg-orange-100 dark:bg-orange-800 px-2 py-1 rounded-full">
                      {chat.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground dark:text-gray-400 mb-3 line-clamp-2 pl-10">
                    {chat.lastMessage}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground dark:text-gray-400 pl-10">
                    <Clock className="h-3 w-3 mr-1" />
                    {chat.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 px-4 dark:text-gray-300">
                <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center mx-auto mb-3">
                  <History className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">
                  Nenhuma conversa encontrada
                </p>
                <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6">
                  Inicie uma nova conversa com nosso suporte
                </p>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
                  onClick={() => {
                    setActiveTab("chat");
                    setSelectedChat(null);
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Iniciar uma nova conversa
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  const renderNotificationsContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <Bell className="h-3.5 w-3.5 text-orange-500" />
            <h3 className="text-sm font-semibold">Notificações</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full px-2 py-0 h-6 text-xs"
            onClick={() => {
              setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true })),
              );
            }}
          >
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      <ScrollArea
        className="flex-1 custom-scrollbar"
        style={{ maxHeight: "calc(100% - 60px)" }}
      >
        <div className="p-4 space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-xl p-4 transition-all duration-300 hover:shadow-md ${notification.read ? "border-orange-200 dark:border-orange-700 bg-white dark:bg-transparent" : "border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.type === "info" ? "bg-blue-100 text-blue-600" : notification.type === "success" ? "bg-green-100 text-green-600" : notification.type === "warning" ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"}`}
                    >
                      {notification.type === "info" && (
                        <MessageCircle className="h-4 w-4" />
                      )}
                      {notification.type === "success" && (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      {notification.type === "warning" && (
                        <Clock className="h-4 w-4" />
                      )}
                      {notification.type === "error" && (
                        <X className="h-4 w-4" />
                      )}
                    </div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      {notification.title}
                    </h4>
                  </div>
                  {!notification.read && (
                    <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      Nova
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground dark:text-gray-400 mb-3 ml-10">
                  {notification.message}
                </p>
                <div className="flex justify-between items-center text-xs text-muted-foreground dark:text-gray-400 ml-10">
                  <span>
                    {notification.timestamp.toLocaleDateString()} às{" "}
                    {notification.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs hover:bg-orange-100 dark:hover:bg-orange-900/20"
                    onClick={() => {
                      setNotifications((prev) =>
                        prev.map((n) =>
                          n.id === notification.id ? { ...n, read: true } : n,
                        ),
                      );
                    }}
                  >
                    {notification.read ? "Lida" : "Marcar como lida"}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 px-4 dark:text-gray-300">
              <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center mx-auto mb-3">
                <Bell className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">
                Nenhuma notificação
              </p>
              <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6">
                Você não tem notificações no momento
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const renderChatContent = () => (
    <div className="flex flex-col h-full">
      <ScrollArea
        className="flex-1 p-4 custom-scrollbar overflow-y-auto"
        style={{ maxHeight: "calc(100% - 90px)" }}
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex animate-fadeIn ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "assistant" && (
                <div className="w-10 h-10 rounded-full overflow-hidden mr-2 flex-shrink-0">
                  <Avatar>
                    <AvatarImage src="/images/tempo-image-20250329T044440497Z.png" alt="Epictus IA" />
                    <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white">
                      <Bot className="h-5 w-5" />
                      <span className="absolute -right-1 -bottom-1 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <Sparkles className="h-2 w-2 text-white" />
                      </span>
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-lg px-4 py-3 shadow-md ${
                  message.sender === "user"
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-none"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                }`}
              >
                <div className="flex flex-col">
                  {message.isImproved && (
                    <div className="mb-2 flex items-center">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Resposta melhorada
                      </Badge>
                    </div>
                  )}
                  <div 
                    className="message-content whitespace-pre-wrap" 
                    dangerouslySetInnerHTML={{ 
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\_(.*?)\_/g, '<em>$1</em>')
                        .replace(/\~\~(.*?)\~\~/g, '<del>$1</del>')
                        .replace(/\`(.*?)\`/g, '<code class="bg-black/10 dark:bg-white/10 rounded px-1">$1</code>')
                        .replace(/\n/g, '<br />')
                        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" class="text-white hover:underline hover:text-white/90" target="_blank" rel="noopener noreferrer">$1</a>')
                    }} 
                  />
                </div>
                {message.files && message.files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.files.map((file, index) => (
                      <div key={`${file.name}-${index}`} className={`flex items-center rounded-md p-2.5 transition-all ${
                        message.sender === "user" 
                          ? "bg-white/10 hover:bg-white/20" 
                          : "bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
                      }`}>
                        <div className="mr-3 flex-shrink-0 bg-white/20 p-2 rounded-full">
                          {file.type.startsWith('image/') && <Image className="h-4 w-4" />}
                          {file.type.startsWith('video/') && <Video className="h-4 w-4" />}
                          {file.type.startsWith('audio/') && <Music className="h-4 w-4" />}
                          {(!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/')) && <File className="h-4 w-4" />}
                        </div>
                        <div className="overflow-hidden text-sm">
                          <a 
                            href={file.url} 
                            download={file.name} 
                            className={`hover:underline font-medium truncate block ${message.sender === "user" ? "text-white" : "text-blue-500"}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name}
                          </a>
                          <span className="text-xs opacity-70">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs opacity-80 mt-1.5 text-right flex items-center justify-end gap-1">
                  <span className={message.sender === "user" ? "bg-white/20 px-1.5 py-0.5 rounded-sm" : ""}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              {message.sender === "user" && (
                <div className="w-8 h-8 rounded-full overflow-hidden ml-2 flex-shrink-0">
                  <Avatar>
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </div>
              )}
              {message.sender === "assistant" && (
                <div className="flex items-center justify-end mt-1 space-x-2">
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Gostei da resposta"
                      onClick={() => {
                        // Marcar feedback positivo
                        const updatedMessages = [...messages];
                        const messageIndex = updatedMessages.findIndex(m => m.id === message.id);
                        if (messageIndex >= 0) {
                          updatedMessages[messageIndex] = {
                            ...updatedMessages[messageIndex],
                            feedback: 'positive'
                          };
                          setMessages(updatedMessages);
                        }
                      }}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${message.feedback === 'positive' ? 'text-green-500 fill-green-500' : 'text-gray-500'}`} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Não gostei da resposta"
                      onClick={() => {
                        // Marcar feedback negativo e mostrar opções para melhoria
                        const updatedMessages = [...messages];
                        const messageIndex = updatedMessages.findIndex(m => m.id === message.id);
                        if (messageIndex >= 0) {
                          updatedMessages[messageIndex] = {
                            ...updatedMessages[messageIndex],
                            feedback: 'negative',
                            showFeedbackOptions: !updatedMessages[messageIndex].showFeedbackOptions
                          };
                          setMessages(updatedMessages);
                        }
                      }}
                    >
                      <ThumbsDown className={`h-3.5 w-3.5 ${message.feedback === 'negative' ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
                    </Button>
                  </div>
                </div>
              )}
              {message.sender === "assistant" && message.showFeedbackOptions && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium mb-2">Como podemos melhorar esta resposta?</h4>
                  <div className="space-y-2">
                    <div className="flex flex-col space-y-2">
                      <Textarea 
                        placeholder="Descreva como a resposta poderia ser melhor..."
                        className="text-sm resize-none min-h-[60px]"
                        value={message.feedbackText || ''}
                        onChange={(e) => {
                          const updatedMessages = [...messages];
                          const messageIndex = updatedMessages.findIndex(m => m.id === message.id);
                          if (messageIndex >= 0) {
                            updatedMessages[messageIndex] = {
                              ...updatedMessages[messageIndex],
                              feedbackText: e.target.value
                            };
                            setMessages(updatedMessages);
                          }
                        }}
                      />
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            const updatedMessages = [...messages];
                            const messageIndex = updatedMessages.findIndex(m => m.id === message.id);
                            if (messageIndex >= 0) {
                              updatedMessages[messageIndex] = {
                                ...updatedMessages[messageIndex],
                                showFeedbackOptions: false
                              };
                              setMessages(updatedMessages);
                            }
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={async () => {
                            // Encontrar a mensagem atual
                            const messageIndex = messages.findIndex(m => m.id === message.id);
                            if (messageIndex < 0) return;
                            
                            const currentMessage = messages[messageIndex];
                            
                            // Encontrar a mensagem do usuário que veio antes
                            let userMessageIndex = messageIndex - 1;
                            while (userMessageIndex >= 0 && messages[userMessageIndex].sender !== 'user') {
                              userMessageIndex--;
                            }
                            
                            if (userMessageIndex < 0) return;
                            
                            const userMessage = messages[userMessageIndex];
                            
                            // Criar um prompt para melhorar a resposta
                            const prompt = `Melhore a seguinte resposta com base no feedback do usuário:
                            
Pergunta original: "${userMessage.content}"
Resposta original: "${currentMessage.content}"
Feedback do usuário: "${currentMessage.feedbackText || 'A resposta precisa ser mais clara, correta e bem organizada'}"

Por favor, forneça uma nova resposta melhorada que:
1. Seja mais clara e direta
2. Esteja bem organizada
3. Corrija quaisquer erros ou imprecisões
4. Atenda melhor às expectativas do usuário conforme o feedback`;
                            
                            // Mostrar indicador de carregamento
                            setIsTyping(true);
                            
                            // Ocultar as opções de feedback
                            const updatedMessages = [...messages];
                            updatedMessages[messageIndex] = {
                              ...updatedMessages[messageIndex],
                              showFeedbackOptions: false
                            };
                            setMessages(updatedMessages);
                            
                            try {
                              // Gerar resposta melhorada
                              const improvedResponse = await generateAIResponse(
                                prompt,
                                sessionId || 'default_session',
                                {
                                  intelligenceLevel: 'advanced',
                                  languageStyle: aiLanguageStyle
                                }
                              );
                              
                              // Adicionar a resposta melhorada
                              setMessages(prev => [
                                ...prev,
                                { 
                                  id: Date.now(), 
                                  content: improvedResponse, 
                                  sender: 'assistant', 
                                  timestamp: new Date(),
                                  isImproved: true
                                }
                              ]);
                            } catch (error) {
                              console.error('Erro ao melhorar resposta:', error);
                              setMessages(prev => [
                                ...prev,
                                { 
                                  id: Date.now(), 
                                  content: 'Desculpe, não foi possível gerar uma resposta melhorada. Por favor, tente novamente mais tarde.', 
                                  sender: 'assistant', 
                                  timestamp: new Date() 
                                }
                              ]);
                            } finally {
                              setIsTyping(false);
                            }
                          }}
                        >
                          Melhorar resposta
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white">
                    <Bot className="h-4 w-4" />
                    <span className="absolute -right-1 -bottom-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                      <Sparkles className="h-2 w-2 text-white" />
                    </span>
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="max-w-[75%] rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm">
                <div className="flex items-center">
                  <div className="mr-2 text-xs text-gray-500 dark:text-gray-400">Epictus IA está digitando</div>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse delay-150" />
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse delay-300" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Badge 
              variant="outline" 
              className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-800 dark:text-blue-300 text-xs px-2 py-0 h-5 cursor-pointer"
              onClick={() => setIsShowingAISettings(!isShowingAISettings)}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              IA Habilitada
              <Settings className="h-3 w-3 ml-1" />
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1"
              onClick={async () => {
                // Limpar histórico de mensagens
                setMessages(defaultMessages);

                // Importar e chamar função para limpar histórico de conversa
                try {
                  const { clearConversationHistory } = await import('@/services/aiChatService');
                  const sessionId = userName || 'anonymous-' + Date.now().toString();
                  clearConversationHistory(sessionId);
                } catch (error) {
                  console.error('Erro ao limpar histórico:', error);
                }
              }}
            >
              <RefreshCw className="h-3 w-3" />
              Nova conversa
            </Button>
          </div>
        </div>

        {isShowingAISettings && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Settings className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
              Configurações da IA
            </h4>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Nível de Inteligência</label>
                <div className="flex gap-1">
                  {['basic', 'normal', 'advanced'].map((level) => (
                    <Button
                      key={level}
                      size="sm"
                      variant={aiIntelligenceLevel === level ? "default" : "outline"}
                      className={`text-xs py-1 px-2 h-auto ${
                        aiIntelligenceLevel === level 
                          ? "bg-orange-500 hover:bg-orange-600 text-white" 
                          : "border-orange-200 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      }`}
                      onClick={() => setAIIntelligenceLevel(level)}
                    >
                      {level === 'basic' ? 'Básico' : level === 'normal' ? 'Normal' : 'Avançado'}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Estilo de Linguagem</label>
                <div className="flex gap-1">
                  {['casual', 'formal', 'technical'].map((style) => (
                    <Button
                      key={style}
                      size="sm"
                      variant={aiLanguageStyle === style ? "default" : "outline"}
                      className={`text-xs py-1 px-2 h-auto ${
                        aiLanguageStyle === style 
                          ? "bg-orange-500 hover:bg-orange-600 text-white" 
                          : "border-orange-200 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      }`}
                      onClick={() => setAILanguageStyle(style)}
                    >
                      {style === 'casual' ? 'Casual' : style === 'formal' ? 'Formal' : 'Técnico'}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Sons de Notificação</label>
                <div className="flex items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className={`text-xs py-1 px-2 h-auto mr-2 ${
                      enableNotificationSounds 
                        ? "bg-orange-500 hover:bg-orange-600 text-white" 
                        : "border-orange-200 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    }`}
                    onClick={() => setEnableNotificationSounds(!enableNotificationSounds)}
                  >
                    {enableNotificationSounds ? (
                      <Headphones className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Bell className="h-3.5 w-3.5 mr-1" />
                    )}
                    {enableNotificationSounds ? 'Ativado' : 'Desativado'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {isImprovingPrompt ? (
          <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-200 dark:border-orange-700">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                Prompt melhorado
              </h4>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-6 px-2 text-xs border-orange-200 dark:border-orange-700"
                  onClick={cancelImprovedPrompt}
                >
                  Cancelar
                </Button>
                <Button 
                  size="sm" 
                  className="h-6 px-2 text-xs bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={acceptImprovedPrompt}
                >
                  Usar este prompt
                </Button>
              </div>
            </div>
            
            {promptImprovementLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-150" />
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-300" />
                  <span className="text-sm text-orange-600 dark:text-orange-400 ml-2">Melhorando sua pergunta...</span>
                </div>
              </div>
            ) : (
              <div className="p-2 bg-white dark:bg-gray-800 rounded border border-orange-100 dark:border-orange-800">
                <p className="text-sm whitespace-pre-wrap">{improvedPrompt}</p>
              </div>
            )}
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="pr-10 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <div className="absolute right-0 top-0 h-full flex">
              {inputMessage.trim().length > 0 && !isImprovingPrompt && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-orange-500 hover:text-orange-600 hover:bg-transparent"
                  onClick={improvePrompt}
                  title="Melhorar pergunta com IA"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-orange-500 hover:text-orange-600"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() && selectedFiles.length === 0}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
              >
                <Paperclip className="h-5 w-5" />
              </Button>

              {showAttachmentOptions && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 overflow-hidden">
                  <div className="py-1">
                    <label htmlFor="image-upload" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer w-full">
                      <Image className="h-4 w-4 text-[#FF6B00]" />
                      Imagem
                    </label>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    <label htmlFor="document-upload" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer w-full">
                      <FileText className="h-4 w-4 text-[#FF6B00]" />
                      Documento
                    </label>
                    <input
                      type="file"
                      id="document-upload"
                      accept=".pdf,.doc,.docx,.txt,.xlsx,.ppt,.pptx"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    <label htmlFor="video-upload" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer w-full">
                      <Video className="h-4 w-4 text-[#FF6B00]" />
                      Vídeo
                    </label>
                    <input
                      type="file"
                      id="video-upload"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    <button
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                      onClick={startVoiceRecording}
                    >
                      <Mic className="h-4 w-4 text-[#FF6B00]" />
                      Áudio
                    </button>
                  </div>
                </div>
              )}

              {isRecordingAudio && (
                <div className="absolute bottom-full right-0 mb-2 p-3 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50">
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse">
                      <Mic className="h-5 w-5 text-red-500" />
                    </div>
                    <span className="text-sm">Gravando áudio...</span>
                    <Button size="sm" variant="ghost" onClick={stopVoiceRecording}>
                      <Square className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}


            </div>
            {/* Área de arquivos selecionados */}
            {selectedFiles.length > 0 && (
              <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1"
                  >
                    <span className="text-xs truncate max-w-[120px]">{file.name}</span>
                    <button 
                      className="ml-1 text-gray-500 hover:text-red-500"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Configurações da IA */}
            {showAISettings && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Configurações da IA</h4>

                <div className="mb-2">
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Nível de inteligência</label>
                  <div className="flex gap-2">
                    {(['basic', 'normal', 'advanced'] as const).map((level) => (
                      <button
                        key={level}
                        className={`px-2 py-1 text-xs rounded ${
                          aiIntelligenceLevel === level 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                        onClick={() => setAIIntelligenceLevel(level)}
                      >
                        {level === 'basic' ? 'Básico' : level === 'normal' ? 'Normal' : 'Avançado'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Estilo de linguagem</label>
                  <div className="flex gap-2">
                    {(['casual', 'formal', 'technical'] as const).map((style) => (
                      <button
                        key={style}
                        className={`px-2 py-1 text-xs rounded ${
                          aiLanguageStyle === style 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                        onClick={() => setAILanguageStyle(style)}
                      >
                        {style === 'casual' ? 'Casual' : style === 'formal' ? 'Formal' : 'Técnico'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Área de arquivos selecionados */}
            {selectedFiles.length > 0 && (
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div 
                      key={index} 
                      className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1"
                    >
                      <span className="text-xs truncate max-w-[120px]">{file.name}</span>
                      <button 
                        className="ml-1 text-gray-500 hover:text-red-500"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTicketsContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-[#FF6B00] text-white">
        <h3 className="text-lg font-semibold">Meus Tickets</h3>
        <div className="flex justify-between items-center mt-2">
          <Input
            placeholder="Buscar tickets..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 h-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            size="sm"
            className="ml-2 bg-white text-[#FF6B00] hover:bg-white/90"
            onClick={() => setIsCreatingTicket(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Novo Ticket
          </Button>
        </div>
      </div>

      {isCreatingTicket ? (
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold dark:text-gray-200">
            Novo Ticket
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block dark:text-gray-300">
                Título
              </label>
              <Input
                value={newTicket.title}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, title: e.target.value })
                }
                placeholder="Descreva o problema brevemente"
                className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block dark:text-gray-300">
                Descrição
              </label>
              <textarea
                value={newTicket.description}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, description: e.target.value })
                }
                placeholder="Forneça detalhes sobre o problema"
                className="w-full min-h-[100px] p-2 rounded-md border border-input dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block dark:text-gray-300">
                Categoria
              </label>
              <select
                value={newTicket.category}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, category: e.target.value })
                }
                className="w-full p-2 rounded-md border border-input dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
              >
                <option value="Acesso e Conteúdo">Acesso e Conteúdo</option>
                <option value="Problemas Técnicos">Problemas Técnicos</option>
                <option value="Faturamento">Faturamento</option>
                <option value="Certificados">Certificados</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreatingTicket(false)}
                className="dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                onClick={handleCreateTicket}
              >
                Enviar Ticket
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium dark:text-gray-200">
                    {ticket.title}
                  </h4>
                  <Badge
                    className={`${ticket.status === "open" ? "bg-blue-500" : ticket.status === "in_progress" ? "bg-yellow-500" : "bg-green-500"}`}
                  >
                    #{ticket.id}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {ticket.description}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <Badge
                    variant="outline"
                    className="dark:border-gray-700 dark:text-gray-300"
                  >
                    {ticket.category}
                  </Badge>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {ticket.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {filteredTickets.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhum ticket encontrado
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  const renderHelpContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-[#FF6B00] text-white">
        <h3 className="text-lg font-semibold">Central de Ajuda</h3>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
          <Input
            placeholder="Buscar perguntas frequentes..."
            className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/60 h-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {selectedFaq ? (
        <div className="p-4 space-y-4">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={() => setSelectedFaq(null)}
          >
            ← Voltar
          </Button>
          <h3 className="text-lg font-semibold dark:text-gray-200">
            {selectedFaq.question}
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {selectedFaq.answer}
            </p>
          </div>
          <div className="pt-4 border-t dark:border-gray-700">
            <p className="text-sm font-medium mb-2 dark:text-gray-300">
              Esta resposta foi útil?
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <ThumbsUp className="h-4 w-4" /> Sim
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <ThumbsDown className="h-4 w-4" /> Não
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Group FAQs by category */}
            {(() => {
              const groupedFaqs: Record<string, FaqItem[]> = {};

              filteredFaqs.forEach((faq) => {
                if (!groupedFaqs[faq.category]) {
                  groupedFaqs[faq.category] = [];
                }
                groupedFaqs[faq.category].push(faq);
              });

              return Object.entries(groupedFaqs).map(([category, faqs]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-semibold text-[#FF6B00] uppercase">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {faqs.map((faq) => (
                      <Button
                        key={faq.id}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                        onClick={() => setSelectedFaq(faq)}
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-[#FF6B00]" />
                          <span className="text-sm">{faq.question}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ));
            })()}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhuma pergunta encontrada
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  const renderSuggestionsContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <Lightbulb className="h-3.5 w-3.5 text-orange-500" />
            <h3 className="text-sm font-semibold">Sugestões</h3>
          </div>
          <Button
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-2 py-0 h-6 text-xs"
            onClick={() => setIsCreatingSuggestion(true)}
          >
            <Plus className="h-3 w-3 mr-1" /> Nova
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Buscar sugestões..."
            className="pl-7 py-1 h-6 text-xs rounded-full border-orange-200 dark:border-orange-700 bg-white dark:bg-orange-900/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isCreatingSuggestion ? (
        <div className="p-4 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-1 dark:text-gray-200">
            <Lightbulb className="h-3.5 w-3.5 text-orange-500" />
            Nova Sugestão
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block dark:text-gray-300">
                Título
              </label>
              <Input
                value={newSuggestion.title}
                onChange={(e) =>
                  setNewSuggestion({ ...newSuggestion, title: e.target.value })
                }
                placeholder="Título da sua sugestão"
                className="border-orange-200 dark:border-orange-700 bg-white dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block dark:text-gray-300">
                Descrição
              </label>
              <textarea
                value={newSuggestion.description}
                onChange={(e) =>
                  setNewSuggestion({
                    ...newSuggestion,
                    description: e.target.value,
                  })
                }
                placeholder="Descreva sua sugestão em detalhes"
                className="w-full min-h-[120px] p-3 rounded-md border border-orange-200 dark:border-orange-700 bg-white dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                className="border-orange-200 dark:border-orange-700 dark:text-gray-200 dark:hover:bg-gray-800"
                onClick={() => setIsCreatingSuggestion(false)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleCreateSuggestion}
              >
                Enviar Sugestão
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <ScrollArea
          className="flex-1 custom-scrollbar"
          style={{ maxHeight: "calc(100% - 60px)" }}
        >
          <div className="p-4 space-y-4">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="border border-orange-200 dark:border-orange-700 rounded-xl p-4 hover:bg-orange-50 dark:hover:bg-orange-900/50 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      {suggestion.title}
                    </h4>
                    <Badge
                      className={`${suggestionStatusColors[suggestion.status]} rounded-full px-3`}
                    >
                      {suggestion.status === "pending"
                        ? "Pendente"
                        : suggestion.status === "reviewing"
                          ? "Em análise"
                          : suggestion.status === "approved"
                            ? "Aprovado"
                            : "Implementado"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground dark:text-gray-400 mb-3">
                    {suggestion.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <Button
                      variant={suggestion.userVoted ? "default" : "outline"}
                      size="sm"
                      className={
                        suggestion.userVoted
                          ? "bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                          : "border-orange-200 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/50 rounded-full dark:text-gray-200"
                      }
                      onClick={() => handleVote(suggestion.id)}
                    >
                      <Vote className="h-4 w-4 mr-1" />
                      {suggestion.votes} votos
                    </Button>
                    <div className="text-xs text-muted-foreground bg-orange-100 dark:bg-orange-800 px-2 py-1 rounded-full">
                      {new Date(suggestion.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 px-4 dark:text-gray-300">
                <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center mx-auto mb-3">
                  <Lightbulb className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">
                  Nenhuma sugestão encontrada
                </p>
                <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6">
                  Compartilhe suas ideias para melhorar a plataforma
                </p>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
                  onClick={() => setIsCreatingSuggestion(true)}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Criar uma nova sugestão
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  return (
    <>
      {/* Overlay for blur effect */}
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <Button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 shadow-lg animate-bounce-subtle"
          >
            <MessageSquare className="h-6 w-6 text-white" />
          </Button>
        ) : (
          <div
            className={cn(
              "bg-white dark:bg-gray-900 rounded-xl shadow-xl flex flex-col overflow-hidden transition-all duration-300",
              isExpanded ? "w-[800px] h-[600px]" : "w-[380px] h-[550px]",
            )}
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Button
                  variant={activeTab === "home" ? "default" : "ghost"}
                  size="icon"
                  className={`h-10 w-10 rounded-full mb-4 ${activeTab === "home" ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white" : ""}`}
                  onClick={() => setActiveTab("home")}
                >
                  <Home className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="flex h-full">
                <div className="w-[70px] border-r dark:border-gray-800 flex flex-col items-center py-4">
                  <Button
                    variant={activeTab === "home" ? "default" : "ghost"}
                    size="icon"
                    className={`h-10 w-10 rounded-full mb-4 ${activeTab === "home" ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white" : ""}`}
                    onClick={() => setActiveTab("home")}
                  >
                    <Home className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={activeTab === "chat" ? "default" : "ghost"}
                    size="icon"
                    className={`h-10 w-10 rounded-full mb-4 ${activeTab === "chat" ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white" : ""}`}
                    onClick={() => {
                      setActiveTab("chat");
                      setSelectedChat(null);
                    }}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={activeTab === "history" ? "default" : "ghost"}
                    size="icon"
                    className={`h-10 w-10 rounded-full mb-4 ${activeTab === "history" ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white" : ""}`}
                    onClick={() => setActiveTab("history")}
                  >
                    <History className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={activeTab === "tickets" ? "default" : "ghost"}
                    size="icon"
                    className={`h-10 w-10 rounded-full mb-4 ${activeTab === "tickets" ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white" : ""}`}
                    onClick={() => setActiveTab("tickets")}
                  >
                    <TicketIcon className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={activeTab === "help" ? "default" : "ghost"}
                    size="icon"
                    className={`h-10 w-10 rounded-full mb-4 ${activeTab === "help" ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white" : ""}`}
                    onClick={() => setActiveTab("help")}
                  >
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={activeTab === "suggestions" ? "default" : "ghost"}
                    size="icon"
                    className={`h-10 w-10 rounded-full mb-4 ${activeTab === "suggestions" ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white" : ""}`}
                    onClick={() => setActiveTab("suggestions")}
                  >
                    <Lightbulb className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={
                      activeTab === "notifications" ? "default" : "ghost"
                    }
                    size="icon"
                    className={`h-10 w-10 rounded-full mb-4 relative ${activeTab === "notifications" ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white" : ""}`}
                    onClick={() => setActiveTab("notifications")}
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.some((n) => !n.read) && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white dark:border-gray-900"></span>
                    )}
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden">
                  {activeTab === "home" && renderHomeContent()}
                  {activeTab === "chat" && renderChatContent()}
                  {activeTab === "history" && renderChatHistoryContent()}
                  {activeTab === "tickets" && renderTicketsContent()}
                  {activeTab === "help" && renderHelpContent()}
                  {activeTab === "suggestions" && renderSuggestionsContent()}
                  {activeTab === "notifications" &&
                    renderNotificationsContent()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes bounce-subtle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .message-content strong {
          font-weight: 600;
        }
        
        .message-content em {
          font-style: italic;
          opacity: 0.9;
        }
        
        .message-content code {
          font-family: monospace;
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
        }
        
        .message-content ul, .message-content ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        
        .message-content ul li {
          list-style-type: disc;
        }
        
        .message-content ol li {
          list-style-type: decimal;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
          height: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(249, 115, 22, 0.6);
          border-radius: 9999px;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(249, 115, 22, 0.6);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(249, 115, 22, 0.8);
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(249, 115, 22, 0.8);
        }

        /* Apply custom scrollbar to all ScrollArea components */
        .ScrollAreaViewport {
          scrollbar-width: thin;
          scrollbar-color: rgba(249, 115, 22, 0.6) transparent;
        }

        .dark .ScrollAreaViewport {
          scrollbar-color: rgba(249, 115, 22, 0.6) transparent;
        }

        /* Fix for mobile responsiveness */
        @media (max-width: 640px) {
          .fixed.z-40 {
            width: 90% !important;
            right: 5% !important;
            left: 5% !important;
            max-height: 80vh !important;
          }

          .fixed.z-40 .rounded-2xl {
            max-width: 75% !important;
          }
        }
      `}</style>
    </>
  );
};

export default FloatingChatSupport;