
import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Search, FileText, Send, PlusCircle, Tag, AlertCircle, CheckCircle, Info, ThumbsUp, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/components/ui/use-toast";

type Message = {
  id: string;
  sender: "user" | "system";
  content: string;
  timestamp: Date;
  read: boolean;
};

type Ticket = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "open" | "in_progress" | "closed" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpfulness: {
    helpful: number;
    unhelpful: number;
  };
};

type SuggestionItem = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "implemented";
  votes: number;
  userVoted: boolean;
  createdAt: Date;
};

const statusColors = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  closed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  pending: "bg-purple-100 text-purple-800",
  approved: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  implemented: "bg-green-100 text-green-800",
};

const defaultMessages: Message[] = [
  {
    id: "1",
    sender: "system",
    content: "Olá! Como posso ajudar você hoje?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: true,
  },
  {
    id: "2",
    sender: "user",
    content: "Estou com dificuldade para acessar meu calendário",
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    read: true,
  },
  {
    id: "3",
    sender: "system",
    content: "Entendi. Você pode descrever exatamente o que está acontecendo quando tenta acessar o calendário?",
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    read: true,
  },
];

const defaultTickets: Ticket[] = [
  {
    id: "1",
    title: "Problema com carregamento da página",
    description: "A página de turmas não está carregando corretamente, fica travada em 50%.",
    category: "Bug",
    status: "in_progress",
    priority: "high",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "2",
    title: "Notificações não aparecem",
    description: "Não estou recebendo notificações de novos eventos no calendário.",
    category: "Funcionalidade",
    status: "open",
    priority: "medium",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
  },
];

const defaultFaqs: FaqItem[] = [
  {
    id: "1",
    question: "Como posso alterar minha senha?",
    answer: "Para alterar sua senha, acesse 'Configurações' no menu do perfil, depois clique em 'Segurança' e em 'Alterar senha'.",
    category: "Conta e Perfil",
    tags: ["senha", "segurança", "perfil"],
    helpfulness: {
      helpful: 45,
      unhelpful: 3,
    },
  },
  {
    id: "2",
    question: "Como adicionar um evento ao meu calendário?",
    answer: "Para adicionar um evento, acesse a seção 'Calendário', clique no botão '+' ou diretamente na data desejada, e preencha os detalhes do evento no formulário que aparecer.",
    category: "Agenda",
    tags: ["calendário", "evento", "agenda"],
    helpfulness: {
      helpful: 38,
      unhelpful: 2,
    },
  },
  {
    id: "3",
    question: "Como posso compartilhar materiais com outros alunos?",
    answer: "Para compartilhar materiais, acesse a página 'Biblioteca', selecione o material que deseja compartilhar, clique no botão 'Compartilhar' e selecione os destinatários ou copie o link para enviar diretamente.",
    category: "Materiais",
    tags: ["compartilhar", "materiais", "biblioteca"],
    helpfulness: {
      helpful: 27,
      unhelpful: 4,
    },
  },
];

const defaultSuggestionItems: SuggestionItem[] = [
  {
    id: "1",
    title: "Modo escuro para a plataforma",
    description: "Seria ótimo ter um modo escuro completo para reduzir o cansaço visual durante estudos noturnos.",
    status: "implemented",
    votes: 128,
    userVoted: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
  },
  {
    id: "2",
    title: "Integração com Google Calendar",
    description: "Gostaria de poder sincronizar eventos do Epictus com meu Google Calendar.",
    status: "approved",
    votes: 89,
    userVoted: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25),
  },
];

