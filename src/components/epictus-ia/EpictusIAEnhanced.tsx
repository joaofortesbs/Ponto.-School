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
} from "lucide-react";

export default function EpictusIAEnhanced() {
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [inputMessage, setInputMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(50);
  const [messageTheme, setMessageTheme] = useState("default");
  const [fontSizePreference, setFontSizePreference] = useState("medium");
  const [autoSaveHistory, setAutoSaveHistory] = useState(true);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(true);
  const [aiIntelligenceLevel, setAiIntelligenceLevel] = useState("normal");
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

  // Sugestões de perguntas rápidas
  const quickSuggestions = [
    "Criar um plano de estudos para o ENEM",
    "Resumir o capítulo sobre termodinâmica",
    "Explicar o teorema de Pitágoras",
    "Gerar exercícios de matemática",
  ];

  return (
    <div className="w-full h-full flex">
      {/* Coluna Esquerda - Chatbot (fixa) */}
      <div className="w-[350px] h-full flex flex-col bg-[#0A1628] text-white border-r border-[#29335C]/30">
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
        <div className="flex-1 p-4 overflow-y-auto">
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
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Sugestões de Perguntas */}
        <div className="p-4 border-t border-[#29335C]/30">
          <p className="text-sm text-white/60 mb-2 font-medium">Sugestões:</p>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="bg-[#29335C]/50 text-white border-[#29335C] hover:bg-[#29335C]/70"
                onClick={() => {
                  setInputMessage(suggestion);
                }}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {/* Campo de Entrada */}
        <div className="p-4 border-t border-[#29335C]/30">
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

      {/* Coluna Direita - Conteúdo */}
      <div className="flex-1 flex flex-col bg-[#0A1628] text-white">
        {/* Navegação Superior */}
        <div className="p-4 border-b border-[#29335C]/30 flex items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-[#FF6B00] text-white border-[#FF6B00] hover:bg-[#FF6B00]/90"
            >
              <Brain className="h-4 w-4 mr-2" /> Visão Geral
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent text-white border-[#29335C]/50 hover:bg-[#29335C]/30"
            >
              <BookOpen className="h-4 w-4 mr-2" /> Plano de Estudos
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent text-white border-[#29335C]/50 hover:bg-[#29335C]/30"
            >
              <FileText className="h-4 w-4 mr-2" /> Resumos
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent text-white border-[#29335C]/50 hover:bg-[#29335C]/30"
            >
              <BarChart3 className="h-4 w-4 mr-2" /> Desempenho
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent text-white border-[#29335C]/50 hover:bg-[#29335C]/30"
            >
              <Compass className="h-4 w-4 mr-2" /> Modo Exploração
            </Button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Olá, João Silva!</h2>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Estatísticas de Uso */}
            <div className="bg-[#29335C]/30 rounded-xl p-6 border border-[#29335C]/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#FF6B00]" /> Estatísticas
                  de Uso
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#29335C]/30 p-4 rounded-lg">
                  <p className="text-sm text-white/60 mb-1">Tempo de Estudo</p>
                  <p className="text-2xl font-bold">42h 30min</p>
                  <p className="text-xs text-white/60 mt-1">Últimos 30 dias</p>
                </div>
                <div className="bg-[#29335C]/30 p-4 rounded-lg">
                  <p className="text-sm text-white/60 mb-1">
                    Tarefas Concluídas
                  </p>
                  <p className="text-2xl font-bold">28/35</p>
                  <p className="text-xs text-white/60 mt-1">Últimos 30 dias</p>
                </div>
              </div>
            </div>

            {/* Ferramentas da IA */}
            <div className="bg-[#29335C]/30 rounded-xl p-6 border border-[#29335C]/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-[#FF6B00]" /> Ferramentas da IA
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button className="bg-[#FF6B00]/20 hover:bg-[#FF6B00]/30 text-[#FF6B00] justify-start h-auto py-3 px-4">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Plano de Estudos</span>
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
                  Com base na sua análise de desempenho, identificamos que você
                  tem um desempenho melhor em Matemática e Biologia, mas pode
                  melhorar em Química. Recomendamos dedicar mais tempo aos
                  estudos de Química, especialmente nos tópicos de Química
                  Orgânica.
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
            <h3 className="text-lg font-bold mb-4">Módulos Principais</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                {
                  title: "Desempenho",
                  description: "Análise do seu progresso",
                  icon: <BarChart3 className="h-6 w-6 text-[#FF6B00]" />,
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
        </div>

        {/* Navegação Inferior */}
        <div className="p-4 border-t border-[#29335C]/30 flex justify-between">
          <Button
            variant="ghost"
            className="flex-1 flex flex-col items-center gap-1 text-white/60 hover:text-white hover:bg-[#29335C]/30 py-2"
            onClick={() => setActiveTab("plano-estudos")}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs">Plano de Estudos</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 flex flex-col items-center gap-1 text-white/60 hover:text-white hover:bg-[#29335C]/30 py-2"
            onClick={() => setActiveTab("resumos")}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs">Resumos</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 flex flex-col items-center gap-1 text-white/60 hover:text-white hover:bg-[#29335C]/30 py-2"
          >
            <Map className="h-5 w-5" />
            <span className="text-xs">Mapa Mental</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 flex flex-col items-center gap-1 text-white/60 hover:text-white hover:bg-[#29335C]/30 py-2"
          >
            <PenTool className="h-5 w-5" />
            <span className="text-xs">Exercícios</span>
          </Button>
        </div>
      </div>

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
