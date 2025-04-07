import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Lightbulb,
  Target,
  LineChart,
  Search,
  Plus,
  Users2,
  MessageCircle,
  Calendar,
  CheckCircle,
  ChevronRight,
  BookOpen,
  FileText,
  Code,
  Edit3,
  Sparkles,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Calculator,
  Atom,
  TestTube,
  BookText,
  Dna,
  Microscope,
  Binary,
  Globe,
  Rocket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GroupDetail from "./group-detail";

// Topic Card Component
interface TopicCardProps {
  icon: React.ReactNode;
  title: string;
  color: string;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({
  icon,
  title,
  color,
  count,
  isSelected,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`relative min-w-[200px] h-32 rounded-xl overflow-hidden cursor-pointer shadow-md transition-all duration-300 ${isSelected ? "ring-2 ring-[#FF6B00] ring-offset-2 dark:ring-offset-[#001427]" : ""}`}
      onClick={onClick}
    >
      <div className={`absolute inset-0 ${color}`}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">{title}</h3>
          <p className="text-white/80 text-sm">{count} grupos</p>
        </div>
      </div>
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#FF6B00] flex items-center justify-center"
        >
          <CheckCircle className="h-4 w-4 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
};

// Dados simulados para os grupos de estudo
const gruposEstudo = [
  {
    id: "g1",
    nome: "Mecânica Quântica Avançada",
    disciplina: "Física Quântica",
    membros: ["Ana", "Pedro", "Você"],
    proximaReuniao: "16/03, 18:00",
    progresso: 68.5,
    novasMensagens: true,
    nivel: "Avançado",
    imagem:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
    curso: "Física Quântica",
    descricao:
      "Grupo dedicado ao estudo de mecânica quântica e suas aplicações na física moderna. Discutimos desde os fundamentos até aplicações avançadas como computação quântica e criptografia quântica.",
    tags: ["avançado", "teórico", "prático"],
    dataInicio: "10/01/2023",
  },
  {
    id: "g4",
    nome: "Mecânica Quântica Avançada (Cópia)",
    disciplina: "Física Quântica",
    membros: ["Maria", "Carlos", "Você"],
    proximaReuniao: "18/03, 19:30",
    progresso: 72.0,
    novasMensagens: true,
    nivel: "Avançado",
    imagem:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
    curso: "Física Quântica",
    descricao:
      "Grupo dedicado ao estudo de mecânica quântica e suas aplicações na física moderna. Discutimos desde os fundamentos até aplicações avançadas como computação quântica e criptografia quântica.",
    tags: ["avançado", "teórico", "prático"],
    dataInicio: "15/01/2023",
  },
  {
    id: "g2",
    nome: "Projeto Final de Física Aplicada",
    disciplina: "Física Aplicada",
    membros: ["Mariana", "João", "Carla", "Você"],
    proximaReuniao: "23/03, 19:00",
    progresso: 45.6,
    novasMensagens: true,
    nivel: "Intermediário",
    imagem:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    curso: "Física Aplicada",
    descricao:
      "Grupo para desenvolvimento do projeto final da disciplina de Física Aplicada, com foco em aplicações práticas e experimentais.",
    tags: ["intermediário", "prático", "projeto"],
    dataInicio: "15/02/2023",
  },
  {
    id: "g3",
    nome: "Cálculo Avançado e Aplicações",
    disciplina: "Matemática",
    membros: ["Roberto", "Luiza", "Você"],
    proximaReuniao: "18/03, 17:30",
    progresso: 72.3,
    novasMensagens: false,
    nivel: "Avançado",
    imagem:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
    curso: "Matemática",
    descricao:
      "Grupo de estudos focado em cálculo avançado, incluindo cálculo multivariável, equações diferenciais e aplicações em problemas reais.",
    tags: ["avançado", "teórico", "matemática"],
    dataInicio: "05/01/2023",
  },
];

// Dados simulados para grupos recomendados
const gruposRecomendados = [
  {
    id: "rg1",
    nome: "Grupo de Química Orgânica",
    disciplina: "Química Orgânica",
    membros: 8,
    matchScore: 95,
    imagem:
      "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80",
    curso: "Química",
    descricao:
      "Grupo de estudos para a disciplina de Química Orgânica, com foco em reações, mecanismos e síntese orgânica.",
    tags: ["intermediário", "química", "orgânica"],
    progresso: 65,
  },
  {
    id: "rg2",
    nome: "Biologia Molecular Avançada",
    disciplina: "Biologia Molecular",
    membros: 5,
    matchScore: 87,
    imagem:
      "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=800&q=80",
    curso: "Biologia",
    descricao:
      "Grupo para discussão de tópicos avançados em biologia molecular, incluindo técnicas de laboratório e análise de dados genômicos.",
    tags: ["avançado", "biologia", "molecular"],
    progresso: 42,
  },
];

// Componente para o card de grupo de estudo
const GrupoEstudoCard = ({
  grupo,
  onClick,
}: {
  grupo: any;
  onClick: (grupo: any) => void;
}) => {
  return (
    <div
      className="bg-white dark:bg-[#1E293B] rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
      onClick={() => onClick(grupo)}
    >
      <div className="relative h-32 overflow-hidden">
        <img
          src={grupo.imagem}
          alt={grupo.nome}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-3 w-full">
          <div className="flex justify-between items-center">
            <Badge className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs font-medium px-2 py-1">
              {grupo.disciplina}
            </Badge>
            <Badge className="bg-[#001427]/80 text-white text-xs px-2 py-1">
              {grupo.nivel}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 line-clamp-1">
          {grupo.nome}
        </h3>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex -space-x-2 mr-2">
            {Array.isArray(grupo.membros) ? (
              grupo.membros.map((membro, index) => (
                <Avatar
                  key={index}
                  className="h-6 w-6 border-2 border-white dark:border-[#1E293B]"
                >
                  <AvatarFallback className="text-[10px] bg-[#FF6B00]/10 text-[#FF6B00]">
                    {membro.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))
            ) : (
              <span className="text-sm">{grupo.membros} membros</span>
            )}
          </div>
          {Array.isArray(grupo.membros) && (
            <span>{grupo.membros.length} membros</span>
          )}
        </div>

        {grupo.progresso !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                Progresso
              </span>
              <span className="font-medium text-[#FF6B00]">
                {grupo.progresso.toFixed(1)}%
              </span>
            </div>
            <Progress value={grupo.progresso} className="h-1.5" />
          </div>
        )}

        {grupo.proximaReuniao && (
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-3">
            <Calendar className="h-3.5 w-3.5 mr-1 text-[#FF6B00]" />
            <span>Próxima reunião: {grupo.proximaReuniao}</span>
          </div>
        )}

        {grupo.matchScore !== undefined && (
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-3">
            <Target className="h-3.5 w-3.5 mr-1 text-[#FF6B00]" />
            <span>
              Compatibilidade:{" "}
              <span className="font-medium text-[#FF6B00]">
                {grupo.matchScore}%
              </span>
            </span>
          </div>
        )}

        <div className="flex justify-between mt-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
          >
            {grupo.matchScore !== undefined ? "Ver detalhes" : "Acessar grupo"}
          </Button>
          <Button
            size="sm"
            className="text-xs bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
          >
            {grupo.matchScore !== undefined
              ? "Solicitar entrada"
              : "Iniciar chat"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Componente para a ferramenta de IA
const FerramentaIA = ({
  titulo,
  descricao,
  icone,
  cor,
  acao,
}: {
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  cor: string;
  acao: string;
}) => {
  return (
    <div
      className={`bg-white dark:bg-[#1E293B] rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col items-center p-5 text-center`}
    >
      <div
        className={`w-12 h-12 rounded-full ${cor} flex items-center justify-center mb-3`}
      >
        {icone}
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">
        {titulo}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
        {descricao}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="text-xs border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full"
      >
        {acao}
      </Button>
    </div>
  );
};

export default function EstudosView() {
  const [activeTab, setActiveTab] = useState("meus-grupos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const topicsRef = useRef<HTMLDivElement>(null);

  // Scroll horizontally through topics
  const scrollTopics = (direction: "left" | "right") => {
    if (topicsRef.current) {
      const scrollAmount = 300;
      const currentScroll = topicsRef.current.scrollLeft;
      topicsRef.current.scrollTo({
        left:
          direction === "left"
            ? currentScroll - scrollAmount
            : currentScroll + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleGroupClick = (grupo: any) => {
    setSelectedGroup(grupo);
  };

  const handleBackFromGroup = () => {
    setSelectedGroup(null);
  };

  if (selectedGroup) {
    return (
      <div className="w-full h-full overflow-hidden">
        <GroupDetail group={selectedGroup} onBack={handleBackFromGroup} />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] space-y-6 transition-colors duration-300 p-6 overflow-auto">
      <div className="bg-[#001427] text-white p-6 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#001427] to-[#001427]/80"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80')] bg-cover bg-center"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-6 w-6 text-[#FF6B00]" />
            <h1 className="text-2xl font-bold">Estudos</h1>
          </div>
          <p className="text-gray-300 mb-4">
            Organize, aprenda e evolua com métodos inteligentes
          </p>

          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
            >
              <Plus className="h-4 w-4 mr-1" /> Criar Novo Grupo
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Search className="h-4 w-4 mr-1" /> Buscar grupos...
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <Badge className="bg-white/10 hover:bg-white/20 text-white cursor-pointer">
              Meus Grupos
            </Badge>
            <Badge className="bg-white/10 hover:bg-white/20 text-white cursor-pointer">
              Recomendados IA
            </Badge>
            <Badge className="bg-white/10 hover:bg-white/20 text-white cursor-pointer">
              Estatísticas
            </Badge>
            <Badge className="bg-white/10 hover:bg-white/20 text-white cursor-pointer">
              Física
            </Badge>
            <Badge className="bg-white/10 hover:bg-white/20 text-white cursor-pointer">
              Matemática
            </Badge>
            <Badge className="bg-white/10 hover:bg-white/20 text-white cursor-pointer">
              Química
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-white dark:bg-[#1E293B] p-1 rounded-lg border border-gray-100 dark:border-gray-800">
              <TabsTrigger
                value="meus-grupos"
                className="rounded-md data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00]"
              >
                <Users2 className="h-4 w-4 mr-2" /> Meus Grupos
              </TabsTrigger>
              <TabsTrigger
                value="recomendados"
                className="rounded-md data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00]"
              >
                <Lightbulb className="h-4 w-4 mr-2" /> Recomendados IA
              </TabsTrigger>
              <TabsTrigger
                value="estatisticas"
                className="rounded-md data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00]"
              >
                <LineChart className="h-4 w-4 mr-2" /> Estatísticas
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`border-gray-200 dark:border-gray-700 ${viewMode === "grid" ? "bg-[#FF6B00]/10 text-[#FF6B00]" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`border-gray-200 dark:border-gray-700 ${viewMode === "list" ? "bg-[#FF6B00]/10 text-[#FF6B00]" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar grupos..."
                className="pl-10 bg-white dark:bg-[#1E293B] border-gray-200 dark:border-gray-700 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Topics Horizontal Scrolling Section */}
            <div className="relative mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                <BookText className="h-5 w-5 mr-2 text-[#FF6B00]" />
                Tópicos de Estudo
              </h3>

              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 dark:bg-[#1E293B]/80 border-gray-200 dark:border-gray-700 rounded-full shadow-md"
                  onClick={() => scrollTopics("left")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div
                  ref={topicsRef}
                  className="flex gap-4 overflow-x-auto py-4 px-8 scrollbar-none scroll-smooth"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {/* Topic Cards */}
                  <TopicCard
                    icon={<Calculator className="h-6 w-6 text-white" />}
                    title="Matemática"
                    color="bg-gradient-to-r from-orange-500 to-red-500"
                    count={8}
                    isSelected={selectedTopic === "matematica"}
                    onClick={() =>
                      setSelectedTopic(
                        selectedTopic === "matematica" ? null : "matematica",
                      )
                    }
                  />
                  <TopicCard
                    icon={<Atom className="h-6 w-6 text-white" />}
                    title="Física"
                    color="bg-gradient-to-r from-blue-500 to-indigo-600"
                    count={5}
                    isSelected={selectedTopic === "fisica"}
                    onClick={() =>
                      setSelectedTopic(
                        selectedTopic === "fisica" ? null : "fisica",
                      )
                    }
                  />
                  <TopicCard
                    icon={<TestTube className="h-6 w-6 text-white" />}
                    title="Química"
                    color="bg-gradient-to-r from-green-500 to-teal-500"
                    count={3}
                    isSelected={selectedTopic === "quimica"}
                    onClick={() =>
                      setSelectedTopic(
                        selectedTopic === "quimica" ? null : "quimica",
                      )
                    }
                  />
                  <TopicCard
                    icon={<BookOpen className="h-6 w-6 text-white" />}
                    title="Literatura"
                    color="bg-gradient-to-r from-purple-500 to-pink-500"
                    count={4}
                    isSelected={selectedTopic === "literatura"}
                    onClick={() =>
                      setSelectedTopic(
                        selectedTopic === "literatura" ? null : "literatura",
                      )
                    }
                  />
                  <TopicCard
                    icon={<Dna className="h-6 w-6 text-white" />}
                    title="Biologia"
                    color="bg-gradient-to-r from-emerald-500 to-green-600"
                    count={6}
                    isSelected={selectedTopic === "biologia"}
                    onClick={() =>
                      setSelectedTopic(
                        selectedTopic === "biologia" ? null : "biologia",
                      )
                    }
                  />
                  <TopicCard
                    icon={<Microscope className="h-6 w-6 text-white" />}
                    title="Ciências"
                    color="bg-gradient-to-r from-cyan-500 to-blue-500"
                    count={2}
                    isSelected={selectedTopic === "ciencias"}
                    onClick={() =>
                      setSelectedTopic(
                        selectedTopic === "ciencias" ? null : "ciencias",
                      )
                    }
                  />
                  <TopicCard
                    icon={<Binary className="h-6 w-6 text-white" />}
                    title="Computação"
                    color="bg-gradient-to-r from-gray-700 to-gray-900"
                    count={7}
                    isSelected={selectedTopic === "computacao"}
                    onClick={() =>
                      setSelectedTopic(
                        selectedTopic === "computacao" ? null : "computacao",
                      )
                    }
                  />
                  <TopicCard
                    icon={<Globe className="h-6 w-6 text-white" />}
                    title="Geografia"
                    color="bg-gradient-to-r from-blue-400 to-blue-600"
                    count={3}
                    isSelected={selectedTopic === "geografia"}
                    onClick={() =>
                      setSelectedTopic(
                        selectedTopic === "geografia" ? null : "geografia",
                      )
                    }
                  />
                  <TopicCard
                    icon={<Rocket className="h-6 w-6 text-white" />}
                    title="Engenharia"
                    color="bg-gradient-to-r from-amber-500 to-orange-600"
                    count={5}
                    isSelected={selectedTopic === "engenharia"}
                    onClick={() =>
                      setSelectedTopic(
                        selectedTopic === "engenharia" ? null : "engenharia",
                      )
                    }
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 dark:bg-[#1E293B]/80 border-gray-200 dark:border-gray-700 rounded-full shadow-md"
                  onClick={() => scrollTopics("right")}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>

              {selectedTopic && (
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    onClick={() => setSelectedTopic(null)}
                  >
                    Limpar filtro
                  </Button>
                </div>
              )}
            </div>

            <TabsContent value="meus-grupos" className="space-y-6">
              <AnimatePresence mode="wait">
                {viewMode === "grid" ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {gruposEstudo
                      .filter(
                        (grupo) =>
                          (!selectedTopic ||
                            (selectedTopic === "matematica" &&
                              grupo.disciplina.includes("Matemática")) ||
                            (selectedTopic === "fisica" &&
                              grupo.disciplina.includes("Física")) ||
                            (selectedTopic === "quimica" &&
                              grupo.disciplina.includes("Química"))) &&
                          (searchQuery === "" ||
                            grupo.nome
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            grupo.disciplina
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())),
                      )
                      .map((grupo) => (
                        <motion.div
                          key={grupo.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <GrupoEstudoCard
                            grupo={grupo}
                            onClick={handleGroupClick}
                          />
                        </motion.div>
                      ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {gruposEstudo
                      .filter(
                        (grupo) =>
                          (!selectedTopic ||
                            (selectedTopic === "matematica" &&
                              grupo.disciplina.includes("Matemática")) ||
                            (selectedTopic === "fisica" &&
                              grupo.disciplina.includes("Física")) ||
                            (selectedTopic === "quimica" &&
                              grupo.disciplina.includes("Química"))) &&
                          (searchQuery === "" ||
                            grupo.nome
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            grupo.disciplina
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())),
                      )
                      .map((grupo) => (
                        <motion.div
                          key={grupo.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white dark:bg-[#1E293B] rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:border-[#FF6B00] cursor-pointer"
                          onClick={() => handleGroupClick(grupo)}
                        >
                          <div className="flex">
                            <div className="w-24 h-24 relative overflow-hidden">
                              <img
                                src={grupo.imagem}
                                alt={grupo.nome}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 p-4">
                              <div className="flex justify-between">
                                <div>
                                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                    {grupo.nome}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] text-xs">
                                      {grupo.disciplina}
                                    </Badge>
                                    <Badge className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                                      {grupo.nivel}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-3.5 w-3.5 mr-1 text-[#FF6B00]" />
                                    <span>{grupo.proximaReuniao}</span>
                                  </div>
                                  <div className="mt-2 w-32">
                                    <div className="flex justify-between items-center mb-1 text-xs">
                                      <span className="text-gray-600 dark:text-gray-400">
                                        Progresso
                                      </span>
                                      <span className="font-medium text-[#FF6B00]">
                                        {grupo.progresso.toFixed(1)}%
                                      </span>
                                    </div>
                                    <Progress
                                      value={grupo.progresso}
                                      className="h-1.5"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center">
                                  <div className="flex -space-x-2 mr-2">
                                    {grupo.membros.map((membro, index) => (
                                      <Avatar
                                        key={index}
                                        className="h-6 w-6 border-2 border-white dark:border-[#1E293B]"
                                      >
                                        <AvatarFallback className="text-[10px] bg-[#FF6B00]/10 text-[#FF6B00]">
                                          {membro.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {grupo.membros.length} membros
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  className="text-xs bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                                >
                                  Acessar grupo
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="recomendados" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gruposRecomendados
                  .filter(
                    (grupo) =>
                      (!selectedTopic ||
                        (selectedTopic === "quimica" &&
                          grupo.disciplina.includes("Química")) ||
                        (selectedTopic === "biologia" &&
                          grupo.disciplina.includes("Biologia"))) &&
                      (searchQuery === "" ||
                        grupo.nome
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        grupo.disciplina
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())),
                  )
                  .map((grupo) => (
                    <motion.div
                      key={grupo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <GrupoEstudoCard
                        grupo={grupo}
                        onClick={handleGroupClick}
                      />
                    </motion.div>
                  ))}

                <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-[#FF6B00]" />
                    Ferramentas de IA para seus estudos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FerramentaIA
                      titulo="Gerador de Resumos"
                      descricao="Crie resumos inteligentes a partir de seus materiais de estudo"
                      icone={<FileText className="h-6 w-6 text-white" />}
                      cor="bg-gradient-to-r from-blue-500 to-indigo-600"
                      acao="Gerar resumo"
                    />
                    <FerramentaIA
                      titulo="Assistente de Código"
                      descricao="Obtenha ajuda com algoritmos e resolução de problemas de programação"
                      icone={<Code className="h-6 w-6 text-white" />}
                      cor="bg-gradient-to-r from-gray-700 to-gray-900"
                      acao="Usar assistente"
                    />
                    <FerramentaIA
                      titulo="Criador de Questões"
                      descricao="Gere questões personalizadas para testar seus conhecimentos"
                      icone={<Edit3 className="h-6 w-6 text-white" />}
                      cor="bg-gradient-to-r from-orange-500 to-red-500"
                      acao="Criar questões"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="estatisticas" className="space-y-6">
              <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-800 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Estatísticas de Estudo
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Visualize suas estatísticas de estudo e progresso nos grupos.
                </p>
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">
                    Estatísticas em desenvolvimento...
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
