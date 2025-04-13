import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  rating?: 'positive' | 'negative';
  needsImprovement?: boolean;
  evaluation?: 'good' | 'bad';
  showFeedbackOptions?: boolean;
  feedbackText?: string;
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
    content: "Oi! Sou o Epictus IA do suporte, seu assistente descolado aqui na Ponto.School! 😊 Estou aqui para te ajudar com dúvidas sobre a plataforma, navegação, funcionalidades e também posso responder questões sobre conteúdos educacionais. Como posso facilitar sua experiência hoje?",
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
  const [soundEnabled, setSoundEnabled] = useState(true); // Estado para habilitar/desabilitar sons
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null); // ID da mensagem sendo editada
  const [editMessageContent, setEditMessageContent] = useState(""); // Conteúdo da mensagem em edição


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
    const initializeChat = async () => {
      try {
        // Tentar obter dados do perfil do usuário com mais detalhes
        const profileService = await import('@/services/profileService');
        const aiChatDatabaseService = await import('@/services/aiChatDatabaseService');
        
        // Obter um perfil completo e detalhado do usuário para contexto 
        const userProfile = await profileService.profileService.getCurrentUserProfile();
        let detailedProfile = null;
        
        try {
          // Tentar obter um perfil mais detalhado usando o serviço avançado
          detailedProfile = await aiChatDatabaseService.aiChatDatabase.getDetailedUserProfile();
        } catch (detailError) {
          console.log('Não foi possível obter perfil detalhado, usando perfil básico:', detailError);
        }
        
        // Usar perfil detalhado se disponível, senão cair para o perfil básico
        const effectiveProfile = detailedProfile || userProfile;

        // Determinar o melhor nome de usuário a usar com prioridades claras
        let displayName = 'Usuário';
        let fullName = '';

        if (effectiveProfile) {
          // Armazenar o nome completo para uso no contexto da IA
          fullName = effectiveProfile.full_name || '';
          
          // Prioridade: nome completo > displayName > username
          if (effectiveProfile.full_name) {
            displayName = effectiveProfile.full_name.split(' ')[0]; // Pegar o primeiro nome
          } else if (effectiveProfile.display_name) {
            displayName = effectiveProfile.display_name;
          } else if (effectiveProfile.username) {
            displayName = effectiveProfile.username;
          }
          
          // Salvar informações do usuário no localStorage para uso futuro
          try {
            localStorage.setItem('userFirstName', displayName);
            localStorage.setItem('userFullName', fullName);
            if (effectiveProfile.id) {
              localStorage.setItem('userId', effectiveProfile.id);
            }
          } catch (storageError) {
            console.log('Erro ao salvar dados do usuário no localStorage:', storageError);
          }
        } else {
          // Fallback para localStorage se não tiver perfil
          const storedName = localStorage.getItem('userFirstName') || 
                            localStorage.getItem('userName') || 
                            localStorage.getItem('userDisplayName');
          if (storedName) {
            displayName = storedName;
          }
          
          fullName = localStorage.getItem('userFullName') || displayName;
        }

        // Atualizar estado com o nome encontrado
        setUserName(displayName);

        // Gerar uma ID de sessão baseada no usuário atual ou usar existente
        // Incluir um identificador único da máquina se possível
        const deviceId = localStorage.getItem('deviceId') || 
                        `device_${Math.random().toString(36).substring(2, 9)}`;
        
        if (!localStorage.getItem('deviceId')) {
          localStorage.setItem('deviceId', deviceId);
        }
        
        const userId = effectiveProfile?.id || localStorage.getItem('userId') || 'anonymous';
        const savedSessionId = localStorage.getItem('chatSessionId');
        const newSessionId = savedSessionId || 
                            `chat_${userId}_${displayName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
        setSessionId(newSessionId);

        if (!savedSessionId) {
          localStorage.setItem('chatSessionId', newSessionId);
        }

        // Carregar mensagens salvas para este usuário
        try {
          const chatService = await import('@/services/aiChatService');

          // Usar a função getConversationHistory para obter histórico com todos os detalhes
          const history = await chatService.getConversationHistory(newSessionId);

          // Se houver histórico com mensagens de usuário e IA, exibir as mensagens
          if (history && history.length > 1) {
            // Converter de ChatMessage do serviço para o formato ChatMessage do componente
            const convertedMessages: ChatMessage[] = history
              .filter(msg => msg.role !== 'system') // Excluir mensagens do sistema
              .map((msg, index) => ({
                id: Date.now() + index,
                content: msg.content,
                sender: msg.role === 'user' ? 'user' : 'assistant',
                timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(),
                // Preservar avaliações anteriores caso existam
                rating: 'rating' in msg ? msg.rating as 'positive' | 'negative' : undefined,
                needsImprovement: 'needsImprovement' in msg ? msg.needsImprovement as boolean : undefined,
              }));

            if (convertedMessages.length > 0) {
              setMessages(convertedMessages);
            }
          }
        } catch (error) {
          console.error('Erro ao carregar histórico de mensagens:', error);
        }
        
        // Vamos usar o aiIntelligenceLevel do localStorage se disponível
        try {
          const storedIntelligenceLevel = localStorage.getItem('aiIntelligenceLevel');
          if (storedIntelligenceLevel && ['basic', 'normal', 'advanced'].includes(storedIntelligenceLevel)) {
            setAIIntelligenceLevel(storedIntelligenceLevel as 'basic' | 'normal' | 'advanced');
          }
          
          const storedLanguageStyle = localStorage.getItem('aiLanguageStyle');
          if (storedLanguageStyle && ['casual', 'formal', 'technical'].includes(storedLanguageStyle)) {
            setAILanguageStyle(storedLanguageStyle as 'casual' | 'formal' | 'technical');
          }
          
          const storedSoundEnabled = localStorage.getItem('soundEnabled');
          if (storedSoundEnabled !== null) {
            setSoundEnabled(storedSoundEnabled === 'true');
            setEnableNotificationSounds(storedSoundEnabled === 'true');
          }
        } catch (prefError) {
          console.log('Erro ao carregar preferências do usuário:', prefError);
        }
        
      } catch (error) {
        console.error('Erro ao inicializar chat:', error);

        // Usar valores padrão em caso de erro
        const displayName = 'Usuário';
        setUserName(displayName);

        const savedSessionId = localStorage.getItem('chatSessionId');
        const newSessionId = savedSessionId || `chat_default_${Date.now()}`;
        setSessionId(newSessionId);

        if (!savedSessionId) {
          localStorage.setItem('chatSessionId', newSessionId);
        }
      }
    };

    initializeChat();
  }, []);

  useEffect(() => {
    setIsMessageEmpty(message.trim() === '');
  }, [message]);

  // Função para editar mensagem
  const startEditingMessage = (messageId: number, content: string) => {
    setEditingMessageId(messageId);
    setEditMessageContent(content);
  };

  // Função para salvar edição de mensagem
  const saveEditedMessage = async () => {
    if (!editingMessageId || !editMessageContent.trim()) return;

    // Encontrar a mensagem original e o seu índice
    const messageIndex = messages.findIndex(msg => msg.id === editingMessageId);
    if (messageIndex === -1) return;

    const originalMessage = messages[messageIndex];
    const nextMessageIndex = messageIndex + 1;

    // Atualizar a mensagem editada
    const updatedMessages = [...messages];
    updatedMessages[messageIndex] = {
      ...originalMessage,
      content: editMessageContent,
      timestamp: new Date() // Atualizar o timestamp
    };

    // Se há uma resposta da IA logo após esta mensagem, vamos removê-la
    // e gerar uma nova resposta baseada na mensagem editada
    if (nextMessageIndex < messages.length && messages[nextMessageIndex].sender === 'assistant') {
      // Remover a resposta antiga
      updatedMessages.splice(nextMessageIndex, 1);
    }

    // Atualizar o estado de mensagens
    setMessages(updatedMessages);

    // Cancelar o modo de edição
    setEditingMessageId(null);
    setEditMessageContent("");

    // Sinalizar que a IA está digitando
    setIsTyping(true);

    try {
      // Gerar uma nova resposta para a mensagem editada
      const aiService = await import('@/services/aiChatService');
      const aiResponse = await aiService.generateAIResponse(
        editMessageContent,
        sessionId || 'default_session',
        {
          intelligenceLevel: aiIntelligenceLevel,
          languageStyle: aiLanguageStyle
        }
      );

      // Adicionar a nova resposta da IA
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
      console.error('Erro ao gerar resposta para mensagem editada:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          id: Date.now(), 
          content: 'Desculpe, estou enfrentando problemas ao responder sua mensagem editada. Por favor, tente novamente mais tarde.', 
          sender: 'assistant', 
          timestamp: new Date() 
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Função para cancelar edição de mensagem
  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditMessageContent("");
  };

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
        `Melhore o seguinte prompt para obter uma resposta mais detalhada e completa. 
        Reescreva mantendo o tom como se EU estivesse fazendo a pergunta para a IA. 
        Mantenha a primeira pessoa ("eu", "me", "minha") e torne a pergunta mais específica e detalhada: "${inputMessage}"`,
        `improve_prompt_${Date.now()}`,
        {
          intelligenceLevel: 'advanced',
          languageStyle: aiLanguageStyle || 'casual'
        }
      );

      // Limpar qualquer formatação que possa ter vindo da resposta
      const cleanedImprovedPrompt = improvedPromptText
        .replace(/^(Prompt melhorado:|Aqui está uma versão melhorada:|Versão melhorada:|Reescrita:|Pergunta melhorada:)/i, '')
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

    // Gerar sessão única para este chat se ainda não existir
    if (!sessionId) {
      // Usar um ID baseado no nome de usuário e timestamp para rastreamento único
      const userId = localStorage.getItem('userId') || 'anonymous';
      const newSessionId = `chat_${userId}_${userName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
    }

    // Atualizar a interface com a mensagem do usuário imediatamente
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setSelectedFiles([]);
    setIsTyping(true);

    try {
      // Importar os serviços necessários dinamicamente
      const aiService = await import('@/services/aiChatService');
      const aiChatDatabase = await import('@/services/aiChatDatabaseService');

      // Gerar um ID de sessão válido caso ainda não exista
      const validSessionId = sessionId || `chat_${userName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
      
      // Antes de chamar a API, vamos verificar se a mensagem é uma solicitação especial
      // que podemos tratar localmente com nossos próprios dados
      const lowerMessage = fullMessage.toLowerCase();
      
      // Verificar se é uma solicitação de informações do perfil do usuário
      const isProfileRequest = lowerMessage.includes('meu perfil') || 
                             lowerMessage.includes('minhas informações') ||
                             lowerMessage.includes('meus dados') ||
                             lowerMessage.includes('minha conta');
      
      let customResponse = '';
      
      if (isProfileRequest) {
        try {
          // Tentar obter o perfil detalhado do usuário
          const userProfile = await aiChatDatabase.aiChatDatabase.getDetailedUserProfile();
          
          if (userProfile) {
            // Formatar o perfil para exibição
            const formattedProfile = aiChatDatabase.aiChatDatabase.formatUserProfile(userProfile);
            
            // Criar uma resposta personalizada
            customResponse = `Claro, ${userName}! Aqui estão as informações do seu perfil:

${formattedProfile}

Você pode atualizar suas informações acessando a [página de perfil](https://pontoschool.com/profile).`;
          }
        } catch (profileError) {
          console.error('Erro ao buscar perfil do usuário:', profileError);
        }
      }
      
      // Se temos uma resposta personalizada, usá-la
      if (customResponse) {
        // Primeiro vamos salvar esta interação no histórico da conversa
        await aiService.addMessageToHistory(validSessionId, {
          role: 'user',
          content: fullMessage
        });
        
        await aiService.addMessageToHistory(validSessionId, {
          role: 'assistant',
          content: customResponse
        });
        
        // Formatação visual melhorada para a resposta personalizada
        const formattedResponse = customResponse
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
          .replace(/\_(.*?)\_/g, '<em class="italic">$1</em>')
          .replace(/\~\~(.*?)\~\~/g, '<del class="line-through">$1</del>')
          .replace(/\`(.*?)\`/g, '<code class="bg-black/10 dark:bg-white/10 rounded px-1">$1</code>')
          .replace(/\n/g, '<br />')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank">$1</a>');
          
        // Reproduzir som se estiver ativado
        if (soundEnabled && enableNotificationSounds) {
          try {
            const audioElement = new Audio('/message-sound.mp3');
            audioElement.volume = 0.5;
            await audioElement.play();
          } catch (audioError) {
            console.log('Não foi possível reproduzir o som:', audioError);
          }
        }
        
        const assistantMessage = { 
          id: Date.now(), 
          content: formattedResponse, 
          sender: 'assistant', 
          timestamp: new Date(),
          showFeedbackOptions: true
        };
        
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
        setIsTyping(false);
        return;
      }

      // Salvar as preferências atuais para uso futuro
      localStorage.setItem('aiIntelligenceLevel', aiIntelligenceLevel);
      localStorage.setItem('aiLanguageStyle', aiLanguageStyle);
      localStorage.setItem('soundEnabled', soundEnabled.toString());
      
      // Obter o contexto da página atual para fornecer respostas mais relevantes
      const pageContext = window.location.pathname;
      const pageTitle = document.title;
      
      // Chamar a API para obter resposta com opções personalizadas e contexto - já gerencia o histórico internamente
      const aiResponse = await aiService.generateAIResponse(
        fullMessage,
        validSessionId,
        {
          intelligenceLevel: aiIntelligenceLevel,
          languageStyle: aiLanguageStyle,
          userContext: {
            currentPage: pageContext,
            pageTitle: pageTitle,
            userName: userName,
            timeOfDay: new Date().getHours() < 12 ? 'manhã' : 
                      (new Date().getHours() < 18 ? 'tarde' : 'noite')
          }
        }
      );

      // Reproduzir som se estiver ativado
      if (soundEnabled && enableNotificationSounds) {
        try {
          const audioElement = new Audio('/message-sound.mp3');
          audioElement.volume = 0.5;
          await audioElement.play();
        } catch (audioError) {
          console.log('Não foi possível reproduzir o som:', audioError);
        }
      }

      // Adicionar a resposta da IA à interface com formatação melhorada
      // Transformar links em instruções de tutorial e formatação melhorada para respostas da IA
      let processedResponse = aiResponse;

      // Transformar links em instruções de tutorial detalhadas com base na seção
      processedResponse = processedResponse.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        if (url.includes('pontoschool.com')) {
          const section = url.split('/').pop() || '';
          let tutorialText = '';
          
          // Personalizar instruções com base na seção específica
          switch(section) {
            case 'portal':
              tutorialText = `Para acessar o Portal de Estudos, siga estas etapas:
1. No menu lateral esquerdo da plataforma, localize o ícone "Portal"
2. Clique no ícone para entrar no Portal de Estudos
3. Você verá todos os seus materiais didáticos organizados por disciplina
4. Utilize os filtros disponíveis para encontrar conteúdos específicos
5. Clique em qualquer material para acessar seu conteúdo completo`;
              break;
            case 'agenda':
              tutorialText = `Para acessar sua Agenda, siga estas etapas:
1. No menu lateral esquerdo da plataforma, localize o ícone "Agenda"
2. Clique no ícone para abrir sua Agenda completa
3. Você verá sua programação em formato de calendário
4. Use as opções de visualização (dia, semana, mês) para navegar melhor
5. Clique no botão "+" para adicionar novos eventos ou compromissos`;
              break;
            case 'turmas':
              tutorialText = `Para acessar suas Turmas, siga estas etapas:
1. No menu lateral esquerdo da plataforma, localize o ícone "Turmas"
2. Clique no ícone para ver todas as suas turmas e grupos de estudo
3. Você verá cards com cada turma que participa
4. Clique em qualquer turma para acessar seu conteúdo, discussões e materiais
5. Se desejar ingressar em uma nova turma, utilize o botão "Adicionar Turma"`;
              break;
            case 'profile':
              tutorialText = `Para acessar seu Perfil, siga estas etapas:
1. No menu superior da plataforma, clique no seu avatar ou nome de usuário
2. Selecione "Meu Perfil" no menu dropdown
3. Você verá sua página de perfil completa
4. Aqui você pode editar suas informações pessoais, biografia e preferências
5. Para alterar sua foto, clique sobre a imagem atual e selecione uma nova`;
              break;
            case 'epictus-ia':
              tutorialText = `Para acessar o Epictus IA, siga estas etapas:
1. No menu lateral esquerdo da plataforma, localize o ícone "Epictus IA"
2. Clique no ícone para acessar a interface completa da IA
3. Você terá acesso a recursos avançados de estudo personalizado
4. Aqui você pode criar planos de estudo, receber recomendações e analisar seu progresso
5. Este é diferente do chat de suporte - ele é focado em aprendizado personalizado`;
              break;
            default:
              tutorialText = `Para acessar "${text}", siga estas etapas:
1. No menu lateral esquerdo da plataforma, procure o item correspondente
2. Você pode também utilizar a barra de pesquisa superior para encontrar esta seção
3. Clique no item para acessar a página
4. Explore as funcionalidades disponíveis nesta seção
5. Se precisar de mais ajuda com esta área específica, me pergunte!`;
          }
          
          return `"${text}": ${tutorialText}`;
        }
        
        // Para links externos, substituir por informação sem link
        return `"${text}": Este recurso está disponível diretamente na plataforma. Não é necessário acessar links externos, pois todas as funcionalidades estão integradas na Ponto.School.`;
      });

      // Remover URLs diretos para segurança
      processedResponse = processedResponse.replace(/(https?:\/\/[^\s]+)(?!\))/g, 'este recurso na plataforma');

      // Adicionar incentivo para continuar a conversa ao final das respostas longas
      if (processedResponse.length > 200 && !processedResponse.includes('Posso ajudar') && !processedResponse.includes('mais alguma coisa')) {
        processedResponse += '\n\nPosso ajudar com mais alguma coisa? Estou à disposição para qualquer dúvida adicional.';
      }

      // Formatação visual melhorada com suporte a elementos HTML para melhor exibição
      const formattedResponse = processedResponse
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-orange-500">$1</strong>')
        .replace(/\_(.*?)\_/g, '<em class="italic">$1</em>')
        .replace(/\~\~(.*?)\~\~/g, '<del class="line-through">$1</del>')
        .replace(/\`(.*?)\`/g, '<code class="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 font-mono text-xs">$1</code>')
        .replace(/\n/g, '<br />')
        // Detecção de listas não ordenadas
        .replace(/^\s*-\s+(.*?)$/gm, '<div class="flex items-start mb-1"><span class="text-orange-500 mr-2">•</span><span>$1</span></div>')
        // Detecção de listas numeradas
        .replace(/^\s*(\d+)\.\s+(.*?)$/gm, '<div class="flex items-start mb-1"><span class="text-orange-500 mr-2">$1.</span><span>$2</span></div>')
        // Seções importantes
        .replace(/\[IMPORTANTE\](.*?)(?:\[\/IMPORTANTE\]|$)/gs, '<div class="p-3 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded my-3">$1</div>')
        // Seções de dicas
        .replace(/\[DICA\](.*?)(?:\[\/DICA\]|$)/gs, '<div class="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded my-3">💡 $1</div>');

      const assistantMessage = { 
        id: Date.now(), 
        content: formattedResponse, 
        sender: 'assistant', 
        timestamp: new Date(),
        showFeedbackOptions: true  // Habilitar opções de feedback para esta mensagem
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);

      // Resposta de erro mais amigável e informativa
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          id: Date.now(), 
          content: `<div class="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded my-3">
            <strong class="text-red-600 dark:text-red-400">Oops! Encontrei um problema técnico.</strong><br/>
            Desculpe ${userName}, estou enfrentando dificuldades no momento. Isso pode ocorrer por instabilidade na conexão ou alta demanda. Por favor, tente novamente em alguns instantes.
          </div>`, 
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
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "assistant" && (
                <div className="w-10 h-10 rounded-full overflow-hidden mr-2 flex-shrink-0">
                  <Avatar>
                    <AvatarImage src="/images/tempo-image-20250329T044440497Z.png" alt="Epictus IA Suporte" />
                    <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white">
                      <LifeBuoy className="h-5 w-5" />
                      <span className="absolute -right-1 -bottom-1 w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <Bot className="h-2 w-2 text-white" />
                      </span>
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}

              {editingMessageId === message.id && message.sender === "user" ? (
                <div className="max-w-[75%] bg-blue-600 text-white p-2 rounded-lg">
                  <textarea
                    value={editMessageContent}
                    onChange={(e) => setEditMessageContent(e.target.value)}
                    className="w-full bg-blue-500 text-white p-2 rounded border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="text-xs py-1 px-2 h-auto"
                      onClick={cancelEditMessage}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      size="sm"
                      className="text-xs py-1 px-2 h-auto bg-green-600 hover:bg-green-700 text-white"
                      onClick={saveEditedMessage}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-[75%] rounded-xl shadow-sm px-4 py-3 ${
                    message.sender === "user" 
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white backdrop-blur-sm" 
                      : "bg-gray-100 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 dark:backdrop-blur-sm"
                  }`}
                >
                  {message.sender === "user" && (
                    <div className="flex justify-end mb-1 group">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-blue-100 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white hover:bg-blue-600/50 rounded-full"
                        onClick={() => startEditingMessage(message.id, message.content)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-3 h-3"
                        >
                          <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                          <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                        </svg>
                      </Button>
                    </div>
                  )}
                  <div 
                    className="message-content whitespace-pre-wrap leading-relaxed" 
                    dangerouslySetInnerHTML={{ 
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                        .replace(/\_(.*?)\_/g, '<em class="italic">$1</em>')
                        .replace(/\~\~(.*?)\~\~/g, '<del class="line-through">$1</del>')
                        .replace(/\`(.*?)\`/g, '<code class="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 font-mono text-xs">$1</code>')
                        .replace(/\n/g, '<br />')
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-200 hover:text-blue-100 hover:underline inline-flex items-center" target="_blank" rel="noopener noreferrer">$1<svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>')
                        .replace(/(https?:\/\/[^\s]+)(?!\))/g, '<a href="$1" class="text-blue-200 hover:text-blue-100 hover:underline inline-flex items-center" target="_blank" rel="noopener noreferrer">$1<svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>')
                    }} 
                  />
                  {message.files && message.files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.files.map((file, index) => (
                        <div 
                          key={`${file.name}-${index}`} 
                          className={`flex items-center rounded-lg p-2.5 transition-all ${
                            message.sender === "user" 
                              ? "bg-blue-600/30 hover:bg-blue-700/40" 
                              : "bg-gray-200/70 dark:bg-gray-700/50 hover:bg-gray-300/80 dark:hover:bg-gray-700/70"
                          }`}
                        >
                          <div className="mr-3 flex-shrink-0 bg-white/20 p-2 rounded-md">
                            {file.type.startsWith('image/') && <Image className="h-4 w-4" />}
                            {file.type.startsWith('video/') && <Video className="h-4 w-4" />}
                            {file.type.startsWith('audio/') && <Music className="h-4 w-4" />}
                            {(!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/')) && <File className="h-4 w-4" />}
                          </div>
                          <div className="overflow-hidden text-sm">
                            <a 
                              href={file.url} 
                              download={file.name} 
                              className={`hover:underline font-medium truncate block ${
                                message.sender === "user" ? "text-white" : "text-blue-500"
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name}
                            </a>
                            <span className="text-xs opacity-80">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-6 w-6 p-0 ml-auto rounded-full ${
                              message.sender === "user"
                                ? "text-blue-100 hover:bg-blue-700/50"
                                : "text-gray-500 hover:bg-gray-300/50 dark:hover:bg-gray-600/50"
                            }`}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <div className={`flex gap-1 ${message.sender === 'assistant' ? 'opacity-80' : 'opacity-0'}`}>
                      {message.sender === 'assistant' && !message.rating && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-green-500 hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-full"
                            onClick={() => {
                              const updatedMessages = [...messages];
                              const index = updatedMessages.findIndex(m => m.id === message.id);
                              if (index !== -1) {
                                updatedMessages[index] = {
                                  ...updatedMessages[index],
                                  rating: 'positive'
                                };
                                setMessages(updatedMessages);
                              }
                            }}
                            title="Resposta útil"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full"
                            onClick={() => {
                              const updatedMessages = [...messages];
                              const index = updatedMessages.findIndex(m => m.id === message.id);
                              if (index !== -1) {
                                updatedMessages[index] = {
                                  ...updatedMessages[index],
                                  rating: 'negative',
                                  needsImprovement: true
                                };
                                setMessages(updatedMessages);
                              }
                            }}
                            title="Resposta não útil"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      {message.rating === 'positive' && (
                        <span className="text-xs text-green-500 flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" /> Obrigado pelo feedback!
                        </span>
                      )}
                      {message.rating === 'negative' && message.needsImprovement && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-red-500 flex items-center gap-1">
                            <ThumbsDown className="h-3 w-3" /> Desculpe pela resposta insatisfatória
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs py-0 px-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                              onClick={async () => {
                                setIsTyping(true);
                                const updatedMessages = [...messages];
                                const index = updatedMessages.findIndex(m => m.id === message.id);

                                if (index !== -1) {
                                  updatedMessages[index] = {
                                    ...updatedMessages[index],
                                    needsImprovement: false
                                  };
                                  setMessages(updatedMessages);

                                  try {
                                    // Importar o serviço AI dinamicamente
                                    const aiService = await import('@/services/aiChatService');

                                    // Solicitar uma resposta melhorada
                                    const improvedResponse = await aiService.generateAIResponse(
                                      `Por favor, reformule sua resposta anterior para torná-la mais clara, precisa e útil: "${message.content.replace(/<[^>]*>/g, '')}"`,
                                      sessionId || 'default_session',
                                      {
                                        intelligenceLevel: 'advanced',
                                        languageStyle: aiLanguageStyle
                                      }
                                    );

                                    // Adicionar a resposta melhorada como uma nova mensagem
                                    setMessages(prev => [
                                      ...prev,
                                      { 
                                        id: Date.now(), 
                                        content: `**Resposta reformulada:**\n\n${improvedResponse}`, 
                                        sender: 'assistant', 
                                        timestamp: new Date() 
                                      }
                                    ]);
                                  } catch (error) {
                                    console.error('Erroao reformular resposta:', error);
                                    setMessages(prev => [
                                      ...prev,
                                      { 
                                        id: Date.now(), 
                                        content: 'Desculpe, ocorreu um erro ao tentar reformular a resposta. Por favor, tente novamente mais tarde.', 
                                        sender: 'assistant', 
                                        timestamp: new Date() 
                                      }
                                    ]);
                                  } finally {
                                    setIsTyping(false);
                                  }
                                }
                              }}
                            >
                              Reformular resposta
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs py-0 px-2 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                              onClick={() => {
                                const updatedMessages = [...messages];
                                const index = updatedMessages.findIndex(m => m.id === message.id);

                                if (index !== -1) {
                                  // Definir estado temporário para entrada de sugestão
                                  setInputMessage(`Quero uma resposta melhor para: "${message.content.replace(/<[^>]*>/g, '').substring(0, 50)}...". Preciso que você melhore em: `);

                                  // Atualizar o estado da mensagem
                                  updatedMessages[index] = {
                                    ...updatedMessages[index],
                                    needsImprovement: false
                                  };
                                  setMessages(updatedMessages);
                                }
                              }}
                            >
                              Sugerir melhoria
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-xs opacity-80 text-right font-medium ml-auto">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              )}

              {message.sender === "user" && (
                <div className="w-8 h-8 rounded-full overflow-hidden ml-2 flex-shrink-0">
                  <Avatar>
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
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
              <div className="max-w-[75%] rounded-xl px-4 py-3 bg-gray-100 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 shadow-sm backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="relative flex space-x-1 items-center pl-0.5">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-150"></div>
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-300"></div>
                    <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                      Epictus IA está elaborando uma resposta...
                    </span>
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
            <Plus className="h-3 w3 mr-1" /> Nova
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

        /* Styles for AI messages */
        .chat-container .message.ai-message {
          align-self: flex-start;
          background-color: #f0f0f0;
          border-radius: 18px 18px 18px 4px;
          color: #333;
          margin-right: 40px;
        }

        .chat-container .message.ai-message .message-content strong {
          color: #FF6B00;
          font-weight: 600;
        }

        .chat-container .message.ai-message .message-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 12px 0;
          font-size: 0.9em;
        }

        .chat-container .message.ai-message .message-content th,
        .chat-container .message.ai-message .message-content td {
          padding: 8px;
          text-align: left;
          border: 1px solid rgba(255, 107, 0, 0.2);
        }

        .chat-container .message.ai-message .message-content th {
          background-color: rgba(255, 107, 0, 0.1);
          font-weight: 600;
          text-align: center;
        }

        .chat-container .message.ai-message .message-content tr:nth-child(even) {
          background-color: rgba(0, 0, 0, 0.02);
        }

        .dark .chat-container .message.ai-message .message-content tr:nth-child(even) {
          background-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </>
  );
};

export default FloatingChatSupport;