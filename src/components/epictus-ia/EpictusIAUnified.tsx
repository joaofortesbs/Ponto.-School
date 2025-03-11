import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
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
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Loader2,
  Info,
  HelpCircle,
} from "lucide-react";

export default function EpictusIAUnified() {
  const { theme } = useTheme();
  const { toast } = useToast();
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
  const [userMessageSound] = useState(new Audio("/message-sound.mp3"));
  const [aiMessageSound] = useState(new Audio("/message-sound.mp3"));
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [initialMessagesLoaded, setInitialMessagesLoaded] = useState(false);

  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const suggestionsScrollRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Carregar usuário atual
  useEffect(() => {
    const loadUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
        } else {
          // Para desenvolvimento, usar um ID de usuário fictício
          setUserId("dev-user-id");
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        // Para desenvolvimento, usar um ID de usuário fictício
        setUserId("dev-user-id");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Carregar preferências do usuário
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from("epictus_ia_preferences")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          setSoundEnabled(data.sound_enabled);
          setSoundVolume(data.sound_volume);
          setMessageTheme(data.message_theme);
          setFontSizePreference(data.font_size);
          setAutoSaveHistory(data.auto_save_history);
          setKeyboardShortcuts(data.keyboard_shortcuts);
          setAiIntelligenceLevel(data.ai_intelligence_level);
        }
      } catch (error) {
        console.error("Erro ao carregar preferências:", error);
      }
    };

    loadUserPreferences();
  }, [userId]);

  // Carregar histórico de mensagens
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!userId || !autoSaveHistory) return;

      try {
        const { data, error } = await supabase
          .from("epictus_ia_messages")
          .select("*")
          .eq("user_id", userId)
          .order("timestamp", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Converter as mensagens do formato do banco para o formato da aplicação
          const formattedMessages = data.map((msg) => ({
            id: msg.id,
            sender: msg.sender,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            isFile: msg.is_file,
            fileName: msg.file_name,
            fileType: msg.file_type,
            isEdited: msg.is_edited,
          }));

          setMessages(formattedMessages);
        } else {
          // Se não houver mensagens, adicionar mensagem inicial de boas-vindas
          setMessages([
            {
              id: Date.now(),
              sender: "ai",
              content:
                "Olá! Sou o Epictus IA, seu assistente de estudos pessoal. Como posso ajudar você hoje?",
              timestamp: new Date(),
            },
          ]);
        }
        setInitialMessagesLoaded(true);
      } catch (error) {
        console.error("Erro ao carregar histórico de mensagens:", error);
        // Mensagem inicial de fallback
        setMessages([
          {
            id: Date.now(),
            sender: "ai",
            content:
              "Olá! Sou o Epictus IA, seu assistente de estudos pessoal. Como posso ajudar você hoje?",
            timestamp: new Date(),
          },
        ]);
        setInitialMessagesLoaded(true);
      }
    };

    if (userId && !initialMessagesLoaded) {
      loadChatHistory();
    }
  }, [userId, autoSaveHistory, initialMessagesLoaded]);

  // Salvar mensagens quando houver alterações (se autoSaveHistory estiver ativado)
  useEffect(() => {
    const saveChatMessage = async (message) => {
      if (!userId || !autoSaveHistory || !initialMessagesLoaded) return;

      try {
        // Verificar se a mensagem já existe no banco
        const { data: existingMessage, error: checkError } = await supabase
          .from("epictus_ia_messages")
          .select("id")
          .eq("id", message.id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError;
        }

        // Se a mensagem já existe, atualizar
        if (existingMessage) {
          const { error: updateError } = await supabase
            .from("epictus_ia_messages")
            .update({
              content: message.content,
              is_edited: message.isEdited || false,
            })
            .eq("id", message.id);

          if (updateError) throw updateError;
        } else {
          // Se a mensagem não existe, inserir
          const { error: insertError } = await supabase
            .from("epictus_ia_messages")
            .insert({
              id: message.id,
              user_id: userId,
              sender: message.sender,
              content: message.content,
              timestamp: message.timestamp.toISOString(),
              is_file: message.isFile || false,
              file_name: message.fileName || null,
              file_type: message.fileType || null,
              is_edited: message.isEdited || false,
            });

          if (insertError) throw insertError;
        }
      } catch (error) {
        console.error("Erro ao salvar mensagem:", error);
      }
    };

    // Salvar a última mensagem quando houver alterações
    if (messages.length > 0 && initialMessagesLoaded) {
      const lastMessage = messages[messages.length - 1];
      saveChatMessage(lastMessage);
    }
  }, [messages, userId, autoSaveHistory, initialMessagesLoaded]);

  // Salvar preferências do usuário quando houver alterações
  useEffect(() => {
    const saveUserPreferences = async () => {
      if (!userId || isLoading) return;

      try {
        const { data, error: checkError } = await supabase
          .from("epictus_ia_preferences")
          .select("user_id")
          .eq("user_id", userId)
          .single();

        const preferences = {
          sound_enabled: soundEnabled,
          sound_volume: soundVolume,
          message_theme: messageTheme,
          font_size: fontSizePreference,
          auto_save_history: autoSaveHistory,
          keyboard_shortcuts: keyboardShortcuts,
          ai_intelligence_level: aiIntelligenceLevel,
        };

        if (checkError && checkError.code === "PGRST116") {
          // Preferências não existem, inserir
          const { error } = await supabase
            .from("epictus_ia_preferences")
            .insert({
              user_id: userId,
              ...preferences,
            });

          if (error) throw error;
        } else {
          // Preferências existem, atualizar
          const { error } = await supabase
            .from("epictus_ia_preferences")
            .update(preferences)
            .eq("user_id", userId);

          if (error) throw error;
        }
      } catch (error) {
        console.error("Erro ao salvar preferências:", error);
      }
    };

    // Debounce para evitar muitas chamadas ao banco
    const timeoutId = setTimeout(() => {
      if (userId && !isLoading) {
        saveUserPreferences();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [
    userId,
    isLoading,
    soundEnabled,
    soundVolume,
    messageTheme,
    fontSizePreference,
    autoSaveHistory,
    keyboardShortcuts,
    aiIntelligenceLevel,
  ]);

  // Efeito para rolar para o final das mensagens quando uma nova mensagem é adicionada
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Configurar sons diferentes para mensagens do usuário e da IA
  useEffect(() => {
    // Configurar o som para mensagens do usuário
    userMessageSound.volume = soundVolume / 100;
    userMessageSound.playbackRate = 1.2; // Um pouco mais rápido

    // Configurar o som para mensagens da IA
    aiMessageSound.volume = soundVolume / 100;
    aiMessageSound.playbackRate = 0.9; // Um pouco mais lento
  }, [soundVolume, userMessageSound, aiMessageSound]);

  // Função para limpar o histórico de mensagens
  const clearChatHistory = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);

      // Excluir mensagens do banco de dados
      if (autoSaveHistory) {
        const { error } = await supabase
          .from("epictus_ia_messages")
          .delete()
          .eq("user_id", userId);

        if (error) throw error;
      }

      // Limpar mensagens na interface
      setMessages([
        {
          id: Date.now(),
          sender: "ai",
          content: "Histórico limpo. Como posso ajudar você hoje?",
          timestamp: new Date(),
        },
      ]);

      toast({
        title: "Histórico limpo",
        description: "Seu histórico de conversas foi limpo com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao limpar histórico:", error);
      toast({
        title: "Erro",
        description: "Não foi possível limpar o histórico. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para restaurar configurações padrão
  const restoreDefaultSettings = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);

      // Valores padrão
      const defaultSettings = {
        sound_enabled: true,
        sound_volume: 50,
        message_theme: "default",
        font_size: "medium",
        auto_save_history: true,
        keyboard_shortcuts: true,
        ai_intelligence_level: "normal",
      };

      // Atualizar no banco de dados
      const { error } = await supabase
        .from("epictus_ia_preferences")
        .update(defaultSettings)
        .eq("user_id", userId);

      if (error) throw error;

      // Atualizar estado local
      setSoundEnabled(defaultSettings.sound_enabled);
      setSoundVolume(defaultSettings.sound_volume);
      setMessageTheme(defaultSettings.message_theme);
      setFontSizePreference(defaultSettings.font_size);
      setAutoSaveHistory(defaultSettings.auto_save_history);
      setKeyboardShortcuts(defaultSettings.keyboard_shortcuts);
      setAiIntelligenceLevel(defaultSettings.ai_intelligence_level);

      toast({
        title: "Configurações restauradas",
        description: "As configurações padrão foram restauradas com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao restaurar configurações:", error);
      toast({
        title: "Erro",
        description:
          "Não foi possível restaurar as configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para reproduzir som de mensagem do usuário
  const playUserMessageSound = () => {
    if (soundEnabled) {
      userMessageSound.currentTime = 0;
      userMessageSound
        .play()
        .catch((e) => console.log("Erro ao reproduzir som do usuário:", e));
    }
  };

  // Função para reproduzir som de mensagem da IA
  const playAIMessageSound = () => {
    if (soundEnabled) {
      aiMessageSound.currentTime = 0;
      aiMessageSound
        .play()
        .catch((e) => console.log("Erro ao reproduzir som da IA:", e));
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

      // Reproduzir som de mensagem do usuário
      playUserMessageSound();

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

        // Reproduzir som de mensagem da IA
        playAIMessageSound();
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

    // Reproduzir som de mensagem do usuário
    playUserMessageSound();

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

      // Reproduzir som de mensagem da IA
      playAIMessageSound();
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

    // Reproduzir som de mensagem do usuário
    playUserMessageSound();

    // Simular resposta da IA
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        sender: "ai",
        content: `Recebi seu arquivo "${file.name}". Estou analisando o conteúdo...`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);

      // Reproduzir som de mensagem da IA
      playAIMessageSound();
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
  const deleteMessage = async (messageId) => {
    // Remover mensagem do estado local
    setMessages(messages.filter((msg) => msg.id !== messageId));
    if (editingMessage && editingMessage.id === messageId) {
      cancelEditing();
    }

    // Se autoSaveHistory estiver ativado, remover do banco também
    if (autoSaveHistory && userId) {
      try {
        const { error } = await supabase
          .from("epictus_ia_messages")
          .delete()
          .eq("id", messageId)
          .eq("user_id", userId);

        if (error) throw error;
      } catch (error) {
        console.error("Erro ao excluir mensagem do banco:", error);
      }
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

  // Função para navegar para uma seção específica
  const navigateToSection = (section) => {
    setActiveTab(section);
    if (isFullscreen) {
      setIsFullscreen(false);
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

  // Determinar classes de cores com base no tema atual
  const getThemeClasses = () => {
    const baseClasses = {
      chatBackground: "",
      chatText: "",
      chatBorder: "",
      contentBackground: "",
      contentText: "",
      contentBorder: "",
      cardBackground: "",
      cardHover: "",
      userMessageBg: "",
      aiMessageBg: "",
      inputBg: "",
      buttonHover: "",
    };

    if (theme === "dark") {
      return {
        ...baseClasses,
        chatBackground: "bg-[#0A1628]",
        chatText: "text-white",
        chatBorder: "border-[#29335C]/30",
        contentBackground: "bg-[#0A1628]",
        contentText: "text-white",
        contentBorder: "border-[#29335C]/30",
        cardBackground: "bg-[#29335C]/30",
        cardHover: "hover:bg-[#29335C]/50",
        userMessageBg: "bg-[#FF6B00]",
        aiMessageBg: "bg-[#29335C]/50",
        inputBg: "bg-[#29335C]/50",
        buttonHover: "hover:bg-[#29335C]/30",
      };
    } else {
      return {
        ...baseClasses,
        chatBackground: "bg-white",
        chatText: "text-[#29335C]",
        chatBorder: "border-gray-200",
        contentBackground: "bg-gray-50",
        contentText: "text-[#29335C]",
        contentBorder: "border-gray-200",
        cardBackground: "bg-white",
        cardHover: "hover:bg-gray-100",
        userMessageBg: "bg-[#FF6B00]",
        aiMessageBg: "bg-[#29335C]/10",
        inputBg: "bg-white",
        buttonHover: "hover:bg-gray-100",
      };
    }
  };

  const themeClasses = getThemeClasses();

  // Determinar o tamanho da fonte com base na preferência
  const getFontSizeClass = () => {
    switch (fontSizePreference) {
      case "small":
        return "text-sm";
      case "large":
        return "text-lg";
      default: // medium
        return "text-base";
    }
  };

  const fontSizeClass = getFontSizeClass();

  // Determinar o estilo da mensagem com base no tema escolhido
  const getMessageStyle = (sender) => {
    const isUser = sender === "user";
    const baseClasses = `group max-w-[85%] p-4 rounded-xl relative ${fontSizeClass}`;

    switch (messageTheme) {
      case "modern":
        return `${baseClasses} ${isUser ? `${themeClasses.userMessageBg} text-white shadow-md` : `${themeClasses.aiMessageBg} ${themeClasses.contentText} shadow-sm`}`;
      case "compact":
        return `${baseClasses} ${isUser ? `${themeClasses.userMessageBg} text-white py-2 px-3` : `${themeClasses.aiMessageBg} ${themeClasses.contentText} py-2 px-3`}`;
      case "bubble":
        return `${baseClasses} ${isUser ? `${themeClasses.userMessageBg} text-white rounded-2xl rounded-tr-none` : `${themeClasses.aiMessageBg} ${themeClasses.contentText} rounded-2xl rounded-tl-none`}`;
      default: // default
        return `${baseClasses} ${isUser ? `${themeClasses.userMessageBg} text-white` : `${themeClasses.aiMessageBg} ${themeClasses.contentText}`}`;
    }
  };

  if (isLoading && !initialMessagesLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-[#FF6B00] animate-spin" />
          <p className="text-lg font-medium">Carregando Epictus IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex">
      {/* Coluna Esquerda - Chatbot (fixa) */}
      <div
        ref={chatContainerRef}
        className={`${isFullscreen ? "w-full" : "w-[400px]"} h-full flex flex-col ${themeClasses.chatBackground} ${themeClasses.chatText} border-r ${themeClasses.chatBorder} overflow-hidden`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          height: "100vh",
          zIndex: 40,
        }}
      >
        {/* Cabeçalho do Chat */}
        <div
          className={`p-4 border-b ${themeClasses.chatBorder} flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Epictus IA</h3>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-xs opacity-70">
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
              className={`opacity-70 hover:opacity-100 ${themeClasses.buttonHover} rounded-full`}
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
                  className={`opacity-70 hover:opacity-100 ${themeClasses.buttonHover} rounded-full relative`}
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF6B00] rounded-full"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className={`w-80 ${themeClasses.chatBackground} border-${themeClasses.chatBorder} ${themeClasses.chatText}`}
                align="end"
              >
                <div className={`p-4 border-b ${themeClasses.chatBorder}`}>
                  <h3 className="font-semibold">Notificações</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  <div className="p-2">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 mb-2 rounded-lg cursor-pointer ${themeClasses.cardHover} ${!notification.read ? "bg-[#FF6B00]/5" : ""}`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">
                              {notification.title}
                            </h4>
                            <span className="text-xs opacity-70">
                              {notification.time}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center opacity-70">
                        Nenhuma notificação
                      </div>
                    )}
                  </div>
                </div>
                <div className={`p-2 border-t ${themeClasses.chatBorder}`}>
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
                  className={`opacity-70 hover:opacity-100 ${themeClasses.buttonHover} rounded-full`}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className={`w-80 ${themeClasses.chatBackground} border-${themeClasses.chatBorder} ${themeClasses.chatText}`}
                align="end"
              >
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4 text-[#FF6B00]" />{" "}
                    Configurações
                  </h3>

                  <div
                    className={`space-y-3 pt-2 border-t ${themeClasses.chatBorder}`}
                  >
                    <h4 className="text-sm font-medium opacity-80">
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
                        <SelectTrigger
                          className={`${theme === "dark" ? "bg-[#29335C]/50 border-[#29335C]/50" : "bg-white border-gray-200"}`}
                        >
                          <SelectValue placeholder="Selecione um nível" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Básico</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="advanced">Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs opacity-70">
                        {aiIntelligenceLevel === "basic" &&
                          "Respostas simples e diretas."}
                        {aiIntelligenceLevel === "normal" &&
                          "Equilíbrio entre simplicidade e profundidade."}
                        {aiIntelligenceLevel === "advanced" &&
                          "Respostas detalhadas e abrangentes."}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`space-y-3 pt-2 border-t ${themeClasses.chatBorder}`}
                  >
                    <h4 className="text-sm font-medium opacity-80">
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
                        <p className="text-xs opacity-70">
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
                          <VolumeX className="h-4 w-4 opacity-70" />
                          <Slider
                            value={[soundVolume]}
                            onValueChange={(value) => setSoundVolume(value[0])}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <Volume2 className="h-4 w-4 opacity-70" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className={`space-y-3 pt-2 border-t ${themeClasses.chatBorder}`}
                  >
                    <h4 className="text-sm font-medium opacity-80">
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
                        <SelectTrigger
                          className={`${theme === "dark" ? "bg-[#29335C]/50 border-[#29335C]/50" : "bg-white border-gray-200"}`}
                        >
                          <SelectValue placeholder="Selecione um tema" />
                        </SelectTrigger>
                        <SelectContent>
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
                        <SelectTrigger
                          className={`${theme === "dark" ? "bg-[#29335C]/50 border-[#29335C]/50" : "bg-white border-gray-200"}`}
                        >
                          <SelectValue placeholder="Selecione um tamanho" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Pequeno</SelectItem>
                          <SelectItem value="medium">Médio</SelectItem>
                          <SelectItem value="large">Grande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div
                    className={`space-y-3 pt-2 border-t ${themeClasses.chatBorder}`}
                  >
                    <h4 className="text-sm font-medium opacity-80">
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
                        <p className="text-xs opacity-70">
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
                        <p className="text-xs opacity-70">
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

                  <div
                    className={`pt-2 border-t ${themeClasses.chatBorder} flex justify-between`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-${themeClasses.chatBorder} ${themeClasses.buttonHover}`}
                      onClick={clearChatHistory}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4 mr-1" />
                      )}
                      Limpar histórico
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-${themeClasses.chatBorder} ${themeClasses.buttonHover}`}
                      onClick={restoreDefaultSettings}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-1" />
                      )}
                      Restaurar padrões
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <Brain className="h-16 w-16 text-[#FF6B00] mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">
                Bem-vindo ao Epictus IA
              </h3>
              <p className="opacity-70 mb-6 max-w-xs">
                Seu assistente de estudos pessoal. Faça uma pergunta ou escolha
                uma das sugestões abaixo para começar.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    onClick={() => setInputMessage(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={getMessageStyle(message.sender)}>
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
                      <p className="leading-relaxed">
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
          )}
        </div>

        {/* Sugestões de Perguntas com rolagem horizontal */}
        <div className={`p-4 border-t ${themeClasses.chatBorder} relative`}>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full flex-shrink-0 opacity-60 hover:opacity-100 ${themeClasses.buttonHover}`}
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
                  className={`${theme === "dark" ? "bg-[#29335C]/50" : "bg-gray-100"} rounded-full px-4 py-2 text-sm cursor-pointer ${theme === "dark" ? "hover:bg-[#29335C]/70" : "hover:bg-gray-200"} transition-colors whitespace-nowrap flex-shrink-0`}
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
              className={`h-8 w-8 rounded-full flex-shrink-0 opacity-60 hover:opacity-100 ${themeClasses.buttonHover}`}
              onClick={() => scrollSuggestions("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Campo de Entrada */}
        <div className={`p-4 border-t ${themeClasses.chatBorder}`}>
          {editingMessage ? (
            <div className="mb-2 p-2 bg-[#FF6B00]/10 rounded-lg flex justify-between items-center">
              <span className="text-sm">Editando mensagem</span>
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

          <div
            className={`flex items-center gap-2 ${themeClasses.inputBg} rounded-xl p-3`}
          >
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
              className="opacity-70 hover:opacity-100 hover:bg-[#29335C]/30 rounded-full"
              onClick={handleFileButtonClick}
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <Input
              placeholder="Digite sua mensagem..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className={`flex-1 bg-transparent border-none placeholder:opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0 ${fontSizeClass} h-10`}
              onKeyDown={(e) => {
                if (
                  keyboardShortcuts &&
                  e.key === "Enter" &&
                  (e.ctrlKey || e.metaKey)
                ) {
                  e.preventDefault();
                  sendMessage();
                } else if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            {/* Botão de emoji */}
            <Button
              variant="ghost"
              size="icon"
              className="opacity-70 hover:opacity-100 hover:bg-[#29335C]/30 rounded-full"
            >
              <Smile className="h-5 w-5" />
            </Button>

            {/* Botão de áudio */}
            <Button
              variant="ghost"
              size="icon"
              className="opacity-70 hover:opacity-100 hover:bg-[#29335C]/30 rounded-full"
            >
              <Mic className="h-5 w-5" />
            </Button>

            <Button
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white rounded-full p-2 h-10 w-10 shadow-md"
              onClick={sendMessage}
              disabled={inputMessage.trim() === ""}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Coluna Direita - Conteúdo (só mostra se não estiver em tela cheia) */}
      {!isFullscreen && (
        <div
          className={`flex-1 flex flex-col ${themeClasses.contentBackground} ${themeClasses.contentText}`}
          style={{ marginLeft: "400px" }}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            {/* Navegação Superior */}
            <div
              className={`p-4 border-b ${themeClasses.contentBorder} flex items-center sticky top-0 z-10 ${themeClasses.contentBackground}`}
            >
              <TabsList className="bg-transparent">
                <TabsTrigger
                  value="visao-geral"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white opacity-70 data-[state=active]:opacity-100 hover:opacity-100 hover:bg-[#29335C]/30 px-4 py-2"
                >
                  <Brain className="h-4 w-4 mr-2" /> Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value="plano-estudos"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white opacity-70 data-[state=active]:opacity-100 hover:opacity-100 hover:bg-[#29335C]/30 px-4 py-2"
                >
                  <BookOpen className="h-4 w-4 mr-2" /> Plano de Estudos
                </TabsTrigger>
                <TabsTrigger
                  value="resumos"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white opacity-70 data-[state=active]:opacity-100 hover:opacity-100 hover:bg-[#29335C]/30 px-4 py-2"
                >
                  <FileText className="h-4 w-4 mr-2" /> Resumos
                </TabsTrigger>
                <TabsTrigger
                  value="desempenho"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white opacity-70 data-[state=active]:opacity-100 hover:opacity-100 hover:bg-[#29335C]/30 px-4 py-2"
                >
                  <BarChart3 className="h-4 w-4 mr-2" /> Desempenho
                </TabsTrigger>
                <TabsTrigger
                  value="modo-exploracao"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white opacity-70 data-[state=active]:opacity-100 hover:opacity-100 hover:bg-[#29335C]/30 px-4 py-2"
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
                    <div
                      className={`${themeClasses.cardBackground} rounded-xl p-6 border ${themeClasses.contentBorder}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-[#FF6B00]" />{" "}
                          Estatísticas de Uso
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div
                          className={`${theme === "dark" ? "bg-[#29335C]/30" : "bg-gray-50"} p-4 rounded-lg`}
                        >
                          <p className="text-sm opacity-60 mb-1">
                            Tempo de Estudo
                          </p>
                          <p className="text-2xl font-bold">42h 30min</p>
                          <p className="text-xs text-green-500 mt-1">
                            +15% que semana passada
                          </p>
                        </div>
                        <div
                          className={`${theme === "dark" ? "bg-[#29335C]/30" : "bg-gray-50"} p-4 rounded-lg`}
                        >
                          <p className="text-sm opacity-60 mb-1">
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
                    <div
                      className={`${themeClasses.cardBackground} rounded-xl p-6 border ${themeClasses.contentBorder} hover:shadow-glow-cyan transition-all duration-300`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <Brain className="h-5 w-5 text-[#FF6B00]" />{" "}
                          Ferramentas da IA
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          className={`${theme === "dark" ? "bg-[#29335C]/50 hover:bg-[#29335C]/70" : "bg-gray-100 hover:bg-gray-200"} justify-start h-auto py-3 px-4 hover:scale-105 transition-all duration-300 animate-subtle-pulse`}
                          onClick={() => navigateToSection("plano-estudos")}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium">
                              Plano de Estudos
                            </span>
                            <span className="text-xs opacity-60">
                              Personalize seu plano
                            </span>
                          </div>
                        </Button>
                        <Button
                          className={`${theme === "dark" ? "bg-[#29335C]/50 hover:bg-[#29335C]/70" : "bg-gray-100 hover:bg-gray-200"} justify-start h-auto py-3 px-4 hover:scale-105 transition-all duration-300 animate-subtle-pulse`}
                          onClick={() => navigateToSection("resumos")}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Resumos</span>
                            <span className="text-xs opacity-60">
                              Resumos inteligentes
                            </span>
                          </div>
                        </Button>
                        <Button
                          className={`${theme === "dark" ? "bg-[#29335C]/50 hover:bg-[#29335C]/70" : "bg-gray-100 hover:bg-gray-200"} justify-start h-auto py-3 px-4 hover:scale-105 transition-all duration-300 animate-subtle-pulse`}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Mapa Mental</span>
                            <span className="text-xs opacity-60">
                              Visualize conceitos
                            </span>
                          </div>
                        </Button>
                        <Button
                          className={`${theme === "dark" ? "bg-[#29335C]/50 hover:bg-[#29335C]/70" : "bg-gray-100 hover:bg-gray-200"} justify-start h-auto py-3 px-4 hover:scale-105 transition-all duration-300 animate-subtle-pulse`}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Exercícios</span>
                            <span className="text-xs opacity-60">
                              Pratique o conteúdo
                            </span>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Insights Personalizados */}
                  <div
                    className={`${theme === "dark" ? "bg-gradient-to-r from-[#29335C] to-[#0A1628]" : "bg-gradient-to-r from-blue-50 to-indigo-50"} p-6 rounded-xl border ${themeClasses.contentBorder} mb-6`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                          Insights Personalizados{" "}
                          <Sparkles className="h-4 w-4 text-[#FF6B00]" />
                        </h3>
                        <p className="opacity-80 mb-4">
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
                          section: "desempenho",
                        },
                        {
                          title: "Modo Exploração",
                          description: "Explore novos tópicos",
                          icon: <Compass className="h-6 w-6 text-[#FF6B00]" />,
                          section: "modo-exploracao",
                        },
                        {
                          title: "Mapas Mentais",
                          description: "Visualize conceitos",
                          icon: <Map className="h-6 w-6 text-[#FF6B00]" />,
                          section: "",
                        },
                        {
                          title: "Exercícios",
                          description: "Pratique o conteúdo",
                          icon: <PenTool className="h-6 w-6 text-[#FF6B00]" />,
                          section: "",
                        },
                      ].map((module, index) => (
                        <div
                          key={index}
                          className={`${themeClasses.cardBackground} p-4 rounded-xl border ${themeClasses.contentBorder} hover:border-[#FF6B00]/50 transition-all cursor-pointer hover:shadow-md hover:translate-y-[-2px]`}
                          onClick={() =>
                            module.section && navigateToSection(module.section)
                          }
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
                              {module.icon}
                            </div>
                            <h4 className="font-medium mb-1">{module.title}</h4>
                            <p className="text-xs opacity-60 mb-3">
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
                          className="opacity-60 border-${themeClasses.contentBorder} ${themeClasses.buttonHover} h-8"
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
                          className={`flex items-center justify-between p-4 ${themeClasses.cardBackground} ${themeClasses.cardHover} rounded-xl transition-colors cursor-pointer border ${themeClasses.contentBorder} hover:border-[#FF6B00]/30`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                              <MessageSquare className="h-6 w-6 text-[#FF6B00]" />
                            </div>
                            <div>
                              <h4 className="font-medium text-base">
                                {interaction.title}
                              </h4>
                              <p className="text-sm opacity-60 line-clamp-1 mt-1">
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
                                  className={`h-3 w-3 ${i < interaction.rating ? "text-[#FF6B00]" : "opacity-30"} mr-0.5`}
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
    </div>
  );
}
