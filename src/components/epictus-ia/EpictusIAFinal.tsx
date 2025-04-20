import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import ModoExploracaoInterface from "./ModoExploracaoInterface";
import ResumosInterface from "./ResumosInterface";
import DesempenhoInterface from "./DesempenhoInterface";
import PlanoEstudosInterface from "./PlanoEstudosInterface";
import {
  Brain,
  Send,
  BookOpen,
  FileText,
  BarChart3,
  Compass,
  MessageSquare,
  Sparkles,
  Clock,
  Settings,
  Paperclip,
  Smile,
  Mic,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  Trash,
  RefreshCw,
  File,
  Image,
  Map,
  PenTool,
  Download,
  Share2,
  Plus,
  Star,
  Zap,
  Lightbulb,
  Target,
  Award,
  Bookmark,
  BookMarked,
  Filter,
  Save,
  Edit,
  Bell,
  Maximize2,
  Minimize2,
  X,
  ExternalLink,
} from "lucide-react";

export default function EpictusIAFinal() {
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [inputMessage, setInputMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(50);
  const [messageTheme, setMessageTheme] = useState("default");
  const [fontSizePreference, setFontSizePreference] = useState("medium");
  const [autoSaveHistory, setAutoSaveHistory] = useState(true);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(true);
  const [aiIntelligenceLevel, setAiIntelligenceLevel] = useState("normal");
  const [editingMessage, setEditingMessage] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      content:
        "Olá! Sou o Epictus IA, seu assistente de estudos pessoal. Como posso ajudar você hoje?",
      timestamp: new Date(Date.now() - 60000),
    },
    {
      id: 2,
      sender: "user",
      content: "Crie um plano de estudos para o ENEM",
      timestamp: new Date(Date.now() - 30000),
    },
    {
      id: 3,
      sender: "ai",
      content: "Estou processando sua solicitação. Como posso ajudar mais?",
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const suggestionsScrollRef = useRef(null);

  // Efeito para rolar para o final das mensagens quando uma nova mensagem é adicionada
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Função para reproduzir som de mensagem
  const playMessageSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.volume = soundVolume / 100;
      audioRef.current.currentTime = 0; // Reset audio to start
      audioRef.current
        .play()
        .catch((e) => console.log("Erro ao reproduzir som:", e));
    }
  };

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
        playMessageSound();
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
    playMessageSound();

    // Simular resposta da IA (em uma aplicação real, isso seria uma chamada de API)
    setTimeout(() => {
      let responseContent = "";

      // Ajustar resposta com base no nível de inteligência selecionado
      switch (aiIntelligenceLevel) {
        case "basic":
          responseContent =
            "Entendi seu pedido. Aqui está uma resposta simples e direta.";
          break;
        case "advanced":
          responseContent =
            "Analisando sua solicitação em profundidade. Estou elaborando uma resposta detalhada e abrangente, considerando múltiplas perspectivas e nuances do tema.";
          break;
        default: // normal
          responseContent =
            "Estou processando sua solicitação. Como posso ajudar mais?";
      }

      const aiResponse = {
        id: Date.now() + 1,
        sender: "ai",
        content: responseContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);

      // Reproduzir som se estiver habilitado
      playMessageSound();
    }, 1000);
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
    playMessageSound();

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
      playMessageSound();
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

  // Função para alternar entre tela cheia e normal para o chat
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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

  // Sugestões de perguntas rápidas
  const quickSuggestions = [
    "Criar um plano de estudos para o ENEM",
    "Resumir o capítulo sobre termodinâmica",
    "Explicar o teorema de Pitágoras",
    "Gerar exercícios de matemática",
    "Como funciona a fotossíntese?",
    "Quais são os principais eventos da Segunda Guerra Mundial?",
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

  // Últimas interações
  const recentInteractions = [
    {
      title: "Plano de Estudos ENEM",
      preview:
        "Criação de um plano personalizado para o ENEM com foco em ciências da natureza e matemática...",
      timestamp: "Hoje",
      rating: 5,
    },
    {
      title: "Resumo de Física",
      preview:
        "Resumo sobre termodinâmica e leis da física quântica para revisão...",
      timestamp: "Ontem",
      rating: 4,
    },
    {
      title: "Dúvidas de Matemática",
      preview:
        "Resolução de exercícios sobre funções trigonométricas e cálculo diferencial...",
      timestamp: "3 dias atrás",
      rating: 5,
    },
  ];

  return (
    <div className="w-full h-full flex">
      {/* Coluna Esquerda - Chatbot (fixa) */}
      <div
        className={`${isFullscreen ? "w-full" : "w-[400px]"} h-full flex flex-col bg-[#0A1628] text-white border-r border-[#29335C]/30`}
      >
        {/* Cabeçalho do Chat */}
        <div className="p-4 border-b border-[#29335C]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Epictus IA</h3>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-xs text-gray-300">
                  Seu assistente de estudos
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Botão de Tela Cheia */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-[#29335C]/30 rounded-full"
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
                  className="text-white/70 hover:text-white hover:bg-[#29335C]/30 rounded-full relative"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF6B00] rounded-full"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 bg-[#0A1628] border-[#29335C]/50 text-white"
                align="end"
              >
                <div className="p-4 border-b border-[#29335C]/30">
                  <h3 className="font-semibold text-white">Notificações</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  <div className="p-2">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 mb-2 rounded-lg cursor-pointer hover:bg-[#29335C]/30 ${!notification.read ? "bg-[#FF6B00]/5" : ""}`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-white text-sm">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-400">
                              {notification.time}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-400">
                        Nenhuma notificação
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-2 border-t border-[#29335C]/30">
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
                  className="text-white/70 hover:text-white hover:bg-[#29335C]/30 rounded-full"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 bg-[#0A1628] border-[#29335C]/50 text-white"
                align="end"
              >
                <div className="space-y-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Settings className="h-4 w-4 text-[#FF6B00]" />{" "}
                    Configurações
                  </h3>

                  <div className="space-y-3 pt-2 border-t border-[#29335C]/30">
                    <h4 className="text-sm font-medium text-white/80">
                      Inteligência Artificial
                    </h4>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Nível de Inteligência
                      </Label>
                      <Select
                        value={aiIntelligenceLevel}
                        onValueChange={setAiIntelligenceLevel}
                      >
                        <SelectTrigger className="bg-[#29335C]/50 border-[#29335C]/50 text-white">
                          <SelectValue placeholder="Selecione um nível" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A1628] border-[#29335C]/50 text-white">
                          <SelectItem value="basic">Básico</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="advanced">Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-400">
                        {aiIntelligenceLevel === "basic" &&
                          "Respostas simples e diretas."}
                        {aiIntelligenceLevel === "normal" &&
                          "Equilíbrio entre simplicidade e profundidade."}
                        {aiIntelligenceLevel === "advanced" &&
                          "Respostas detalhadas e abrangentes."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-[#29335C]/30">
                    <h4 className="text-sm font-medium text-white/80">
                      Notificações
                    </h4>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="sound-notifications"
                          className="text-sm font-medium"
                        >
                          Sons de notificação
                        </Label>
                        <p className="text-xs text-gray-400">
                          Ativar sons ao enviar/receber mensagens
                        </p>
                      </div>
                      <Switch
                        id="sound-notifications"
                        checked={soundEnabled}
                        onCheckedChange={setSoundEnabled}
                      />
                    </div>

                    {soundEnabled && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Volume</Label>
                        <div className="flex items-center gap-2">
                          <VolumeX className="h-4 w-4 text-gray-400" />
                          <Slider
                            value={[soundVolume]}
                            onValueChange={(value) => setSoundVolume(value[0])}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <Volume2 className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-2 border-t border-[#29335C]/30">
                    <h4 className="text-sm font-medium text-white/80">
                      Aparência
                    </h4>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Tema das mensagens
                      </Label>
                      <Select
                        value={messageTheme}
                        onValueChange={setMessageTheme}
                      >
                        <SelectTrigger className="bg-[#29335C]/50 border-[#29335C]/50 text-white">
                          <SelectValue placeholder="Selecione um tema" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A1628] border-[#29335C]/50 text-white">
                          <SelectItem value="default">Padrão</SelectItem>
                          <SelectItem value="modern">Moderno</SelectItem>
                          <SelectItem value="compact">Compacto</SelectItem>
                          <SelectItem value="bubble">Bolhas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Tamanho da fonte
                      </Label>
                      <Select
                        value={fontSizePreference}
                        onValueChange={setFontSizePreference}
                      >
                        <SelectTrigger className="bg-[#29335C]/50 border-[#29335C]/50 text-white">
                          <SelectValue placeholder="Selecione um tamanho" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A1628] border-[#29335C]/50 text-white">
                          <SelectItem value="small">Pequeno</SelectItem>
                          <SelectItem value="medium">Médio</SelectItem>
                          <SelectItem value="large">Grande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-[#29335C]/30">
                    <h4 className="text-sm font-medium text-white/80">
                      Preferências
                    </h4>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="auto-save"
                          className="text-sm font-medium"
                        >
                          Salvar histórico automaticamente
                        </Label>
                        <p className="text-xs text-gray-400">
                          Salvar conversas para acesso posterior
                        </p>
                      </div>
                      <Switch
                        id="auto-save"
                        checked={autoSaveHistory}
                        onCheckedChange={setAutoSaveHistory}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="keyboard-shortcuts"
                          className="text-sm font-medium"
                        >
                          Atalhos de teclado
                        </Label>
                        <p className="text-xs text-gray-400">
                          Habilitar atalhos de teclado (Ctrl+Enter para enviar)
                        </p>
                      </div>
                      <Switch
                        id="keyboard-shortcuts"
                        checked={keyboardShortcuts}
                        onCheckedChange={setKeyboardShortcuts}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#29335C]/30 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-[#29335C]/50 hover:bg-[#29335C]/30"
                    >
                      <Trash className="h-4 w-4 mr-1" /> Limpar histórico
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-[#29335C]/50 hover:bg-[#29335C]/30"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" /> Restaurar padrões
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`group max-w-[85%] p-4 rounded-xl ${
                    message.sender === "user"
                      ? "bg-[#FF6B00] text-white"
                      : "bg-[#29335C]/50 text-white"
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
                        <X className="h-3 w-3 text-white" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Sugestões de Perguntas com rolagem horizontal */}
        <div className="p-4 border-t border-[#29335C]/30 relative">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full flex-shrink-0 text-white/60 hover:text-white hover:bg-[#29335C]/30"
              onClick={() => scrollSuggestions("left")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div
              ref={suggestionsScrollRef}
              className="flex overflow-x-auto gap-2 py-1 px-2 flex-1 custom-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {quickSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-[#29335C]/50 text-white rounded-full px-4 py-2 text-sm cursor-pointer hover:bg-[#29335C]/70 transition-colors whitespace-nowrap flex-shrink-0"
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
              className="h-8 w-8 rounded-full flex-shrink-0 text-white/60 hover:text-white hover:bg-[#29335C]/30"
              onClick={() => scrollSuggestions("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Campo de Entrada */}
        <div className="p-4 border-t border-[#29335C]/30">
          {editingMessage ? (
            <div className="mb-2 p-2 bg-[#FF6B00]/10 rounded-lg flex justify-between items-center">
              <span className="text-sm text-white">Editando mensagem</span>
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

          <div className="flex items-center gap-2 bg-[#29335C]/50 rounded-xl p-3">
            {/* Input de arquivo oculto */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />

            {/* Botão para anexar arquivos */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-[#29335C]/30 rounded-full"
              onClick={handleFileButtonClick}
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <Input
              placeholder="Digite sua mensagem..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-transparent border-none text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-10"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            {/* Botão de emoji */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-[#29335C]/30 rounded-full"
            >
              <Smile className="h-5 w-5" />
            </Button>

            {/* Botão de áudio */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-[#29335C]/30 rounded-full"
            >
              <Mic className="h-5 w-5" />
            </Button>

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
        <div className="flex-1 flex flex-col bg-[#0A1628] text-white">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            {/* Navegação Superior */}
            <div className="p-4 border-b border-[#29335C]/30 flex items-center">
              <TabsList className="bg-transparent">
                <TabsTrigger
                  value="visao-geral"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-white/60 hover:text-white hover:bg-[#29335C]/30 px-4 py-2"
                >
                  <Brain className="h-4 w-4 mr-2" /> Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value="plano-estudos"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-white/60 hover:text-white hover:bg-[#29335C]/30 px-4 py-2"
                >
                  <BookOpen className="h-4 w-4 mr-2" /> Plano de Estudos
                </TabsTrigger>
                <TabsTrigger
                  value="resumos"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-white/60 hover:text-white hover:bg-[#29335C]/30 px-4 py-2"
                >
                  <FileText className="h-4 w-4 mr-2" /> Resumos
                </TabsTrigger>
                <TabsTrigger
                  value="desempenho"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-white/60 hover:text-white hover:bg-[#29335C]/30 px-4 py-2"
                >
                  <BarChart3 className="h-4 w-4 mr-2" /> Desempenho
                </TabsTrigger>
                <TabsTrigger
                  value="modo-exploracao"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-white/60 hover:text-white hover:bg-[#29335C]/30 px-4 py-2"
                >
                  <Compass className="h-4 w-4 mr-2" /> Modo Exploração
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <TabsContent value="visao-geral" className="h-full">
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Olá, João Silva!</h2>
                    <Badge className="bg-[#FF6B00] text-white">
                      <Sparkles className="h-3.5 w-3.5 mr-1" /> Versão Premium
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Estatísticas de Uso */}
                    <div className="bg-[#29335C]/30 rounded-xl p-6 border border-[#29335C]/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-[#FF6B00]" />{" "}
                          Estatísticas de Uso
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#29335C]/30 p-4 rounded-lg">
                          <p className="text-sm text-white/60 mb-1">
                            Tempo de Estudo
                          </p>
                          <p className="text-2xl font-bold">42h 30min</p>
                          <p className="text-xs text-green-500 mt-1">
                            +15% que semana passada
                          </p>
                        </div>
                        <div className="bg-[#29335C]/30 p-4 rounded-lg">
                          <p className="text-sm text-white/60 mb-1">
                            Tarefas Concluídas
                          </p>
                          <p className="text-2xl font-bold">28/35</p>
                          <p className="text-xs text-green-500 mt-1">
                            80% concluídas
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Ferramentas da IA */}
                    <div className="bg-[#29335C]/30 rounded-xl p-6 border border-[#29335C]/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <Brain className="h-5 w-5 text-[#FF6B00]" />{" "}
                          Ferramentas da IA
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Button className="bg-[#FF6B00]/20 hover:bg-[#FF6B00]/30 text-[#FF6B00] justify-start h-auto py-3 px-4">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">
                              Plano de Estudos
                            </span>
                            <span className="text-xs text-[#FF6B00]/80">
                              Personalize seu plano
                            </span>
                          </div>
                        </Button>
                        <Button className="bg-[#29335C]/50 hover:bg-[#29335C]/70 text-white justify-start h-auto py-3 px-4">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Resumos</span>
                            <span className="text-xs text-white/60">
                              Resumos inteligentes
                            </span>
                          </div>
                        </Button>
                        <Button className="bg-[#FF6B00]/20 hover:bg-[#FF6B00]/30 text-[#FF6B00] justify-start h-auto py-3 px-4">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Mapa Mental</span>
                            <span className="text-xs text-[#FF6B00]/80">
                              Visualize conceitos
                            </span>
                          </div>
                        </Button>
                        <Button className="bg-[#29335C]/50 hover:bg-[#29335C]/70 text-white justify-start h-auto py-3 px-4">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Exercícios</span>
                            <span className="text-xs text-white/60">
                              Pratique o conteúdo
                            </span>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Insights Personalizados */}
                  <div className="bg-gradient-to-r from-[#29335C] to-[#0A1628] p-6 rounded-xl border border-[#29335C]/50 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                          Insights Personalizados{" "}
                          <Sparkles className="h-4 w-4 text-[#FF6B00]" />
                        </h3>
                        <p className="text-white/80 mb-4">
                          Com base na sua análise de desempenho, identificamos
                          que você tem um desempenho melhor em Matemática e
                          Biologia, mas pode melhorar em Química. Recomendamos
                          dedicar mais tempo aos estudos de Química,
                          especialmente nos tópicos de Química Orgânica.
                        </p>
                        <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                          Ver Recomendações Detalhadas{" "}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Módulos Principais */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">Módulos Principais</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#FF6B00] border-[#FF6B00]/20 hover:bg-[#FF6B00]/10"
                      >
                        <Filter className="h-4 w-4 mr-1" /> Filtrar
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        {
                          title: "Desempenho",
                          description: "Análise do seu progresso",
                          icon: (
                            <BarChart3 className="h-6 w-6 text-[#FF6B00]" />
                          ),
                        },
                        {
                          title: "Modo Exploração",
                          description: "Explore novos tópicos",
                          icon: <Compass className="h-6 w-6 text-[#FF6B00]" />,
                        },
                        {
                          title: "Mapas Mentais",
                          description: "Visualize conceitos",
                          icon: <Map className="h-6 w-6 text-[#FF6B00]" />,
                        },
                        {
                          title: "Exercícios",
                          description: "Pratique o conteúdo",
                          icon: <PenTool className="h-6 w-6 text-[#FF6B00]" />,
                        },
                      ].map((module, index) => (
                        <div
                          key={index}
                          className="bg-[#29335C]/30 p-4 rounded-xl border border-[#29335C]/50 hover:border-[#FF6B00]/50 transition-all cursor-pointer"
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
                              {module.icon}
                            </div>
                            <h4 className="font-medium text-white mb-1">
                              {module.title}
                            </h4>
                            <p className="text-xs text-white/60 mb-3">
                              {module.description}
                            </p>
                            <Button
                              variant="ghost"
                              className="text-[#FF6B00] hover:bg-[#FF6B00]/20 w-full"
                            >
                              Acessar <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Últimas Interações */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-[#FF6B00]" />{" "}
                        Últimas Interações
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-white/60 border-[#29335C]/50 hover:bg-[#29335C]/30 h-8"
                        >
                          <Download className="h-3.5 w-3.5 mr-1" /> Exportar
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-[#FF6B00] text-xs flex items-center gap-1 h-8"
                        >
                          Ver Todas <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {recentInteractions.map((interaction, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-[#29335C]/30 hover:bg-[#29335C]/50 rounded-xl transition-colors cursor-pointer border border-[#29335C]/50 hover:border-[#FF6B00]/30"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                              <MessageSquare className="h-6 w-6 text-[#FF6B00]" />
                            </div>
                            <div>
                              <h4 className="font-medium text-white text-base">
                                {interaction.title}
                              </h4>
                              <p className="text-sm text-white/60 line-clamp-1 mt-1">
                                {interaction.preview}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] text-xs">
                              {interaction.timestamp}
                            </Badge>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < interaction.rating ? "text-[#FF6B00]" : "text-gray-600"} mr-0.5`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
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
        ref={audioRef}
        src="/message-sound.mp3"
        preload="auto"
        className="hidden"
      ></audio>
    </div>
  );
}
