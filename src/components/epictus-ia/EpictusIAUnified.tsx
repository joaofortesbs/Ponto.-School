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
import { Skeleton } from "@/components/ui/skeleton";
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
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const suggestionsScrollRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Função para obter resposta da IA
  const getResponseFromAI = async (userMessage) => {
    try {
      setIsAiResponding(true);
      // Simulação de chamada de API - em produção, substituir pela chamada real
      // const response = await fetch("https://api.your-ai-service.com/respond", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": "Bearer AIzaSyDaMGN00DG-3KHgV9b7Fm_SHGvfruuMdgM"
      //   },
      //   body: JSON.stringify({ message: userMessage }),
      // });
      // const data = await response.json();
      // return data.response;

      // Simulação de resposta para desenvolvimento
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simula o tempo de resposta da API

      // Gera respostas diferentes com base no nível de inteligência
      let response = "";
      switch (aiIntelligenceLevel) {
        case "basic":
          response = `Entendi sua pergunta sobre "${userMessage}". Aqui está uma resposta simples e direta.`;
          break;
        case "advanced":
          response = `Analisando sua pergunta sobre "${userMessage}" em profundidade. Considerando múltiplas perspectivas e nuances do tema, posso oferecer a seguinte resposta detalhada e abrangente...`;
          break;
        default: // normal
          response = `Sobre "${userMessage}", posso dizer que é um tema interessante. Aqui estão algumas informações relevantes que podem ajudar no seu estudo.`;
      }
      setIsAiResponding(false);
      return response;
    } catch (error) {
      console.error("Erro ao obter resposta da IA:", error);
      toast({
        description: "Erro ao conectar com a IA.",
        variant: "destructive",
      });
      setIsAiResponding(false);
      return "Desculpe, houve um erro ao processar sua solicitação.";
    }
  };

  // Carregar usuário atual
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Simular um tempo de carregamento para mostrar os skeletons
        await new Promise(resolve => setTimeout(resolve, 1500));
        
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
        setError("Não foi possível carregar os dados do usuário. Tente novamente mais tarde.");
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
        setError("Não foi possível carregar suas preferências. Configurações padrão serão usadas.");
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
        setError("Não foi possível carregar o histórico de mensagens. Iniciando uma nova conversa.");
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

  // Função para enviar mensagem
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isAiResponding) return;

    // Adicionar mensagem do usuário
    const userMessageObj = {
      id: Date.now(),
      sender: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setInputMessage("");

    // Reproduzir som se estiver habilitado
    if (soundEnabled && userMessageSound) {
      userMessageSound.volume = soundVolume / 100;
      userMessageSound
        .play()
        .catch((e) => console.error("Erro ao reproduzir som:", e));
    }

    // Obter resposta da IA
    const aiResponse = await getResponseFromAI(inputMessage);

    // Adicionar resposta da IA
    const aiMessageObj = {
      id: Date.now(),
      sender: "ai",
      content: aiResponse,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessageObj]);

    // Reproduzir som se estiver habilitado
    if (soundEnabled && aiMessageSound) {
      aiMessageSound.volume = soundVolume / 100;
      aiMessageSound
        .play()
        .catch((e) => console.error("Erro ao reproduzir som:", e));
    }

    // Rolar para o final da conversa
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Função para lidar com tecla Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && keyboardShortcuts) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Função para obter estilo da mensagem com base no remetente e tema
  const getMessageStyle = (sender) => {
    const baseStyle = "rounded-lg p-3 mb-2 max-w-[80%] break-words";

    if (sender === "user") {
      return `${baseStyle} ml-auto bg-primary text-primary-foreground`;
    } else {
      return `${baseStyle} mr-auto ${theme === "dark" ? "bg-secondary" : "bg-muted"} text-foreground`;
    }
  };

  // Rolar para o final quando novas mensagens são adicionadas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Epictus IA</h2>
          {isLoading ? (
            <Skeleton className="h-6 w-16 ml-2" />
          ) : (
            <Badge variant="outline" className="ml-2">
              {aiIntelligenceLevel === "basic"
                ? "Básico"
                : aiIntelligenceLevel === "advanced"
                  ? "Avançado"
                  : "Normal"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            disabled={isLoading}
          >
            <Bell className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            disabled={isLoading}
          >
            <Settings className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            disabled={isLoading}
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Navegação por abas */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid grid-cols-5 p-0 h-12">
          <TabsTrigger 
            value="visao-geral" 
            className="flex items-center gap-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <Skeleton className="h-4 w-4 rounded-full" />
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isLoading ? <Skeleton className="h-4 w-12" /> : "Chat"}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="exploracao" 
            className="flex items-center gap-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <Skeleton className="h-4 w-4 rounded-full" />
            ) : (
              <Compass className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isLoading ? <Skeleton className="h-4 w-20" /> : "Exploração"}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="resumos" 
            className="flex items-center gap-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <Skeleton className="h-4 w-4 rounded-full" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isLoading ? <Skeleton className="h-4 w-16" /> : "Resumos"}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="desempenho" 
            className="flex items-center gap-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <Skeleton className="h-4 w-4 rounded-full" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isLoading ? <Skeleton className="h-4 w-20" /> : "Desempenho"}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="plano-estudos"
            className="flex items-center gap-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <Skeleton className="h-4 w-4 rounded-full" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isLoading ? <Skeleton className="h-4 w-12" /> : "Plano"}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="visao-geral"
          className="flex-1 flex flex-col p-0 m-0"
        >
          {/* Área de chat */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{
              fontSize:
                fontSizePreference === "small"
                  ? "0.875rem"
                  : fontSizePreference === "large"
                    ? "1.125rem"
                    : "1rem",
            }}
          >
            {isLoading ? (
              // Skeleton loaders para mensagens
              <>
                <div className="flex flex-col space-y-2 ml-auto max-w-[80%]">
                  <Skeleton className="h-5 w-20 mb-1" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
                <div className="flex flex-col space-y-2 mr-auto max-w-[80%]">
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                </div>
                <div className="flex flex-col space-y-2 ml-auto max-w-[80%]">
                  <Skeleton className="h-5 w-20 mb-1" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              </>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
                <p>Nenhuma mensagem ainda. Comece uma conversa!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={getMessageStyle(message.sender)}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold">
                      {message.sender === "user" ? "Você" : "Epictus IA"}
                    </span>
                    <span className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div>{message.content}</div>
                </div>
              ))
            )}
            {isAiResponding && (
              <div className={getMessageStyle("ai")}>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Epictus IA está digitando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Área de entrada de mensagem */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-10" />
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAiResponding}
                  >
                    <Paperclip className="h-5 w-5" />
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => {
                        // Lógica para upload de arquivo
                        toast({
                          description:
                            "Funcionalidade de upload em desenvolvimento.",
                        });
                      }}
                    />
                  </Button>

                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="flex-1"
                    disabled={isAiResponding}
                  />

                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isAiResponding}
                  >
                    {isAiResponding ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="exploracao" className="flex-1 p-4 m-0">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-40 w-full rounded-lg" />
              </div>
            </div>
          ) : (
            <ModoExploracaoInterface />
          )}
        </TabsContent>

        <TabsContent value="resumos" className="flex-1 p-4 m-0">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-40 w-full rounded-lg" />
              </div>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ) : (
            <ResumosInterface />
          )}
        </TabsContent>

        <TabsContent value="desempenho" className="flex-1 p-4 m-0">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          ) : (
            <DesempenhoInterface />
          )}
        </TabsContent>

        <TabsContent value="plano-estudos" className="flex-1 p-4 m-0">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-40 w-full rounded-lg" />
              </div>
              <Skeleton className="h-8 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          ) : (
            <PlanoEstudosInterface />
          )}
        </TabsContent>
      </Tabs>

      {/* Popover de configurações */}
      <Popover open={showSettings} onOpenChange={setShowSettings}>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <h3 className="font-medium">Configurações</h3>

            {isLoading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-10" />
                </div>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-10" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-6 w-10" />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-toggle">Som</Label>
                  <Switch
                    id="sound-toggle"
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                </div>

              {soundEnabled && (
                <div className="space-y-1">
                  <Label htmlFor="volume-slider">Volume: {soundVolume}%</Label>
                  <Slider
                    id="volume-slider"
                    min={0}
                    max={100}
                    step={1}
                    value={[soundVolume]}
                    onValueChange={(value) => setSoundVolume(value[0])}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme-select">Tema das mensagens</Label>
              <Select value={messageTheme} onValueChange={setMessageTheme}>
                <SelectTrigger id="theme-select">
                  <SelectValue placeholder="Selecione um tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Padrão</SelectItem>
                  <SelectItem value="modern">Moderno</SelectItem>
                  <SelectItem value="compact">Compacto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="font-size-select">Tamanho da fonte</Label>
              <Select
                value={fontSizePreference}
                onValueChange={setFontSizePreference}
              >
                <SelectTrigger id="font-size-select">
                  <SelectValue placeholder="Selecione um tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeno</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-level-select">
                Nível de inteligência da IA
              </Label>
              <Select
                value={aiIntelligenceLevel}
                onValueChange={setAiIntelligenceLevel}
              >
                <SelectTrigger id="ai-level-select">
                  <SelectValue placeholder="Selecione um nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autosave-toggle">
                Salvar histórico automaticamente
              </Label>
              <Switch
                id="autosave-toggle"
                checked={autoSaveHistory}
                onCheckedChange={setAutoSaveHistory}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="shortcuts-toggle">Atalhos de teclado</Label>
              <Switch
                id="shortcuts-toggle"
                checked={keyboardShortcuts}
                onCheckedChange={setKeyboardShortcuts}
              />
            </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Mensagem de erro */}
      {!isLoading && error && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-md shadow-lg flex items-center gap-2 max-w-md">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Erro ao carregar dados</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
