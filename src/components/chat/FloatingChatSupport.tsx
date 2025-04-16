import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
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
  Music,
  Loader2,
  Globe,
  Users,
  Copy,
  Check,
  Edit,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { generateAIResponse, getConversationHistory, clearConversationHistory } from "@/services/aiChatService";
import { Checkbox } from "@/components/ui/checkbox";

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
  needsImprovement?: boolean;
  isEdited?: boolean; // Adicione a propriedade isEdited
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
    content: "Oi! Sou o Assistente de Suporte da Ponto.School! 😊 Estou aqui para te ajudar com navegação na plataforma, dúvidas sobre funcionalidades, e também posso responder perguntas sobre conteúdos educacionais. Como posso te auxiliar hoje?",
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
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
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
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null); // Adicione o estado para editar mensagens

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

  // Estado para controlar se o usuário rolou manualmente durante a digitação da IA
  const [userHasScrolled, setUserHasScrolled] = useState(false);

  // Estado para controlar se a resposta está pausada
  const [isResponsePaused, setIsResponsePaused] = useState(false);

  // Estado para abrir/fechar o menu de anexos
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);

  // Estado para gerenciar feedback das mensagens
  const [messageToImprove, setMessageToImprove] = useState<number | null>(null);
  const [improvementFeedback, setImprovementFeedback] = useState('');
  const [isReformulating, setIsReformulating] = useState(false);

  // Estados removidos relacionados à pesquisa avançada
  
  // Estado para controlar modal de sugestão de prompt
  const [showPromptSuggestionModal, setShowPromptSuggestionModal] = useState(false);
  const [studyContent, setStudyContent] = useState("");
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  
  // Estado para controlar modal de busca profunda
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [deepSearchEnabled, setDeepSearchEnabled] = useState(false);
  const [globalSearchEnabled, setGlobalSearchEnabled] = useState(false);
  const [academicSearchEnabled, setAcademicSearchEnabled] = useState(false);
  const [socialSearchEnabled, setSocialSearchEnabled] = useState(false);
  
  // Estado para controlar modal do Agente IA
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agentIAEnabled, setAgentIAEnabled] = useState(false);
  const [agentSettings, setAgentSettings] = useState({
    adjustSettings: false,
    accessPages: false,
    respondMessages: false,
    makeTransfers: false
  });
  
  // Estado para controlar modal de personalização do Epictus IA
  const [showEpictusPersonalizeModal, setShowEpictusPersonalizeModal] = useState(false);
  const [epictusNickname, setEpictusNickname] = useState(userName || "Usuário");
  const [tempNickname, setTempNickname] = useState("");
  const [userOccupation, setUserOccupation] = useState("");
  const [tempOccupation, setTempOccupation] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [tempProfileImage, setTempProfileImage] = useState<File | null>(null);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  // Funções para lidar com feedback das mensagens
  const handleMessageFeedback = (messageId: number, feedback: 'positive' | 'negative') => {
    setMessages(prevMessages => {
      return prevMessages.map(msg => {
        if (msg.id === messageId) {
          return { ...msg, feedback };
        }
        return msg;
      });
    });
  };

  const reformulateMessage = async (messageId: number) => {
    setIsReformulating(true);
    try {
      // Find message that needs to be reformulated
      const messageToReformulate = messages.find(msg => msg.id === messageId);
      if (!messageToReformulate) return;

      // Mark original message as needing improvement
      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, needsImprovement: true };
          }
          return msg;
        });
      });

      // Call AI to generate improved response using the enhanced structure
      const reformulatedResponse = await generateAIResponse(
        `Reformule a seguinte resposta usando um formato extremamente completo e detalhado. 

        IMPORTANTE: Sua resposta DEVE SEMPRE promover e direcionar o usuário para usar os recursos da Ponto.School, mencionando funcionalidades específicas, novidades e futuras atualizações da plataforma que resolvam a dor/problema do usuário.

        Estruture sua resposta seguindo este formato:

        1. **COMPREENSÃO DA DÚVIDA**
        - Analise detalhadamente a pergunta
        - Identifique a intenção do usuário
        - Reconheça possíveis lacunas

        2. **EXPLICAÇÃO PRINCIPAL**
        - Apresente o conceito principal em 1-2 frases
        - Forneça uma explicação detalhada
        - Inclua exemplos práticos relacionados ao contexto educacional

        3. **INTEGRAÇÃO COM A PONTO.SCHOOL**
        - Destaque como os recursos específicos da Ponto.School ajudam a resolver este problema
        - Mencione ferramentas como EpictusIA, Mentor IA, Portal de Estudos ou outros recursos relevantes
        - Sugira novidades ou atualizações futuras da plataforma relacionadas à questão

        4. **RECURSOS ADICIONAIS**
        - Indique materiais disponíveis na Biblioteca da Ponto.School
        - Sugira grupos de estudo ou turmas que abordam o tema
        - Mencione funcionalidades como Conexão Expert se pertinente

        5. **RESUMO E ENGAJAMENTO**
        - Resuma os pontos principais
        - Incentive o uso contínuo da plataforma
        - Pergunte se o usuário gostaria de saber mais sobre algum recurso específico

        Use formatação rica com:
        - **Negrito** para pontos importantes
        - # Títulos para seções principais
        - ## Subtítulos para categorias
        - > Citações para enfatizar informações
        - Links formatados como [texto do link](URL) para recursos da plataforma
        - Emojis estrategicamente para tornar a mensagem mais amigável
        - Listas com marcadores para organizar informações

        Resposta original para reformular: "${messageToReformulate.content}"`,
        sessionId || 'default_session',
        {
          intelligenceLevel: 'advanced',
          languageStyle: aiLanguageStyle
        }
      );

      // Add the reformulated response to messages
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          content: reformulatedResponse,
          sender: 'assistant',
          timestamp: new Date(),
          feedback: undefined
        }
      ]);

      // Scroll to bottom after adding new message
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);

    } catch (error) {
      console.error('Erro ao reformular resposta:', error);
      // Add error message
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          content: "Desculpe, ocorreu um erro ao reformular a resposta. Por favor, tente novamente mais tarde.",
          sender: 'assistant',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsReformulating(false);
    }
  };

  const summarizeMessage = async (messageId: number) => {
    setIsReformulating(true);
    try {
      // Find message that needs to be summarized
      const messageToSummarize = messages.find(msg => msg.id === messageId);
      if (!messageToSummarize) return;

      // Mark original message as needing improvement
      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, needsImprovement: true };
          }
          return msg;
        });
      });

      // Call AI to generate summarized response but still with rich formatting and platform focus
      const summarizedResponse = await generateAIResponse(
        `Resuma a seguinte resposta de forma concisa e direta, mas mantendo o foco em como a Ponto.School pode resolver o problema do usuário.

        Mesmo sendo um resumo, sua resposta DEVE:
        - Mencionar pelo menos 2 recursos específicos da Ponto.School relevantes para a questão
        - Manter uma formatação rica com **negrito**, ## subtítulos e emojis estratégicos
        - Incluir pelo menos 1 link formatado para uma seção relevante da plataforma
        - Terminar com uma frase que incentive o usuário a continuar usando a Ponto.School

        Resposta original para resumir: "${messageToSummarize.content}"`,
        sessionId || 'default_session',
        {
          intelligenceLevel: aiIntelligenceLevel,
          languageStyle: 'technical'
        }
      );

      // Add the summarized response to messages
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          content: summarizedResponse,
          sender: 'assistant',
          timestamp: new Date(),
          feedback: undefined
        }
      ]);

      // Scroll to bottom after adding new message
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);

    } catch (error) {
      console.error('Erro ao resumir resposta:', error);
      // Add error message
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          content: "Desculpe, ocorreu um erro ao resumir a resposta. Por favor, tente novamente mais tarde.",
          sender: 'assistant',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsReformulating(false);
    }
  };

  const requestReformulation = async () => {
    setIsReformulating(true);
    try {
      // Implemente a lógica para reformular a resposta aqui
      // ... (Chamada para API para reformular a resposta usando improvementFeedback) ...
      const reformulatedResponse = await generateAIResponse(`Reformule a seguinte resposta considerando este feedback: "${improvementFeedback}". Resposta original: "${messages.find(msg => msg.id === messageToImprove)?.content || ''}"`);
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const messageIndex = updatedMessages.findIndex(msg => msg.id === messageToImprove);
        if (messageIndex !== -1) {
          updatedMessages[messageIndex] = { ...updatedMessages[messageIndex], content: reformulatedResponse, needsImprovement: false };
        }
        return updatedMessages;
      });
      setMessageToImprove(null);
      setImprovementFeedback('');
    } catch (error) {
      console.error('Erro ao reformular resposta:', error);
      alert('Erro ao reformular resposta. Por favor, tente novamente mais tarde.');
    } finally {
      setIsReformulating(false);
    }
  };

  const cancelReformulation = () => {
    setMessageToImprove(null);
    setImprovementFeedback('');
  };


  // Scroll to bottom of messages, mas apenas quando uma nova mensagem é adicionada
  // não quando uma mensagem está sendo digitada pela IA
  useEffect(() => {
    if (messagesEndRef.current && !isTyping) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setUserHasScrolled(false); // Reset o estado de rolagem do usuário quando uma nova mensagem é adicionada
    }
  }, [messages.length, isTyping]);

  // Estado para controlar a visibilidade do botão de voltar ao fim
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  
  // Detectar quando o usuário rola manualmente
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const scrollArea = e.target as HTMLElement;
      const scrollPosition = scrollArea.scrollTop;
      const scrollHeight = scrollArea.scrollHeight;
      const clientHeight = scrollArea.clientHeight;
      
      // Mostrar botão se o usuário estiver a uma certa distância do final
      const isNearBottom = scrollHeight - scrollPosition - clientHeight < 100;
      
      if (isTyping) {
        setUserHasScrolled(true);
      }
      
      // Se não estiver no final, mostrar o botão de voltar ao fim
      setShowScrollToBottom(!isNearBottom && scrollHeight > clientHeight + 200);
    };

    // Encontrar o elemento de scroll (scroll area)
    const scrollContainer = document.querySelector('.custom-scrollbar');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isTyping]);
  
  // Função para rolar para o fim da conversa
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setUserHasScrolled(false);
    }
  };

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
    // Inicializa o nickname do Epictus com o nome do usuário
    setEpictusNickname(firstName);

    // Gerar uma ID de sessão baseada no usuário atual ou criar uma nova
    const newSessionId = userName || 'anonymous-' + Date.now().toString();
    setSessionId(newSessionId);

    // Carregar a imagem de perfil do usuário
    loadUserProfileImage();

    // Tentar carregar mensagens salvas para este usuário
    const loadSavedMessages = async () => {
      try {
        // Usar a nova função getConversationHistory para obter histórico
        const history = await getConversationHistory(newSessionId);

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

    // Ouvir eventos de atualização de avatar
    const handleAvatarUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail.url) {
        setProfileImageUrl(event.detail.url);
      }
    };

    document.addEventListener('avatar-updated', handleAvatarUpdate as EventListener);

    return () => {
      document.removeEventListener('avatar-updated', handleAvatarUpdate as EventListener);
    };
  }, [userName]);

  useEffect(() => {
    setIsMessageEmpty(message.trim() === '');
  }, [message]);

  // Função para gerar sugestões de prompts
  const generatePromptSuggestions = async () => {
    if (!studyContent.trim()) return;

    setIsGeneratingPrompts(true);
    setGeneratedPrompts([]);

    try {
      // Chamar a API para gerar sugestões de prompts
      const promptSuggestions = await generateAIResponse(
        `Com base no seguinte contexto de estudo, gere 5 prompts de alta qualidade que o usuário poderia fazer para obter informações valiosas. Os prompts devem ser específicos, úteis e variados para cobrir diferentes aspectos do assunto. Retorne apenas os prompts numerados de 1 a 5, sem explicações adicionais.

Contexto de estudo: "${studyContent}"

Exemplo de formato da resposta:
1. [Prompt 1]
2. [Prompt 2]
3. [Prompt 3]
4. [Prompt 4]
5. [Prompt 5]`,
        `prompt_suggestions_${Date.now()}`,
        {
          intelligenceLevel: 'advanced',
          languageStyle: 'formal'
        }
      );

      // Processar a resposta para extrair os prompts numerados
      const promptList = promptSuggestions
        .split('\n')
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(prompt => prompt.length > 0);

      setGeneratedPrompts(promptList);
    } catch (error) {
      console.error('Erro ao gerar sugestões de prompts:', error);
      toast({
        title: "Erro ao gerar sugestões",
        description: "Ocorreu um problema ao gerar as sugestões de prompts. Por favor, tente novamente.",
        duration: 3000,
      });
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  // Função para melhorar o prompt com IA
  const improvePrompt = async () => {
    if (!inputMessage.trim()) return;

    setPromptImprovementLoading(true);
    setIsImprovingPrompt(true);

    try {
      // Chamar a API para melhorar o prompt
      const improvedPromptText = await generateAIResponse(
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

  // Função para enviar mensagem
  const sendMessage = async () => {
    if (inputMessage.trim() === "" && selectedFiles.length === 0) return;

    // Resetar o estado de pausa quando uma nova mensagem é enviada
    setIsResponsePaused(false);

    // Se estiver editando uma mensagem
    if (editingMessage) {
      // Atualizar a mensagem editada
      const updatedMessages = messages.map((msg) =>
        msg.id === editingMessage.id
          ? { ...msg, content: inputMessage, isEdited: true }
          : msg
      );

      setMessages(updatedMessages);
      setInputMessage("");
      setEditingMessage(null);
      setIsTyping(true);

      try {
        // Chamar a API para obter resposta atualizada à mensagem editada
        const aiResponse = await generateAIResponse(
          inputMessage,
          sessionId || 'default_session',
          {
            intelligenceLevel: aiIntelligenceLevel,
            languageStyle: aiLanguageStyle
          }
        );

        // Reproduzir som se estiver ativado
        if (soundEnabled) {
          console.log('Sound would play here if implemented');
        }

        // Efeito de digitação para mostrar a resposta gradualmente
        const messageId = Date.now();
        setMessages(prevMessages => [
          ...prevMessages,
          { 
            id: messageId, 
            content: '', 
            sender: 'assistant', 
            timestamp: new Date() 
          }
        ]);

        // Mostrar texto gradualmente como se estivesse sendo digitado
        let displayedContent = '';
        const words = aiResponse.split(' ');

        // Função para adicionar palavras gradualmente
        const addNextWord = async (index: number) => {
          try {
            // Importar o serviço de IA para verificar estado
            const aiService = await import('@/services/aiChatService');

            // Verificar se a resposta foi cancelada
            if (aiService.isResponseCancelled(sessionId || 'default_session')) {
              console.log('Resposta cancelada, parando geração');
              setIsTyping(false);
              return;
            }

            // Verificar se a resposta está pausada
            if (aiService.isResponsePaused(sessionId || 'default_session')) {
              console.log('Resposta pausada, verificando novamente em 500ms');
              // Se pausada, verifica novamente após 500ms, sem avançar o índice
              setTimeout(() => addNextWord(index), 500);
              return;
            }

            if (index < words.length) {
              displayedContent += (index === 0 ? '' : ' ') + words[index];

              setMessages(prevMessages => 
                prevMessages.map(msg => 
                  msg.id === messageId 
                    ? { ...msg, content: displayedContent } 
                    : msg
                )
              );

              // Velocidade variável da digitação baseada no tamanho da palavra
              const typingSpeed = Math.min(100, Math.max(30, 70 - words[index].length * 5));
              setTimeout(() => addNextWord(index + 1), typingSpeed);
            } else {
              setIsTyping(false);

              // Resetar o estado de pausa/cancelamento quando terminar
              aiService.resetResponseState(sessionId || 'default_session');
            }
          } catch (error) {
            console.error('Erro durante a geração de resposta:', error);
            setIsTyping(false);
          }
        };

        // Reset o estado de resposta antes de iniciar uma nova
        const prepareAndStartTyping = async () => {
          const aiService = await import('@/services/aiChatService');
          aiService.resetResponseState(sessionId || 'default_session');

          // Inicia o efeito de digitação após um pequeno delay
          setTimeout(() => addNextWord(0), 500);
        };

        prepareAndStartTyping();
      } catch (error) {
        console.error('Erro ao obter resposta para mensagem editada:', error);
        setMessages(prevMessages => [
          ...prevMessages,
          { 
            id: Date.now(), 
            content: 'Desculpe, estou enfrentando problemas no momento. Por favor, tente novamente mais tarde.', 
            sender: 'assistant', 
            timestamp: new Date() 
          }
        ]);
        setIsTyping(false);
      }
      return;
    }

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
        // Implementar função de som aqui
        console.log('Sound would play here if implemented');
      }

      // Criar ID único para a nova mensagem
      const messageId = Date.now();

      // Adicionar mensagem vazia inicialmente
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          id: messageId, 
          content: '', 
          sender: 'assistant', 
          timestamp: new Date() 
        }
      ]);

      // Mostrar texto gradualmente como se estivesse sendo digitado
      let displayedContent = '';
      const words = aiResponse.split(' ');

      // Função para adicionar palavras gradualmente
      const addNextWord = async(index: number) => {
        try {
          // Importar o serviço de IA para verificar estado
          const aiService = await import('@/services/aiChatService');

          // Verificar se a resposta foi cancelada
          if (aiService.isResponseCancelled(sessionId || 'default_session')) {
            console.log('Resposta cancelada, parando geração');
            setIsTyping(false);
            return;
          }

          // Verificar se a resposta está pausada
          if (aiService.isResponsePaused(sessionId || 'default_session')) {
            console.log('Resposta pausada, verificando novamente em 500ms');
            // Se pausada, verifica novamente após 500ms, sem avançar o índice
            setTimeout(() => addNextWord(index), 500);
            return;
          }

          if (index < words.length) {
            displayedContent += (index === 0 ? '' : ' ') + words[index];

            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === messageId 
                  ? { ...msg, content: displayedContent } 
                  : msg
              )
            );

            // Velocidade variável da digitação baseada no tamanho da palavra
            const typingSpeed = Math.min(100, Math.max(30, 70 - words[index].length * 5));
            setTimeout(() => addNextWord(index + 1), typingSpeed);
          } else {
            setIsTyping(false);

            // Resetar o estado de pausa/cancelamento quando terminar
            aiService.resetResponseState(sessionId || 'default_session');
          }
        } catch (error) {
          console.error('Erro durante a geração de resposta:', error);
          setIsTyping(false);
        }
      };

      // Reset o estado de resposta antes de iniciar uma nova
      const prepareAndStartTyping = async () => {
        const aiService = await import('@/services/aiChatService');
        aiService.resetResponseState(sessionId || 'default_session');

        // Inicia o efeito de digitação após um pequeno delay
        setTimeout(() => addNextWord(0), 500);
      };

      prepareAndStartTyping();

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

  // Função para carregar a imagem de perfil do usuário
  const loadUserProfileImage = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const userId = sessionData.session.user.id;
      
      // Consultar o perfil do usuário para obter a URL da imagem
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Erro ao buscar imagem de perfil:', profileError);
        return;
      }
      
      if (profileData?.avatar_url) {
        setProfileImageUrl(profileData.avatar_url);
      }
    } catch (error) {
      console.error('Erro ao carregar imagem de perfil:', error);
    }
  };

  // Função para upload da foto de perfil
  const handleProfileImageUpload = async () => {
    if (!tempProfileImage) return;

    try {
      setIsUploadingProfileImage(true);
      
      // Obter a sessão do usuário
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para fazer upload de imagens",
          variant: "destructive"
        });
        return;
      }

      const userId = sessionData.session.user.id;
      const fileExt = tempProfileImage.name.split('.').pop();
      const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Comprimir a imagem antes do upload
      let fileToUpload = tempProfileImage;
      if (tempProfileImage.size > 1000000) { // Se for maior que 1MB
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        const compressedFile = await new Promise<File>((resolve) => {
          img.onload = () => {
            // Calcular novo tamanho mantendo proporção
            const maxSize = 800;
            let width = img.width;
            let height = img.height;
            
            if (width > height && width > maxSize) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else if (height > maxSize) {
              width = (width / height) * maxSize;
              height = maxSize;
            }

            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
              if (blob) {
                const optimizedFile = new File([blob], tempProfileImage.name, { 
                  type: 'image/jpeg', 
                  lastModified: Date.now() 
                });
                resolve(optimizedFile);
              } else {
                resolve(tempProfileImage);
              }
            }, 'image/jpeg', 0.85);
          };
          img.onerror = () => resolve(tempProfileImage);
          
          img.src = URL.createObjectURL(tempProfileImage);
        });
        
        fileToUpload = compressedFile;
      }

      // Upload para o storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
      }

      // Obter a URL pública da imagem
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        throw new Error('Não foi possível obter a URL pública da imagem');
      }

      // Atualizar o perfil do usuário com a URL da imagem
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
      }

      // Atualizar o estado da imagem
      setProfileImageUrl(publicUrlData.publicUrl);
      
      // Disparar evento para outros componentes saberem que o avatar foi atualizado
      const avatarUpdateEvent = new CustomEvent('avatar-updated', {
        detail: { url: publicUrlData.publicUrl }
      });
      document.dispatchEvent(avatarUpdateEvent);

      toast({
        title: "Sucesso",
        description: "Foto de perfil atualizada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao fazer upload da foto de perfil:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao fazer upload da foto: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive"
      });
    } finally {
      setIsUploadingProfileImage(false);
      setTempProfileImage(null);
    }
  };

  // Função para iniciar gravação de áudio
  const startVoiceRecording = () => {
    setShowAttachmentOptions(false);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          // Criar uma instância do MediaRecorder com o stream de áudio
          const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
          setAudioRecorder(recorder);
          setAudioChunks([]);

          // Coletar chunks de dados do áudio gravado
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              setAudioChunks(prev => [...prev, e.data]);
            }
          };

          // Quando a gravação parar
          recorder.onstop = () => {
            // Criar um blob com todos os chunks de áudio
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);

            // Mostrar notificação de sucesso
            toast({
              title: "Áudio gravado com sucesso",
              description: "Seu áudio foi processado e enviado.",
              duration: 3000,
            });

            // Adicionar mensagem com áudio
            const newMessage: ChatMessage = {
              id: Date.now(),
              content: "Mensagem de áudio enviada",
              sender: "user",
              timestamp: new Date(),
              files: [{name: 'audio.webm', size: audioBlob.size, type: 'audio/webm', url: audioUrl}]
            };

            setMessages((prev) => [...prev, newMessage]);
            setIsLoading(true);

            // Gerar resposta da IA
            import('@/services/aiChatService').then(aiService => {
              setIsTyping(true);
              aiService.generateAIResponse("Analisando áudio enviado pelo usuário", sessionId)
                .then(response => {
                  const aiMessage: ChatMessage = {
                    id: Date.now() + 1,
                    content: response || "Recebi seu áudio e analisei o conteúdo. Como posso ajudar com sua solicitação?",
                    sender: "assistant",
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, aiMessage]);
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
                  setIsTyping(false);
                });
            });

            // Parar todos os tracks da stream
            stream.getTracks().forEach(track => track.stop());
          };

          // Configurar para capturar dados a cada 1 segundo
          recorder.start(1000);
          setIsRecordingAudio(true);
          
          // Mostrar notificação de gravação iniciada
          toast({
            title: "Gravação de áudio iniciada",
            description: "Fale sua mensagem e clique em parar quando terminar.",
            duration: 3000,
          });
        })
        .catch(err => {
          console.error("Erro ao acessar microfone:", err);
          toast({
            title: "Erro ao acessar microfone",
            description: "Verifique se você concedeu permissão de acesso ao microfone.",
            variant: "destructive",
            duration: 5000,
          });
        });
    } else {
      toast({
        title: "Navegador incompatível",
        description: "Seu navegador não suporta gravação de áudio. Por favor, use um navegador mais recente.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Função para parar gravação de áudio
  const stopVoiceRecording = () => {
    if (audioRecorder && audioRecorder.state !== 'inactive') {
      try {
        // Parar a gravação
        audioRecorder.stop();
        // Atualizar o estado
        setIsRecordingAudio(false);
        
        // Mostrar indicador visual de processamento
        toast({
          title: "Processando áudio",
          description: "Aguarde enquanto processamos sua mensagem de áudio...",
          duration: 2000,
        });
      } catch (error) {
        console.error("Erro ao parar a gravação:", error);
        toast({
          title: "Erro ao finalizar gravação",
          description: "Ocorreu um problema ao finalizar a gravação de áudio.",
          variant: "destructive",
          duration: 3000,
        });
        
        // Tentar limpar recursos mesmo em caso de erro
        if (audioRecorder) {
          try {
            audioRecorder.stream?.getTracks().forEach(track => track.stop());
          } catch (e) {
            console.error("Erro ao limpar tracks de áudio:", e);
          }
        }
        setIsRecordingAudio(false);
      }
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
            E AÍ, {epictusNickname.split(/[_\s]/)[0].toUpperCase()} 👋
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
                  },100);
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
        className="flex-1 p-4 custom-scrollbar overflow-y-auto relative"
        style={{ maxHeight: "calc(100% - 90px)" }}
      >
        {/* Botão flutuante para voltar ao fim da conversa */}
        {showScrollToBottom && (
          <div 
            className="absolute bottom-6 right-6 z-50 animate-fadeIn"
            onClick={scrollToBottom}
          >
            <Button 
              size="icon"
              className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white shadow-lg hover:scale-105 transition-all duration-300"
            >
              <ChevronRight className="h-5 w-5 rotate-90" />
            </Button>
          </div>
        )}
        
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex animate-fadeIn ${message.sender === "user" ? "justify-end" : "justify-start"} group`}
            >
              {message.sender === "assistant" && (
                <div className="w-10 h-10 rounded-full overflow-hidden mr-2 flex-shrink-0">
                  <Avatar>
                    <AvatarImage src="/images/tempo-image-20250329T044440497Z.png" alt="Assistente de Suporte" />
                    <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white">
                      <LifeBuoy className="h-5 w-5" />
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
                    : message.needsImprovement 
                      ? "bg-gray-100/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 line-through" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                }`}
              >
                <div 
                  className="message-content whitespace-pre-wrap prose prose-headings:mb-2 prose-headings:mt-3 prose-p:my-1.5 prose-blockquote:my-2" 
                  dangerouslySetInnerHTML={{ 
                    __html: message.content
                      // Headers
                      .replace(/^# (.*?)$/gm, '<h1 class="text-xl font-bold text-gray-900 dark:text-gray-100 border-b pb-1 border-gray-200 dark:border-gray-700">$1</h1>')
                      .replace(/^## (.*?)$/gm, '<h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-3">$1</h2>')
                      .replace(/^### (.*?)$/gm, '<h3 class="text-base font-medium text-gray-800 dark:text-gray-200">$1</h3>')

                      // Text formatting
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
                      .replace(/\_(.*?)\_/g, '<em class="text-gray-700 dark:text-gray-300 italic">$1</em>')
                      .replace(/\~\~(.*?)\~\~/g, '<del class="text-gray-500 dark:text-gray-400">$1</del>')
                      .replace(/\`(.*?)\`/g, '<code class="bg-gray-100 dark:bg-gray-800 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')

                      // Lists
                      .replace(/^- (.*?)$/gm, '<ul class="list-disc pl-5 my-2"><li>$1</li></ul>').replace(/<\/ul>\s?<ul class="list-disc pl-5 my-2">/g, '')
                      .replace(/^[0-9]+\. (.*?)$/gm, '<ol class="list-decimal pl-5 my-2"><li>$1</li></ol>').replace(/<\/ol>\s?<ol class="list-decimal pl-5 my-2">/g, '')

                      // Blockquotes
                      .replace(/^> (.*?)$/gm, '<blockquote class="pl-3 border-l-4 border-orange-400 dark:border-orange-600 italic bg-orange-50 dark:bg-orange-900/20 py-1 px-2 rounded-r my-2 text-gray-700 dark:text-gray-300">$1</blockquote>')

                      // Separators
                      .replace(/^---$/gm, '<hr class="border-t border-gray-200 dark:border-gray-700 my-3" />')

                      // Line breaks
                      .replace(/\n/g, '<br />')

                      // Links
                      .replace(/\[(.*?)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-0.5">$1<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-0.5"><path d="M18 13v6a2 `1-2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>')

                      // URLs in parentheses
                      .replace(/(?<!\]|\()\((https?:\/\/[^\s)]+)\)/g, '(<a href="$1" target="_blank" rel="noopener noreferrer" class="text-orange-600 dark:text-orange-400 hover:underline">$1</a>)')

                      // Plain URLs
                      .replace(/(?<!\]|\()(?<!\(\s*)(https?:\/\/[^\s)]+)/g, '$1')
                  }} 
                />
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
                        <div className="overflow-hidden text-sm flex-1">
                          {file.type.startsWith('audio/') ? (
                            <div className="w-full">
                              <div className="mb-1 flex justify-between">
                                <span className={`font-medium ${message.sender === "user" ? "text-white" : "text-blue-500"}`}>
                                  Mensagem de áudio
                                </span>
                                <span className="text-xs opacity-70">
                                  {(file.size / 1024).toFixed(1)} KB
                                </span>
                              </div>
                              <audio 
                                src={file.url} 
                                controls 
                                className="w-full h-8 rounded-lg"
                                preload="metadata"
                              />
                            </div>
                          ) : (
                            <>
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
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {message.sender === "user" && (
                  <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1 p-1">
                    <button 
                      className="text-gray-400 hover:text-orange-500 dark:text-gray-500 dark:hover:text-orange-400 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => {
                        setEditingMessage(message);
                        setInputMessage(message.content);
                      }}
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
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs opacity-80 flex items-center gap-1">
                    <span className={message.sender === "user" ? "bg-white/20 px-1.5 py-0.5 rounded-sm" : ""}>
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {message.isEdited && (
                        <span className="text-xs opacity-70 ml-1">(editado)</span>
                      )}
                    </span>
                  </div>

                  {/* Feedback buttons for AI messages */}
                  {message.sender === "assistant" && !message.needsImprovement && (
                    <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          // Editar mensagem
                          setEditingMessage(message);
                          setInputMessage(message.content);
                        }}
                        className="p-1 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Editar mensagem"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                      <button 
                        onClick={() => {
                          // Compartilhar mensagem
                          if (navigator.share) {
                            navigator.share({
                              title: 'Compartilhar mensagem do Suporte Ponto.School',
                              text: message.content,
                            }).catch(error => {
                              console.error('Erro ao compartilhar:', error);
                              toast({
                                title: "Erro ao compartilhar",
                                description: "Não foi possível compartilhar esta mensagem",
                                duration: 3000,
                              });
                            });
                          } else {
                            navigator.clipboard.writeText(message.content);
                            toast({
                              title: "Copiado para compartilhar!",
                              description: "O conteúdo foi copiado para a área de transferência",
                              duration: 3000,
                            });
                          }
                        }}
                        className="p-1 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Compartilhar mensagem"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400">
                          <circle cx="18" cy="5" r="3"></circle>
                          <circle cx="6" cy="12" r="3"></circle>
                          <circle cx="18" cy="19" r="3"></circle>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                      </button>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(message.content);
                          toast({
                            title: "Mensagem copiada!",
                            description: "O conteúdo foi copiado para a área de transferência",
                            duration: 3000,
                          });
                        }}
                        className="p-1 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Copiar mensagem"
                      >
                        <Copy className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button 
                        onClick={() => handleMessageFeedback(message.id, 'positive')}
                        className={`p-1 rounded-full transition-colors ${message.feedback === 'positive' ? 'bg-green-100 dark:bg-green-900/30' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        title="Avaliar como boa resposta"
                      >
                        <ThumbsUp className={`h-3.5 w-3.5 ${message.feedback === 'positive' ? 'text-green-500 dark:text-green-400' : 'text-green-500 dark:text-green-400'}`} />
                      </button>
                      <button 
                        onClick={() => handleMessageFeedback(message.id, 'negative')}
                        className={`p-1 rounded-full transition-colors ${message.feedback === 'negative' ? 'bg-red-100 dark:bg-red-900/30' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        title="Avaliar como resposta que precisa melhorar"
                      >
                        <ThumbsDown className={`h-3.5 w-3.5 ${message.feedback === 'negative' ? 'text-red-600 dark:text-red-400' : 'text-red-500 dark:text-red-400'}`} />
                      </button>
                    </div>
                  )}

                  {/* Improvement options when negative feedback is given */}
                  {message.sender === "assistant" && message.feedback === 'negative' && (
                    <div className="mt-2 flex flex-col gap-2 w-full animate-fadeIn">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Como podemos melhorar esta resposta?</div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs py-1 px-2 h-auto border-orange-200 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-1"
                          onClick={() => reformulateMessage(message.id)}
                          disabled={isReformulating}
                        >
                          {isReformulating ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Reformulando...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3" />
                              <span>Reformular (mais detalhado)</span>
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs py-1 px-2 h-auto border-orange-200 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-1"
                          onClick={() => summarizeMessage(message.id)}
                          disabled={isReformulating}
                        >
                          <FileText className="h-3 w-3" />
                          <span>Resumir (mais direto)</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {message.sender === "user" && (
                <div className="w-8 h-8 rounded-full overflow-hidden ml-2 flex-shrink-0">
                  <Avatar>
                    <AvatarImage src={profileImageUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=John"} />
                    <AvatarFallback>{userName ? userName.substring(0, 2).toUpperCase() : "US"}</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          ))}
          {/* Mostra o componente de digitação quando está digitando ou pausado */}
          {(isTyping || isResponsePaused) && (
            <div className="flex justify-start animate-fadeIn">
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
              <div className="max-w-[75%] rounded-lg px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-md">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <span className="text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded-full">
                      Assistente IA
                    </span>
                  </div>
                  <div className="text-xs opacity-70">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="relative min-h-[40px] flex flex-col">
                  <div className="flex items-center">
                    {!isResponsePaused ? (
                      <>
                        <div className="flex space-x-1 mr-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-150"></div>
                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-300"></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Formulando resposta...</span>
                      </>
                    ) : (
                      <span className="text-sm text-orange-500 dark:text-orange-400 font-medium">Resposta pausada</span>
                    )}
                  </div>

                  <div className="flex items-center mt-2 justify-start gap-2">
                    <button 
                      onClick={async () => {
                        try {
                          // Importar e chamar a função para cancelar a resposta da IA
                          const aiService = await import('@/services/aiChatService');
                          if (typeof aiService.cancelResponse === 'function') {
                            await aiService.cancelResponse(sessionId || 'default_session');
                          }
                          
                          // Atualizar UI
                          setIsTyping(false);
                          setIsResponsePaused(false); // Resetar o estado de pausa
                          
                          // Remover a mensagem incompleta da IA que está sendo gerada
                          setMessages(prevMessages => {
                            // Filtramos para remover a última mensagem da IA (a que está sendo gerada)
                            // mas mantemos todas as outras mensagens
                            const lastAIMessageIndex = [...prevMessages].reverse().findIndex(
                              msg => msg.sender === 'assistant' && msg.content === ''
                            );
                            
                            if (lastAIMessageIndex !== -1) {
                              const actualIndex = prevMessages.length - 1 - lastAIMessageIndex;
                              return prevMessages.filter((_, i) => i !== actualIndex);
                            }
                            
                            return prevMessages;
                          });
                        } catch (error) {
                          console.error('Erro ao cancelar resposta da IA:', error);
                          // Mesmo em caso de erro, atualizar UI
                          setIsTyping(false);
                        }
                      }}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 dark:bg-gray-700/40 dark:hover:bg-gray-700/60 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 transform hover:scale-105 shadow-sm backdrop-blur-sm"
                    >
                      Cancelar
                    </button>

                    {/* Usa o estado local para verificar se a resposta está pausada */}
                    {isResponsePaused ? (
                      <button 
                        onClick={async () => {
                          // Importar e chamar a função para retomar a resposta da IA
                          try {
                            const aiService = await import('@/services/aiChatService');
                            if (typeof aiService.resumeResponse === 'function') {
                              await aiService.resumeResponse(sessionId || 'default_session');
                            }
                            // Atualizar estados para indicar que voltou a digitar
                            setIsResponsePaused(false);
                            setIsTyping(true);
                          } catch (error) {
                            console.error('Erro ao retomar resposta da IA:', error);
                          }
                        }}
                        className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 dark:bg-green-700/40 dark:hover:bg-green-700/60 rounded-full text-xs font-medium text-green-700 dark:text-green-300 transition-all duration-200 transform hover:scale-105 shadow-sm backdrop-blur-sm"
                      >
                        Retomar
                      </button>
                    ) : (
                      <button 
                        onClick={async () => {
                          // Importar e chamar a função para pausar a resposta da IA
                          try {
                            const aiService = await import('@/services/aiChatService');
                            if (typeof aiService.pauseResponse === 'function') {
                              await aiService.pauseResponse(sessionId || 'default_session');
                            }
                            // Definir o estado de pausa como verdadeiro, mas manter isTyping true
                            // para preservar o componente de resposta visível
                            setIsResponsePaused(true);
                          } catch (error) {
                            console.error('Erro ao pausar resposta da IA:', error);
                          }
                        }}
                        className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 dark:bg-orange-700/40 dark:hover:bg-orange-700/60 rounded-full text-xs font-medium text-orange-700 dark:text-orange-300 transition-all duration-200 transform hover:scale-105 shadow-sm backdrop-blur-sm"
                      >
                        Pausar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* AI Settings Popover */}
      {isShowingAISettings && (
        <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-xl w-[85%] max-w-sm animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-orange-500" />
              Configurações da IA
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                setIsShowingAISettings(false);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Nível de Inteligência</label>
              <div className="grid grid-cols-3 gap-2">
                {['basic', 'normal', 'advanced'].map((level) => (
                  <div 
                    key={level}
                    className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all ${
                      aiIntelligenceLevel === level 
                        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-400" 
                        : "bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/10"
                    }`}
                    onClick={() => setAIIntelligenceLevel(level as 'basic' | 'normal' | 'advanced')}
                  >
                    <span className="text-xs font-medium">
                      {level === 'basic' ? 'Básico' : level === 'normal' ? 'Normal' : 'Avançado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Estilo de Linguagem</label>
              <div className="grid grid-cols-3 gap-2">
                {['casual', 'formal', 'technical'].map((style) => (
                  <div 
                    key={style}
                    className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all ${
                      aiLanguageStyle === style 
                        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-400" 
                        : "bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/10"
                    }`}
                    onClick={() => setAILanguageStyle(style as 'casual' | 'formal' | 'technical')}
                  >
                    <span className="text-xs font-medium">
                      {style === 'casual' ? 'Casual' : style === 'formal' ? 'Formal' : 'Técnico'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Sons de Notificação</label>
              <div 
                className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all ${
                  enableNotificationSounds 
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-400" 
                    : "bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/10"
                }`}
                onClick={() => setEnableNotificationSounds(!enableNotificationSounds)}
              >
                <div className="flex items-center justify-center w-full">
                  {enableNotificationSounds ? (
                    <Headphones className="h-4 w-4 mr-2" />
                  ) : (
                    <Bell className="h-4 w-4 mr-2" />
                  )}
                  <span className="text-xs font-medium">{enableNotificationSounds ? 'Sons ativados' : 'Sons desativados'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Personalização do Epictus IA */}
      {showEpictusPersonalizeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setShowEpictusPersonalizeModal(false)}></div>
          <div className="relative bg-gradient-to-br from-white/90 to-gray-50/80 dark:from-gray-900/90 dark:to-gray-950/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-4 shadow-2xl w-[85%] max-w-md max-h-[480px] animate-fadeIn flex flex-col">
            {/* Elementos decorativos de fundo */}
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="absolute right-1/4 bottom-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
            
            {/* Header com design futurista */}
            <div className="flex justify-between items-center mb-4 relative z-10 sticky top-0 bg-gradient-to-b from-white/80 to-transparent dark:from-gray-900/80 dark:to-transparent pb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 shadow-lg shadow-orange-500/20">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-300">
                    Personalizar Epictus IA
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Configure sua experiência personalizada</p>
                </div>
              </div>
              <Button 
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-0 rounded-full bg-white/30 dark:bg-gray-800/30 backdrop-blur-md hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                onClick={() => setShowEpictusPersonalizeModal(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Conteúdo principal */}
            <ScrollArea className="h-[350px] pr-2 relative z-10">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gradient p-1 bg-white dark:bg-gray-800">
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <Avatar className="w-full h-full">
                        <AvatarImage 
                          src={profileImageUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&mouth=smile&eyes=happy"}
                          alt="Avatar Epictus IA"
                          className="w-full h-full object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white">
                          IA
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0">
                    <input 
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={profileImageInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setTempProfileImage(e.target.files[0]);
                        }
                      }}
                    />
                    <div 
                      className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => profileImageInputRef.current?.click()}
                    >
                      <Edit className="h-4 w-4 text-orange-500" />
                    </div>
                  </div>
                </div>
                
                {tempProfileImage && (
                  <div className="mb-3 w-full flex justify-center">
                    <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/20 p-2 rounded-lg">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img 
                          src={URL.createObjectURL(tempProfileImage)} 
                          alt="Nova imagem" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate" style={{ maxWidth: "120px" }}>
                          {tempProfileImage.name}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {(tempProfileImage.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                          onClick={() => setTempProfileImage(null)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full"
                          onClick={handleProfileImageUpload}
                          disabled={isUploadingProfileImage}
                        >
                          {isUploadingProfileImage ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">Epictus IA</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                  Seu assistente de suporte inteligente, personalizado para atender às suas necessidades.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white/70 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100/80 dark:border-gray-700/30 backdrop-filter backdrop-blur-sm shadow-sm">
                  <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-orange-500" />
                    Como o Epictus IA deveria chamar você?
                  </h5>
                  
                  <div className="space-y-3">
                    <Input
                      value={tempNickname || epictusNickname}
                      onChange={(e) => setTempNickname(e.target.value)}
                      placeholder="Digite seu nome ou apelido preferido"
                      className="bg-white/80 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus-visible:ring-orange-500"
                    />
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                      Este nome será usado pelo Epictus IA para se referir a você durante as conversas.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/70 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100/80 dark:border-gray-700/30 backdrop-filter backdrop-blur-sm shadow-sm">
                  <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-orange-500" />
                    O que você faz?
                  </h5>
                  
                  <div className="space-y-3">
                    <textarea
                      value={tempOccupation || userOccupation}
                      onChange={(e) => setTempOccupation(e.target.value)}
                      placeholder="Ex: Estudante de engenharia, Professor, Profissional de Marketing..."
                      className="w-full h-20 px-3 py-2 bg-white/80 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-sm resize-none"
                    />
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                      Isso ajuda a IA a adaptar as respostas ao seu contexto pessoal ou profissional, tornando as informações mais relevantes para você.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/70 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100/80 dark:border-gray-700/30 backdrop-filter backdrop-blur-sm shadow-sm">
                  <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-orange-500" />
                    Personalidade do Epictus IA
                  </h5>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/30 p-3 rounded-lg cursor-pointer hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Amigável</span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Conversação casual e acolhedora</p>
                    </div>
                    
                    <div className="border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/30 p-3 rounded-lg cursor-pointer hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <BookOpen className="h-3 w-3 text-blue-500" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Técnico</span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Comunicação formal e detalhada</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/70 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100/80 dark:border-gray-700/30 backdrop-filter backdrop-blur-sm shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Bell className="h-4 w-4 text-orange-500" />
                      Notificações
                    </h5>
                    <Switch />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Receba lembretes e sugestões personalizados do Epictus IA.
                  </p>
                </div>
              </div>
            </ScrollArea>
            
            {/* Botões de ação */}
            <div className="flex justify-end items-center gap-2 mt-3 pb-1 relative z-10">
              <Button
                variant="outline" 
                size="sm"
                className="px-3 py-1 h-8 text-xs bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-white/20 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-300 rounded-lg"
                onClick={() => setShowEpictusPersonalizeModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                size="sm"
                className="px-3 py-1 h-8 text-xs bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border-none shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 rounded-lg"
                onClick={async () => {
                  try {
                    let hasChanges = false;
                    let confirmationMessage = "Perfeito! ";

                    // Primeiro, vamos salvar a imagem de perfil se houver uma temporária
                    if (tempProfileImage) {
                      await handleProfileImageUpload();
                      confirmationMessage += "Sua imagem de perfil foi atualizada. ";
                      hasChanges = true;
                    }

                    // Atualiza o nickname se foi alterado
                    if (tempNickname.trim()) {
                      setEpictusNickname(tempNickname.trim());
                      setTempNickname("");
                      confirmationMessage += `A partir de agora vou te chamar de ${tempNickname.trim() || epictusNickname}. `;
                      hasChanges = true;
                      
                      // Atualizar o nickname no banco de dados, se possível
                      try {
                        const { data: sessionData } = await supabase.auth.getSession();
                        if (sessionData.session) {
                          await supabase
                            .from('profiles')
                            .update({ 
                              display_name: tempNickname.trim(),
                              updated_at: new Date().toISOString()
                            })
                            .eq('id', sessionData.session.user.id);
                        }
                      } catch (error) {
                        console.error('Erro ao atualizar nickname no perfil:', error);
                      }
                    }
                    
                    // Atualiza a ocupação se foi alterada
                    if (tempOccupation.trim()) {
                      setUserOccupation(tempOccupation.trim());
                      setTempOccupation("");
                      confirmationMessage += `Entendi que você ${tempOccupation.trim()} e vou adaptar minhas respostas ao seu contexto. `;
                      hasChanges = true;
                      
                      // Atualizar a ocupação no banco de dados, se possível
                      try {
                        const { data: sessionData } = await supabase.auth.getSession();
                        if (sessionData.session) {
                          await supabase
                            .from('profiles')
                            .update({ 
                              bio: tempOccupation.trim(),
                              updated_at: new Date().toISOString()
                            })
                            .eq('id', sessionData.session.user.id);
                        }
                      } catch (error) {
                        console.error('Erro ao atualizar ocupação no perfil:', error);
                      }
                    }
                    
                    if (!hasChanges) {
                      confirmationMessage = "Suas configurações foram mantidas. ";
                    }
                    
                    confirmationMessage += "Como posso te ajudar hoje?";
                    
                    setShowEpictusPersonalizeModal(false);
                    
                    // Adiciona uma mensagem de confirmação ao chat
                    setMessages(prevMessages => [
                      ...prevMessages, 
                      {
                        id: Date.now(),
                        content: confirmationMessage,
                        sender: "assistant",
                        timestamp: new Date()
                      }
                    ]);
                    
                    // Notificação visual
                    toast({
                      title: "Personalização salva",
                      description: "Suas preferências foram atualizadas com sucesso.",
                      duration: 3000,
                    });
                  } catch (error) {
                    console.error('Erro ao salvar preferências:', error);
                    toast({
                      title: "Erro",
                      description: "Ocorreu um erro ao salvar suas preferências. Por favor, tente novamente.",
                      variant: "destructive",
                      duration: 3000,
                    });
                  }
                }}
              >
                Salvar preferências
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal do Agente IA */}
      {showAgentModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setShowAgentModal(false)}></div>
          <div className="relative bg-gradient-to-br from-white/90 to-gray-50/80 dark:from-gray-900/90 dark:to-gray-950/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-4 shadow-2xl w-[85%] max-w-md max-h-[480px] animate-fadeIn flex flex-col">
            {/* Elementos decorativos de fundo */}
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="absolute right-1/4 bottom-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
            
            {/* Header com design futurista */}
            <div className="flex justify-between items-center mb-4 relative z-10 sticky top-0 bg-gradient-to-b from-white/80 to-transparent dark:from-gray-900/80 dark:to-transparent pb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 shadow-lg shadow-blue-500/20">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    Agente IA
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Powered by advanced AI</p>
                </div>
              </div>
              <Button 
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-0 rounded-full bg-white/30 dark:bg-gray-800/30 backdrop-blur-md hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                onClick={() => setShowAgentModal(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Conteúdo com barra de rolagem */}
            <ScrollArea className="h-[350px] pr-2 relative z-10">
              <div className="flex items-center justify-between p-3 mb-3 rounded-xl bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 backdrop-filter backdrop-blur-sm shadow-sm">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-0.5">Ativar Agente IA</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Assistência automática inteligente</span>
                </div>
                <Switch 
                  checked={agentIAEnabled} 
                  onCheckedChange={setAgentIAEnabled}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-indigo-600 scale-90"
                />
              </div>
              
              <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50/70 to-white/70 dark:from-gray-800/30 dark:to-gray-900/30 border border-gray-100/80 dark:border-gray-700/30 backdrop-filter backdrop-blur-sm shadow-sm mb-3">
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  O Agente IA utiliza tecnologia avançada para auxiliar proativamente em tarefas complexas, aprendendo com suas interações para oferecer suporte personalizado.
                </p>
              </div>
              
              <div className="space-y-3 relative z-10">
                <h5 className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Settings className="h-2.5 w-2.5 text-white" />
                  </div>
                  Capacidades do Agente IA
                </h5>
                
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center p-2 rounded-lg bg-white/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/40 backdrop-filter backdrop-blur-sm transition-all hover:shadow-md hover:bg-white dark:hover:bg-gray-800/60">
                    <Checkbox 
                      id="adjust-settings" 
                      checked={agentSettings.adjustSettings}
                      onCheckedChange={(checked) => 
                        setAgentSettings(prev => ({...prev, adjustSettings: !!checked}))}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mr-2 h-3.5 w-3.5"
                    />
                    <label 
                      htmlFor="adjust-settings" 
                      className="flex flex-col flex-1 cursor-pointer"
                    >
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-200">Configurações do usuário</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">Ajusta suas preferências automaticamente</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center p-2 rounded-lg bg-white/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/40 backdrop-filter backdrop-blur-sm transition-all hover:shadow-md hover:bg-white dark:hover:bg-gray-800/60">
                    <Checkbox 
                      id="access-pages" 
                      checked={agentSettings.accessPages}
                      onCheckedChange={(checked) => 
                        setAgentSettings(prev => ({...prev, accessPages: !!checked}))}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mr-2 h-3.5 w-3.5"
                    />
                    <label 
                      htmlFor="access-pages" 
                      className="flex flex-col flex-1 cursor-pointer"
                    >
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-200">Navegação assistida</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">Acessa seções e páginas da plataforma</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center p-2 rounded-lg bg-white/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/40 backdrop-filter backdrop-blur-sm transition-all hover:shadow-md hover:bg-white dark:hover:bg-gray-800/60">
                    <Checkbox 
                      id="respond-messages" 
                      checked={agentSettings.respondMessages}
                      onCheckedChange={(checked) => 
                        setAgentSettings(prev => ({...prev, respondMessages: !!checked}))}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mr-2 h-3.5 w-3.5"
                    />
                    <label 
                      htmlFor="respond-messages" 
                      className="flex flex-col flex-1 cursor-pointer"
                    >
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-200">Comunicação autônoma</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">Responde notificações e mensagens</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center p-2 rounded-lg bg-white/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/40 backdrop-filter backdrop-blur-sm transition-all hover:shadow-md hover:bg-white dark:hover:bg-gray-800/60">
                    <Checkbox 
                      id="make-transfers" 
                      checked={agentSettings.makeTransfers}
                      onCheckedChange={(checked) => 
                        setAgentSettings(prev => ({...prev, makeTransfers: !!checked}))}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mr-2 h-3.5 w-3.5"
                    />
                    <label 
                      htmlFor="make-transfers" 
                      className="flex flex-col flex-1 cursor-pointer"
                    >
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-200">Transações financeiras</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">Realiza transferências e recargas</span>
                    </label>
                  </div>
                </div>
              </div>
            </ScrollArea>
            
            {/* Botões de ação com aparência mais moderna */}
            <div className="flex justify-end items-center gap-2 mt-3 pb-1 relative z-10">
              <Button
                variant="outline" 
                size="sm"
                className="px-3 py-1 h-8 text-xs bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-white/20 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-300 rounded-lg"
                onClick={() => setShowAgentModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                size="sm"
                className="px-3 py-1 h-8 text-xs bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white border-none shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 rounded-lg"
                onClick={() => {
                  setShowAgentModal(false);
                  
                  if (agentIAEnabled) {
                    // Adiciona uma mensagem de confirmação ao chat
                    setMessages(prevMessages => [
                      ...prevMessages, 
                      {
                        id: Date.now(),
                        content: "Agente IA ativado com sucesso! Como posso ajudar você hoje?",
                        sender: "assistant",
                        timestamp: new Date()
                      }
                    ]);
                    
                    // Notificação visual
                    toast({
                      title: "Agente IA ativado",
                      description: `O Agente IA agora está ativo e pronto para auxiliar você ${agentSettings.accessPages ? 'com navegação na plataforma' : ''} ${agentSettings.respondMessages ? 'e responder a mensagens' : ''}.`,
                      duration: 3000,
                    });
                  }
                }}
              >
                Salvar configurações
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Busca Profunda */}
      {showSearchModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setShowSearchModal(false)}></div>
          
          {/* Modal principal com efeitos glassmorphism avançados - versão menor */}
          <div className="relative bg-gradient-to-br from-white/90 to-gray-50/80 dark:from-gray-900/90 dark:to-gray-950/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-4 shadow-2xl w-[85%] max-w-md max-h-[500px] animate-fadeIn">
            {/* Elementos decorativos de fundo */}
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute right-1/4 bottom-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>
            
            {/* Header com design futurista */}
            <div className="flex justify-between items-center mb-4 relative z-10 sticky top-0 bg-gradient-to-b from-white/80 to-transparent dark:from-gray-900/80 dark:to-transparent pb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 shadow-lg shadow-blue-500/20">
                  <Search className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    DeepSearch™
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Powered by advanced AI</p>
                </div>
              </div>
              <Button 
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-0 rounded-full bg-white/30 dark:bg-gray-800/30 backdrop-blur-md hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                onClick={() => setShowSearchModal(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Conteúdo com barra de rolagem */}
            <ScrollArea className="h-[400px] pr-2 relative z-10">
              {/* Campo de pesquisa com UI aprimorada */}
              <div className="mb-4 relative z-10">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-blue-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <Input 
                    placeholder="O que você deseja pesquisar?"
                    className="pl-9 pr-3 h-9 bg-white/70 dark:bg-gray-800/50 backdrop-blur-md border-white/20 dark:border-gray-700/50 rounded-lg text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/50 shadow-sm text-sm"
                  />
                </div>
              </div>
              
              {/* Seletor de fontes com design mais moderno */}
              <div className="space-y-3 relative z-10">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-indigo-700 rounded-full"></div>
                  <span>Fontes de Pesquisa</span>
                </div>
                
                {/* Web Global - Card mais avançado */}
                <div className="group relative overflow-hidden p-3 bg-gradient-to-br from-white/80 to-blue-50/50 dark:from-gray-800/40 dark:to-blue-900/20 backdrop-blur-md rounded-lg border border-blue-100/60 dark:border-blue-900/30 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300">
                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-blue-500/5 rounded-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">Web Global</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Resultados da internet mundial</div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Switch 
                        checked={globalSearchEnabled}
                        onCheckedChange={(checked) => {
                          setGlobalSearchEnabled(!!checked);
                          if (checked) {
                            toast({
                              title: "Web Global ativada",
                              description: "Suas pesquisas agora incluirão resultados da internet global",
                              duration: 3000,
                            });
                          }
                        }}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700 scale-75"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Acadêmico - Card mais avançado */}
                <div className="group relative overflow-hidden p-3 bg-gradient-to-br from-white/80 to-purple-50/50 dark:from-gray-800/40 dark:to-purple-900/20 backdrop-blur-md rounded-lg border border-purple-100/60 dark:border-purple-900/30 hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300">
                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-purple-500/5 rounded-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">Acadêmico</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Artigos científicos e pesquisas</div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Switch 
                        checked={academicSearchEnabled}
                        onCheckedChange={(checked) => {
                          setAcademicSearchEnabled(!!checked);
                          if (checked) {
                            toast({
                              title: "Busca acadêmica ativada",
                              description: "Suas pesquisas agora incluirão artigos e fóruns acadêmicos",
                              duration: 3000,
                            });
                          }
                        }}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-purple-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700 scale-75"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Social - Card mais avançado */}
                <div className="group relative overflow-hidden p-3 bg-gradient-to-br from-white/80 to-green-50/50 dark:from-gray-800/40 dark:to-green-900/20 backdrop-blur-md rounded-lg border border-green-100/60 dark:border-green-900/30 hover:shadow-md hover:shadow-green-500/5 transition-all duration-300">
                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-green-500/5 rounded-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-md shadow-green-500/20">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">Social</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Discussões e opiniões da comunidade</div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Switch 
                        checked={socialSearchEnabled}
                        onCheckedChange={(checked) => {
                          setSocialSearchEnabled(!!checked);
                          if (checked) {
                            toast({
                              title: "Busca social ativada",
                              description: "Suas pesquisas agora incluirão discussões e opiniões de redes sociais",
                              duration: 3000,
                            });
                          }
                        }}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-green-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700 scale-75"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Profundidade da Busca com um slider visual */}
                <div className="mt-3 p-3 bg-white/50 dark:bg-gray-800/30 backdrop-blur-md rounded-lg border border-gray-100/60 dark:border-gray-700/30 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Profundidade da Busca</span>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-medium">
                      {deepSearchEnabled ? "Avançada" : "Padrão"}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-500">Padrão</span>
                    <Switch 
                      checked={deepSearchEnabled}
                      onCheckedChange={(checked) => {
                        setDeepSearchEnabled(!!checked);
                      }}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-orange-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700 scale-75"
                    />
                    <span className="text-[10px] text-gray-500">Profunda</span>
                  </div>
                  
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 italic">
                    A busca profunda analisa fontes extensas e realiza conexões complexas entre diferentes conteúdos.
                  </p>
                </div>
                
                {/* Botões de ação com aparência mais moderna */}
                <div className="flex justify-end items-center gap-2 mt-5 relative z-10">
                  <Button
                    variant="outline" 
                    size="sm"
                    className="px-3 py-1 h-8 text-xs bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-white/20 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-300 rounded-lg"
                    onClick={() => setShowSearchModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    size="sm"
                    className="px-3 py-1 h-8 text-xs bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white border-none shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 rounded-lg"
                    onClick={() => {
                      setShowSearchModal(false);
                      
                      let description = "Busca padrão será utilizada em suas pesquisas";
                      
                      // Construir mensagem com base nas opções selecionadas
                      const enabledOptions = [];
                      if (deepSearchEnabled) enabledOptions.push("Busca Profunda");
                      if (globalSearchEnabled) enabledOptions.push("Web Global");
                      if (academicSearchEnabled) enabledOptions.push("Acadêmico");
                      if (socialSearchEnabled) enabledOptions.push("Social");
                      
                      if (enabledOptions.length > 0) {
                        description = `Fontes ativadas: ${enabledOptions.join(", ")}`;
                      }
                      
                      toast({
                        title: "Configurações salvas",
                        description: description,
                        duration: 3000,
                      });
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Aplicar</span>
                      <div className="h-3.5 w-3.5 rounded-full bg-white/20 flex items-center justify-center">
                        <ArrowRight className="h-2 w-2" />
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
      
      {/* Modal de Sugestão de Prompt */}
      {showPromptSuggestionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowPromptSuggestionModal(false)}></div>
          <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-orange-200 dark:border-orange-700 p-4 shadow-xl w-[90%] max-w-md animate-fadeIn">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                <Lightbulb className="h-4 w-4" />
                Sugestão de Prompts Inteligentes
              </h4>
              <Button 
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowPromptSuggestionModal(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Quais conteúdos você está estudando?</label>
              <textarea 
                value={studyContent}
                onChange={(e) => setStudyContent(e.target.value)}
                placeholder="Ex: Estou estudando cálculo diferencial, especificamente sobre derivadas e suas aplicações em problemas de otimização."
                className="w-full min-h-[100px] p-3 rounded-md border border-orange-200 dark:border-orange-700 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-500/30 mb-4"
              />

              {generatedPrompts.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                    Prompts Sugeridos
                  </h5>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                    {generatedPrompts.map((prompt, index) => (
                      <div 
                        key={index}
                        className="p-2 border border-orange-100 dark:border-orange-800/40 rounded-lg bg-orange-50/50 dark:bg-orange-900/20 hover:bg-orange-50 dark:hover:bg-orange-900/30 cursor-pointer transition-colors"
                        onClick={() => {
                          setInputMessage(prompt);
                          setShowPromptSuggestionModal(false);
                        }}
                      >
                        <p className="text-sm text-gray-700 dark:text-gray-300">{prompt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs border-orange-200 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  onClick={() => setShowPromptSuggestionModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  size="sm" 
                  className="text-xs bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-none flex items-center gap-1"
                  onClick={generatePromptSuggestions}
                  disabled={isGeneratingPrompts || !studyContent.trim()}
                >
                  {isGeneratingPrompts ? (
                    <>
                      <div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      <span>Pedir IA sugerir prompts</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Improved Prompt Panel */}
      {isImprovingPrompt && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={cancelImprovedPrompt}></div>
          <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-orange-200 dark:border-orange-700 p-4 shadow-xl w-[90%] max-w-md animate-fadeIn">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                <Sparkles className="h-4 w-4" />
                Prompt Aprimorado com IA
              </h4>
              <Button 
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={cancelImprovedPrompt}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {promptImprovementLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="flex flex-col items-center space-y-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse delay-150" />
                    <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse delay-300" />
                  </div>
                  <span className="text-sm text-orange-600 dark:text-orange-400">Aprimorando sua pergunta com IA...</span>
                </div>
              </div>
            ) : (
              <>
                <ScrollArea className="max-h-[200px] mb-4">
                  <div className="p-3 bg-white dark:bg-gray-800/80 rounded-lg border border-orange-100 dark:border-orange-800/40">
                    <p className="text-sm whitespace-pre-wrap">{improvedPrompt}</p>
                  </div>
                </ScrollArea>
                
                <div className="flex justify-end gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs border-orange-200 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    onClick={cancelImprovedPrompt}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    size="sm" 
                    className="text-xs bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-none"
                    onClick={acceptImprovedPrompt}
                  >
                    Usar este prompt
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modern floating input area fixed to bottom */}
      <div className="absolute bottom-2 left-0 right-0 px-2.5">
        {/* Quick Actions Bar */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs p-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow flex items-center gap-1"
              onClick={() => {
                setIsShowingAISettings(true);
              }}
            >
              <Sparkles className="h-3 w-3 text-orange-500" />
              <span className="text-gray-700 dark:text-gray-300">IA Habilitada</span>
            </Button>
            
            {/* Opção de pesquisa removida */}
            
            {/* Botão de Pesquisa Avançada removido */}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs p-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow flex items-center gap-1"
              onClick={() => {
                // Abre o modal de busca profunda
                setShowSearchModal(true);
                
                // Desativa outros modais para evitar conflitos
                setIsShowingAISettings(false);
                setShowPromptSuggestionModal(false);
                setIsImprovingPrompt(false);
              }}
            >
              <Search className="h-3 w-3 text-indigo-500" />
              <span className="text-gray-700 dark:text-gray-300">Busca</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs p-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow flex items-center gap-1"
              onClick={() => {
                // Desativa os outros modais para evitar conflitos
                setIsShowingAISettings(false);
                
                // Abre o modal do Agente IA
                setShowAgentModal(true);
              }}
            >
              <Bot className="h-3 w-3 text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">Agente IA</span>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs p-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow flex items-center gap-1"
            onClick={async () => {
              // Limpar histórico de mensagens
              setMessages(defaultMessages);

              // Importar e chamar função para limpar histórico de conversa
              try {
                const sessionId = userName || 'anonymous-' + Date.now().toString();
                const { clearConversationHistory } = await import('@/services/aiChatService');
                clearConversationHistory(sessionId);
              } catch (error) {
                console.error('Erro ao limpar histórico:', error);
              }
            }}
          >
            <RefreshCw className="h-3 w-3 text-purple-500" />
            <span className="text-gray-700 dark:text-gray-300">Nova conversa</span>
          </Button>
        </div>
        
        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-2 px-2 py-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex flex-wrap gap-1.5">
              {selectedFiles.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center bg-white dark:bg-gray-700 rounded-full px-2 py-0.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                >
                  {file.type.startsWith('image/') && <Image className="h-3 w-3 text-blue-500 mr-1" />}
                  {file.type.startsWith('video/') && <Video className="h-3 w-3 text-red-500 mr-1" />}
                  {file.type.startsWith('audio/') && <Mic className="h-3 w-3 text-green-500 mr-1" />}
                  {(!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/')) && <FileText className="h-3 w-3 text-orange-500 mr-1" />}
                  <span className="text-xs truncate max-w-[80px]">{file.name}</span>
                  <button 
                    className="ml-1 text-gray-400 hover:text-red-500"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Input Area with Glass Effect */}
        <div className="flex gap-1.5 relative">
          {/* File Attachment Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
            >
              <Paperclip className="h-5 w-5 text-orange-500" />
            </Button>

            {showAttachmentOptions && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-gray-100 dark:border-gray-700 shadow-lg z-50 overflow-hidden">
                <div className="py-1">
                  <label htmlFor="image-upload" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer w-full">
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

                  <label htmlFor="document-upload" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer w-full">
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

                  <label htmlFor="video-upload" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer w-full">
                    <Video className="h-4 w-4 text-[#FF6B00]" />
                    Vídeo
                  </label>
                  <input
                    type="file"
                    id="videoupload"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <button
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    onClick={startVoiceRecording}
                  >
                    <Mic className="h-4 w-4 text-[#FF6B00]" />
                    Áudio
                  </button>
                </div>
              </div>
            )}

            {isRecordingAudio && (
              <div className="absolute bottom-full left-0 mb-2 p-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-red-100 dark:border-red-900/50 shadow-lg z-50 animate-pulse-subtle">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Mic className="h-5 w-5 text-red-500" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Gravando áudio...</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Fale sua mensagem</span>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0 rounded-full border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={stopVoiceRecording}
                      title="Parar gravação"
                    >
                      <Square className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="bg-red-500 h-1.5 rounded-full animate-recording-progress"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Input Field with Glow Effect */}
          <div className="flex-1 relative">
            <div className="relative flex items-center backdrop-blur-lg rounded-full border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm bg-white/90 dark:bg-gray-800/90 hover:shadow-md transition-all duration-200 hover:border-orange-200 dark:hover:border-orange-700 focus-within:border-orange-300 dark:focus-within:border-orange-600 focus-within:ring-2 focus-within:ring-orange-500/20 dark:focus-within:ring-orange-500/30">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="border-0 bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 pr-14 py-5 h-11 text-md placeholder:text-gray-400 dark:placeholder:text-gray-500"
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              
              <div className="absolute right-2 flex items-center gap-1.5">
                {inputMessage.trim().length > 0 && !isImprovingPrompt && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-orange-100/50 dark:hover:bg-orange-900/30"
                    onClick={improvePrompt}
                    title="Melhorar pergunta com IA"
                  >
                    <Sparkles className="h-4 w-4 text-orange-500" />
                  </Button>
                )}
                
                <Button
                  size="icon"
                  className={`h-8 w-8 rounded-full transition-all duration-300 ${
                    isMessageEmpty && selectedFiles.length === 0
                      ? "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                      : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  }`}
                  onClick={inputMessage.trim().length > 0 ? sendMessage : startVoiceRecording}
                  disabled={isMessageEmpty && selectedFiles.length === 0}
                  title={inputMessage.trim().length > 0 ? "Enviar mensagem" : "Gravar áudio"}
                  className={`h-8 w-8 mr-2 rounded-full transition-all duration-300 ${
                    isMessageEmpty && selectedFiles.length === 0
                      ? "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-600"
                      : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  }`}
                >
                  {inputMessage.trim().length > 0 ? (
                    <Send className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                
                {/* Botão de sugerir prompt */}
                <Button
                  size="icon"
                  className="h-8 w-8 rounded-full bg-green-500 hover:bg-green-600 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={() => setShowPromptSuggestionModal(true)}
                  title="Sugerir prompt"
                >
                  <Lightbulb className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
      </div>{isCreatingTicket ? (
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
                  <Lightbulb className="h-8 w-8 text-orange500" />
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
            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF8736] to-[#FF6B00] hover:bg-gradient-to-br hover:from-[#FF9856] hover:to-[#FF7B20] shadow-lg shadow-orange-500/20 dark:shadow-orange-700/30 animate-bounce-subtle flex items-center justify-center"
          >
            <MessageSquare className="h-6 w-6 text-white" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
          </Button>
        ) : (
          <div
            className={cn(
              "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 rounded-3xl shadow-2xl backdrop-blur-md border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden transition-all duration-300 p-1",
              isExpanded ? "w-[700px] h-[700px]" : "w-[1100px] h-[700px]",
            )}
          >
            {/* Header with glass effect */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl mb-2 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Suporte Ponto.School</h3>
                  <div className="flex items-center gap-1 text-xs text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    Online agora
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <div 
                  className="h-8 w-8 rounded-full border-2 border-white/30 hover:border-white/70 cursor-pointer overflow-hidden transition-all duration-300 transform hover:scale-110"
                  onClick={() => setShowEpictusPersonalizeModal(true)}
                  title="Personalizar Epictus IA"
                >
                  <Avatar>
                    <AvatarImage 
                      src={profileImageUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&mouth=smile&eyes=happy"}
                      alt="Personalizar IA"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-white/10 text-white"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-white/10 text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Main content with floating card effect */}
            <div className="flex-1 overflow-hidden px-1 relative">
              {/* Floating navigation pills */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-1 shadow-sm border border-gray-100 dark:border-gray-700">
                <Button
                  variant={activeTab === "home" ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 rounded-full px-3 ${activeTab === "home" ? "bg-orange-500 text-white" : "text-gray-700 dark:text-gray-300"}`}
                  onClick={() => setActiveTab("home")}
                >
                  <Home className="h-4 w-4 mr-1" /> Início
                </Button>
                <Button
                  variant={activeTab === "chat" ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 rounded-full px-3 ${activeTab === "chat" ? "bg-orange-500 text-white" : "text-gray-700 dark:text-gray-300"}`}
                  onClick={() => {
                    setActiveTab("chat");
                    setSelectedChat(null);
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-1" /> Chat
                </Button>
                <Button
                  variant={activeTab === "history" ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 rounded-full px-3 ${activeTab === "history" ? "bg-orange-500 text-white" : "text-gray-700 dark:text-gray-300"}`}
                  onClick={() => setActiveTab("history")}
                >
                  <History className="h-4 w-4 mr-1" /> Histórico
                </Button>
                <Button
                  variant={activeTab === "tickets" ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 rounded-full px-3 ${activeTab === "tickets" ? "bg-orange-500 text-white" : "text-gray-700 dark:text-gray-300"}`}
                  onClick={() => setActiveTab("tickets")}
                >
                  <TicketIcon className="h-4 w-4 mr-1" /> Tickets
                </Button>
                <Button
                  variant={activeTab === "suggestions" ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 rounded-full px-3 ${activeTab === "suggestions" ? "bg-orange-500 text-white" : "text-gray-700 dark:text-gray-300"}`}
                  onClick={() => setActiveTab("suggestions")}
                >
                  <Lightbulb className="h-4 w-4 mr-1" /> Sugestões
                </Button>
                <Button
                  variant={activeTab === "notifications" ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 rounded-full px-3 ${activeTab === "notifications" ? "bg-orange-500 text-white" : "text-gray-700 dark:text-gray-300"}`}
                  onClick={() => setActiveTab("notifications")}
                >
                  <Bell className="h-4 w-4 mr-1" /> Notificações
                </Button>
                <Button
                  variant={activeTab === "help" ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 rounded-full px-3 ${activeTab === "help" ? "bg-orange-500 text-white" : "text-gray-700 dark:text-gray-300"}`}
                  onClick={() => setActiveTab("help")}
                >
                  <HelpCircle className="h-4 w-4 mr-1" /> Ajuda
                </Button>
              </div>

              {/* Content area with glass morphism effect */}
              <div className="mt-14 h-[calc(100%-3.5rem)] rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-100 dark:border-gray-700 shadow-sm p-3 overflow-hidden">
                <div className="h-full overflow-hidden">
                  {activeTab === "home" && renderHomeContent()}
                  {activeTab === "chat" && renderChatContent()}
                  {activeTab === "history" && renderChatHistoryContent()}
                  {activeTab === "tickets" && renderTicketsContent()}
                  {activeTab === "help" && renderHelpContent()}
                  {activeTab === "suggestions" && renderSuggestionsContent()}
                  {activeTab === "notifications" && renderNotificationsContent()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
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
        
        .border-gradient {
          position: relative;
          background-clip: padding-box;
          background-origin: border-box;
          background-image: linear-gradient(to right, #FF6B00, #FF8C40);
        }
        
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 1.5s ease-in-out infinite;
        }
        
        @keyframes recording-progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        
        .animate-recording-progress {
          animation: recording-progress 10s linear infinite;
          width: 0%;
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

        @keyframes typeBlinkCursor {
          from, to { border-color: transparent }
          50% { border-color: #FF6B00; }
        }

        @keyframes typingIn {
          from { width: 0 }
          to { width: 100% }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-typing {
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          border-right: 2px solid #FF6B00;
          animation: typingIn 3.5s steps(40, end), typeBlinkCursor .75s step-end infinite;
        }

        .message-content {
          line-height: 1.6;
          color: rgba(55, 65, 81, 1);
        }

        .dark .message-content {
          color: rgba(229, 231, 235, 1);
        }

        .message-content strong {
          font-weight: 600;
          color: rgba(17, 24, 39, 1);
        }

        .dark .message-content strong {
          color: rgba(255, 255, 255, 1);
        }

        .message-content em {
          font-style: italic;
          opacity: 0.9;
        }

        .message-content code {
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          font-size: 0.9em;
        }

        .message-content h1, .message-content h2, .message-content h3 {
          margin-top: 0.8em;
          margin-bottom: 0.4em;
          line-height: 1.3;
        }

        .message-content h1 {
          font-size: 1.3em;
          font-weight: 700;
        }

        .message-content h2 {
          font-size: 1.2em;
          font-weight: 600;
        }

        .message-content h3 {
          font-size: 1.1em;
          font-weight: 600;
        }

        .message-content p {
          margin: 0.6em 0;
        }

        .message-content ul, .message-content ol {
          padding-left: 1.5rem;
          margin: 0.7rem 0;
        }

        .message-content ul li {
          list-style-type: disc;
          margin: 0.3em 0;
        }

        .message-content ol li {
          list-style-type: decimal;
          margin: 0.3em 0;
        }

        .message-content blockquote {
          border-left: 3px solid #FF8736;
          padding: 0.5em 1em;
          margin: 0.8em 0;
          background: rgba(255, 135, 54, 0.1);
          border-radius: 0 0.25em 0.25em 0;
        }

        .message-content a {
          text-decoration: none;
          color: #FF6B00;
          transition: all 0.2s ease;
        }

        .message-content a:hover {
          text-decoration: underline;
          opacity: 0.8;
        }

        .message-content hr {
          margin: 1em 0;
          border: 0;
          border-top: 1px solid rgba(229, 231, 235, 1);
        }

        .dark .message-content hr {
          border-color: rgba(55, 65, 81, 0.5);
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