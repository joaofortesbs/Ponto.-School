import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
  MessageSquare,
  Send,
  Mic,
  X,
  Minimize2,
  Maximize2,
  Home,
  MessageCircle,
  TicketIcon,
  HelpCircle,
  Paperclip,
  SmilePlus,
  Bot,
  User,
  ChevronRight,
  AlertCircle,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Vote,
  Keyboard,
  ArrowRight,
  Sparkles,
  Headphones,
  BookOpen,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "support" | "ai";
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
  isTyping?: boolean;
}

interface Suggestion {
  id: string;
  text: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  category: string;
  createdAt: Date;
  updatedAt: Date;
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

interface CommonQuestion {
  id: string;
  question: string;
  icon: React.ReactNode;
}

interface SupportAgent {
  id: string;
  name: string;
  avatar: string;
  role: string;
  isOnline: boolean;
}

const defaultSuggestions: Suggestion[] = [
  { id: "1", text: "Como faço para recuperar minha senha?" },
  { id: "2", text: "Preciso de ajuda com uma tarefa" },
  { id: "3", text: "Como funciona o sistema de pontos?" },
];

const defaultMessages: Message[] = [
  {
    id: "1",
    text: "Olá! Sou o assistente da Ponto.School. Como posso ajudar você hoje?",
    sender: "ai",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: "read",
  },
];

const defaultTickets: Ticket[] = [
  {
    id: "1",
    title: "Problema ao acessar curso de Física",
    description:
      "Não consigo acessar as aulas do módulo 3 do curso de Física Quântica.",
    status: "in_progress",
    priority: "medium",
    category: "Acesso a Conteúdo",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: "2",
    title: "Dúvida sobre certificado",
    description: "Completei o curso mas não recebi meu certificado por email.",
    status: "open",
    priority: "low",
    category: "Certificados",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
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

const defaultSuggestionItems: SuggestionItem[] = [
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

const supportAgents: SupportAgent[] = [
  {
    id: "1",
    name: "Ana Silva",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    role: "Suporte Técnico",
    isOnline: true,
  },
  {
    id: "2",
    name: "Carlos Mendes",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    role: "Especialista em Conteúdo",
    isOnline: true,
  },
  {
    id: "3",
    name: "Mariana Costa",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    role: "Atendimento ao Aluno",
    isOnline: false,
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

const statusColors = {
  open: "bg-blue-500",
  in_progress: "bg-yellow-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500",
};

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const suggestionStatusColors = {
  pending: "bg-gray-100 text-gray-800",
  reviewing: "bg-blue-100 text-blue-800",
  approved: "bg-purple-100 text-purple-800",
  implemented: "bg-green-100 text-green-800",
};

const SupportChat: React.FC = () => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [tickets, setTickets] = useState<Ticket[]>(defaultTickets);
  const [faqs, setFaqs] = useState<FaqItem[]>(defaultFaqs);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(
    defaultSuggestionItems,
  );
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "Acesso a Conteúdo",
    priority: "medium",
  });
  const [newSuggestion, setNewSuggestion] = useState({
    title: "",
    description: "",
  });
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [isCreatingSuggestion, setIsCreatingSuggestion] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);
  const [isStartingNewChat, setIsStartingNewChat] = useState(false);
  const [userName, setUserName] = useState("Usuário");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Define color palette
  const colors = {
    primary: "#29335C", // Azul Noite Profundo
    secondary: "#E0E1DD", // Cinza Névoa
    accent: "#778DA9", // Azul Aço Claro
    textLight: "#FFFFFF", // Branco
    textDark: "#29335C", // Azul Noite Profundo
    textMuted: "#6C757D", // Cinza médio
  };

  // Get user data from Supabase
  useEffect(() => {
    const getUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          if (data && data.full_name) {
            setUserName(data.full_name.split(" ")[0]); // Get first name
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Fallback to default name if error occurs
        setUserName("Usuário");
      }
    };

    getUserData();
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Simulate receiving a message after a delay
  useEffect(() => {
    if (unreadCount === 0) {
      const timer = setTimeout(() => {
        const newMessage = {
          id: Date.now().toString(),
          text: "Temos uma nova promoção para cursos de Física! Gostaria de saber mais?",
          sender: "support" as const,
          timestamp: new Date(),
          status: "delivered" as const,
        };
        setMessages((prev) => [...prev, newMessage]);
        setUnreadCount((prev) => prev + 1);
      }, 60000); // 1 minute

      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
      status: "sent",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse = getAIResponse(inputMessage);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: "ai",
        timestamp: new Date(),
        status: "delivered",
      };

      const updatedMessages = [...messages, userMessage, aiMessage];
      setMessages(updatedMessages);
      setIsTyping(false);

      // Função de salvar conversa no histórico removida
    }, 1500);
  };

  // Função para salvar conversa no histórico removida

  const getAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("senha") || lowerMessage.includes("recuperar")) {
      return "Para recuperar sua senha, clique em 'Esqueci minha senha' na tela de login. Você receberá um email com instruções para criar uma nova senha.";
    } else if (
      lowerMessage.includes("pontos") ||
      lowerMessage.includes("school points")
    ) {
      return "Os School Points são nossa moeda virtual. Você pode ganhar pontos completando cursos, participando de fóruns e realizando outras atividades. Eles podem ser trocados por recompensas na seção Carteira.";
    } else if (
      lowerMessage.includes("curso") ||
      lowerMessage.includes("aula")
    ) {
      return "Temos diversos cursos disponíveis em nossa plataforma. Você pode acessá-los na seção 'Biblioteca'. Se estiver com problemas para acessar algum conteúdo específico, por favor, abra um ticket de suporte.";
    } else {
      return "Obrigado por sua mensagem. Posso ajudar com informações sobre cursos, pontos, certificados e muito mais. Por favor, seja mais específico sobre o que você precisa.";
    }
  };

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const ticket: Ticket = {
      id: (tickets.length + 1).toString(),
      title: newTicket.title,
      description: newTicket.description,
      status: "open",
      priority: newTicket.priority as "low" | "medium" | "high",
      category: newTicket.category,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTickets((prev) => [ticket, ...prev]);
    setNewTicket({
      title: "",
      description: "",
      category: "Acesso a Conteúdo",
      priority: "medium",
    });
    setIsCreatingTicket(false);

    toast({
      title: "Ticket criado",
      description: "Seu ticket foi criado com sucesso!",
    });
  };

