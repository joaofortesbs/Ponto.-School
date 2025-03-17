import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Star,
  Download,
  Bookmark,
  Play,
  FileText,
  Heart,
  BookText,
  BookMarked,
  Home,
  Settings,
  Sliders,
  BookOpenCheck,
  GraduationCap,
  Users2,
  Lightbulb,
  Brain,
  PanelRight,
  MessageCircle,
  Eye,
  ThumbsUp,
  Calendar,
  Globe,
  Beaker,
  Rocket,
  Leaf,
  Grid,
  List,
  LayoutGrid,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Plus,
  Share2,
  MoreHorizontal,
  Bookmark as BookmarkIcon,
  BookmarkCheck,
  Pencil,
  Trash2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from "lucide-react";

export function BibliotecaLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [fontSize, setFontSize] = useState("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [showMaterialDetail, setShowMaterialDetail] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [activeTab, setActiveTab] = useState("minhas-turmas");
  const [isLoading, setIsLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  // Parse URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const view = searchParams.get("view");
    if (view) {
      setActiveTab(view);
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [location]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    navigate(`/biblioteca?view=${value}`);
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  const toggleColorBlindMode = () => {
    setColorBlindMode(!colorBlindMode);
  };

  const openMaterialDetail = (material) => {
    setSelectedMaterial(material);
    setShowMaterialDetail(true);
  };

  const toggleFocusMode = () => {
    setShowFocusMode(!showFocusMode);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <div
      className={`flex flex-col h-full ${highContrast ? "bg-black text-white" : "bg-[#f7f9fa] dark:bg-[#001427]"} ${fontSize === "large" ? "text-lg" : fontSize === "larger" ? "text-xl" : "text-base"}`}
    >
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1
              className={`text-2xl md:text-3xl font-bold ${highContrast ? "text-white" : "text-[#29335C] dark:text-white"}`}
            >
              Biblioteca
            </h1>
            <p
              className={`${highContrast ? "text-gray-300" : "text-[#64748B] dark:text-white/60"} mt-1`}
            >
              Seu universo de conhecimento
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <form
              onSubmit={handleSearch}
              className="relative flex-1 min-w-[200px] md:min-w-[300px]"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar na biblioteca..."
                className="pl-9 pr-4 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" /> Filtros
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filtrar materiais</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() =>
                      setShowAccessibilityPanel(!showAccessibilityPanel)
                    }
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Configurações de acessibilidade</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setShowTutorial(true)}
                  >
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ajuda e tutorial</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Accessibility Panel */}
        {showAccessibilityPanel && (
          <div className="mt-4 p-4 bg-white dark:bg-[#0A2540] rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Acessibilidade</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAccessibilityPanel(false)}
              >
                Fechar
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm mb-2">Tamanho da fonte</p>
                <div className="flex gap-2">
                  <Button
                    variant={fontSize === "normal" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFontSizeChange("normal")}
                  >
                    Normal
                  </Button>
                  <Button
                    variant={fontSize === "large" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFontSizeChange("large")}
                  >
                    Grande
                  </Button>
                  <Button
                    variant={fontSize === "larger" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFontSizeChange("larger")}
                  >
                    Maior
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm mb-2">Contraste</p>
                <Button
                  variant={highContrast ? "default" : "outline"}
                  size="sm"
                  onClick={toggleHighContrast}
                >
                  {highContrast
                    ? "Desativar Alto Contraste"
                    : "Ativar Alto Contraste"}
                </Button>
              </div>
              <div>
                <p className="text-sm mb-2">Modo Daltonismo</p>
                <Button
                  variant={colorBlindMode ? "default" : "outline"}
                  size="sm"
                  onClick={toggleColorBlindMode}
                >
                  {colorBlindMode ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 md:p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[400px]">
                <div className="w-12 h-12 border-4 border-t-[#29335C] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#64748B] dark:text-white/60">
                  Carregando biblioteca...
                </p>
              </div>
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <div className="flex justify-between items-center mb-6">
                  <TabsList className="overflow-x-auto">
                    <TabsTrigger value="minhas-turmas">
                      Minhas Turmas
                    </TabsTrigger>
                    <TabsTrigger value="livros">Livros</TabsTrigger>
                    <TabsTrigger value="artigos">Artigos</TabsTrigger>
                    <TabsTrigger value="videos">Vídeos</TabsTrigger>
                    <TabsTrigger value="disciplinas">Disciplinas</TabsTrigger>
                    <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
                    <TabsTrigger value="trilhas">Trilhas</TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className={
                              viewMode === "grid"
                                ? "bg-gray-100 dark:bg-gray-800"
                                : ""
                            }
                            onClick={() => setViewMode("grid")}
                          >
                            <LayoutGrid className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visualização em grade</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className={
                              viewMode === "list"
                                ? "bg-gray-100 dark:bg-gray-800"
                                : ""
                            }
                            onClick={() => setViewMode("list")}
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visualização em lista</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <TabsContent value="minhas-turmas" className="space-y-8">
                  {/* Turmas Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      {
                        id: 1,
                        name: "Cálculo I",
                        professor: "Prof. Carlos Santos",
                        materials: 24,
                        color: "bg-blue-600",
                        image:
                          "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&q=80",
                        progress: 65,
                      },
                      {
                        id: 2,
                        name: "Física Quântica",
                        professor: "Profa. Ana Oliveira",
                        materials: 18,
                        color: "bg-purple-600",
                        image:
                          "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=500&q=80",
                        progress: 42,
                      },
                      {
                        id: 3,
                        name: "Química Orgânica",
                        professor: "Prof. Roberto Almeida",
                        materials: 32,
                        color: "bg-green-600",
                        image:
                          "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=500&q=80",
                        progress: 78,
                      },
                      {
                        id: 4,
                        name: "Biologia Celular",
                        professor: "Profa. Mariana Costa",
                        materials: 15,
                        color: "bg-amber-600",
                        image:
                          "https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?w=500&q=80",
                        progress: 23,
                      },
                      {
                        id: 5,
                        name: "Estatística Aplicada",
                        professor: "Prof. André Martins",
                        materials: 20,
                        color: "bg-cyan-600",
                        image:
                          "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=500&q=80",
                        progress: 55,
                      },
                      {
                        id: 6,
                        name: "Programação em Python",
                        professor: "Prof. Lucas Ferreira",
                        materials: 28,
                        color: "bg-indigo-600",
                        image:
                          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80",
                        progress: 89,
                      },
                      {
                        id: 7,
                        name: "Álgebra Linear",
                        professor: "Profa. Juliana Mendes",
                        materials: 22,
                        color: "bg-red-600",
                        image:
                          "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&q=80",
                        progress: 34,
                      },
                      {
                        id: 8,
                        name: "Termodinâmica",
                        professor: "Prof. Ricardo Oliveira",
                        materials: 19,
                        color: "bg-orange-600",
                        image:
                          "https://images.unsplash.com/photo-1581093458791-9d15482442f5?w=500&q=80",
                        progress: 67,
                      },
                    ].map((turma) => (
                      <div
                        key={turma.id}
                        className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
                        onClick={() =>
                          navigate(`/biblioteca?view=turmas&id=${turma.id}`)
                        }
                      >
                        <div className="h-32 overflow-hidden relative">
                          <img
                            src={turma.image}
                            alt={turma.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div
                            className={`absolute top-0 left-0 w-full h-1 ${turma.color}`}
                          ></div>
                          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/70 to-transparent"></div>
                          <div className="absolute bottom-2 left-3 right-3">
                            <div className="flex justify-between items-center">
                              <Badge
                                variant="secondary"
                                className="bg-white/90 text-[#29335C] text-xs"
                              >
                                {turma.materials} materiais
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="bg-white/90 text-[#29335C] text-xs"
                              >
                                {turma.progress}% concluído
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-[#29335C] dark:text-white mb-1 line-clamp-1">
                            {turma.name}
                          </h3>
                          <p className="text-sm text-[#64748B] dark:text-white/60 mb-3 line-clamp-1">
                            {turma.professor}
                          </p>
                          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                            <div
                              className={`h-full rounded-full ${turma.color}`}
                              style={{ width: `${turma.progress}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#64748B] dark:text-white/60">
                              Último acesso: hoje
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1 text-xs group-hover:bg-gray-100 dark:group-hover:bg-gray-800"
                            >
                              <BookOpen className="h-3 w-3" /> Acessar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Continue Estudando */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium text-[#29335C] dark:text-white">
                        Continue Estudando
                      </h2>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-[#29335C] dark:text-white"
                      >
                        Ver todos
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        {
                          id: 1,
                          title: "Derivadas Parciais",
                          type: "video",
                          turma: "Cálculo I",
                          progress: 45,
                          thumbnail:
                            "https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=500&q=80",
                          duration: "45:30",
                          lastAccess: "Hoje, 10:30",
                        },
                        {
                          id: 2,
                          title: "Princípios da Mecânica Quântica",
                          type: "pdf",
                          turma: "Física Quântica",
                          progress: 68,
                          thumbnail:
                            "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&q=80",
                          pages: 24,
                          lastAccess: "Ontem, 15:45",
                        },
                        {
                          id: 3,
                          title: "Reações de Substituição",
                          type: "quiz",
                          turma: "Química Orgânica",
                          progress: 30,
                          thumbnail:
                            "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=500&q=80",
                          questions: 15,
                          lastAccess: "2 dias atrás",
                        },
                      ].map((material) => (
                        <div
                          key={material.id}
                          className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
                          onClick={() => openMaterialDetail(material)}
                        >
                          <div className="h-32 overflow-hidden relative">
                            <img
                              src={material.thumbnail}
                              alt={material.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-12 w-12 rounded-full bg-white/80 hover:bg-white text-[#FF6B00]"
                              >
                                {material.type === "video" ? (
                                  <Play className="h-6 w-6 ml-1" />
                                ) : material.type === "pdf" ? (
                                  <FileText className="h-6 w-6" />
                                ) : (
                                  <CheckCircle2 className="h-6 w-6" />
                                )}
                              </Button>
                            </div>
                            {material.type === "video" && (
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {material.duration}
                              </div>
                            )}
                            <div className="absolute top-2 left-2">
                              <Badge
                                variant="secondary"
                                className="bg-white/90 text-[#29335C] text-xs"
                              >
                                {material.turma}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-medium text-[#29335C] dark:text-white line-clamp-1">
                                {material.title}
                              </h3>
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {material.type}
                              </Badge>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden my-2">
                              <div
                                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                                style={{ width: `${material.progress}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-[#64748B] dark:text-white/60">
                                {material.progress}% concluído
                              </span>
                              <span className="text-xs text-[#64748B] dark:text-white/60">
                                {material.lastAccess}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recomendado para Você */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-medium text-[#29335C] dark:text-white">
                          Recomendado para Você
                        </h2>
                        <Badge className="bg-[#FF6B00] text-white">IA</Badge>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-[#29335C] dark:text-white"
                      >
                        Ver todos
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        {
                          id: 1,
                          title: "Física Quântica: Conceitos Básicos",
                          type: "video",
                          reason: "Baseado no seu interesse em Física",
                          thumbnail:
                            "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&q=80",
                          duration: "38:15",
                          instructor: "Profa. Ana Oliveira",
                        },
                        {
                          id: 2,
                          title: "Aplicações de Cálculo na Engenharia",
                          type: "artigo",
                          reason: "Complementa seus estudos em Cálculo I",
                          thumbnail:
                            "https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=500&q=80",
                          readTime: "12 min",
                          author: "Dr. Paulo Mendes",
                        },
                        {
                          id: 3,
                          title: "Bioquímica Avançada",
                          type: "livro",
                          reason: "Alunos de Biologia Celular também gostaram",
                          thumbnail:
                            "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=500&q=80",
                          pages: 342,
                          author: "Dra. Carla Rodrigues",
                        },
                      ].map((material) => (
                        <div
                          key={material.id}
                          className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
                          onClick={() => openMaterialDetail(material)}
                        >
                          <div className="h-32 overflow-hidden relative">
                            <img
                              src={material.thumbnail}
                              alt={material.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-12 w-12 rounded-full bg-white/80 hover:bg-white text-[#FF6B00]"
                              >
                                {material.type === "video" ? (
                                  <Play className="h-6 w-6 ml-1" />
                                ) : material.type === "artigo" ? (
                                  <FileText className="h-6 w-6" />
                                ) : (
                                  <BookText className="h-6 w-6" />
                                )}
                              </Button>
                            </div>
                            {material.type === "video" && (
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {material.duration}
                              </div>
                            )}
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-[#FF6B00]/90 text-white text-xs">
                                Recomendado
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-medium text-[#29335C] dark:text-white line-clamp-1">
                                {material.title}
                              </h3>
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {material.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-[#64748B] dark:text-white/60 mb-2">
                              {material.type === "video"
                                ? material.instructor
                                : material.author}
                            </p>
                            <div className="flex items-center gap-1 mb-1">
                              <Lightbulb className="h-3 w-3 text-[#FF6B00]" />
                              <p className="text-xs text-[#FF6B00] font-medium">
                                {material.reason}
                              </p>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-[#64748B] dark:text-white/60">
                                {material.type === "video"
                                  ? material.duration
                                  : material.type === "artigo"
                                    ? `${material.readTime} de leitura`
                                    : `${material.pages} páginas`}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1 text-xs"
                              >
                                <BookmarkIcon className="h-3 w-3" /> Salvar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="livros">
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {[
                        {
                          id: 1,
                          title: "Cálculo - Volume 1",
                          author: "James Stewart",
                          cover:
                            "https://images.unsplash.com/photo-1621944190310-e3cca1564bd7?w=500&q=80",
                          rating: 4.8,
                          subject: "Matemática",
                          turma: "Cálculo I",
                          pages: 680,
                          year: 2018,
                        },
                        {
                          id: 2,
                          title: "Física Conceitual",
                          author: "Paul G. Hewitt",
                          cover:
                            "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=500&q=80",
                          rating: 4.5,
                          subject: "Física",
                          turma: "Física Quântica",
                          pages: 528,
                          year: 2015,
                        },
                        {
                          id: 3,
                          title: "Química Orgânica",
                          author: "John McMurry",
                          cover:
                            "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=500&q=80",
                          rating: 4.7,
                          subject: "Química",
                          turma: "Química Orgânica",
                          pages: 720,
                          year: 2016,
                        },
                        {
                          id: 4,
                          title: "Biologia Molecular",
                          author: "Bruce Alberts",
                          cover:
                            "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=500&q=80",
                          rating: 4.6,
                          subject: "Biologia",
                          turma: "Biologia Celular",
                          pages: 840,
                          year: 2017,
                        },
                        {
                          id: 5,
                          title: "Álgebra Linear",
                          author: "David C. Lay",
                          cover:
                            "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&q=80",
                          rating: 4.4,
                          subject: "Matemática",
                          turma: "Álgebra Linear",
                          pages: 492,
                          year: 2014,
                        },
                        {
                          id: 6,
                          title: "Termodinâmica",
                          author: "Yunus A. Çengel",
                          cover:
                            "https://images.unsplash.com/photo-1581093458791-9d15482442f5?w=500&q=80",
                          rating: 4.3,
                          subject: "Física",
                          turma: "Termodinâmica",
                          pages: 624,
                          year: 2019,
                        },
                        {
                          id: 7,
                          title: "Bioquímica",
                          author: "Lubert Stryer",
                          cover:
                            "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=500&q=80",
                          rating: 4.5,
                          subject: "Biologia",
                          turma: "Biologia Celular",
                          pages: 736,
                          year: 2020,
                        },
                        {
                          id: 8,
                          title: "Estatística Básica",
                          author: "Pedro A. Morettin",
                          cover:
                            "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=500&q=80",
                          rating: 4.2,
                          subject: "Matemática",
                          turma: "Estatística Aplicada",
                          pages: 380,
                          year: 2017,
                        },
                      ].map((book) => (
                        <div
                          key={book.id}
                          className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
                          onClick={() => openMaterialDetail(book)}
                        >
                          <div className="h-48 overflow-hidden relative">
                            <img
                              src={book.cover}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 right-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-white/80 hover:bg-white text-[#29335C]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle bookmark
                                }}
                              >
                                <Bookmark className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="absolute top-2 left-2">
                              <Badge
                                variant="secondary"
                                className="bg-white/90 text-[#29335C] text-xs"
                              >
                                {book.turma}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3">
                            <Badge variant="outline" className="mb-2">
                              {book.subject}
                            </Badge>
                            <h3 className="font-medium text-[#29335C] dark:text-white line-clamp-1">
                              {book.title}
                            </h3>
                            <p className="text-sm text-[#64748B] dark:text-white/60 mb-2">
                              {book.author}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-medium">
                                  {book.rating}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 text-xs"
                                >
                                  <Download className="h-3 w-3" /> PDF
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 text-xs"
                                >
                                  <BookOpen className="h-3 w-3" /> Ler
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[
                        {
                          id: 1,
                          title: "Cálculo - Volume 1",
                          author: "James Stewart",
                          cover:
                            "https://images.unsplash.com/photo-1621944190310-e3cca1564bd7?w=500&q=80",
                          rating: 4.8,
                          subject: "Matemática",
                          turma: "Cálculo I",
                          pages: 680,
                          year: 2018,
                        },
                        {
                          id: 2,
                          title: "Física Conceitual",
                          author: "Paul G. Hewitt",
                          cover:
                            "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=500&q=80",
                          rating: 4.5,
                          subject: "Física",
                          turma: "Física Quântica",
                          pages: 528,
                          year: 2015,
                        },
                        {
                          id: 3,
                          title: "Química Orgânica",
                          author: "John McMurry",
                          cover:
                            "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=500&q=80",
                          rating: 4.7,
                          subject: "Química",
                          turma: "Química Orgânica",
                          pages: 720,
                          year: 2016,
                        },
                        {
                          id: 4,
                          title: "Biologia Molecular",
                          author: "Bruce Alberts",
                          cover:
                            "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=500&q=80",
                          rating: 4.6,
                          subject: "Biologia",
                          turma: "Biologia Celular",
                          pages: 840,
                          year: 2017,
                        },
                        {
                          id: 5,
                          title: "Álgebra Linear",
                          author: "David C. Lay",
                          cover:
                            "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&q=80",
                          rating: 4.4,
                          subject: "Matemática",
                          turma: "Álgebra Linear",
                          pages: 492,
                          year: 2014,
                        },
                        {
                          id: 6,
                          title: "Termodinâmica",
                          author: "Yunus A. Çengel",
                          cover:
                            "https://images.unsplash.com/photo-1581093458791-9d15482442f5?w=500&q=80",
                          rating: 4.3,
                          subject: "Física",
                          turma: "Termodinâmica",
                          pages: 624,
                          year: 2019,
                        },
                        {
                          id: 7,
                          title: "Bioquímica",
                          author: "Lubert Stryer",
                          cover:
                            "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=500&q=80",
                          rating: 4.5,
                          subject: "Biologia",
                          turma: "Biologia Celular",
                          pages: 736,
                          year: 2020,
                        },
                        {
                          id: 8,
                          title: "Estatística Básica",
                          author: "Pedro A. Morettin",
                          cover:
                            "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=500&q=80",
                          rating: 4.2,
                          subject: "Matemática",
                          turma: "Estatística Aplicada",
                          pages: 380,
                          year: 2017,
                        },
                      ].map((book) => (
                        <div
                          key={book.id}
                          className="bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 p-3 hover:shadow-md transition-all duration-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#0A2540]/80"
                          onClick={() => openMaterialDetail(book)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-md">
                              <img
                                src={book.cover}
                                alt={book.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium text-[#29335C] dark:text-white truncate">
                                    {book.title}
                                  </h3>
                                  <p className="text-sm text-[#64748B] dark:text-white/60">
                                    {book.author}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {book.subject}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {book.turma}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                      <span className="text-xs">
                                        {book.rating}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle bookmark
                                    }}
                                  >
                                    <Bookmark className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle download
                                    }}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle read
                                    }}
                                  >
                                    <BookOpen className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-[#64748B] dark:text-white/60">
                                  {book.pages} páginas • {book.year}
                                </span>
                                <span className="text-xs text-[#64748B] dark:text-white/60">
                                  Adicionado: 15/06/2024
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="artigos">
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        {
                          id: 1,
                          title: "Avanços na Teoria das Cordas",
                          author: "Dr. Richard Feynman",
                          date: "15/06/2024",
                          subject: "Física",
                          readTime: "8 min",
                          turma: "Física Quântica",
                          thumbnail:
                            "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&q=80",
                        },
                        {
                          id: 2,
                          title: "Aplicações de Machine Learning na Medicina",
                          author: "Dra. Maria Silva",
                          date: "12/06/2024",
                          subject: "Tecnologia",
                          readTime: "12 min",
                          turma: "Estatística Aplicada",
                          thumbnail:
                            "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&q=80",
                        },
                        {
                          id: 3,
                          title: "Descobertas Recentes em Neurociência",
                          author: "Dr. João Oliveira",
                          date: "10/06/2024",
                          subject: "Biologia",
                          readTime: "10 min",
                          turma: "Biologia Celular",
                          thumbnail:
                            "https://images.unsplash.com/photo-1559757175-7cb036bd4d31?w=500&q=80",
                        },
                        {
                          id: 4,
                          title: "Métodos Avançados de Integração",
                          author: "Dra. Ana Santos",
                          date: "08/06/2024",
                          subject: "Matemática",
                          readTime: "15 min",
                          turma: "Cálculo I",
                          thumbnail:
                            "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&q=80",
                        },
                        {
                          id: 5,
                          title:
                            "Impacto da Inteligência Artificial na Educação",
                          author: "Dr. Carlos Mendes",
                          date: "05/06/2024",
                          subject: "Tecnologia",
                          readTime: "11 min",
                          turma: "Programação em Python",
                          thumbnail:
                            "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&q=80",
                        },
                        {
                          id: 6,
                          title: "Genética e Hereditariedade",
                          author: "Dra. Juliana Costa",
                          date: "03/06/2024",
                          subject: "Biologia",
                          readTime: "9 min",
                          turma: "Biologia Celular",
                          thumbnail:
                            "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=500&q=80",
                        },
                      ].map((article) => (
                        <div
                          key={article.id}
                          className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
                          onClick={() => openMaterialDetail(article)}
                        >
                          <div className="h-40 overflow-hidden relative">
                            <img
                              src={article.thumbnail}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 right-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-white/80 hover:bg-white text-[#29335C]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle bookmark
                                }}
                              >
                                <Bookmark className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="absolute top-2 left-2">
                              <Badge
                                variant="secondary"
                                className="bg-white/90 text-[#29335C] text-xs"
                              >
                                {article.turma}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <Badge variant="outline">{article.subject}</Badge>
                              <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-white/60">
                                <Clock className="h-3 w-3" /> {article.readTime}{" "}
                                de leitura
                              </div>
                            </div>
                            <h3 className="font-medium text-[#29335C] dark:text-white mb-1 line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-sm text-[#64748B] dark:text-white/60 mb-3">
                              {article.author}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-[#64748B] dark:text-white/60">
                                {article.date}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 text-xs"
                              >
                                <FileText className="h-3 w-3" /> Ler artigo
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[
                        {
                          id: 1,
                          title: "Avanços na Teoria das Cordas",
                          author: "Dr. Richard Feynman",
                          date: "15/06/2024",
                          subject: "Física",
                          readTime: "8 min",
                          turma: "Física Quântica",
                          thumbnail:
                            "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&q=80",
                        },
                        {
                          id: 2,
                          title: "Aplicações de Machine Learning na Medicina",
                          author: "Dra. Maria Silva",
                          date: "12/06/2024",
                          subject: "Tecnologia",
                          readTime: "12 min",
                          turma: "Estatística Aplicada",
                          thumbnail:
                            "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&q=80",
                        },
                        {
                          id: 3,
                          title: "Descobertas Recentes em Neurociência",
                          author: "Dr. João Oliveira",
                          date: "10/06/2024",
                          subject: "Biologia",
                          readTime: "10 min",
                          turma: "Biologia Celular",
                          thumbnail:
                            "https://images.unsplash.com/photo-1559757175-7cb036bd4d31?w=500&q=80",
                        },
                        {
                          id: 4,
                          title: "Métodos Avançados de Integração",
                          author: "Dra. Ana Santos",
                          date: "08/06/2024",
                          subject: "Matemática",
                          readTime: "15 min",
                          turma: "Cálculo I",
                          thumbnail:
                            "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&q=80",
                        },
                        {
                          id: 5,
                          title:
                            "Impacto da Inteligência Artificial na Educação",
                          author: "Dr. Carlos Mendes",
                          date: "05/06/2024",
                          subject: "Tecnologia",
                          readTime: "11 min",
                          turma: "Programação em Python",
                          thumbnail:
                            "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&q=80",
                        },
                        {
                          id: 6,
                          title: "Genética e Hereditariedade",
                          author: "Dra. Juliana Costa",
                          date: "03/06/2024",
                          subject: "Biologia",
                          readTime: "9 min",
                          turma: "Biologia Celular",
                          thumbnail:
                            "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=500&q=80",
                        },
                      ].map((article) => (
                        <div
                          key={article.id}
                          className="bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 p-3 hover:shadow-md transition-all duration-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#0A2540]/80"
                          onClick={() => openMaterialDetail(article)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                              <img
                                src={article.thumbnail}
                                alt={article.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium text-[#29335C] dark:text-white line-clamp-1">
                                    {article.title}
                                  </h3>
                                  <p className="text-sm text-[#64748B] dark:text-white/60">
                                    {article.author}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {article.subject}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {article.turma}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-white/60">
                                      <Clock className="h-3 w-3" />{" "}
                                      {article.readTime}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle bookmark
                                    }}
                                  >
                                    <Bookmark className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle read
                                    }}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-[#64748B] dark:text-white/60">
                                  Publicado: {article.date}
                                </span>
                                <span className="text-xs text-[#64748B] dark:text-white/60">
                                  Adicionado: 16/06/2024
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="videos">
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        {
                          id: 1,
                          title: "Introdução ao Cálculo Diferencial",
                          instructor: "Prof. Carlos Santos",
                          duration: "45:30",
                          thumbnail:
                            "https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=500&q=80",
                          subject: "Matemática",
                          turma: "Cálculo I",
                          views: 1245,
                          date: "10/06/2024",
                        },
                        {
                          id: 2,
                          title: "Mecânica Quântica Básica",
                          instructor: "Profa. Ana Oliveira",
                          duration: "38:15",
                          thumbnail:
                            "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&q=80",
                          subject: "Física",
                          turma: "Física Quântica",
                          views: 987,
                          date: "12/06/2024",
                        },
                        {
                          id: 3,
                          title: "Reações Orgânicas",
                          instructor: "Prof. Roberto Almeida",
                          duration: "52:20",
                          thumbnail:
                            "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=500&q=80",
                          subject: "Química",
                          turma: "Química Orgânica",
                          views: 756,
                          date: "15/06/2024",
                        },
                        {
                          id: 4,
                          title: "Estrutura Celular",
                          instructor: "Profa. Mariana Costa",
                          duration: "41:10",
                          thumbnail:
                            "https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?w=500&q=80",
                          subject: "Biologia",
                          turma: "Biologia Celular",
                          views: 1023,
                          date: "08/06/2024",
                        },
                        {
                          id: 5,
                          title: "Equações Diferenciais",
                          instructor: "Prof. Carlos Santos",
                          duration: "49:25",
                          thumbnail:
                            "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&q=80",
                          subject: "Matemática",
                          turma: "Cálculo I",
                          views: 876,
                          date: "05/06/2024",
                        },
                        {
                          id: 6,
                          title: "Termodinâmica Aplicada",
                          instructor: "Prof. Pedro Oliveira",
                          duration: "37:45",
                          thumbnail:
                            "https://images.unsplash.com/photo-1581093458791-9d15482442f5?w=500&q=80",
                          subject: "Física",
                          turma: "Termodinâmica",
                          views: 654,
                          date: "03/06/2024",
                        },
                      ].map((video) => (
                        <div
                          key={video.id}
                          className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
                          onClick={() => openMaterialDetail(video)}
                        >
                          <div className="h-40 overflow-hidden relative">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-12 w-12 rounded-full bg-white/80 hover:bg-white text-[#FF6B00]"
                              >
                                <Play className="h-6 w-6 ml-1" />
                              </Button>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {video.duration}
                            </div>
                            <div className="absolute top-2 left-2">
                              <Badge
                                variant="secondary"
                                className="bg-white/90 text-[#29335C] text-xs"
                              >
                                {video.turma}
                              </Badge>
                            </div>
                            <div className="absolute top-2 right-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-white/80 hover:bg-white text-[#29335C]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle bookmark
                                }}
                              >
                                <Bookmark className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-3">
                            <Badge variant="outline" className="mb-2">
                              {video.subject}
                            </Badge>
                            <h3 className="font-medium text-[#29335C] dark:text-white line-clamp-1">
                              {video.title}
                            </h3>
                            <p className="text-sm text-[#64748B] dark:text-white/60">
                              {video.instructor}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-white/60">
                                <Eye className="h-3 w-3" /> {video.views}{" "}
                                visualizações
                              </div>
                              <span className="text-xs text-[#64748B] dark:text-white/60">
                                {video.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[
                        {
                          id: 1,
                          title: "Introdução ao Cálculo Diferencial",
                          instructor: "Prof. Carlos Santos",
                          duration: "45:30",
                          thumbnail:
                            "https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=500&q=80",
                          subject: "Matemática",
                          turma: "Cálculo I",
                          views: 1245,
                          date: "10/06/2024",
                        },
                        {
                          id: 2,
                          title: "Mecânica Quântica Básica",
                          instructor: "Profa. Ana Oliveira",
                          duration: "38:15",
                          thumbnail:
                            "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&q=80",
                          subject: "Física",
                          turma: "Física Quântica",
                          views: 987,
                          date: "12/06/2024",
                        },
                        {
                          id: 3,
                          title: "Reações Orgânicas",
                          instructor: "Prof. Roberto Almeida",
                          duration: "52:20",
                          thumbnail:
                            "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=500&q=80",
                          subject: "Química",
                          turma: "Química Orgânica",
                          views: 756,
                          date: "15/06/2024",
                        },
                        {
                          id: 4,
                          title: "Estrutura Celular",
                          instructor: "Profa. Mariana Costa",
                          duration: "41:10",
                          thumbnail:
                            "https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?w=500&q=80",
                          subject: "Biologia",
                          turma: "Biologia Celular",
                          views: 1023,
                          date: "08/06/2024",
                        },
                        {
                          id: 5,
                          title: "Equações Diferenciais",
                          instructor: "Prof. Carlos Santos",
                          duration: "49:25",
                          thumbnail:
                            "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&q=80",
                          subject: "Matemática",
                          turma: "Cálculo I",
                          views: 876,
                          date: "05/06/2024",
                        },
                        {
                          id: 6,
                          title: "Termodinâmica Aplicada",
                          instructor: "Prof. Pedro Oliveira",
                          duration: "37:45",
                          thumbnail:
                            "https://images.unsplash.com/photo-1581093458791-9d15482442f5?w=500&q=80",
                          subject: "Física",
                          turma: "Termodinâmica",
                          views: 654,
                          date: "03/06/2024",
                        },
                      ].map((video) => (
                        <div
                          key={video.id}
                          className="bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 p-3 hover:shadow-md transition-all duration-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#0A2540]/80"
                          onClick={() => openMaterialDetail(video)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-20 w-32 flex-shrink-0 overflow-hidden rounded-md relative">
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Play className="h-6 w-6 text-white" />
                              </div>
                              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                {video.duration}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium text-[#29335C] dark:text-white line-clamp-1">
                                    {video.title}
                                  </h3>
                                  <p className="text-sm text-[#64748B] dark:text-white/60">
                                    {video.instructor}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {video.subject}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {video.turma}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-white/60">
                                      <Eye className="h-3 w-3" /> {video.views}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle bookmark
                                    }}
                                  >
                                    <Bookmark className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle download
                                    }}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-[#64748B] dark:text-white/60">
                                  Publicado: {video.date}
                                </span>
                                <span className="text-xs text-[#64748B] dark:text-white/60">
                                  Adicionado: 18/06/2024
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="disciplinas">
                  Conteúdo de disciplinas
                </TabsContent>
                <TabsContent value="favoritos">
                  Conteúdo de favoritos
                </TabsContent>
                <TabsContent value="trilhas">
                  Conteúdo de trilhas de aprendizagem
                </TabsContent>
              </Tabs>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Material Detail Dialog */}
      <Dialog open={showMaterialDetail} onOpenChange={setShowMaterialDetail}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {selectedMaterial?.title || "Detalhes do Material"}
            </DialogTitle>
            <DialogDescription>
              {selectedMaterial?.type === "video"
                ? "Vídeo"
                : selectedMaterial?.type === "pdf"
                  ? "Documento PDF"
                  : selectedMaterial?.type === "quiz"
                    ? "Questionário"
                    : selectedMaterial?.type === "livro"
                      ? "Livro"
                      : selectedMaterial?.type === "artigo"
                        ? "Artigo"
                        : "Material"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <p>Conteúdo detalhado do material selecionado.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMaterialDetail(false)}
            >
              Fechar
            </Button>
            <Button>
              {selectedMaterial?.type === "video"
                ? "Assistir"
                : selectedMaterial?.type === "pdf" ||
                    selectedMaterial?.type === "livro"
                  ? "Ler"
                  : selectedMaterial?.type === "quiz"
                    ? "Iniciar"
                    : "Acessar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tutorial Dialog */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bem-vindo à Biblioteca</DialogTitle>
            <DialogDescription>
              Conheça os recursos disponíveis na sua biblioteca digital.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Minhas Turmas</h3>
                <p className="text-sm text-muted-foreground">
                  Acesse todos os materiais organizados por turmas.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                <BookText className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Materiais Diversos</h3>
                <p className="text-sm text-muted-foreground">
                  Explore livros, artigos e vídeos organizados por categorias.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full">
                <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <h3 className="font-medium mb-1">
                  Recomendações Personalizadas
                </h3>
                <p className="text-sm text-muted-foreground">
                  Receba sugestões de conteúdo baseadas nos seus interesses e
                  histórico de estudo.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                <Settings className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Acessibilidade</h3>
                <p className="text-sm text-muted-foreground">
                  Personalize a interface com opções de tamanho de fonte,
                  contraste e modo para daltonismo.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTutorial(false)}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
