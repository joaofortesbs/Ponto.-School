
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/components/ui/use-toast";
import { 
  MessageSquare, 
  X, 
  Send, 
  Plus, 
  Search,
  ThumbsUp, 
  ThumbsDown, 
  TicketIcon, 
  HelpCircle, 
  Lightbulb, 
  ChevronRight, 
  ArrowLeft
} from "lucide-react";

// Interface definitions
interface Message {
  id: string;
  text: string;
  sender: "user" | "support";
  timestamp: Date;
  read: boolean;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in-progress" | "resolved" | "closed";
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
  tags: string[];
}

interface SuggestionItem {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  status: "pending" | "under-review" | "implemented" | "rejected";
  votes: number;
  userVoted: boolean;
}

// Default data
const defaultMessages: Message[] = [
  {
    id: "1",
    text: "Olá! Como posso ajudar você hoje?",
    sender: "support",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: "2",
    text: "Bem-vindo(a) à plataforma! Estou aqui para ajudar com qualquer dúvida que você possa ter sobre os recursos, conteúdos ou funcionamento do sistema.",
    sender: "support",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
  },
];

const defaultTickets: Ticket[] = [
  {
    id: "1",
    title: "Problema ao acessar conteúdo de matemática",
    description: "Não consigo visualizar os vídeos da aula de funções.",
    status: "in-progress",
    priority: "medium",
    category: "Acesso a Conteúdo",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    title: "Erro ao enviar tarefa",
    description: "Sistema mostra erro ao tentar enviar o arquivo PDF da redação.",
    status: "open",
    priority: "high",
    category: "Envio de Atividades",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

const defaultFaqs: FaqItem[] = [
  {
    id: "1",
    question: "Como acesso as videoaulas?",
    answer: "Você pode acessar as videoaulas através do menu 'Portal' e depois selecionar a disciplina e o tópico desejado. Os vídeos estão disponíveis para streaming e também para download em dispositivos móveis através do nosso aplicativo.",
    category: "Conteúdo",
    tags: ["videoaulas", "acesso", "conteúdo"],
  },
  {
    id: "2",
    question: "Como recupero minha senha?",
    answer: "Para recuperar sua senha, clique em 'Esqueci minha senha' na tela de login. Um e-mail será enviado para o endereço cadastrado com instruções para criar uma nova senha. Verifique também sua caixa de spam se não encontrar o e-mail na caixa de entrada.",
    category: "Conta",
    tags: ["senha", "login", "recuperação"],
  },
  {
    id: "3",
    question: "Posso acessar a plataforma de qualquer dispositivo?",
    answer: "Sim! Nossa plataforma é responsiva e pode ser acessada de computadores, tablets e smartphones. Além disso, temos aplicativos disponíveis para iOS e Android que permitem acesso offline aos conteúdos baixados.",
    category: "Acesso",
    tags: ["dispositivos", "acesso", "mobile"],
  },
  {
    id: "4",
    question: "Como faço para enviar dúvidas aos professores?",
    answer: "Você pode enviar dúvidas aos professores de duas formas: (1) Através do fórum de discussão disponível em cada aula, onde outros alunos também podem contribuir; (2) Pelo sistema de mensagens diretas, acessando o perfil do professor e clicando em 'Enviar Mensagem'.",
    category: "Comunicação",
    tags: ["dúvidas", "professores", "comunicação"],
  },
  {
    id: "5",
    question: "Quanto tempo tenho para concluir os cursos?",
    answer: "O tempo para conclusão dos cursos varia de acordo com seu plano de assinatura. Assinantes do plano básico têm acesso por 6 meses, enquanto assinantes do plano premium têm acesso por tempo ilimitado enquanto a assinatura estiver ativa.",
    category: "Cursos",
    tags: ["prazo", "conclusão", "acesso"],
  }
];

const defaultSuggestionItems: SuggestionItem[] = [
  {
    id: "1",
    title: "Adicionar modo escuro",
    description: "Seria ótimo ter um modo escuro para estudar à noite sem cansar a vista.",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    status: "implemented",
    votes: 127,
    userVoted: true,
  },
  {
    id: "2",
    title: "Permitir download de apostilas",
    description: "Gostaria de poder baixar as apostilas em PDF para estudar offline.",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: "under-review",
    votes: 84,
    userVoted: false,
  },
  {
    id: "3",
    title: "Adicionar notificações por email",
    description: "Receber notificações por email quando novos conteúdos forem adicionados.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: "pending",
    votes: 32,
    userVoted: false,
  },
];

const priorityClasses = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const statusClasses = {
  open: "bg-blue-100 text-blue-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  pending: "bg-purple-100 text-purple-800",
  "under-review": "bg-orange-100 text-orange-800",
  implemented: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const FloatingChatSupport: React.FC = () => {
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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(".scrollbar-container");
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim() === "") return;

    const newMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
      read: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    // Simulate typing indicator
    setIsTyping(true);
    
    // Simulate response after delay
    setTimeout(() => {
      const responseMessage: Message = {
        id: `support-${Date.now()}`,
        text: getAIResponse(inputMessage),
        sender: "support",
        timestamp: new Date(),
        read: true,
      };
      setMessages((prev) => [...prev, responseMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (query: string): string => {
    // Simple AI response logic
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("olá") || lowerQuery.includes("oi") || lowerQuery.includes("bom dia") || lowerQuery.includes("boa tarde") || lowerQuery.includes("boa noite")) {
      return `Olá ${userName}! Como posso ajudar você hoje?`;
    }
    
    if (lowerQuery.includes("ajuda") || lowerQuery.includes("como funciona")) {
      return "Posso ajudar com dúvidas sobre a plataforma, problemas técnicos, ou direcionar você para os recursos corretos. Basta descrever o que você precisa!";
    }
    
    if (lowerQuery.includes("senha") || lowerQuery.includes("login")) {
      return "Para problemas de senha, você pode usar a opção 'Esqueci minha senha' na tela de login ou criar um ticket de suporte para que nossa equipe possa ajudar.";
    }
    
    if (lowerQuery.includes("curso") || lowerQuery.includes("aula")) {
      return "Você pode acessar todos os cursos e aulas através do Portal. Se estiver com dificuldade para encontrar um conteúdo específico, me informe o nome do curso ou disciplina para que eu possa orientá-lo melhor.";
    }
    
    if (lowerQuery.includes("pagamento") || lowerQuery.includes("assinatura") || lowerQuery.includes("plano")) {
      return "Para questões relacionadas a pagamentos ou assinatura, recomendo acessar a seção 'Minha Conta' ou criar um ticket de suporte para atendimento personalizado sobre sua situação específica.";
    }
    
    return "Entendi sua mensagem. Nossa equipe de suporte está analisando e retornará em breve com uma resposta mais detalhada. Há algo mais específico em que posso tentar ajudar enquanto isso?";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    setIsStartingNewChat(false);
    setMessages([
      {
        id: `support-${Date.now()}`,
        text: `Olá ${userName}! Como posso ajudar você hoje?`,
        sender: "support",
        timestamp: new Date(),
        read: true,
      },
    ]);
    setActiveTab("chat");
  };

  const createNewTicket = () => {
    if (newTicket.title.trim() === "" || newTicket.description.trim() === "") {
      toast({
        title: "Campos incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const ticket: Ticket = {
      id: `ticket-${Date.now()}`,
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
      description: "Seu ticket foi criado com sucesso. Acompanhe o status na aba de tickets.",
    });
  };

  const createNewSuggestion = () => {
    if (newSuggestion.title.trim() === "" || newSuggestion.description.trim() === "") {
      toast({
        title: "Campos incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const suggestion: SuggestionItem = {
      id: `suggestion-${Date.now()}`,
      title: newSuggestion.title,
      description: newSuggestion.description,
      createdAt: new Date(),
      status: "pending",
      votes: 1,
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
      description: "Sua sugestão foi enviada com sucesso. Agradecemos por contribuir para a melhoria da plataforma!",
    });
  };

  const toggleSuggestionVote = (id: string) => {
    setSuggestions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const userVoted = !item.userVoted;
          return {
            ...item,
            votes: userVoted ? item.votes + 1 : item.votes - 1,
            userVoted,
          };
        }
        return item;
      }),
    );
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Render chat content
  const renderChatContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <h3 className="font-medium text-sm">Chat de Suporte</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsStartingNewChat(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Horário de atendimento: Segunda a Sexta, 8h às 18h
        </div>
      </div>

      {isStartingNewChat ? (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <h3 className="text-lg font-semibold mb-2">Iniciar nova conversa?</h3>
          <p className="text-sm text-center text-muted-foreground mb-4">
            Isso apagará a conversa atual. Você tem certeza que deseja continuar?
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsStartingNewChat(false)}>
              Cancelar
            </Button>
            <Button onClick={startNewChat}>Iniciar nova conversa</Button>
          </div>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 p-3 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "support" && (
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                      <Avatar>
                        <AvatarImage src="/images/tempo-image-20250329T044440497Z.png" />
                        <AvatarFallback className="bg-orange-100 text-orange-600">
                          CS
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg px-3 py-2 break-words",
                      message.sender === "user"
                        ? "bg-orange-500 text-white"
                        : "bg-muted",
                    )}
                  >
                    <div className="text-sm">{message.text}</div>
                    <div className="text-xs opacity-70 mt-1 text-right">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {message.sender === "user" && (
                    <div className="w-8 h-8 rounded-full overflow-hidden ml-2 flex-shrink-0">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                    <Avatar>
                      <AvatarImage src="/images/tempo-image-20250329T044440497Z.png" />
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        CS
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="bg-muted p-3 rounded-lg max-w-[75%] chat-message-typing">
                    <div className="flex space-x-2 items-center">
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "100ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "200ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-3 border-t bg-background">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Digite sua mensagem..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={inputMessage.trim() === ""}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );

  // Render tickets content
  const renderTicketsContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <TicketIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <h3 className="font-medium text-sm">Meus Tickets</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsCreatingTicket(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tickets..."
            className="pl-8 h-8 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isCreatingTicket ? (
        <div className="p-3 overflow-y-auto">
          <div className="mb-3">
            <Button
              variant="ghost"
              size="sm"
              className="mb-2"
              onClick={() => setIsCreatingTicket(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
            <h3 className="text-lg font-semibold">Novo Ticket</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Título <span className="text-red-500">*</span>
              </label>
              <Input
                value={newTicket.title}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, title: e.target.value })
                }
                placeholder="Descreva brevemente o problema"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Descrição <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={newTicket.description}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, description: e.target.value })
                }
                placeholder="Forneça detalhes sobre o problema"
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Categoria</label>
              <select
                className="w-full p-2 rounded-md border border-input bg-background"
                value={newTicket.category}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, category: e.target.value })
                }
              >
                <option value="Acesso a Conteúdo">Acesso a Conteúdo</option>
                <option value="Problemas Técnicos">Problemas Técnicos</option>
                <option value="Faturamento">Faturamento</option>
                <option value="Dúvidas Gerais">Dúvidas Gerais</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Prioridade</label>
              <select
                className="w-full p-2 rounded-md border border-input bg-background"
                value={newTicket.priority}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    priority: e.target.value as "low" | "medium" | "high",
                  })
                }
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <Button
              className="w-full"
              onClick={createNewTicket}
              disabled={!newTicket.title || !newTicket.description}
            >
              Criar Ticket
            </Button>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-3 space-y-3">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <Card key={ticket.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{ticket.title}</h4>
                      <Badge
                        className={cn(
                          "text-xs",
                          statusClasses[ticket.status] || "bg-gray-100",
                        )}
                      >
                        {ticket.status === "open"
                          ? "Aberto"
                          : ticket.status === "in-progress"
                            ? "Em andamento"
                            : ticket.status === "resolved"
                              ? "Resolvido"
                              : "Fechado"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "mr-2 text-xs",
                            priorityClasses[ticket.priority] || "bg-gray-100",
                          )}
                        >
                          {ticket.priority === "low"
                            ? "Baixa"
                            : ticket.priority === "medium"
                              ? "Média"
                              : "Alta"}
                        </Badge>
                        {ticket.category}
                      </span>
                      <span>
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <TicketIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <h3 className="font-medium">Nenhum ticket encontrado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? "Nenhum resultado para sua busca"
                    : "Você não possui tickets ativos"}
                </p>
                <Button onClick={() => setIsCreatingTicket(true)}>
                  Criar novo ticket
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  // Render FAQs content
  const renderFaqsContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
        <div className="flex items-center gap-1 mb-2">
          <HelpCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <h3 className="font-medium text-sm">Perguntas Frequentes</h3>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar perguntas..."
            className="pl-8 h-8 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {selectedFaq ? (
        <div className="p-3 overflow-y-auto">
          <Button
            variant="ghost"
            size="sm"
            className="mb-3"
            onClick={() => setSelectedFaq(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>

          <div>
            <h3 className="text-lg font-semibold mb-2">{selectedFaq.question}</h3>
            <Badge className="mb-3">{selectedFaq.category}</Badge>
            <p className="text-sm whitespace-pre-line">{selectedFaq.answer}</p>

            <div className="mt-4 flex flex-wrap gap-1">
              {selectedFaq.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <p className="text-sm text-center mb-2">Esta resposta foi útil?</p>
              <div className="flex justify-center gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() =>
                    toast({
                      title: "Feedback enviado",
                      description: "Obrigado pelo seu feedback positivo!",
                    })
                  }
                >
                  <ThumbsUp className="h-4 w-4" /> Sim
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => {
                    toast({
                      title: "Feedback enviado",
                      description: "Lamentamos que não tenha sido útil. Vamos melhorar!",
                    });
                    setActiveTab("chat");
                  }}
                >
                  <ThumbsDown className="h-4 w-4" /> Não
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-3 space-y-2">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="p-3 rounded-lg border hover:border-orange-200 cursor-pointer transition-colors"
                  onClick={() => setSelectedFaq(faq)}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{faq.question}</h4>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {faq.category}
                    </Badge>
                    {faq.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs text-muted-foreground"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {faq.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        +{faq.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <h3 className="font-medium">Nenhuma pergunta encontrada</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? "Nenhum resultado para sua busca"
                    : "Tente uma busca diferente ou entre em contato pelo chat"}
                </p>
                <Button onClick={() => setActiveTab("chat")}>
                  Ir para o Chat de Suporte
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  // Render suggestions content
  const renderSuggestionsContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <Lightbulb className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <h3 className="font-medium text-sm">Sugestões</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsCreatingSuggestion(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar sugestões..."
            className="pl-8 h-8 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isCreatingSuggestion ? (
        <div className="p-3 overflow-y-auto">
          <div className="mb-3">
            <Button
              variant="ghost"
              size="sm"
              className="mb-2"
              onClick={() => setIsCreatingSuggestion(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
            <h3 className="text-lg font-semibold">Nova Sugestão</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Título <span className="text-red-500">*</span>
              </label>
              <Input
                value={newSuggestion.title}
                onChange={(e) =>
                  setNewSuggestion({ ...newSuggestion, title: e.target.value })
                }
                placeholder="Título da sua sugestão"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Descrição <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={newSuggestion.description}
                onChange={(e) =>
                  setNewSuggestion({
                    ...newSuggestion,
                    description: e.target.value,
                  })
                }
                placeholder="Descreva sua sugestão em detalhes"
                rows={4}
              />
            </div>

            <Button
              className="w-full"
              onClick={createNewSuggestion}
              disabled={!newSuggestion.title || !newSuggestion.description}
            >
              Enviar Sugestão
            </Button>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-3 space-y-3">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <Badge
                        className={cn(
                          "text-xs",
                          statusClasses[suggestion.status] || "bg-gray-100",
                        )}
                      >
                        {suggestion.status === "pending"
                          ? "Pendente"
                          : suggestion.status === "under-review"
                            ? "Em análise"
                            : suggestion.status === "implemented"
                              ? "Implementado"
                              : "Rejeitado"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {suggestion.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {new Date(suggestion.createdAt).toLocaleDateString()}
                      </span>
                      <Button
                        variant={suggestion.userVoted ? "default" : "outline"}
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => toggleSuggestionVote(suggestion.id)}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        {suggestion.votes}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <h3 className="font-medium">Nenhuma sugestão encontrada</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? "Nenhum resultado para sua busca"
                    : "Seja o primeiro a sugerir uma melhoria!"}
                </p>
                <Button onClick={() => setIsCreatingSuggestion(true)}>
                  Criar nova sugestão
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  const renderChatHistoryContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <h3 className="font-medium text-sm">Histórico de Conversas</h3>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Conversas anteriores
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-3 overflow-y-auto custom-scrollbar">
        <div className="space-y-2">
          {/* Placeholder for chat history - would be populated from the backend in a real app */}
          <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-medium text-sm">Problemas com pagamento</h4>
              <span className="text-xs text-muted-foreground">10/05/2023</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              Última mensagem: Seu problema foi resolvido com sucesso...
            </p>
          </div>
          
          <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-medium text-sm">Dúvida sobre material</h4>
              <span className="text-xs text-muted-foreground">28/04/2023</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              Última mensagem: O material está disponível na seção...
            </p>
          </div>
          
          <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-medium text-sm">Acesso ao curso</h4>
              <span className="text-xs text-muted-foreground">15/04/2023</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              Última mensagem: Seu acesso foi liberado com sucesso...
            </p>
          </div>
          
          <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-medium text-sm">Problema técnico</h4>
              <span className="text-xs text-muted-foreground">02/04/2023</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              Última mensagem: Tente limpar o cache do navegador e...
            </p>
          </div>
          
          <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-medium text-sm">Recuperação de senha</h4>
              <span className="text-xs text-muted-foreground">20/03/2023</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              Última mensagem: Enviamos um email com as instruções...
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
            isOpen
              ? "bg-red-500 hover:bg-red-600 rotate-90"
              : theme === "dark"
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-orange-500 hover:bg-orange-600",
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
            <X className="h-6 w-6" />
          ) : (
            <MessageSquare className="h-6 w-6" />
          )}
        </Button>
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-40 rounded-2xl shadow-xl transition-all duration-300 overflow-hidden",
            isExpanded
              ? "inset-4"
              : "bottom-24 right-6 w-80 h-[32rem] max-h-[calc(100vh-150px)]",
          )}
        >
          <div className="flex flex-col h-full bg-background border">
            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-col h-full"
            >
              <div className="border-b">
                <TabsList className="w-full h-auto bg-transparent p-0">
                  <TabsTrigger
                    value="chat"
                    className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 h-10"
                  >
                    Chat
                  </TabsTrigger>
                  <TabsTrigger
                    value="tickets"
                    className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 h-10"
                  >
                    Tickets
                  </TabsTrigger>
                  <TabsTrigger
                    value="faqs"
                    className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 h-10"
                  >
                    FAQs
                  </TabsTrigger>
                  <TabsTrigger
                    value="suggestions"
                    className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 h-10"
                  >
                    Sugestões
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="chat" className="flex-1 m-0 outline-none">
                {renderChatContent()}
              </TabsContent>
              <TabsContent value="tickets" className="flex-1 m-0 outline-none">
                {renderTicketsContent()}
              </TabsContent>
              <TabsContent value="faqs" className="flex-1 m-0 outline-none">
                {renderFaqsContent()}
              </TabsContent>
              <TabsContent
                value="suggestions"
                className="flex-1 m-0 outline-none"
              >
                {renderSuggestionsContent()}
              </TabsContent>
              <TabsContent
                value="history"
                className="flex-1 m-0 outline-none"
              >
                {renderChatHistoryContent()}
              </TabsContent>
            </Tabs>

            {/* Expand/Collapse Toggle */}
            <div className="border-t p-1 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Minimizar" : "Expandir"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatSupport;
