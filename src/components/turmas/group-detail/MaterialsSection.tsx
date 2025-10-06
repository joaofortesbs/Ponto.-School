import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Material } from "./types";
import { materials, topics } from "./data/mockData";
import {
  Search,
  FileText,
  Video,
  BookOpen,
  Zap,
  Brain,
  Download,
  Eye,
  Clock,
  BarChart3,
  Tag,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Play,
  CheckSquare,
  Lightbulb,
  Plus,
  SortAsc,
  SortDesc,
} from "lucide-react";

const MaterialsSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [relevanceThreshold, setRelevanceThreshold] = useState<number[]>([70]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "video":
        return <Video className="h-5 w-5 text-red-500" />;
      case "exercise":
        return <CheckSquare className="h-5 w-5 text-green-500" />;
      case "interactive":
        return <Zap className="h-5 w-5 text-purple-500" />;
      case "quiz":
        return <Brain className="h-5 w-5 text-amber-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Básico":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Intermediário":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "Avançado":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 80) return "text-amber-600 dark:text-amber-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getTopicById = (id: number) => {
    const topic = topics.find((t) => t.id === id);
    return topic ? topic.title : "";
  };

  const filteredMaterials = materials
    .filter((material) => {
      // Search query filter
      if (
        searchQuery &&
        !material.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !material.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Type filter
      if (selectedType !== "all" && material.type !== selectedType) {
        return false;
      }

      // Topic filter
      if (
        selectedTopic !== "all" &&
        material.topic !== parseInt(selectedTopic)
      ) {
        return false;
      }

      // Difficulty filter
      if (
        selectedDifficulty !== "all" &&
        material.difficulty !== selectedDifficulty
      ) {
        return false;
      }

      // Relevance threshold filter
      if (material.relevanceScore < relevanceThreshold[0]) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "relevance":
          comparison = a.relevanceScore - b.relevanceScore;
          break;
        case "date":
          comparison =
            new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case "views":
          comparison = a.views - b.views;
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = a.relevanceScore - b.relevanceScore;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

  const renderMaterialCard = (material: Material) => {
    return (
      <div
        key={material.id}
        className="bg-white dark:bg-[#0f1525] p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-md dark:hover:shadow-gray-900 transition-all"
      >
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/80">
            {getTypeIcon(material.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {material.title}
              </h3>
              <Badge className={getDifficultyColor(material.difficulty)}>
                {material.difficulty}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {material.description}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {material.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center text-gray-500 dark:text-gray-400">
                  <Eye className="h-4 w-4 mr-1" />
                  {material.views}
                </span>
                {material.downloads && (
                  <span className="flex items-center text-gray-500 dark:text-gray-400">
                    <Download className="h-4 w-4 mr-1" />
                    {material.downloads}
                  </span>
                )}
                {material.duration && (
                  <span className="flex items-center text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {material.duration}
                  </span>
                )}
                {material.questions && (
                  <span className="flex items-center text-gray-500 dark:text-gray-400">
                    <CheckSquare className="h-4 w-4 mr-1" />
                    {material.questions} questões
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center font-medium ${getRelevanceColor(
                    material.relevanceScore,
                  )}`}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  {material.relevanceScore}%
                </span>
                <Badge variant="outline" className="text-xs">
                  {getTopicById(material.topic)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Por {material.author} • {material.uploadedAt}
          </div>
          <div className="flex gap-2">
            {material.type === "video" || material.type === "interactive" ? (
              <Button size="sm" className="h-8 bg-[#FF6B00] hover:bg-[#FF8C40]">
                <Play className="h-3.5 w-3.5 mr-1" /> Iniciar
              </Button>
            ) : (
              <Button size="sm" className="h-8 bg-[#FF6B00] hover:bg-[#FF8C40]">
                <Download className="h-3.5 w-3.5 mr-1" /> Baixar
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-gray-200 dark:border-gray-800"
            >
              <Eye className="h-3.5 w-3.5 mr-1" /> Visualizar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-white dark:bg-[#0a101f]">
      <div className="bg-gray-100 dark:bg-[#1a2236] rounded-lg p-4 shadow-sm dark:shadow-gray-900/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Materiais de Estudo
          </h3>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar materiais..."
                className="pl-10 bg-white dark:bg-[#0f1525] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white w-full md:w-64 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f1525]"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {showFilters ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>
              <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white transition-colors">
                <Plus className="h-4 w-4 mr-2" /> Adicionar material
              </Button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white dark:bg-[#0f1525] p-4 rounded-lg mb-4 border border-gray-200 dark:border-gray-800/80 shadow-sm dark:shadow-gray-900/10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">
                  Tipo
                </label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="document">Documentos</SelectItem>
                    <SelectItem value="video">Vídeos</SelectItem>
                    <SelectItem value="exercise">Exercícios</SelectItem>
                    <SelectItem value="interactive">Interativos</SelectItem>
                    <SelectItem value="quiz">Quizzes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">
                  Tópico
                </label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos os tópicos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tópicos</SelectItem>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id.toString()}>
                        {topic.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">
                  Dificuldade
                </label>
                <Select
                  value={selectedDifficulty}
                  onValueChange={setSelectedDifficulty}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas as dificuldades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as dificuldades</SelectItem>
                    <SelectItem value="Básico">Básico</SelectItem>
                    <SelectItem value="Intermediário">Intermediário</SelectItem>
                    <SelectItem value="Avançado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">
                  Relevância mínima: {relevanceThreshold[0]}%
                </label>
                <Slider
                  defaultValue={[70]}
                  max={100}
                  step={5}
                  value={relevanceThreshold}
                  onValueChange={setRelevanceThreshold}
                  className="py-2"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {filteredMaterials.length} materiais encontrados
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Ordenar por:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevância</SelectItem>
                    <SelectItem value="date">Data</SelectItem>
                    <SelectItem value="views">Visualizações</SelectItem>
                    <SelectItem value="title">Título</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 bg-gray-200 dark:bg-gray-800/90 p-1 rounded-full w-full md:w-auto">
            <TabsTrigger
              value="all"
              className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1525] data-[state=active]:text-[#FF6B00]"
            >
              <BookOpen className="h-4 w-4 mr-2" /> Todos
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1525] data-[state=active]:text-[#FF6B00]"
            >
              <FileText className="h-4 w-4 mr-2" /> Documentos
            </TabsTrigger>
            <TabsTrigger
              value="videos"
              className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1525] data-[state=active]:text-[#FF6B00]"
            >
              <Video className="h-4 w-4 mr-2" /> Vídeos
            </TabsTrigger>
            <TabsTrigger
              value="exercises"
              className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1525] data-[state=active]:text-[#FF6B00]"
            >
              <CheckSquare className="h-4 w-4 mr-2" /> Exercícios
            </TabsTrigger>
            <TabsTrigger
              value="interactive"
              className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1525] data-[state=active]:text-[#FF6B00]"
            >
              <Lightbulb className="h-4 w-4 mr-2" /> Interativos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 gap-4">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((material) =>
                  renderMaterialCard(material),
                )
              ) : (
                <div className="text-center py-8 bg-white/50 dark:bg-gray-900/20 rounded-lg border border-gray-100 dark:border-gray-800/50">
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhum material encontrado com os filtros selecionados.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <div className="grid grid-cols-1 gap-4">
              {filteredMaterials
                .filter((m) => m.type === "document")
                .map((material) => renderMaterialCard(material))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-0">
            <div className="grid grid-cols-1 gap-4">
              {filteredMaterials
                .filter((m) => m.type === "video")
                .map((material) => renderMaterialCard(material))}
            </div>
          </TabsContent>

          <TabsContent value="exercises" className="mt-0">
            <div className="grid grid-cols-1 gap-4">
              {filteredMaterials
                .filter((m) => m.type === "exercise" || m.type === "quiz")
                .map((material) => renderMaterialCard(material))}
            </div>
          </TabsContent>

          <TabsContent value="interactive" className="mt-0">
            <div className="grid grid-cols-1 gap-4">
              {filteredMaterials
                .filter((m) => m.type === "interactive")
                .map((material) => renderMaterialCard(material))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MaterialsSection;