  const handleCreateSuggestion = () => {
    if (!newSuggestion.title || !newSuggestion.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

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

    toast({
      title: "Sugestão enviada",
      description: "Sua sugestão foi enviada com sucesso!",
    });
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

    const suggestion = suggestions.find((item) => item.id === id);
    if (suggestion) {
      toast({
        title: suggestion.userVoted ? "Voto removido" : "Voto adicionado",
        description: suggestion.userVoted
          ? "Você removeu seu voto desta sugestão."
          : "Você votou nesta sugestão.",
      });
    }
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

  const renderHomeContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#29335C] to-[#001427] overflow-y-auto custom-scrollbar">
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#778DA9] flex items-center justify-center">
            <img src="/vite.svg" alt="Logo" className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-semibold text-xl">Ponto.School</span>
        </div>
        <div className="flex -space-x-3">
          {supportAgents.map((agent) => (
            <div key={agent.id} className="relative">
              <Avatar className="border-2 border-[#001427] w-10 h-10 transition-transform hover:scale-110 hover:z-10">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback className="text-sm">
                  {agent.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {agent.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-[#001427]"></span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 flex flex-col items-start">
        <div className="mb-6 w-full">
          <h2 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent truncate">
            OLÁ {userName.toUpperCase()} 👋
          </h2>
          <p className="text-white/90 text-lg">Como posso ajudar você hoje?</p>
        </div>

        <Button
          variant="outline"
          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 mb-5 flex justify-between items-center group p-4 h-auto rounded-lg backdrop-blur-sm"
          onClick={() => {
            setActiveTab("chat");
            setIsStartingNewChat(true);
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#778DA9]/20 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-[#778DA9]" />
            </div>
            <span className="text-base font-medium">Envie uma mensagem</span>
          </div>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        <div className="w-full">
          <h3 className="text-white/90 text-base mb-4 flex items-center gap-2 font-medium">
            <Search className="h-5 w-5 text-[#778DA9]" />
            Qual é a sua dúvida?
          </h3>

          <div className="space-y-4 w-full">
            {commonQuestions.map((q, index) => (
              <Button
                key={q.id}
                variant="outline"
                className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 flex justify-between items-center text-left p-4 h-auto rounded-lg transition-all duration-300 hover:translate-x-1"
                onClick={() => {
                    setActiveTab("chat");
                    setInputMessage(q.question);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center">
                    {index === 0 && (
                      <BookOpen className="h-4.5 w-4.5 text-[#778DA9]" />
                    )}
                    {index === 1 && (
                      <Headphones className="h-4.5 w-4.5 text-[#778DA9]" />
                    )}
                    {index === 2 && (
                      <Settings className="h-4.5 w-4.5 text-[#778DA9]" />
                    )}
                    {index === 3 && (
                      <Sparkles className="h-4.5 w-4.5 text-[#778DA9]" />
                    )}
                  </div>
                  <span className="text-base truncate max-w-[250px]">
                    {q.question}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-white/10 flex items-center justify-between bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle2 className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm text-white/80">
            Status: Todos os sistemas operacionais
          </span>
        </div>
        <span className="text-sm text-white/60 truncate">
          Atualizado em {new Date().toLocaleDateString()}
        </span>
      </div>
    </div>
  );


  const renderChatContent = () => (
    <div className="flex flex-col h-full">
      <ScrollArea
        className="flex-1 p-4 custom-scrollbar overflow-y-auto"
        ref={scrollAreaRef}
        style={{ maxHeight: "calc(100% - 100px)" }}
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender !== "user" && (
                <div className="w-10 h-10 rounded-full overflow-hidden mr-2 flex-shrink-0">
                  <Avatar>
                    <AvatarImage
                      src={
                        message.sender === "ai"
                          ? "/ai-avatar.png"
                          : "/support-avatar.png"
                      }
                      alt={message.sender === "ai" ? "AI" : "Support"}
                    />
                    <AvatarFallback
                      className={
                        message.sender === "ai"
                          ? "bg-[#E0E1DD] dark:bg-[#E0E1DD]/20 text-[#29335C] dark:text-white"
                          : "bg-[#E0E1DD] dark:bg-[#E0E1DD]/20 text-[#29335C] dark:text-white"
                      }
                    >
                      {message.sender === "ai" ? (
                        <Bot className="h-6 w-6" />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div
                className={cn(
                  "max-w-[75%] rounded-lg px-4 py-3 mb-3 text-base",
                  message.sender === "user"
                    ? "bg-[#778DA9] text-white rounded-tr-none"
                    : message.sender === "ai"
                      ? "bg-[#E0E1DD] dark:bg-[#E0E1DD]/20 text-[#29335C] dark:text-white rounded-tl-none"
                      : "bg-[#E0E1DD] dark:bg-[#E0E1DD]/20 text-[#29335C] dark:text-white rounded-tl-none",
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <div className="text-xs opacity-70 mt-1 text-right">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              {message.sender === "user" && (
                <div className="w-10 h-10 rounded-full overflow-hidden ml-2 flex-shrink-0">
                  <Avatar>
                    <AvatarImage
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                      alt="User"
                    />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-2 flex-shrink-0">
                <Avatar>
                  <AvatarFallback className="bg-[#E0E1DD] dark:bg-[#E0E1DD]/20 text-[#29335C] dark:text-white">```jsx
                    <Bot className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="max-w-[75%] rounded-lg px-4 py-3 bg-[#E0E1DD] dark:bg-[#E0E1DD]/20 text-[#29335C] dark:text-white rounded-tl-none text-base">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#778DA9] animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-[#778DA9] animate-pulse delay-150" />
                  <div className="w-2 h-2 rounded-full bg-[#778DA9] animate-pulse delay-300" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-[#E0E1DD] dark:border-[#E0E1DD]/20 bg-white dark:bg-[#29335C]">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="pr-12 rounded-full border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-[#29335C]/50 h-12 text-base"
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <div className="absolute right-2 top-0 h-full flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-[#E0E1DD]/10"
              >
                <Paperclip className="h-4 w-4 text-[#29335C] dark:text-[#E0E1DD]/70" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-[#E0E1DD]/10"
              >
                <SmilePlus className="h-4 w-4 text-[#29335C] dark:text-[#E0E1DD]/70" />
              </Button>
            </div>
          </div>
          <Button
            size="icon"
            className="rounded-full h-12 w-12 flex-shrink-0 bg-[#778DA9] hover:bg-[#778DA9]/90"
            onClick={handleSendMessage}
          >
            <Send className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTicketsContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-gradient-to-r from-[#E0E1DD] to-[#E0E1DD]/80 dark:from-[#29335C] dark:to-[#29335C]/90">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <TicketIcon className="h-5 w-5 text-[#778DA9] dark:text-[#778DA9]" />
            <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
              Meus Tickets
            </h3>
          </div>
          <Button
            size="sm"
            className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white rounded-full px-4 py-0 h-9 text-sm"
            onClick={() => setIsCreatingTicket(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Novo Ticket
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tickets..."
            className="pl-10 py-2 h-10 text-sm rounded-full border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-[#29335C]/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isCreatingTicket ? (
        <div className="p-4 space-y4 overflow-y-auto max-h-[calc(100vh-150px)]">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#778DA9]" />
            Novo Ticket
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Título</label>
              <Input
                value={newTicket.title}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, title: e.target.value })
                }
                placeholder="Descreva o problema brevemente"
                className="border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-[#29335C]/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Descrição
              </label>
              <textarea
                value={newTicket.description}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, description: e.target.value })
                }
                placeholder="Forneça detalhes sobre o problema"
                className="w-full min-h-[120px] p-3 rounded-md border border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-[#29335C]/50 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Categoria
                </label>
                <select
                  value={newTicket.category}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, category: e.target.value })
                  }
                  className="w-full p-2 rounded-md border border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-[#29335C]/50 text-sm"
                >
                  <option value="Acesso a Conteúdo">Acesso a Conteúdo</option>
                  <option value="Problemas Técnicos">Problemas Técnicos</option>
                  <option value="Faturamento">Faturamento</option>
                  <option value="Certificados">Certificados</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Prioridade
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      priority: e.target.value as any,
                    })
                  }
                  className="w-full p-2 rounded-md border border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-[#29335C]/50 text-sm"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                className="border-[#E0E1DD] dark:border-[#E0E1DD]/30 text-sm h-10"
                onClick={() => setIsCreatingTicket(false)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white text-sm h-10"
                onClick={handleCreateTicket}
              >
                Enviar Ticket
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
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border border-[#E0E1DD] dark:border-[#E0E1DD]/30 rounded-xl p-4 hover:bg-[#E0E1DD]/10 dark:hover:bg-[#E0E1DD]/5 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${statusColors[ticket.status]}`}
                      />
                      <h4 className="font-medium text-[#29335C] dark:text-white">
                        {ticket.title}
                      </h4>
                    </div>
                    <Badge className="bg-[#E0E1DD] text-[#29335C] dark:bg-[#E0E1DD]/20 dark:text-white hover:bg-[#E0E1DD]/80 dark:hover:bg-[#E0E1DD]/30">
                      #{ticket.id}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2 pl-5">
                    {ticket.description}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs pl-5">
                    <Badge
                      variant="outline"
                      className="border-[#E0E1DD] dark:border-[#E0E1DD]/30"
                    >
                      {ticket.category}
                    </Badge>
                    <Badge className={priorityColors[ticket.priority]}>
                      {ticket.priority === "low"
                        ? "Baixa"
                        : ticket.priority === "medium"
                          ? "Média"
                          : "Alta"}
                    </Badge>
                    <div className="flex items-center text-muted-foreground ml-auto">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 px-4">
                <div className="w-16 h-16 rounded-full bg-[#E0E1DD] dark:bg-[#E0E1DD]/10 flex items-center justify-center mx-auto mb-3">
                  <TicketIcon className="h-8 w-8 text-[#778DA9] dark:text-[#778DA9]" />
                </div>
                <p className="text-[#29335C] dark:text-white font-medium mb-2">
                  Nenhum ticket encontrado
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Crie um novo ticket para obter suporte
                </p>
                <Button
                  className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white rounded-full px-6"
                  onClick={() => setIsCreatingTicket(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar um novo ticket
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  const renderHelpContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-gradient-to-r from-[#E0E1DD] to-[#E0E1DD]/80 dark:from-[#29335C] dark:to-[#29335C]/90">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="h-5 w-5 text-[#778DA9] dark:text-[#778DA9]" />
          <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
            Central de Ajuda
          </h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar perguntas frequentes..."
            className="pl-10 py-2 h-10 text-sm rounded-full border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-[#29335C]/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {selectedFaq ? (
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-[#778DA9] hover:bg-[#778DA9]/10 dark:hover:bg-[#778DA9]/20 dark:text-[#778DA9]"
            onClick={() => setSelectedFaq(null)}
          >
            <ChevronRight className="h-4 w-4 mr-1 rotate-180" /> Voltar
          </Button>
          <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
            {selectedFaq.question}
          </h3>
          <div className="bg-[#E0E1DD]/30 dark:bg-[#E0E1DD]/5 p-4 rounded-xl border border-[#E0E1DD] dark:border-[#E0E1DD]/20">
            <p className="text-sm text-[#29335C] dark:text-white/90 whitespace-pre-line leading-relaxed">
              {selectedFaq.answer}
            </p>
          </div>
          <div className="pt-4 border-t border-[#E0E1DD] dark:border-[#E0E1DD]/20">
            <p className="text-sm font-medium mb-2">Esta resposta foi útil?</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-transparent hover:bg-[#E0E1DD]/10 dark:hover:bg-[#E0E1DD]/5"
              >
                <ThumbsUp className="h-4 w-4 mr-1 text-[#778DA9] dark:text-[#778DA9]" />{" "}
                Sim
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-transparent hover:bg-[#E0E1DD]/10 dark:hover:bg-[#E0E1DD]/5"
              >
                <ThumbsDown className="h-4 w-4 mr-1 text-[#778DA9] dark:text-[#778DA9]" />{" "}
                Não
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <ScrollArea
          className="flex-1 custom-scrollbar"
          style={{ maxHeight: "calc(100% - 60px)" }}
        >
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
                <div
                  key={category}
                  className="bg-white dark:bg-[#E0E1DD]/5 rounded-xl border border-[#E0E1DD] dark:border-[#E0E1DD]/20 overflow-hidden"
                >
                  <h4 className="text-sm font-semibold text-white mb-0 p-3 bg-[#29335C]">
                    {category}
                  </h4>
                  <div className="divide-y divide-[#E0E1DD] dark:divide-[#E0E1DD]/20">
                    {faqs.map((faq) => (
                      <Button
                        key={faq.id}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-[#E0E1DD]/10 dark:hover:bg-[#E0E1DD]/5 rounded-none"
                        onClick={() => setSelectedFaq(faq)}
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-[#778DA9] dark:text-[#778DA9]" />
                          <span className="text-sm text-[#29335C] dark:text-white">
                            {faq.question}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ));
            })()}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-8 px-4">
                <div className="w-16 h-16 rounded-full bg-[#E0E1DD] dark:bg-[#E0E1DD]/10 flex items-center justify-center mx-auto mb-3">
                  <HelpCircle className="h-8 w-8 text-[#778DA9] dark:text-[#778DA9]" />
                </div>
                <p className="text-[#29335C] dark:text-white font-medium mb-2">
                  Nenhuma pergunta encontrada
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Tente uma nova busca ou fale com nosso assistente
                </p>
                <Button
                  className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white rounded-full px-6"
                  onClick={() => setActiveTab("chat")}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Pergunte ao nosso assistente
                </Button>
              </div>
            )}

            <div className="pt-4 border-t border-[#E0E1DD] dark:border-[#E0E1DD]/20">
              <p className="text-sm font-medium mb-3">
                Não encontrou o que procurava?
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-transparent hover:bg-[#E0E1DD]/10 dark:hover:bg-[#E0E1DD]/5"
                  onClick={() => setActiveTab("chat")}
                >
                  <MessageCircle className="h-4 w-4 mr-1 text-[#778DA9] dark:text-[#778DA9]" />{" "}
                  Falar com assistente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-transparent hover:bg-[#E0E1DD]/10 dark:hover:bg-[#E0E1DD]/5"
                  onClick={() => {
                    setActiveTab("tickets");
                    setIsCreatingTicket(true);
                  }}
                >
                  <TicketIcon className="h-4 w-4 mr-1 text-[#778DA9] dark:text-[#778DA9]" />{" "}
                  Abrir ticket
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );

  const renderSuggestionsContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-gradient-to-r from-[#E0E1DD] to-[#E0E1DD]/80 dark:from-[#29335C] dark:to-[#29335C]/90">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-[#778DA9] dark:text-[#778DA9]" />
            <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
              Sugestões
            </h3>
          </div>
          <Button
            size="sm"
            className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white rounded-full px-4 py-0 h-9 text-sm"
            onClick={() => setIsCreatingSuggestion(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Nova
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar sugestões..."
            className="pl-10 py-2 h-10 text-sm rounded-full border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-[#29335C]/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isCreatingSuggestion ? (
        <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-150px)]">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[#778DA9]" />
            Nova Sugestão
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Título</label>
              <Input
                value={newSuggestion.title}
                onChange={(e) =>
                  setNewSuggestion({ ...newSuggestion, title: e.target.value })
                }
                placeholder="Título da sua sugestão"
                className="border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-[#29335C]/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
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
                className="w-full min-h-[120px] p-3 rounded-md border border-[#E0E1DD] dark:border-[#E0E1DD]/30 bg-white dark:bg-[#29335C]/50 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                className="border-[#E0E1DD] dark:border-[#E0E1DD]/30 text-sm h-10"
                onClick={() => setIsCreatingSuggestion(false)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white text-sm h-10"
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
                  className="border border-[#E0E1DD] dark:border-[#E0E1DD]/30 rounded-xl p-4 hover:bg-[#E0E1DD]/10 dark:hover:bg-[#E0E1DD]/5 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-[#29335C] dark:text-white">
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
                  <p className="text-sm text-muted-foreground mb-3">
                    {suggestion.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <Button
                      variant={suggestion.userVoted ? "default" : "outline"}                      size="sm"
                      className={
                        suggestion.userVoted
                          ? "bg-[#778DA9] hover:bg-[#778DA9]/90 text-white rounded-full"
                          : "border-[#E0E1DD] dark:border-[#E0E1DD]/30 hover:bg-[#E0E1DD]/10 dark:hover:bg-[#E0E1DD]/5 rounded-full"
                      }
                      onClick={() => handleVote(suggestion.id)}
                    >
                      <Vote className="h-4 w-4 mr-1" />
                      {suggestion.votes} votos
                    </Button>
                    <div className="text-xs text-muted-foreground bg-[#E0E1DD]/30 dark:bg-[#E0E1DD]/10 px-2 py-1 rounded-full">
                      {new Date(suggestion.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 px-4">
                <div className="w-16 h-16 rounded-full bg-[#E0E1DD] dark:bg-[#E0E1DD]/10 flex items-center justify-center mx-auto mb-3">
                  <Lightbulb className="h-8 w-8 text-[#778DA9] dark:text-[#778DA9]" />
                </div>
                <p className="text-[#29335C] dark:text-white font-medium mb-2">
                  Nenhuma sugestão encontrada
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Compartilhe suas ideias para melhorar a plataforma
                </p>
                <Button
                  className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white rounded-full px-6"
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
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className={cn(
            "h-16 w-16 rounded-full shadow-lg transition-all duration-300",
            isOpen
              ? "bg-red-500 hover:bg-red-600 rotate-90"
              : theme === "dark"
                ? "bg-[#29335C] hover:bg-[#29335C]/90"
                : "bg-[#29335C] hover:bg-[#29335C]/90",
            unreadCount > 0 && !isOpen && "animate-pulse",
          )}
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setUnreadCount(0);
              // Reset to home tab when opening
              setActiveTab("chat");
            }
          }}
          aria-label={
            isOpen ? "Fechar chat de suporte" : "Abrir chat de suporte"
          }
        >
          {isOpen ? (
            <X className="h-8 w-8 text-white" />
          ) : (
            <MessageSquare className="h-8 w-8 text-white" />
          )}
        </Button>
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-[#778DA9] text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed z-40 transition-all duration-300 ease-in-out",
          isOpen
            ? isExpanded
              ? "inset-4"
              : "bottom-28 right-6 w-[400px] max-w-[95vw] h-[550px] max-h-[80vh]"
            : "bottom-28 right-6 w-[400px] max-w-[95vw] h-0 opacity-0 pointer-events-none",
        )}
        style={{
          maxHeight: isOpen
            ? isExpanded
              ? "calc(100vh - 32px)"
              : "80vh"
            : "0",
        }}
      >
        <div
          className={cn(
            "bg-white dark:bg-[#29335C] rounded-xl shadow-xl border border-[#E0E1DD] dark:border-[#E0E1DD]/20 overflow-hidden flex flex-col h-full transition-all duration-300 font-['Poppins']",
            !isOpen && "scale-95 opacity-0",
          )}
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-[#29335C] text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Suporte Ponto.School</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                  <p className="text-sm text-white/90">
                    Online - Resposta em minutos
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col"
            >
              <TabsContent
                value="chat"
                className="m-0 flex-1 flex flex-col overflow-hidden"
              >
                {renderHomeContent()}
              </TabsContent>

              <TabsContent
                value="tickets"
                className="m-0 flex-1 flex flex-col overflow-hidden"
              >
                {renderTicketsContent()}
              </TabsContent>

              <TabsContent
                value="help"
                className="m-0 flex-1 flex flex-col overflow-hidden"
              >
                {renderHelpContent()}
              </TabsContent>

              <TabsContent
                value="suggestions"
                className="m-0 flex-1 flex flex-col overflow-hidden"
              >
                {renderSuggestionsContent()}
              </TabsContent>
            </Tabs>
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-[#E0E1DD] dark:border-[#E0E1DD]/20 bg-white dark:bg-[#29335C] w-full">
            <div className="flex items-center justify-around">
              <Button
                variant="ghost"
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-none ${activeTab === "chat" ? "text-[#778DA9] dark:text-[#778DA9]" : "text-muted-foreground"}`}
                onClick={() => setActiveTab("chat")}
              >
                <Home className="h-5 w-5" />
                <span className="text-sm">Início</span>
              </Button>
              <Button
                variant="ghost"
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-none ${activeTab === "tickets" ? "text-[#778DA9] dark:text-[#778DA9]" : "text-muted-foreground"}`}
                onClick={() => setActiveTab("tickets")}
              >
                <TicketIcon className="h-5 w-5" />
                <span className="text-sm">Tickets</span>
              </Button>
              <Button
                variant="ghost"
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-none ${activeTab === "help" ? "text-[#778DA9] dark:text-[#778DA9]" : "text-muted-foreground"}`}
                onClick={() => setActiveTab("help")}
              >
                <HelpCircle className="h-5 w-5" />
                <span className="text-sm">Ajuda</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
          height: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(37, 99, 235, 0.6);
          border-radius: 9999px;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(37, 99, 235, 0.6);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(37, 99, 235, 0.8);
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(37, 99, 235, 0.8);
        }

        /* Apply custom scrollbar to all ScrollArea components */
        .ScrollAreaViewport {
          scrollbar-width: thin;
          scrollbar-color: rgba(37, 99, 235, 0.6) transparent;
        }

        .dark .ScrollAreaViewport {
          scrollbar-color: rgba(37, 99, 235, 0.6) transparent;
        }

        /* Fix for mobile responsiveness */
        @media (max-width: 640px) {
          .fixed.z-40 {
            width: 90% !important;            right: 5% !important;
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

export default SupportChat;