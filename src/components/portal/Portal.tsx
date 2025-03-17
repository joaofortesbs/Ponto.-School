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

export function Portal() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const viewParam = searchParams.get("view");

  const [activeTab, setActiveTab] = useState(viewParam || "visao-geral");
  const [searchQuery, setSearchQuery] = useState("");

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
    },
    {
      id: "2",
      name: "Física para Concursos",
      progress: 30,
      nextStep: "Eletromagnetismo",
      materialsCount: 18,
      image:
        "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
    },
    {
      id: "3",
      name: "Redação Nota 1000",
      progress: 70,
      nextStep: "Dissertação Argumentativa",
      materialsCount: 12,
      image:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    },
  ] as Trilha[];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#001427]">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BookMarked className="h-6 w-6 text-[#FF6B00] mr-2" />
            <h1 className="text-3xl font-bold text-[#001427] dark:text-white">
              Portal
            </h1>
          </div>
          <div className="relative w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar materiais, disciplinas, turmas..."
              className="pl-10 pr-4 py-2 rounded-full border-gray-300 dark:border-gray-700 focus:ring-[#FF6B00] focus:border-[#FF6B00]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="mb-6"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="minhas-turmas">Minhas Turmas</TabsTrigger>
            <TabsTrigger value="disciplinas">Disciplinas</TabsTrigger>
            <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
            <TabsTrigger value="trilhas">Trilhas</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="visao-geral">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-[#FF6B00]" />
                    Materiais Recentes
                  </CardTitle>
                  <CardDescription>Últimos materiais acessados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <div>
                          <h3 className="font-medium text-[#001427] dark:text-white">
                            {material.title}
                          </h3>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="mr-2 text-xs">
                              {material.type}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(material.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FF6B00] rounded-full"
                            style={{ width: `${material.progress}%` }}
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
                  >
                    Ver todos os materiais
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FolderKanban className="h-5 w-5 mr-2 text-[#FF6B00]" />
                    Disciplinas
                  </CardTitle>
                  <CardDescription>Progresso por disciplina</CardDescription>
                </CardHeader>
                <CardContent>
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Rocket className="h-5 w-5 mr-2 text-[#FF6B00]" />
                    Trilhas de Aprendizado
                  </CardTitle>
                  <CardDescription>
                    Trilhas recomendadas para você
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trilhas.map((trilha) => (
                      <div
                        key={trilha.id}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <h3 className="font-medium text-[#001427] dark:text-white">
                          {trilha.name}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400 mr-3">
                              {trilha.materialsCount} materiais
                            </span>
                          </div>
                          <span className="text-xs font-medium text-[#FF6B00]">
                            {trilha.progress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="h-full bg-[#FF6B00] rounded-full"
                            style={{ width: `${trilha.progress}%` }}
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
                    onClick={() => setActiveTab("trilhas")}
                  >
                    Explorar todas as trilhas
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-[#FF6B00]" />
                    Favoritos
                  </CardTitle>
                  <CardDescription>Seus materiais favoritos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {favoritos.map((favorito) => (
                      <div
                        key={favorito.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
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
          </TabsContent>

          {/* Minhas Turmas */}
          <TabsContent value="minhas-turmas">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#001427] dark:text-white">
                Minhas Turmas
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtrar
                </Button>
                <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
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
                    <Button
                      variant="ghost"
                      className="w-full text-[#FF6B00] hover:text-[#FF6B00]/80 hover:bg-[#FF6B00]/10"
                    >
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
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtrar
                </Button>
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
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtrar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {favoritos.map((favorito) => (
                <MaterialListItem key={favorito.id} material={favorito} />
              ))}

              {favoritos.length === 0 && (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nenhum favorito ainda
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Adicione materiais aos favoritos para acessá-los rapidamente
                  </p>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Explorar materiais
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Trilhas */}
          <TabsContent value="trilhas">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#001427] dark:text-white">
                Trilhas de Aprendizado
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtrar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trilhas.map((trilha) => (
                <TrilhaCard key={trilha.id} trilha={trilha} />
              ))}

              {/* Card para descobrir novas trilhas */}
              <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center p-6 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Rocket className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descobrir Novas Trilhas
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                  Explore trilhas de aprendizado recomendadas para você
                </p>
                <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                  Explorar trilhas
                </Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper function to get color for disciplina
function getColorForDisciplina(name: string): string {
  const colorMap: Record<string, string> = {
    Física: "#4C6EF5",
    Matemática: "#FA5252",
    Português: "#40C057",
    História: "#FD7E14",
    Química: "#7950F2",
    Biologia: "#20C997",
  };

  return colorMap[name] || "#6C757D";
}

// Helper function to get progress for disciplina
function getProgressForDisciplina(name: string): number {
  const progressMap: Record<string, number> = {
    Física: 70,
    Matemática: 45,
    Português: 60,
    História: 85,
    Química: 30,
    Biologia: 55,
  };

  return progressMap[name] || 0;
}

export default Portal;