const FloatingChatSupport: React.FC = () => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [tickets, setTickets] = useState<Ticket[]>(defaultTickets);
  const [faqs, setFaqs] = useState<FaqItem[]>(defaultFaqs);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(defaultSuggestionItems);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && activeTab === "chat") {
      scrollToBottom();
    }
  }, [messages, isOpen, activeTab]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: `m-${Date.now()}`,
        sender: "user",
        content: inputMessage.trim(),
        timestamp: new Date(),
        read: true,
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputMessage("");
      setIsTyping(true);

      // Simulate system response after delay
      setTimeout(() => {
        const systemMessage: Message = {
          id: `m-${Date.now()}`,
          sender: "system",
          content: "Obrigado por sua mensagem. Nosso time está analisando seu caso e retornará em breve.",
          timestamp: new Date(),
          read: true,
        };
        setMessages((prev) => [...prev, systemMessage]);
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateTicket = () => {
    if (newTicket.title.trim() && newTicket.description.trim()) {
      const ticket: Ticket = {
        id: `t-${Date.now()}`,
        title: newTicket.title,
        description: newTicket.description,
        category: newTicket.category,
        status: "open",
        priority: newTicket.priority as "low" | "medium" | "high",
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
        description: "Seu ticket foi enviado com sucesso!",
        variant: "default",
      });
    }
  };

  const handleCreateSuggestion = () => {
    if (newSuggestion.title.trim() && newSuggestion.description.trim()) {
      const suggestion: SuggestionItem = {
        id: `s-${Date.now()}`,
        title: newSuggestion.title,
        description: newSuggestion.description,
        status: "pending",
        votes: 1,
        userVoted: true,
        createdAt: new Date(),
      };

      setSuggestions((prev) => [suggestion, ...prev]);
      setNewSuggestion({
        title: "",
        description: "",
      });
      setIsCreatingSuggestion(false);

      toast({
        title: "Sugestão enviada",
        description: "Sua sugestão foi registrada com sucesso!",
        variant: "default",
      });
    }
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
      })
    );
  };

  const toggleFaqHelpfulness = (id: string, isHelpful: boolean) => {
    setFaqs((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            helpfulness: {
              ...item.helpfulness,
              helpful: isHelpful ? item.helpfulness.helpful + 1 : item.helpfulness.helpful,
              unhelpful: !isHelpful ? item.helpfulness.unhelpful + 1 : item.helpfulness.unhelpful,
            },
          };
        }
        return item;
      })
    );

    toast({
      title: "Feedback registrado",
      description: "Obrigado por avaliar nossa resposta!",
      variant: "default",
    });
  };

  const startNewChat = () => {
    setMessages([
      {
        id: `m-${Date.now()}`,
        sender: "system",
        content: `Olá ${userName}! Como posso ajudar você hoje?`,
        timestamp: new Date(),
        read: true,
      },
    ]);
    setActiveTab("chat");
    setIsStartingNewChat(false);
  };

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : faqs;

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const renderChatContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">Chat de Suporte</h3>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setIsStartingNewChat(true)}>
              <PlusCircle className="h-3 w-3 mr-1" />
              Novo Chat
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}
            >
              {message.sender === "system" && (
                <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                  <Avatar>
                    <AvatarImage src="/images/support-agent.png" />
                    <AvatarFallback className="bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                      SP
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div
                className={cn(
                  "max-w-[70%] rounded-lg px-3 py-2",
                  message.sender === "user"
                    ? "bg-orange-500 text-white"
                    : "bg-orange-100 dark:bg-orange-900 text-gray-800 dark:text-gray-100"
                )}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70 text-right">{formatTimestamp(message.timestamp)}</p>
              </div>
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
                  <AvatarImage src="/images/support-agent.png" />
                  <AvatarFallback className="bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                    SP
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="max-w-[70%] rounded-lg px-3 py-2 bg-orange-100 dark:bg-orange-900 text-gray-800 dark:text-gray-100">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-150" />
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-300" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleInputKeyPress}
            placeholder="Digite sua mensagem..."
            className="min-h-[60px] resize-none bg-white dark:bg-gray-800"
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="h-full aspect-square bg-orange-500 hover:bg-orange-600"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTicketsContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Meus Tickets</h3>
          </div>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setIsCreatingTicket(true)}>
            <PlusCircle className="h-3 w-3 mr-1" />
            Novo Ticket
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        {isCreatingTicket ? (
          <div className="space-y-3 mb-4">
            <h3 className="text-sm font-medium">Criar Novo Ticket</h3>
            <div className="space-y-2">
              <div>
                <label htmlFor="title" className="text-xs font-medium block mb-1">
                  Título
                </label>
                <Input
                  id="title"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="Descreva brevemente o problema"
                  className="bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label htmlFor="description" className="text-xs font-medium block mb-1">
                  Descrição
                </label>
                <Textarea
                  id="description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Forneça detalhes do problema"
                  className="min-h-[100px] resize-none bg-white dark:bg-gray-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="category" className="text-xs font-medium block mb-1">
                    Categoria
                  </label>
                  <Select
                    value={newTicket.category}
                    onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                  >
                    <SelectTrigger id="category" className="bg-white dark:bg-gray-800">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Acesso a Conteúdo">Acesso a Conteúdo</SelectItem>
                        <SelectItem value="Bug">Bug</SelectItem>
                        <SelectItem value="Funcionalidade">Funcionalidade</SelectItem>
                        <SelectItem value="Conta">Conta</SelectItem>
                        <SelectItem value="Pagamento">Pagamento</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="priority" className="text-xs font-medium block mb-1">
                    Prioridade
                  </label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value) => setNewTicket({ ...newTicket, priority: value as "low" | "medium" | "high" })}
                  >
                    <SelectTrigger id="priority" className="bg-white dark:bg-gray-800">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsCreatingTicket(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateTicket}
                  disabled={!newTicket.title.trim() || !newTicket.description.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Enviar Ticket
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <Card key={ticket.id} className="p-3 hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">{ticket.title}</h4>
                      <Badge className={cn("text-xs", statusColors[ticket.status])}>
                        {ticket.status === "open"
                          ? "Aberto"
                          : ticket.status === "in_progress"
                          ? "Em Andamento"
                          : ticket.status === "closed"
                          ? "Fechado"
                          : "Resolvido"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <span>{ticket.category}</span>
                      </div>
                      <div>
                        {formatDate(ticket.createdAt)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                <h4 className="text-sm font-medium">Nenhum ticket encontrado</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                  Você ainda não criou nenhum ticket de suporte. Clique em "Novo Ticket" para começar.
                </p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  const renderFaqContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <HelpCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Perguntas Frequentes</h3>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar perguntas, respostas ou tags..."
            className="pl-8 h-8 bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        {selectedFaq ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Button variant="ghost" size="sm" onClick={() => setSelectedFaq(null)} className="text-xs h-7 px-2">
                ← Voltar
              </Button>
              <div className="flex items-center space-x-1">
                <Badge variant="outline" className="text-xs">
                  {selectedFaq.category}
                </Badge>
              </div>
            </div>
            <h3 className="text-sm font-medium">{selectedFaq.question}</h3>
            <div className="text-xs text-gray-700 dark:text-gray-300 space-y-2">
              <p>{selectedFaq.answer}</p>
            </div>
            <div className="flex space-x-1 mt-2">
              {selectedFaq.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="border-t pt-3 mt-4">
              <p className="text-xs text-center mb-2">Esta resposta foi útil?</p>
              <div className="flex justify-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 flex items-center"
                  onClick={() => toggleFaqHelpfulness(selectedFaq.id, true)}
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Sim ({selectedFaq.helpfulness.helpful})
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 flex items-center"
                  onClick={() => toggleFaqHelpfulness(selectedFaq.id, false)}
                >
                  <ThumbsUp className="h-3 w-3 mr-1 rotate-180" />
                  Não ({selectedFaq.helpfulness.unhelpful})
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <Card
                  key={faq.id}
                  className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedFaq(faq)}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">{faq.question}</h4>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <Badge variant="outline" className="text-xs">
                        {faq.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{faq.helpfulness.helpful}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                <h4 className="text-sm font-medium">Nenhum resultado encontrado</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                  Não encontramos resultados para sua busca. Tente termos diferentes ou entre em contato conosco.
                </p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  const renderSuggestionsContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">Sugestões e Melhorias</h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => setIsCreatingSuggestion(true)}
          >
            <PlusCircle className="h-3 w-3 mr-1" />
            Nova Sugestão
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        {isCreatingSuggestion ? (
          <div className="space-y-3 mb-4">
            <h3 className="text-sm font-medium">Enviar Nova Sugestão</h3>
            <div className="space-y-2">
              <div>
                <label htmlFor="suggestion-title" className="text-xs font-medium block mb-1">
                  Título
                </label>
                <Input
                  id="suggestion-title"
                  value={newSuggestion.title}
                  onChange={(e) => setNewSuggestion({ ...newSuggestion, title: e.target.value })}
                  placeholder="Descreva brevemente sua sugestão"
                  className="bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label htmlFor="suggestion-description" className="text-xs font-medium block mb-1">
                  Descrição
                </label>
                <Textarea
                  id="suggestion-description"
                  value={newSuggestion.description}
                  onChange={(e) => setNewSuggestion({ ...newSuggestion, description: e.target.value })}
                  placeholder="Descreva sua sugestão em detalhes"
                  className="min-h-[100px] resize-none bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsCreatingSuggestion(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateSuggestion}
                  disabled={!newSuggestion.title.trim() || !newSuggestion.description.trim()}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  Enviar Sugestão
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="p-3 hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">{suggestion.title}</h4>
                      <Badge className={cn("text-xs", statusColors[suggestion.status])}>
                        {suggestion.status === "pending"
                          ? "Pendente"
                          : suggestion.status === "approved"
                          ? "Aprovada"
                          : suggestion.status === "rejected"
                          ? "Rejeitada"
                          : "Implementada"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{suggestion.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <Button
                        size="sm"
                        variant={suggestion.userVoted ? "default" : "outline"}
                        className={cn(
                          "h-6 text-xs flex items-center",
                          suggestion.userVoted && "bg-purple-500 hover:bg-purple-600"
                        )}
                        onClick={() => toggleSuggestionVote(suggestion.id)}
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {suggestion.votes}
                      </Button>
                      <div>{formatDate(suggestion.createdAt)}</div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Info className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                <h4 className="text-sm font-medium">Nenhuma sugestão encontrada</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                  Ainda não há sugestões registradas. Seja o primeiro a contribuir!
                </p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  const renderChatHistoryContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">Histórico de Conversas</h3>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {[1, 2, 3].map((id) => (
            <Card key={id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium">Conversa #{id}</h4>
                  <Badge variant="outline" className="text-xs">
                    {id === 1 ? "Hoje" : id === 2 ? "Ontem" : "3 dias atrás"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {id === 1
                    ? "Obrigado por sua mensagem. Nosso time está analisando seu caso e retornará em breve."
                    : id === 2
                    ? "Entendi. Você pode descrever exatamente o que está acontecendo quando tenta acessar o calendário?"
                    : "Problema resolvido! Obrigado pela paciência. Se precisar de mais ajuda, não hesite em nos contatar."}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    {id === 1 ? (
                      <span className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        Resolvido
                      </span>
                    ) : id === 2 ? (
                      <span className="flex items-center">
                        <AlertCircle className="h-3 w-3 text-amber-500 mr-1" />
                        Em andamento
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        Resolvido
                      </span>
                    )}
                  </div>
                  <div>3 mensagens</div>
                </div>
              </div>
            </Card>
          ))}
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
                ? "bg-orange-600 hover:bg-orange-700"
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
            "fixed z-40 transition-all duration-300 ease-in-out shadow-xl rounded-2xl overflow-hidden",
            isExpanded
              ? "inset-4 lg:inset-10"
              : "bottom-24 right-6 w-80 h-96 lg:w-96 lg:h-[32rem]"
          )}
        >
          <Card className={cn("flex flex-col h-full", isExpanded ? "rounded-xl" : "")}>
            <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/support-logo.png" />
                  <AvatarFallback className="bg-orange-100 text-orange-500 dark:bg-orange-800 dark:text-orange-200">
                    SP
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-medium">Suporte Epictus</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Estamos online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 w-8"
                  aria-label={isExpanded ? "Minimizar" : "Expandir"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    {isExpanded ? (
                      <>
                        <polyline points="4 14 10 14 10 20" />
                        <polyline points="20 10 14 10 14 4" />
                        <line x1="14" y1="10" x2="21" y2="3" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </>
                    ) : (
                      <>
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </>
                    )}
                  </svg>
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-4 p-0 h-10 bg-muted rounded-none">
                <TabsTrigger
                  value="chat"
                  className="data-[state=active]:bg-orange-100 dark:data-[state=active]:bg-orange-900 data-[state=active]:text-orange-800 dark:data-[state=active]:text-orange-200 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span className="text-xs">Chat</span>
                </TabsTrigger>
                <TabsTrigger
                  value="tickets"
                  className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-800 dark:data-[state=active]:text-blue-200 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  <span className="text-xs">Tickets</span>
                </TabsTrigger>
                <TabsTrigger
                  value="faq"
                  className="data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900 data-[state=active]:text-green-800 dark:data-[state=active]:text-green-200 rounded-none border-b-2 border-transparent data-[state=active]:border-green-500"
                >
                  <HelpCircle className="h-4 w-4 mr-1" />
                  <span className="text-xs">FAQ</span>
                </TabsTrigger>
                <TabsTrigger
                  value="suggestions"
                  className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900 data-[state=active]:text-purple-800 dark:data-[state=active]:text-purple-200 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500"
                >
                  <Info className="h-4 w-4 mr-1" />
                  <span className="text-xs">Ideias</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="chat" className="flex-1 m-0 p-0 overflow-hidden">
                {renderChatContent()}
              </TabsContent>
              <TabsContent value="tickets" className="flex-1 m-0 p-0 overflow-hidden">
                {renderTicketsContent()}
              </TabsContent>
              <TabsContent value="faq" className="flex-1 m-0 p-0 overflow-hidden">
                {renderFaqContent()}
              </TabsContent>
              <TabsContent value="suggestions" className="flex-1 m-0 p-0 overflow-hidden">
                {renderSuggestionsContent()}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      )}

      {/* New Chat Confirmation Dialog */}
      {isStartingNewChat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-80 p-4">
            <h3 className="text-sm font-medium mb-2">Iniciar nova conversa?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Iniciar uma nova conversa encerrará a conversa atual. Tem certeza?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsStartingNewChat(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={startNewChat}>
                Iniciar Nova
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default FloatingChatSupport;
