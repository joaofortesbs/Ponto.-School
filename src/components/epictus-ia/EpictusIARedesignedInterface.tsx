import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ModoExploracaoInterface from "./ModoExploracaoInterface";
import ResumosInterface from "./ResumosInterface";
import DesempenhoInterface from "./DesempenhoInterface";
import PlanoEstudosInterface from "./PlanoEstudosInterface";
import {
  Brain,
  FileText,
  BookOpen,
  BarChart3,
  MessageSquare,
  Sparkles,
  Send,
  Clock,
  ChevronRight,
  Search,
  PlusCircle,
  Compass,
  Zap,
  Settings,
  X,
  PenTool,
  Map,
  Lightbulb,
  HelpCircle,
  Paperclip,
  Smile,
  Mic,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Users,
  Star,
  Bell,
  Download,
  Filter,
  Maximize2,
  Minimize2,
  Image,
  File,
  Volume2,
  VolumeX,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";

export default function EpictusIARedesignedInterface() {
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [inputMessage, setInputMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [editingMessage, setEditingMessage] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      content:
        "Olá! Sou o Epictus IA, seu assistente de estudos pessoal. Como posso ajudar você hoje?",
      timestamp: new Date(),
    },
  ]);

  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const suggestionsScrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sugestões de perguntas rápidas
  const quickSuggestions = [
    "Criar um plano de estudos para o ENEM",
    "Resumir o capítulo sobre termodinâmica",
    "Explicar o teorema de Pitágoras",
    "Gerar exercícios de matemática",
    "Como funciona a fotossíntese?",
    "Quais são os principais eventos da Segunda Guerra Mundial?",
    "Ajude-me com equações do segundo grau",
    "Crie um resumo sobre o Romantismo na literatura",
  ];

  // Funções rápidas que o usuário pode acessar
  const quickActions = [
    {
      name: "Plano de Estudos",
      icon: <BookOpen className="h-4 w-4" />,
      action: () => setActiveTab("plano-estudos"),
    },
    {
      name: "Resumir Texto",
      icon: <FileText className="h-4 w-4" />,
      action: () => setActiveTab("resumos"),
    },
    {
      name: "Mapa Mental",
      icon: <Map className="h-4 w-4" />,
      action: () => alert("Criando mapa mental..."),
    },
    {
      name: "Exercícios",
      icon: <PenTool className="h-4 w-4" />,
      action: () => alert("Gerando exercícios..."),
    },
  ];

  // Histórico de conversas recentes
  const recentConversations = [
    {
      title: "Plano de Estudos ENEM",
      preview:
        "Criação de um plano personalizado para o ENEM com foco em ciências da natureza e matemática...",
      timestamp: "Hoje",
    },
    {
      title: "Resumo de Física",
      preview:
        "Resumo sobre termodinâmica e leis da física quântica para revisão...",
      timestamp: "Ontem",
    },
    {
      title: "Dúvidas de Matemática",
      preview:
        "Resolução de exercícios sobre funções trigonométricas e cálculo diferencial...",
      timestamp: "3 dias atrás",
    },
  ];

  // Notificações
  const notifications = [
    {
      id: 1,
      title: "Novo plano de estudos disponível",
      time: "Agora",
      read: false,
    },
    {
      id: 2,
      title: "Lembrete: Revisar matemática",
      time: "2h atrás",
      read: false,
    },
    { id: 3, title: "Seu resumo foi gerado", time: "Ontem", read: true },
  ];

  // Efeito para rolar para o final das mensagens quando uma nova mensagem é adicionada
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Função para enviar mensagem
  const sendMessage = () => {
    if (inputMessage.trim() === "") return;

    // Se estiver editando uma mensagem
    if (editingMessage) {
      const updatedMessages = messages.map((msg) =>
        msg.id === editingMessage.id
          ? { ...msg, content: inputMessage, isEdited: true }
          : msg,
      );

      setMessages(updatedMessages);
      setEditingMessage(null);
      setInputMessage("");

      // Simular resposta da IA para a mensagem editada
      setTimeout(() => {
        const aiResponse = {
          id: Date.now(),
          sender: "ai",
          content:
            "Entendi sua correção. Baseado na sua mensagem editada, posso ajudar melhor agora.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);

        // Reproduzir som se estiver habilitado
        if (soundEnabled) {
          playMessageSound();
        }
      }, 1000);

      return;
    }

    // Adicionar mensagem do usuário
    const newMessage = {
      id: Date.now(),
      sender: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");

    // Reproduzir som se estiver habilitado
    if (soundEnabled) {
      playMessageSound();
    }

    // Simular resposta da IA (em uma aplicação real, isso seria uma chamada de API)
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        sender: "ai",
        content: "Estou processando sua solicitação. Como posso ajudar mais?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);

      // Reproduzir som se estiver habilitado
      if (soundEnabled) {
        playMessageSound();
      }
    }, 1000);
  };

  // Função para reproduzir som de mensagem
  const playMessageSound = () => {
    const audio = new Audio("/message-sound.mp3");
    audio.volume = 0.5;
    audio.play().catch((e) => console.log("Erro ao reproduzir som:", e));
  };

  // Função para alternar entre tela cheia e normal para o chat
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Função para abrir o seletor de arquivos
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  // Função para processar o arquivo selecionado
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Aqui você pode implementar o upload do arquivo
    // Por enquanto, apenas mostraremos uma mensagem com o nome do arquivo
    const fileMessage = {
      id: Date.now(),
      sender: "user",
      content: `[Arquivo anexado: ${file.name}]`,
      timestamp: new Date(),
      isFile: true,
      fileName: file.name,
      fileType: file.type,
    };

    setMessages([...messages, fileMessage]);

    // Limpar o input de arquivo
    e.target.value = null;

    // Reproduzir som se estiver habilitado
    if (soundEnabled) {
      playMessageSound();
    }

    // Simular resposta da IA
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        sender: "ai",
        content: `Recebi seu arquivo "${file.name}". Estou analisando o conteúdo...`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);

      // Reproduzir som se estiver habilitado
      if (soundEnabled) {
        playMessageSound();
      }
    }, 1000);
  };

  // Função para editar uma mensagem
  const startEditingMessage = (message) => {
    if (message.sender === "user" && !message.isFile) {
      setEditingMessage(message);
      setInputMessage(message.content);
    }
  };

  // Função para cancelar a edição
  const cancelEditing = () => {
    setEditingMessage(null);
    setInputMessage("");
  };

  // Função para excluir uma mensagem
  const deleteMessage = (messageId) => {
    setMessages(messages.filter((msg) => msg.id !== messageId));
    if (editingMessage && editingMessage.id === messageId) {
      cancelEditing();
    }
  };

  // Função para rolar horizontalmente as sugestões
  const scrollSuggestions = (direction) => {
    if (suggestionsScrollRef.current) {
      const scrollAmount = 200; // pixels a rolar
      if (direction === "left") {
        suggestionsScrollRef.current.scrollBy({
          left: -scrollAmount,
          behavior: "smooth",
        });
      } else {
        suggestionsScrollRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] flex transition-colors duration-300">
      {/* Coluna Esquerda - Chatbot (fixa) */}
      <div
        ref={chatContainerRef}
        className={`${isFullscreen ? "fixed inset-0 z-50" : "w-2/5 sticky top-0 h-screen"} 
                  border-r border-gray-200 dark:border-gray-800 flex flex-col 
                  bg-[#f7f9fa] dark:bg-[#001427] 
                  text-[#29335C] dark:text-white transition-all duration-300`}
      >
        {/* Cabeçalho do Chat */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FF6B00] flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
                Epictus IA
              </h3>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-xs text-[#64748B] dark:text-gray-300">
                  Seu assistente de estudos
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#64748B] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-full"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </Button>

            {/* Botão de Notificações com Popover */}
            <Popover
              open={showNotifications}
              onOpenChange={setShowNotifications}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#64748B] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-full relative"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF6B00] rounded-full"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-[#29335C] dark:text-white">
                    Notificações
                  </h3>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="p-2">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 mb-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#29335C]/20 ${!notification.read ? "bg-[#FF6B00]/5" : ""}`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-[#29335C] dark:text-white text-sm">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-[#64748B] dark:text-gray-400">
                              {notification.time}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-[#64748B] dark:text-gray-400">
                        Nenhuma notificação
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[#FF6B00]"
                  >
                    Marcar todas como lidas
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Botão de Configurações com Popover */}
            <Popover open={showSettings} onOpenChange={setShowSettings}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#64748B] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-full"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#29335C] dark:text-white">
                    Configurações
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label
                        htmlFor="sound-notifications"
                        className="text-sm font-medium"
                      >
                        Sons de notificação
                      </Label>
                      <p className="text-xs text-[#64748B] dark:text-gray-400">
                        Ativar sons ao enviar/receber mensagens
                      </p>
                    </div>
                    <Switch
                      id="sound-notifications"
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="outline" size="sm" className="w-full">
                      Limpar histórico de conversas
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Área de Mensagens */}
        <ScrollArea className="flex-1 p-5">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`group max-w-[85%] p-4 rounded-xl shadow-sm ${
                    message.sender === "user"
                      ? "bg-[#FF6B00] text-white"
                      : "bg-[#29335C] text-white"
                  } relative`}
                >
                  {message.sender === "ai" && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">Epictus IA</span>
                    </div>
                  )}

                  {message.isFile ? (
                    <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg">
                      {message.fileType.startsWith("image/") ? (
                        <Image className="h-5 w-5" />
                      ) : (
                        <File className="h-5 w-5" />
                      )}
                      <span>{message.fileName}</span>
                    </div>
                  ) : (
                    <p className="text-base leading-relaxed">
                      {message.content}
                      {message.isEdited && (
                        <span className="text-xs opacity-70 ml-2">
                          (editado)
                        </span>
                      )}
                    </p>
                  )}

                  <div className="mt-1 text-right">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Opções de mensagem (apenas para mensagens do usuário) */}
                  {message.sender === "user" && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {!message.isFile && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20"
                          onClick={() => startEditingMessage(message)}
                        >
                          <Edit className="h-3 w-3 text-white" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20"
                        onClick={() => deleteMessage(message.id)}
                      >
                        <Trash2 className="h-3 w-3 text-white" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Sugestões de Perguntas com rolagem horizontal */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 relative">
          <p className="text-sm text-[#64748B] dark:text-gray-400 mb-2 font-medium">
            Sugestões:
          </p>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full flex-shrink-0 text-[#64748B] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
              onClick={() => scrollSuggestions("left")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div
              ref={suggestionsScrollRef}
              className="flex overflow-x-auto scrollbar-hide gap-2 py-1 px-2 flex-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {quickSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-[#FF6B00]/20 text-[#29335C] dark:text-white rounded-full px-4 py-2 text-sm cursor-pointer hover:bg-[#FF6B00]/30 transition-colors whitespace-nowrap flex-shrink-0"
                  onClick={() => {
                    setInputMessage(suggestion);
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full flex-shrink-0 text-[#64748B] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
              onClick={() => scrollSuggestions("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="text-[#29335C] dark:text-white hover:bg-[#FF6B00]/10 hover:text-[#FF6B00] flex flex-col items-center gap-2 h-auto py-3 w-full mx-1"
              onClick={action.action}
            >
              <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center">
                {action.icon}
              </div>
              <span className="text-xs font-medium">{action.name}</span>
            </Button>
          ))}
        </div>

        {/* Campo de Entrada */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {editingMessage ? (
            <div className="mb-2 p-2 bg-[#FF6B00]/10 rounded-lg flex justify-between items-center">
              <span className="text-sm text-[#29335C] dark:text-white">
                Editando mensagem
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[#FF6B00] hover:bg-[#FF6B00]/10 p-0 px-2"
                onClick={cancelEditing}
              >
                Cancelar
              </Button>
            </div>
          ) : null}

          <div className="flex items-center gap-2 bg-white dark:bg-[#29335C] rounded-xl p-3 shadow-sm">
            {/* Input de arquivo oculto */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />

            {/* Botão para anexar arquivos */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#64748B] dark:text-gray-300 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-full"
                    onClick={handleFileButtonClick}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Anexar arquivo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Input
              placeholder="Digite sua mensagem..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-transparent border-none text-[#29335C] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-10"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            {/* Botão de emoji */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#64748B] dark:text-gray-300 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-full"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Inserir emoji</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Botão de áudio */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#64748B] dark:text-gray-300 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-full"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Gravar áudio</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Botão de som */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#64748B] dark:text-gray-300 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-full"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? (
                      <Volume2 className="h-5 w-5" />
                    ) : (
                      <VolumeX className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{soundEnabled ? "Desativar sons" : "Ativar sons"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white rounded-full p-2 h-10 w-10 shadow-md"
              onClick={sendMessage}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Coluna Direita - Conteúdo (só mostra se não estiver em tela cheia) */}
      {!isFullscreen && (
        <div className="w-3/5 flex flex-col overflow-y-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <div className="border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 bg-[#f7f9fa] dark:bg-[#001427] z-10">
              <TabsList className="bg-gray-100 dark:bg-[#29335C]/20 p-1 w-full">
                <TabsTrigger
                  value="visao-geral"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-[#64748B] dark:text-white/60 flex items-center gap-1 py-2 px-4 flex-1"
                >
                  <span className="hidden sm:inline">Visão</span> Geral
                </TabsTrigger>
                <TabsTrigger
                  value="plano-estudos"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-[#64748B] dark:text-white/60 flex items-center gap-1 py-2 px-4 flex-1"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Plano</span>
                </TabsTrigger>
                <TabsTrigger
                  value="resumos"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-[#64748B] dark:text-white/60 flex items-center gap-1 py-2 px-4 flex-1"
                >
                  <FileText className="h-4 w-4" />
                  Resumos
                </TabsTrigger>
                <TabsTrigger
                  value="desempenho"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-[#64748B] dark:text-white/60 flex items-center gap-1 py-2 px-4 flex-1"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Desempenho</span>
                  <span className="sm:hidden">Notas</span>
                </TabsTrigger>
                <TabsTrigger
                  value="modo-exploracao"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-[#64748B] dark:text-white/60 flex items-center gap-1 py-2 px-4 flex-1"
                >
                  <Compass className="h-4 w-4" />
                  <span className="hidden sm:inline">Modo Exploração</span>
                  <span className="sm:hidden">Explorar</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="visao-geral" className="h-full">
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-[#29335C] dark:text-white">
                        Olá, João Silva!
                      </h2>
                      <p className="text-[#64748B] dark:text-white/60 mt-1">
                        Bem-vindo ao seu assistente de estudos personalizado
                      </p>
                    </div>
                    <Badge className="bg-[#FF6B00] text-white py-1.5 px-3">
                      <Sparkles className="h-3.5 w-3.5 mr-1" /> Versão Premium
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Estatísticas Rápidas */}
                    <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                      <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-4 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-[#FF6B00]" /> Estatísticas
                        de Uso
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-[#29335C]/20 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Tempo de Estudo
                            </span>
                            <Clock className="h-5 w-5 text-[#FF6B00]" />
                          </div>
                          <p className="text-2xl font-bold text-[#29335C] dark:text-white">
                            42h 30min
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-green-500 flex items-center gap-1 font-medium">
                              <ArrowRight className="h-3 w-3" /> +15% que semana
                              passada
                            </p>
                            <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] text-xs">
                              Esta semana
                            </Badge>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-[#29335C]/20 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Tarefas
                            </span>
                            <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
                          </div>
                          <p className="text-2xl font-bold text-[#29335C] dark:text-white">
                            28/35
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-green-500 flex items-center gap-1 font-medium">
                              <ArrowRight className="h-3 w-3" /> 80% concluídas
                            </p>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                              No prazo
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ferramentas da IA */}
                    <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                      <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-4 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[#FF6B00]" />{" "}
                        Ferramentas da IA
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          className="flex items-center justify-start gap-3 h-auto py-4 border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/50 hover:bg-[#FF6B00]/5 rounded-xl"
                          onClick={() => setActiveTab("plano-estudos")}
                        >
                          <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-[#FF6B00]" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-[#29335C] dark:text-white">
                              Plano de Estudos
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Personalizado para você
                            </p>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center justify-start gap-3 h-auto py-4 border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/50 hover:bg-[#FF6B00]/5 rounded-xl"
                          onClick={() => setActiveTab("resumos")}
                        >
                          <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-[#FF6B00]" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-[#29335C] dark:text-white">
                              Resumos
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Resumos inteligentes
                            </p>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Insights e Recomendações */}
                  <div className="bg-gradient-to-r from-[#001427] to-[#29335C] p-6 rounded-xl text-white shadow-md">
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#FF6B00]/20">
                        <Lightbulb className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                          Insights Personalizados
                          <Sparkles className="h-5 w-5 text-[#FF6B00]" />
                        </h3>
                        <p className="text-white/90 mb-5 text-base leading-relaxed">
                          Com base na sua análise de desempenho, identificamos
                          que você tem um desempenho melhor em Matemática e
                          Biologia, mas pode melhorar em Química. Recomendamos
                          dedicar mais tempo aos estudos de Química Orgânica.
                        </p>
                        <Button className="bg-white text-[#29335C] hover:bg-white/90 shadow-md px-5 py-2.5 rounded-lg font-medium">
                          Ver Recomendações Detalhadas{" "}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Módulos Principais */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
                        Módulos Principais
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#FF6B00] border-[#FF6B00]/20 hover:bg-[#FF6B00]/5 flex items-center gap-1"
                      >
                        <Filter className="h-3.5 w-3.5" /> Filtrar
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div
                        className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#FF6B00]/50 hover:shadow-md transition-all duration-300 cursor-pointer shadow-sm group"
                        onClick={() => setActiveTab("desempenho")}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-14 h-14 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-4 group-hover:bg-[#FF6B00]/20 transition-colors">
                            <BarChart3 className="h-7 w-7 text-[#FF6B00]" />
                          </div>
                          <h3 className="font-semibold text-[#29335C] dark:text-white mb-2 text-base">
                            Desempenho
                          </h3>
                          <p className="text-sm text-[#64748B] dark:text-white/60 mb-4">
                            Análise do seu progresso
                          </p>
                          <Button
                            variant="ghost"
                            className="text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full font-medium"
                          >
                            Acessar
                          </Button>
                        </div>
                      </div>

                      <div
                        className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#FF6B00]/50 hover:shadow-md transition-all duration-300 cursor-pointer shadow-sm group"
                        onClick={() => setActiveTab("modo-exploracao")}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-14 h-14 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-4 group-hover:bg-[#FF6B00]/20 transition-colors">
                            <Compass className="h-7 w-7 text-[#FF6B00]" />
                          </div>
                          <h3 className="font-semibold text-[#29335C] dark:text-white mb-2 text-base">
                            Modo Exploração
                          </h3>
                          <p className="text-sm text-[#64748B] dark:text-white/60 mb-4">
                            Explore temas guiados
                          </p>
                          <Button
                            variant="ghost"
                            className="text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full font-medium"
                          >
                            Acessar
                          </Button>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#FF6B00]/50 hover:shadow-md transition-all duration-300 cursor-pointer shadow-sm group">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-14 h-14 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-4 group-hover:bg-[#FF6B00]/20 transition-colors">
                            <Map className="h-7 w-7 text-[#FF6B00]" />
                          </div>
                          <h3 className="font-semibold text-[#29335C] dark:text-white mb-2 text-base">
                            Mapas Mentais
                          </h3>
                          <p className="text-sm text-[#64748B] dark:text-white/60 mb-4">
                            Visualize conceitos
                          </p>
                          <Button
                            variant="ghost"
                            className="text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full font-medium"
                            onClick={() => alert("Criando mapa mental...")}
                          >
                            Acessar
                          </Button>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#FF6B00]/50 hover:shadow-md transition-all duration-300 cursor-pointer shadow-sm group">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-14 h-14 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-4 group-hover:bg-[#FF6B00]/20 transition-colors">
                            <PenTool className="h-7 w-7 text-[#FF6B00]" />
                          </div>
                          <h3 className="font-semibold text-[#29335C] dark:text-white mb-2 text-base">
                            Exercícios
                          </h3>
                          <p className="text-sm text-[#64748B] dark:text-white/60 mb-4">
                            Pratique o conteúdo
                          </p>
                          <Button
                            variant="ghost"
                            className="text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full font-medium"
                            onClick={() => alert("Gerando exercícios...")}
                          >
                            Acessar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Últimas Interações */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-[#29335C] dark:text-white flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-[#FF6B00]" />{" "}
                        Últimas Interações
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[#64748B] dark:text-white/60 border-gray-200 dark:border-gray-700 h-8"
                          onClick={() => alert("Exportando histórico...")}
                        >
                          <Download className="h-3.5 w-3.5 mr-1" /> Exportar
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-[#FF6B00] text-xs flex items-center gap-1 h-8"
                          onClick={() =>
                            alert("Visualizando todas as interações...")
                          }
                        >
                          Ver Todas <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {recentConversations.map((conversation, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-white dark:bg-[#1E293B] hover:bg-gray-50 dark:hover:bg-[#29335C]/30 rounded-xl transition-colors cursor-pointer border border-gray-200 dark:border-gray-800 hover:border-[#FF6B00]/30 hover:shadow-sm"
                          onClick={() =>
                            alert(`Abrindo conversa: ${conversation.title}`)
                          }
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                              <MessageSquare className="h-6 w-6 text-[#FF6B00]" />
                            </div>
                            <div>
                              <h4 className="font-medium text-[#29335C] dark:text-white text-base">
                                {conversation.title}
                              </h4>
                              <p className="text-sm text-[#64748B] dark:text-white/60 line-clamp-1 mt-1">
                                {conversation.preview}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] text-xs">
                              {conversation.timestamp}
                            </Badge>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-[#FF6B00] mr-0.5" />
                              <Star className="h-3 w-3 text-[#FF6B00] mr-0.5" />
                              <Star className="h-3 w-3 text-[#FF6B00] mr-0.5" />
                              <Star className="h-3 w-3 text-[#FF6B00] mr-0.5" />
                              <Star className="h-3 w-3 text-gray-300 dark:text-gray-600" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ajuda e Suporte */}
                  <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 rounded-full bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="h-7 w-7 text-[#FF6B00]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#29335C] dark:text-white mb-2">
                          Precisa de ajuda?
                        </h3>
                        <p className="text-[#64748B] dark:text-white/70 mb-5 text-base">
                          Não encontrou o que procura? Pergunte diretamente ao
                          Epictus IA ou acesse nosso centro de ajuda para obter
                          suporte.
                        </p>
                        <div className="flex gap-3">
                          <Button
                            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white px-5 py-2.5 rounded-lg font-medium"
                            onClick={() =>
                              alert("Iniciando conversa com Epictus IA...")
                            }
                          >
                            Perguntar ao Epictus IA
                          </Button>
                          <Button
                            variant="outline"
                            className="border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-lg font-medium"
                            onClick={() => alert("Abrindo centro de ajuda...")}
                          >
                            Centro de Ajuda
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="plano-estudos" className="h-full">
                <PlanoEstudosInterface />
              </TabsContent>

              <TabsContent value="resumos" className="h-full">
                <ResumosInterface />
              </TabsContent>

              <TabsContent value="desempenho" className="h-full">
                <DesempenhoInterface />
              </TabsContent>

              <TabsContent value="modo-exploracao" className="h-full">
                <ModoExploracaoInterface />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}

      {/* Arquivo de áudio para o som de mensagem (oculto) */}
      <audio
        id="message-sound"
        src="/message-sound.mp3"
        preload="auto"
        className="hidden"
      ></audio>
    </div>
  );
}
