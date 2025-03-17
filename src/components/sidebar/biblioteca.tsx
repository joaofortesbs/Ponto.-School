import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Plus,
  BookOpen,
  Heart,
  Clock,
  BookText,
  FileText,
  Video,
  Headphones,
  Link,
  BrainCircuit,
  Lightbulb,
  Atom,
  Calculator,
  Beaker,
  Dna,
  GraduationCap,
  BookMarked,
  Star,
  Eye,
  ThumbsUp,
  MessageSquare,
  Users,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  Maximize2,
  LayoutGrid,
  List,
  Bookmark,
  CheckCircle2,
} from "lucide-react";

export function Biblioteca() {
  const [activeTab, setActiveTab] = useState("minhas-turmas");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // list, grid, book
  const [sortBy, setSortBy] = useState("relevance"); // relevance, date, alphabetical, type, popular

  // Mock data for turmas
  const turmas = [
    {
      id: "1",
      name: "Física - 3º Ano",
      icon: <Atom className="h-5 w-5 text-blue-500" />,
    },
    {
      id: "2",
      name: "Matemática - 3º Ano",
      icon: <Calculator className="h-5 w-5 text-orange-500" />,
    },
    {
      id: "3",
      name: "Química - 3º Ano",
      icon: <Beaker className="h-5 w-5 text-green-500" />,
    },
    {
      id: "4",
      name: "Biologia - 3º Ano",
      icon: <Dna className="h-5 w-5 text-purple-500" />,
    },
  ];

  // Mock data for featured content
  const featuredContent = [
    {
      id: "1",
      type: "trilha",
      title: "Sua Trilha de Física",
      description: "Mecânica Clássica e Termodinâmica",
      progress: 65,
      icon: <Atom className="h-6 w-6 text-blue-500" />,
      color: "bg-blue-100 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      action: "Continuar Trilha",
    },
    {
      id: "2",
      type: "recomendado",
      title: "Equações Diferenciais",
      description: "Recomendado pelo Mentor IA",
      icon: <BrainCircuit className="h-6 w-6 text-purple-500" />,
      color: "bg-purple-100 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      action: "Acessar",
    },
    {
      id: "3",
      type: "novidade",
      title: "Termodinâmica - Aula 5",
      description: "Adicionado há 2 dias",
      icon: <Lightbulb className="h-6 w-6 text-yellow-500" />,
      color: "bg-yellow-100 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      action: "Ver",
    },
    {
      id: "4",
      type: "clube-livro",
      title: "Clube do Livro",
      description: "Livro do mês: 'O Universo numa Casca de Noz'",
      icon: <BookMarked className="h-6 w-6 text-green-500" />,
      color: "bg-green-100 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      action: "Participar",
    },
  ];

  // Mock data for materials
  const materials = [
    {
      id: "1",
      title: "Introdução à Mecânica Quântica",
      type: "video",
      icon: <Video className="h-5 w-5 text-red-500" />,
      subject: "Física",
      turma: "Física - 3º Ano",
      date: "2023-10-15",
      author: "Prof. Ricardo Oliveira",
      views: 245,
      likes: 56,
      isNew: true,
      isFavorite: true,
      isRead: false,
      tags: ["Quântica", "Física Moderna", "Partículas"],
    },
    {
      id: "2",
      title: "Equações Diferenciais - Exercícios Resolvidos",
      type: "pdf",
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      subject: "Matemática",
      turma: "Matemática - 3º Ano",
      date: "2023-10-10",
      author: "Profa. Maria Silva",
      views: 189,
      likes: 42,
      isNew: false,
      isFavorite: false,
      isRead: true,
      tags: ["Cálculo", "Equações", "Exercícios"],
    },
    {
      id: "3",
      title: "Podcast: História da Química",
      type: "audio",
      icon: <Headphones className="h-5 w-5 text-green-500" />,
      subject: "Química",
      turma: "Química - 3º Ano",
      date: "2023-10-05",
      author: "Prof. Carlos Santos",
      views: 120,
      likes: 35,
      isNew: false,
      isFavorite: true,
      isRead: false,
      tags: ["História", "Química", "Cientistas"],
    },
    {
      id: "4",
      title: "Mapa Mental: Sistema Circulatório",
      type: "mapa",
      icon: <BrainCircuit className="h-5 w-5 text-purple-500" />,
      subject: "Biologia",
      turma: "Biologia - 3º Ano",
      date: "2023-10-01",
      author: "Profa. Ana Costa",
      views: 210,
      likes: 48,
      isNew: true,
      isFavorite: false,
      isRead: true,
      tags: ["Anatomia", "Circulação", "Coração"],
    },
    {
      id: "5",
      title: "Simulado ENEM - Física e Matemática",
      type: "exercicio",
      icon: <GraduationCap className="h-5 w-5 text-orange-500" />,
      subject: "Multidisciplinar",
      turma: "Física - 3º Ano",
      date: "2023-09-28",
      author: "Equipe Ponto.School",
      views: 315,
      likes: 89,
      isNew: false,
      isFavorite: true,
      isRead: false,
      tags: ["ENEM", "Simulado", "Exercícios"],
    },
  ];

  // Filter materials based on search query and active tab
  const filteredMaterials = materials.filter((material) => {
    // Search filter
    if (
      searchQuery &&
      !material.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Tab filter
    if (activeTab === "minhas-turmas") {
      return true; // Show all for now
    } else if (activeTab === "disciplinas") {
      return true; // Show all for now
    } else if (activeTab === "favoritos") {
      return material.isFavorite;
    } else if (activeTab === "recomendados") {
      return true; // In a real app, this would be filtered by AI recommendations
    } else if (activeTab === "clube-livro") {
      return material.type === "book";
    }

    return true;
  });

  // Sort materials based on sortBy
  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === "alphabetical") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "type") {
      return a.type.localeCompare(b.type);
    } else if (sortBy === "popular") {
      return b.views - a.views;
    }
    return 0; // Default: relevance (no sorting)
  });

  // Render material item based on view mode
  const renderMaterialItem = (material) => {
    if (viewMode === "grid") {
      return (
        <Card
          key={material.id}
          className="overflow-hidden hover:border-[#FF6B00]/50 transition-all duration-200 cursor-pointer"
        >
          <div className="h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            {material.icon}
          </div>
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-medium line-clamp-2">
              {material.title}
            </CardTitle>
          </CardHeader>
          <CardFooter className="p-3 pt-0 flex justify-between items-center">
            <Badge variant="outline" className="text-xs">
              {material.subject}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye className="h-3 w-3" /> {material.views}
            </div>
          </CardFooter>
        </Card>
      );
    } else {
      return (
        <div
          key={material.id}
          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/50 transition-all duration-200 cursor-pointer"
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${material.type === "video" ? "bg-red-100 dark:bg-red-900/20" : material.type === "pdf" ? "bg-blue-100 dark:bg-blue-900/20" : material.type === "audio" ? "bg-green-100 dark:bg-green-900/20" : material.type === "mapa" ? "bg-purple-100 dark:bg-purple-900/20" : "bg-orange-100 dark:bg-orange-900/20"}`}
          >
            {material.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {material.title}
              </p>
              {material.isNew && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">
                  Novo
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{material.subject}</span>
              <span>•</span>
              <span>{new Date(material.date).toLocaleDateString()}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {material.views}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full ${material.isFavorite ? "text-red-500" : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"}`}
            >
              <Heart
                className={`h-4 w-4 ${material.isFavorite ? "fill-red-500" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <CheckCircle2
                className={`h-4 w-4 ${material.isRead ? "fill-green-500 text-green-500" : ""}`}
              />
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4">
        <h2 className="text-2xl font-bold text-[#001427] dark:text-white font-montserrat mb-1">
          Biblioteca
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Seu universo de conhecimento
        </p>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar materiais..."
            className="pl-10 pr-10 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Featured Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {featuredContent.map((item) => (
            <Card
              key={item.id}
              className={`overflow-hidden border ${item.borderColor} hover:shadow-md transition-all duration-200 cursor-pointer`}
            >
              <CardHeader className={`p-4 ${item.color}`}>
                <div className="flex items-center justify-between">
                  {item.icon}
                  <Badge
                    variant="outline"
                    className="bg-white/80 dark:bg-gray-800/80"
                  >
                    {item.type === "trilha"
                      ? "Trilha"
                      : item.type === "recomendado"
                        ? "Recomendado"
                        : item.type === "novidade"
                          ? "Novidade"
                          : "Clube do Livro"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-3">
                <CardTitle className="text-base font-medium mb-1">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {item.description}
                </CardDescription>
                {item.type === "trilha" && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progresso</span>
                      <span>{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                  size="sm"
                >
                  {item.action}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Turmas Cards */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#001427] dark:text-white mb-3">
            Minhas Turmas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {turmas.map((turma) => (
              <Card
                key={turma.id}
                className="overflow-hidden hover:border-[#FF6B00]/50 transition-all duration-200 cursor-pointer"
              >
                <CardHeader className="p-3 flex flex-row items-center gap-2">
                  {turma.icon}
                  <CardTitle className="text-sm font-medium">
                    {turma.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="px-4 pb-2">
          <Tabs
            defaultValue="minhas-turmas"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-5 h-10">
              <TabsTrigger value="minhas-turmas" className="text-xs">
                Minhas Turmas
              </TabsTrigger>
              <TabsTrigger value="disciplinas" className="text-xs">
                Disciplinas
              </TabsTrigger>
              <TabsTrigger value="favoritos" className="text-xs">
                Favoritos
              </TabsTrigger>
              <TabsTrigger value="recomendados" className="text-xs">
                Recomendados
              </TabsTrigger>
              <TabsTrigger value="clube-livro" className="text-xs">
                Clube do Livro
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="px-4 pb-2 flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {sortedMaterials.length} materiais encontrados
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md overflow-hidden">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className={`h-8 w-8 rounded-none ${viewMode === "list" ? "bg-[#FF6B00] text-white" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className={`h-8 w-8 rounded-none ${viewMode === "grid" ? "bg-[#FF6B00] text-white" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <select
              className="h-8 rounded-md border border-gray-200 dark:border-gray-700 text-xs px-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="relevance">Relevância</option>
              <option value="date">Data (Recentes)</option>
              <option value="alphabetical">Alfabética</option>
              <option value="type">Tipo</option>
              <option value="popular">Mais Acessados</option>
            </select>
          </div>
        </div>

        <ScrollArea className="flex-1 px-4 pb-4">
          {activeTab === "clube-livro" ? (
            <div className="space-y-4">
              {/* Clube do Livro Content */}
              <Card className="overflow-hidden border border-green-200 dark:border-green-800">
                <div className="relative h-40 bg-gradient-to-r from-green-500 to-emerald-600">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <BookMarked className="h-12 w-12 mx-auto mb-2" />
                      <h3 className="text-xl font-bold">
                        Clube do Livro Ponto.School
                      </h3>
                      <p className="text-sm opacity-90">
                        Expandindo horizontes através da leitura
                      </p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="text-lg font-bold mb-2">Livro do Mês</h4>
                  <div className="flex gap-4">
                    <div className="w-24 h-36 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                      <BookText className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold">
                        O Universo numa Casca de Noz
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Stephen Hawking
                      </p>
                      <div className="flex items-center gap-1 text-yellow-400 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          (42 avaliações)
                        </span>
                      </div>
                      <p className="text-sm mt-2 line-clamp-2">
                        Uma jornada fascinante pelos mistérios do cosmos,
                        explicados de forma acessível pelo renomado físico
                        teórico.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Ler Agora
                        </Button>
                        <Button size="sm" variant="outline">
                          Ver Discussão
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <MessageSquare className="h-3 w-3 mr-1" /> 28 discussões
                    ativas
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    <Users className="h-3 w-3 mr-1" /> 156 membros
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    <Calendar className="h-3 w-3 mr-1" /> Próximo encontro:
                    15/11
                  </Badge>
                </CardFooter>
              </Card>

              <h4 className="text-lg font-bold mt-6 mb-3">Próximos Livros</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    className="overflow-hidden hover:border-green-500/50 transition-all duration-200 cursor-pointer"
                  >
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <BookText className="h-12 w-12 text-gray-400" />
                    </div>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm font-medium">
                        Título do Livro {i}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Autor do Livro {i}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              <h4 className="text-lg font-bold mt-6 mb-3">Fórum do Clube</h4>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">
                    Discussões Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                          />
                          <AvatarFallback>U{i}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Tópico de discussão {i}
                          </p>
                          <p className="text-xs text-gray-500">
                            Iniciado por Usuário {i} • 5 respostas
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full" variant="outline">
                    Ver Todas as Discussões
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 gap-4"
                  : "space-y-3"
              }
            >
              {sortedMaterials.map(renderMaterialItem)}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

function Calendar(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
