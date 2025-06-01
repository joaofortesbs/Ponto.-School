import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BookMarked,
  Search,
  BookOpen,
  FolderKanban,
  Heart,
  Rocket,
  Filter,
  Plus,
  Clock,
  Star,
  BookText,
  Lightbulb,
  Bookmark,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MaterialCard, { Material } from "./MaterialCard";
import MaterialListItem from "./MaterialListItem";
import TrilhaCard, { Trilha } from "./TrilhaCard";
import DisciplinaCard, { Disciplina } from "./DisciplinaCard";
import FilterPanel from "./FilterPanel";
import ViewToggle from "./ViewToggle";
import SortDropdown from "./SortDropdown";
import SearchBar from "./SearchBar";

export const Portal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const viewParam = searchParams.get("view");

  const [activeTab, setActiveTab] = useState(viewParam || "visao-geral");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<
    "relevance" | "date" | "alphabetical" | "type" | "popular"
  >("relevance");
  const [filters, setFilters] = useState({});
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null,
  );

  // Helper functions for disciplina colors and progress
  const getColorForDisciplina = (name: string) => {
    const colorMap: Record<string, string> = {
      Física: "#4C6EF5",
      Matemática: "#FA5252",
      Português: "#40C057",
      História: "#FD7E14",
      Química: "#7950F2",
      Biologia: "#20C997",
    };
    return colorMap[name] || "#6C757D";
  };

  const getProgressForDisciplina = (name: string) => {
    const progressMap: Record<string, number> = {
      Física: 70,
      Matemática: 45,
      Português: 60,
      História: 85,
      Química: 30,
      Biologia: 55,
    };
    return progressMap[name] || 0;
  };

  // Update the URL when tab changes
  useEffect(() => {
    if (activeTab === "visao-geral") {
      navigate("/portal", { replace: true });
    } else {
      navigate(`/portal?view=${activeTab}`, { replace: true });
    }
  }, [activeTab, navigate]);

  // Update the active tab when URL changes
  useEffect(() => {
    if (viewParam) {
      setActiveTab(viewParam);
    } else {
      setActiveTab("visao-geral");
    }
  }, [viewParam, location.search]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // Implement search functionality
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    console.log("Applied filters:", newFilters);
    // Implement filter functionality
  };

  const handleSortChange = (
    option: "relevance" | "date" | "alphabetical" | "type" | "popular",
  ) => {
    setSortOption(option);
    console.log("Sort changed to:", option);
    // Implement sort functionality
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  const handleMaterialClick = (material: Material) => {
    setSelectedMaterial(material);
    setShowFocusMode(true);
  };

  // Mock data for the portal sections
  const recentMaterials = [
    {
      id: "1",
      title: "Introdução à Física Quântica",
      type: "video",
      date: "2023-05-15",
      turma: "Física Avançada",
      disciplina: "Física",
      progress: 75,
      isFavorite: true,
      isRead: false,
      status: "new",
      thumbnail:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    },
    {
      id: "2",
      title: "Cálculo Diferencial",
      type: "pdf",
      date: "2023-05-12",
      turma: "Cálculo I",
      disciplina: "Matemática",
      progress: 40,
      isFavorite: false,
      isRead: true,
      status: "recommended",
      thumbnail:
        "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
    },
    {
      id: "3",
      title: "Literatura Brasileira",
      type: "audio",
      date: "2023-05-10",
      turma: "Literatura",
      disciplina: "Português",
      progress: 60,
      isFavorite: true,
      isRead: true,
      status: "saved",
      thumbnail:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
    },
    {
      id: "4",
      title: "Revolução Industrial",
      type: "mindmap",
      date: "2023-05-05",
      turma: "História Geral",
      disciplina: "História",
      progress: 90,
      isFavorite: false,
      isRead: false,
      status: "new",
      thumbnail:
        "https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=800&q=80",
    },
  ] as Material[];

  const recommendedMaterials = [
    {
      id: "5",
      title: "Fundamentos de Eletromagnetismo",
      type: "video",
      date: "2023-05-18",
      turma: "Física Avançada",
      disciplina: "Física",
      progress: 0,
      isFavorite: false,
      isRead: false,
      status: "recommended",
      thumbnail:
        "https://images.unsplash.com/photo-1581093458791-9f3c3900fbdb?w=800&q=80",
    },
    {
      id: "6",
      title: "Equações Diferenciais",
      type: "pdf",
      date: "2023-05-16",
      turma: "Cálculo I",
      disciplina: "Matemática",
      progress: 0,
      isFavorite: false,
      isRead: false,
      status: "recommended",
      thumbnail:
        "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&q=80",
    },
    {
      id: "7",
      title: "Análise Literária Moderna",
      type: "pdf",
      date: "2023-05-14",
      turma: "Literatura",
      disciplina: "Português",
      progress: 0,
      isFavorite: false,
      isRead: false,
      status: "recommended",
      thumbnail:
        "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=800&q=80",
    },
  ] as Material[];

  const turmas = [
    {
      id: "1",
      name: "Física Avançada",
      professor: "Dr. Ricardo Alves",
      students: 28,
      progress: 65,
      nextClass: "Amanhã, 14:00",
    },
    {
      id: "2",
      name: "Cálculo I",
      professor: "Dra. Maria Silva",
      students: 35,
      progress: 50,
      nextClass: "Quinta, 10:00",
    },
    {
      id: "3",
      name: "Literatura Contemporânea",
      professor: "Prof. João Costa",
      students: 22,
      progress: 80,
      nextClass: "Sexta, 16:00",
    },
  ];

  const disciplinas = [
    {
      id: "1",
      name: "Física",
      materialsCount: 24,
      image:
        "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
    },
    {
      id: "2",
      name: "Matemática",
      materialsCount: 32,
      image:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    },
    {
      id: "3",
      name: "Português",
      materialsCount: 18,
      image:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
    },
    {
      id: "4",
      name: "História",
      materialsCount: 15,
      image:
        "https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=800&q=80",
    },
    {
      id: "5",
      name: "Química",
      materialsCount: 22,
      image:
        "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80",
    },
    {
      id: "6",
      name: "Biologia",
      materialsCount: 20,
      image:
        "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
    },
  ] as Disciplina[];

  const favoritos = [
    {
      id: "1",
      title: "Resumo de Física Quântica",
      type: "pdf",
      date: "2023-05-08",
      turma: "Física Avançada",
      disciplina: "Física",
      isFavorite: true,
      isRead: true,
      author: "Dr. Ricardo Alves",
      fileSize: "2.5 MB",
      thumbnail:
        "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
    },
    {
      id: "2",
      title: "Fórmulas de Cálculo",
      type: "pdf",
      date: "2023-04-25",
      turma: "Cálculo I",
      disciplina: "Matemática",
      isFavorite: true,
      isRead: false,
      author: "Dra. Maria Silva",
      fileSize: "1.8 MB",
      thumbnail:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    },
    {
      id: "3",
      title: "Livro: Dom Casmurro",
      type: "pdf",
      date: "2023-04-15",
      turma: "Literatura",
      disciplina: "Português",
      isFavorite: true,
      isRead: true,
      author: "Machado de Assis",
      fileSize: "4.2 MB",
      thumbnail:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
    },
  ] as Material[];

  const trilhas = [
    {
      id: "1",
      name: "Preparação para o ENEM",
      progress: 45,
      nextStep: "Física: Mecânica",
      materialsCount: 24,
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
      enrolled: 1250,
    },
    {
      id: "2",
      name: "Física para Concursos",
      progress: 30,
      nextStep: "Eletromagnetismo",
      materialsCount: 18,
      image:
        "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
      enrolled: 850,
    },
    {
      id: "3",
      name: "Redação Nota 1000",
      progress: 70,
      nextStep: "Dissertação Argumentativa",
      materialsCount: 12,
      image:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
      enrolled: 2100,
    },
  ] as Trilha[];

  // Focus Mode Component
  const FocusMode = () => {
    if (!selectedMaterial) return null;

    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-[#001427] overflow-auto">
        <div className="container mx-auto py-6 px-4 max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#001427] dark:text-white">
              {selectedMaterial.title}
            </h1>
            <Button
              variant="ghost"
              onClick={() => setShowFocusMode(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Sair do modo foco
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
            {selectedMaterial.type === "video" ? (
              <div className="aspect-video bg-black">
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p>Player de vídeo simulado</p>
                </div>
              </div>
            ) : selectedMaterial.type === "pdf" ? (
              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 p-8">
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Visualizador de PDF simulado
                  </p>
                </div>
              </div>
            ) : selectedMaterial.type === "audio" ? (
              <div className="p-8">
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Player de áudio simulado
                  </p>
                </div>
              </div>
            ) : (
              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 p-8">
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Visualizador de conteúdo simulado
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">
                        Descrição
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Este material aborda os conceitos fundamentais de{" "}
                        {selectedMaterial.disciplina} com foco em{" "}
                        {selectedMaterial.title.toLowerCase()}.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-gray-700 dark:text-gray-300">
                          Disciplina
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {selectedMaterial.disciplina}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700 dark:text-gray-300">
                          Turma
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {selectedMaterial.turma}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700 dark:text-gray-300">
                          Tipo
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {selectedMaterial.type}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700 dark:text-gray-300">
                          Data de publicação
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {new Date(selectedMaterial.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Anotações</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full h-32 p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B00] dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Adicione suas anotações aqui..."
                  ></textarea>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Salvar anotações
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#001427]">
      {showFocusMode && <FocusMode />}

      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header with title and search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-[#001427] to-[#294D61] p-3 rounded-lg mr-4">
              <BookMarked className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#001427] dark:text-white">
                Portal
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Seu universo de conhecimento
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              className="w-full md:w-80"
            />
            <FilterPanel onApplyFilters={handleApplyFilters} />
          </div>
        </div>

        {/* Featured Cards Section - Only on visao-geral */}
        {activeTab === "visao-geral" && (
          <div className="mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Current Trilha Card */}
              <Card className="md:col-span-2 bg-gradient-to-br from-[#001427] to-[#294D61] text-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <GraduationCap className="h-6 w-6 mr-2" />
                    <h2 className="text-xl font-semibold">Sua Trilha Atual</h2>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{trilhas[0].name}</h3>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span>Progresso geral</span>
                      <span className="font-medium">
                        {trilhas[0].progress}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full"
                        style={{ width: `${trilhas[0].progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-center">
                      <Rocket className="h-5 w-5 mr-2" />
                      <span className="font-medium">Próximo passo:</span>
                    </div>
                    <p className="mt-1">{trilhas[0].nextStep}</p>
                  </div>
                  <Button className="bg-white text-[#001427] hover:bg-white/90">
                    Continuar Trilha
                  </Button>
                </CardContent>
              </Card>

              {/* Mentor AI Recommendations */}
              <Card className="bg-gradient-to-br from-[#FF6B00] to-[#FF9248] text-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Sparkles className="h-6 w-6 mr-2" />
                    <h2 className="text-xl font-semibold">Epictus IA</h2>
                  </div>
                  <p className="mb-4">
                    Recomendações personalizadas para você:
                  </p>
                  <ul className="space-y-3 mb-6">
                    {recommendedMaterials.slice(0, 2).map((material) => (
                      <li key={material.id} className="flex items-start">
                        <Lightbulb className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">{material.title}</p>
                          <p className="text-sm text-white/80">
                            {material.disciplina}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Button className="bg-white text-[#FF6B00] hover:bg-white/90">
                    Ver todas as recomendações
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Continue Studying Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-[#FF6B00] mr-2" />
                  <h2 className="text-xl font-bold text-[#001427] dark:text-white">
                    Continue Estudando
                  </h2>
                </div>
                <Button variant="ghost" className="text-[#FF6B00]">
                  Ver todos
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {recentMaterials.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    onClick={() => handleMaterialClick(material)}
                  />
                ))}
              </div>
            </div>

            {/* Recommended Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-[#FF6B00] mr-2" />
                  <h2 className="text-xl font-bold text-[#001427] dark:text-white">
                    Recomendado para Você
                  </h2>
                </div>
                <Button variant="ghost" className="text-[#FF6B00]">
                  Ver todos
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendedMaterials.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    onClick={() => handleMaterialClick(material)}
                  />
                ))}
              </div>
            </div>

            {/* Quick Access Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Disciplinas */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <BookText className="h-5 w-5 mr-2 text-[#FF6B00]" />
                    Disciplinas
                  </CardTitle>
                  <CardDescription>
                    Acesso rápido às suas disciplinas
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    {disciplinas.slice(0, 4).map((disciplina) => (
                      <div
                        key={disciplina.id}
                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                        style={{
                          borderLeftColor: getColorForDisciplina(
                            disciplina.name,
                          ),
                          borderLeftWidth: "4px",
                        }}
                      >
                        <h3 className="font-medium text-[#001427] dark:text-white">
                          {disciplina.name}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {disciplina.materialsCount} materiais
                          </span>
                          <span
                            className="text-xs font-medium"
                            style={{
                              color: getColorForDisciplina(disciplina.name),
                            }}
                          >
                            {getProgressForDisciplina(disciplina.name)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${getProgressForDisciplina(disciplina.name)}%`,
                              backgroundColor: getColorForDisciplina(
                                disciplina.name,
                              ),
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full text-[#FF6B00] hover:text-[#FF6B00]/80 hover:bg-[#FF6B00]/10"
                    onClick={() => setActiveTab("disciplinas")}
                  >
                    Ver todas as disciplinas
                  </Button>
                </CardFooter>
              </Card>

              {/* Favoritos */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Bookmark className="h-5 w-5 mr-2 text-[#FF6B00]" />
                    Favoritos
                  </CardTitle>
                  <CardDescription>Seus materiais favoritos</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-3">
                    {favoritos.slice(0, 3).map((favorito) => (
                      <div
                        key={favorito.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => handleMaterialClick(favorito)}
                      >
                        <div>
                          <h3 className="font-medium text-[#001427] dark:text-white">
                            {favorito.title}
                          </h3>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="mr-2 text-xs">
                              {favorito.type}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {favorito.disciplina}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(favorito.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full text-[#FF6B00] hover:text-[#FF6B00]/80 hover:bg-[#FF6B00]/10"
                    onClick={() => setActiveTab("favoritos")}
                  >
                    Ver todos os favoritos
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="mb-6"
        >
          <TabsList className="mb-6 bg-transparent border-b w-full justify-start gap-6 rounded-none p-0">
            <TabsTrigger
              value="visao-geral"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] rounded-none pb-2 px-1"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="minhas-turmas"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] rounded-none pb-2 px-1"
            >
              Minhas Turmas
            </TabsTrigger>
            <TabsTrigger
              value="disciplinas"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] rounded-none pb-2 px-1"
            >
              Disciplinas
            </TabsTrigger>
            <TabsTrigger
              value="favoritos"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] rounded-none pb-2 px-1"
            >
              Favoritos
            </TabsTrigger>
            <TabsTrigger
              value="trilhas"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] rounded-none pb-2 px-1"
            >
              Trilhas
            </TabsTrigger>
          </TabsList>

          {/* Minhas Turmas */}
          <TabsContent value="minhas-turmas">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#001427] dark:text-white">
                Minhas Turmas
              </h2>
              <div className="flex items-center gap-2">
                <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Turma
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {turmas.map((turma) => (
                <Card
                  key={turma.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardHeader className="pb-2">
                    <CardTitle>{turma.name}</CardTitle>
                    <CardDescription>{turma.professor}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {turma.students} alunos
                      </span>
                      <span className="text-sm font-medium text-[#FF6B00]">
                        {turma.progress}% concluído
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-[#FF6B00] rounded-full"
                        style={{ width: `${turma.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Próxima aula:</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {turma.nextClass}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                      Acessar turma
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {/* Card para adicionar nova turma */}
              <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center p-6 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adicionar Nova Turma
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                  Crie ou participe de uma nova turma
                </p>
                <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                  Nova Turma
                </Button>
              </Card>
            </div>
          </TabsContent>

          {/* Disciplinas */}
          <TabsContent value="disciplinas">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#001427] dark:text-white">
                Disciplinas
              </h2>
              <div className="flex items-center gap-3">
                <ViewToggle
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                />
                <SortDropdown
                  sortOption={sortOption}
                  onSortChange={handleSortChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {disciplinas.map((disciplina) => (
                <DisciplinaCard key={disciplina.id} disciplina={disciplina} />
              ))}
            </div>
          </TabsContent>

          {/* Favoritos */}
          <TabsContent value="favoritos">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#001427] dark:text-white">
                Favoritos
              </h2>
              <div className="flex items-center gap-3">
                <ViewToggle
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                />
                <SortDropdown
                  sortOption={sortOption}
                  onSortChange={handleSortChange}
                />
              </div>
            </div>

            {viewMode === "list" ? (
              <div className="grid grid-cols-1 gap-4">
                {favoritos.map((favorito) => (
                  <MaterialListItem
                    key={favorito.id}
                    material={favorito}
                    onClick={() => handleMaterialClick(favorito)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {favoritos.map((favorito) => (
                  <MaterialCard
                    key={favorito.id}
                    material={favorito}
                    onClick={() => handleMaterialClick(favorito)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Trilhas */}
          <TabsContent value="trilhas">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#001427] dark:text-white">
                Trilhas de Aprendizado
              </h2>
              <div className="flex items-center gap-3">
                <SortDropdown
                  sortOption={sortOption}
                  onSortChange={handleSortChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trilhas.map((trilha) => (
                <TrilhaCard key={trilha.id} trilha={trilha} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
