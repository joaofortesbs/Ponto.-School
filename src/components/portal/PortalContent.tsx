import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
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
import {
  BookMarked,
  Search,
  Filter,
  LayoutGrid,
  List,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import MaterialCard, { Material } from "./MaterialCard";
import MaterialListItem from "./MaterialListItem";
import TurmaCard, { Turma } from "./TurmaCard";
import DisciplinaCard, { Disciplina } from "./DisciplinaCard";
import TrilhaCard, { Trilha } from "./TrilhaCard";
import RecentlyAccessedItem from "./RecentlyAccessedItem";
import FilterPanel from "./FilterPanel";
import MaterialViewer from "./MaterialViewer";

// Mock data
const mockTurmas: Turma[] = [
  {
    id: "t1",
    name: "Cálculo I",
    professor: "Prof. Ricardo Oliveira",
    materialsCount: 24,
    progress: 65,
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
  },
  {
    id: "t2",
    name: "Física Quântica",
    professor: "Profa. Ana Soares",
    materialsCount: 18,
    progress: 42,
    image:
      "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
  },
  {
    id: "t3",
    name: "Programação Avançada",
    professor: "Prof. Carlos Mendes",
    materialsCount: 32,
    progress: 78,
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  },
  {
    id: "t4",
    name: "Estatística Aplicada",
    professor: "Profa. Juliana Costa",
    materialsCount: 15,
    progress: 30,
    image:
      "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&q=80",
  },
];

const mockDisciplinas: Disciplina[] = [
  {
    id: "d1",
    name: "Matemática",
    materialsCount: 87,
    image:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
  },
  {
    id: "d2",
    name: "Física",
    materialsCount: 64,
    image:
      "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
  },
  {
    id: "d3",
    name: "Computação",
    materialsCount: 112,
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  },
  {
    id: "d4",
    name: "Estatística",
    materialsCount: 43,
    image:
      "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&q=80",
  },
];

const mockTrilhas: Trilha[] = [
  {
    id: "tr1",
    name: "Fundamentos de Cálculo",
    progress: 65,
    nextStep: "Limites e Continuidade",
    materialsCount: 12,
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
  },
  {
    id: "tr2",
    name: "Introdução à Física Quântica",
    progress: 30,
    nextStep: "Princípio da Incerteza",
    materialsCount: 15,
    image:
      "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
  },
  {
    id: "tr3",
    name: "Programação Orientada a Objetos",
    progress: 80,
    nextStep: "Padrões de Design",
    materialsCount: 18,
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  },
];

const mockMaterials: Material[] = [
  {
    id: "m1",
    title: "Introdução ao Cálculo Diferencial",
    type: "video",
    turma: "Cálculo I",
    disciplina: "Matemática",
    date: "2023-10-15",
    author: "Prof. Ricardo Oliveira",
    duration: "45 min",
    rating: 4.8,
    views: 324,
    status: "recommended",
    isFavorite: true,
    isRead: true,
    thumbnail:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    description:
      "Uma introdução aos conceitos fundamentais do cálculo diferencial, incluindo limites, continuidade e derivadas.",
  },
  {
    id: "m2",
    title: "Fundamentos da Mecânica Quântica",
    type: "pdf",
    turma: "Física Quântica",
    disciplina: "Física",
    date: "2023-10-10",
    author: "Profa. Ana Soares",
    fileSize: "2.4 MB",
    rating: 4.5,
    views: 187,
    status: "new",
    isFavorite: false,
    isRead: false,
    thumbnail:
      "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
    description:
      "Este documento apresenta os princípios fundamentais da mecânica quântica, incluindo a dualidade onda-partícula e o princípio da incerteza.",
  },
  {
    id: "m3",
    title: "Algoritmos de Ordenação Avançados",
    type: "video",
    turma: "Programação Avançada",
    disciplina: "Computação",
    date: "2023-10-05",
    author: "Prof. Carlos Mendes",
    duration: "60 min",
    rating: 4.9,
    views: 412,
    status: "recommended",
    isFavorite: true,
    isRead: true,
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    description:
      "Uma análise detalhada dos algoritmos de ordenação mais eficientes, incluindo QuickSort, MergeSort e HeapSort.",
  },
  {
    id: "m4",
    title: "Distribuições de Probabilidade",
    type: "pdf",
    turma: "Estatística Aplicada",
    disciplina: "Estatística",
    date: "2023-09-28",
    author: "Profa. Juliana Costa",
    fileSize: "1.8 MB",
    rating: 4.6,
    views: 156,
    status: "saved",
    isFavorite: false,
    isRead: true,
    thumbnail:
      "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&q=80",
    description:
      "Este documento aborda as principais distribuições de probabilidade, incluindo a distribuição normal, binomial e de Poisson.",
  },
  {
    id: "m5",
    title: "Podcast: Fronteiras da Física Moderna",
    type: "audio",
    turma: "Física Quântica",
    disciplina: "Física",
    date: "2023-09-20",
    author: "Profa. Ana Soares e Dr. Paulo Freitas",
    duration: "35 min",
    rating: 4.7,
    views: 98,
    status: "recommended",
    isFavorite: true,
    isRead: false,
    thumbnail:
      "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
    description:
      "Uma conversa fascinante sobre os avanços recentes na física moderna, incluindo a teoria das cordas e a matéria escura.",
  },
  {
    id: "m6",
    title: "Exercícios de Integração",
    type: "exercise",
    turma: "Cálculo I",
    disciplina: "Matemática",
    date: "2023-09-15",
    author: "Prof. Ricardo Oliveira",
    rating: 4.4,
    views: 276,
    status: "new",
    isFavorite: false,
    isRead: false,
    thumbnail:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    description:
      "Uma série de exercícios práticos sobre integração, incluindo técnicas de substituição e integração por partes.",
  },
  {
    id: "m7",
    title: "Artigo: Avanços em Inteligência Artificial",
    type: "link",
    turma: "Programação Avançada",
    disciplina: "Computação",
    date: "2023-09-10",
    author: "Revista Tech Insights",
    rating: 4.8,
    views: 345,
    status: "recommended",
    isFavorite: true,
    isRead: true,
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    description:
      "Um artigo recente sobre os últimos avanços em inteligência artificial e aprendizado de máquina.",
  },
  {
    id: "m8",
    title: "Mapa Mental: Testes de Hipóteses",
    type: "mindmap",
    turma: "Estatística Aplicada",
    disciplina: "Estatística",
    date: "2023-09-05",
    author: "Profa. Juliana Costa",
    rating: 4.5,
    views: 132,
    status: "saved",
    isFavorite: false,
    isRead: true,
    thumbnail:
      "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&q=80",
    description:
      "Um mapa mental abrangente sobre testes de hipóteses, incluindo testes paramétricos e não paramétricos.",
  },
];

const mockRecommendations = mockMaterials
  .filter((m) => m.status === "recommended")
  .slice(0, 4);
const mockRecentlyAccessed = mockMaterials.filter((m) => m.isRead).slice(0, 3);
const mockNewMaterials = mockMaterials
  .filter((m) => m.status === "new")
  .slice(0, 4);
const mockFavorites = mockMaterials.filter((m) => m.isFavorite);

const PortalContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null,
  );
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleOpenMaterial = (material: Material) => {
    setSelectedMaterial(material);
    setIsViewerOpen(true);
  };

  const renderContent = () => {
    switch (view) {
      case "minhas-turmas":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#001427] dark:text-white">
                Minhas Turmas
              </h2>
              <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                Adicionar Turma
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockTurmas.map((turma) => (
                <TurmaCard key={turma.id} turma={turma} />
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold text-[#001427] dark:text-white mb-4">
                Estudos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mockTurmas.slice(0, 3).map((turma) => (
                  <div
                    key={turma.id}
                    className="bg-white dark:bg-[#1E293B] rounded-lg shadow-md p-4 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center mb-3">
                      <div className="h-12 w-12 rounded-lg overflow-hidden mr-3">
                        <img
                          src={turma.image}
                          alt={turma.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-[#001427] dark:text-white">
                          {turma.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {turma.professor}
                        </p>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 mt-2"
                      size="sm"
                    >
                      Ver detalhes
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold text-[#001427] dark:text-white mb-4">
                Estudos 2
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mockTurmas.slice(1, 4).map((turma) => (
                  <div
                    key={turma.id}
                    className="bg-white dark:bg-[#1E293B] rounded-lg shadow-md p-4 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center mb-3">
                      <div className="h-12 w-12 rounded-lg overflow-hidden mr-3">
                        <img
                          src={turma.image}
                          alt={turma.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-[#001427] dark:text-white">
                          {turma.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {turma.professor}
                        </p>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 mt-2"
                      size="sm"
                    >
                      Ver detalhes
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "disciplinas":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#001427] dark:text-white">
                Disciplinas
              </h2>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar disciplina..."
                  className="w-64"
                  prefix={<Search className="h-4 w-4 text-gray-400" />}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockDisciplinas.map((disciplina) => (
                <DisciplinaCard key={disciplina.id} disciplina={disciplina} />
              ))}
            </div>
          </div>
        );

      case "favoritos":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#001427] dark:text-white">
                Favoritos
              </h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filtros</span>
                </Button>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-none h-9 px-3",
                      viewMode === "grid" ? "bg-gray-100 dark:bg-gray-800" : "",
                    )}
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-none h-9 px-3",
                      viewMode === "list" ? "bg-gray-100 dark:bg-gray-800" : "",
                    )}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <FilterPanel
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              mockTurmas={mockTurmas}
            />

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mockFavorites.map((material) => (
                  <div
                    key={material.id}
                    onClick={() => handleOpenMaterial(material)}
                    className="cursor-pointer"
                  >
                    <MaterialCard material={material} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
                {mockFavorites.map((material) => (
                  <div
                    key={material.id}
                    onClick={() => handleOpenMaterial(material)}
                    className="cursor-pointer pt-4 first:pt-0"
                  >
                    <MaterialListItem material={material} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "trilhas":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#001427] dark:text-white">
                Trilhas de Aprendizado
              </h2>
              <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                Explorar Trilhas
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTrilhas.map((trilha) => (
                <TrilhaCard key={trilha.id} trilha={trilha} />
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#001427] dark:text-white">
                Portal de Materiais
              </h2>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar materiais..."
                  className="w-64"
                  prefix={<Search className="h-4 w-4 text-gray-400" />}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filtros</span>
                </Button>
              </div>
            </div>

            <FilterPanel
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              mockTurmas={mockTurmas}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-8">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-semibold text-[#001427] dark:text-white">
                        Recomendados para você
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                      >
                        Ver todos
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    <CardDescription>
                      Baseado nos seus interesses e histórico de estudo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {mockRecommendations.map((material) => (
                        <div
                          key={material.id}
                          onClick={() => handleOpenMaterial(material)}
                          className="cursor-pointer"
                        >
                          <MaterialCard material={material} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-semibold text-[#001427] dark:text-white">
                        Novos Materiais
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                      >
                        Ver todos
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    <CardDescription>
                      Materiais adicionados recentemente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {mockNewMaterials.map((material) => (
                        <div
                          key={material.id}
                          onClick={() => handleOpenMaterial(material)}
                          className="cursor-pointer"
                        >
                          <MaterialCard material={material} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-[#001427] dark:text-white">
                      Acessados Recentemente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {mockRecentlyAccessed.map((material) => (
                      <div
                        key={material.id}
                        onClick={() => handleOpenMaterial(material)}
                        className="cursor-pointer"
                      >
                        <RecentlyAccessedItem material={material} />
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    >
                      Ver histórico completo
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-[#001427] dark:text-white">
                      Estudos 2
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockTurmas.slice(0, 3).map((turma) => (
                      <div
                        key={turma.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#001427]/40 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg overflow-hidden mr-3">
                            <img
                              src={turma.image}
                              alt={turma.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-[#001427] dark:text-white">
                              {turma.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {turma.professor}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                      onClick={() => navigate("/portal?view=minhas-turmas")}
                    >
                      Ver todos os estudos
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-[#001427] dark:text-white">
                      Minhas Turmas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockTurmas.slice(0, 3).map((turma) => (
                      <div
                        key={turma.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#001427]/40 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg overflow-hidden mr-3">
                            <img
                              src={turma.image}
                              alt={turma.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-[#001427] dark:text-white">
                              {turma.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {turma.professor}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                      onClick={() => navigate("/portal?view=minhas-turmas")}
                    >
                      Ver todas as turmas
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <h3 className="text-xl font-bold text-[#001427] dark:text-white">
                Todos os Materiais
              </h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center border rounded-md overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-none h-9 px-3",
                      viewMode === "grid" ? "bg-gray-100 dark:bg-gray-800" : "",
                    )}
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-none h-9 px-3",
                      viewMode === "list" ? "bg-gray-100 dark:bg-gray-800" : "",
                    )}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mockMaterials.map((material) => (
                  <div
                    key={material.id}
                    onClick={() => handleOpenMaterial(material)}
                    className="cursor-pointer"
                  >
                    <MaterialCard material={material} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
                {mockMaterials.map((material) => (
                  <div
                    key={material.id}
                    onClick={() => handleOpenMaterial(material)}
                    className="cursor-pointer pt-4 first:pt-0"
                  >
                    <MaterialListItem material={material} />
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 min-w-8 px-3 bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90 hover:text-white"
                >
                  1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 min-w-8 px-3"
                >
                  2
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 min-w-8 px-3"
                >
                  3
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ...
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 min-w-8 px-3"
                >
                  12
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      {renderContent()}

      <MaterialViewer
        material={selectedMaterial}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  );
};

export default PortalContent;
