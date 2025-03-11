import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Trophy,
  Brain,
  Target,
  Star,
  Award,
  BookOpen,
  ArrowRight,
  Rocket,
  Plus,
  Users,
  Clock,
  Calendar,
  CheckCircle,
  Bookmark,
  Share2,
  BarChart,
  Layers,
  Code,
  FileText,
  Briefcase,
  Cpu,
  Globe,
  Info,
  MessageCircle,
  Sliders,
  X,
  Gauge,
  Medal,
  Dumbbell,
  SortAsc,
  Eye,
  ChevronRight,
  Lightbulb,
  Zap,
  Flame,
  PlusCircle,
  Compass,
  Gamepad2,
  GraduationCap,
  Puzzle,
  Shapes,
  Atom,
  CheckSquare,
  HelpCircle,
  Bell,
  ExternalLink,
  Lock,
  Sparkles,
  Map,
  Route,
  Milestone,
  Coins,
  Gift,
  Footprints,
  Infinity,
  Hourglass,
  Gem,
  Crown,
  Scroll,
  Wand2,
  Backpack,
  Glasses,
  Laptop,
  Palette,
  Pencil,
  Ruler,
  Stethoscope,
  Microscope,
  Beaker,
  Dna,
  Leaf,
  Landmark,
  Newspaper,
  Megaphone,
  Music,
  Mic2,
  Camera,
  Film,
  Brush,
  Pen,
  Notebook,
  Presentation,
  Projector,
  Printer,
  Paperclip,
  Folder,
  File,
  FileText as FileTextIcon,
  FileCheck,
  FileX,
  FilePlus,
  FileMinus,
  FileSearch,
  FileQuestion,
  FileWarning,
  FileCode,
  FileDigit,
  FileImage,
  FileVideo,
  FileAudio,
  FilePen,
  FileSpreadsheet,
  FileArchive,
  FileSymlink,
  FileTerminal,
  FileType,
  FileType2,
  FileUp,
  FileDown,
  FileEdit,
  FileOutput,
  FileInput,
  FileKey,
  FileSignature,
  FileStack,
  FileVolume,
  FileVolume2,
  FileX2,
  FileHeart,
  FileBarChart,
  FileBarChart2,
  FileText2,
  FileJson,
  FileJson2,
  FileKanban,
  FileClock,
  FileSearch2,
  FileSettings,
  FileSettings2,
  FileTerminal2,
  FileWarning2,
  FileDigit2,
  FileCheck2,
  FileArchive2,
  FileQuestion2,
  FileX3,
  FileUp2,
  FileDown2,
  FileEdit2,
  FileOutput2,
  FileInput2,
  FileKey2,
  FileSignature2,
  FileStack2,
  FileVolume3,
  FileVolume4,
  FileX4,
  FileHeart2,
  FileBarChart3,
  FileBarChart4,
  FileText3,
  FileJson3,
  FileJson4,
  FileKanban2,
  FileClock2,
  FileSearch3,
  FileSettings3,
  FileSettings4,
  FileTerminal3,
  FileWarning3,
  FileDigit3,
  FileCheck3,
  FileArchive3,
  FileQuestion3,
  FileX5,
  FileUp3,
  FileDown3,
  FileEdit3,
  FileOutput3,
  FileInput3,
  FileKey3,
  FileSignature3,
  FileStack3,
  FileVolume5,
  FileVolume6,
  FileX6,
  FileHeart3,
  FileBarChart5,
  FileBarChart6,
  FileText4,
  FileJson5,
  FileJson6,
  FileKanban3,
  FileClock3,
  FileSearch4,
  FileSettings5,
  FileSettings6,
  FileTerminal4,
  FileWarning4,
  FileDigit4,
  FileCheck4,
  FileArchive4,
  FileQuestion4,
  FileX7,
  FileUp4,
  FileDown4,
  FileEdit4,
  FileOutput4,
  FileInput4,
  FileKey4,
  FileSignature4,
  FileStack4,
  FileVolume7,
  FileVolume8,
  FileX8,
  FileHeart4,
  FileBarChart7,
  FileBarChart8,
  FileText5,
  FileJson7,
  FileJson8,
  FileKanban4,
  FileClock4,
  FileSearch5,
  FileSettings7,
  FileSettings8,
  FileTerminal5,
  FileWarning5,
  FileDigit5,
  FileCheck5,
  FileArchive5,
  FileQuestion5,
  FileX9,
  FileUp5,
  FileDown5,
  FileEdit5,
  FileOutput5,
  FileInput5,
  FileKey5,
  FileSignature5,
  FileStack5,
  FileVolume9,
  FileVolume10,
  FileX10,
  FileHeart5,
  FileBarChart9,
  FileBarChart10,
  FileText6,
  FileJson9,
  FileJson10,
  FileKanban5,
  FileClock5,
  FileSearch6,
  FileSettings9,
  FileSettings10,
  FileTerminal6,
  FileWarning6,
  FileDigit6,
  FileCheck6,
  FileArchive6,
  FileQuestion6,
  FileX11,
  FileUp6,
  FileDown6,
  FileEdit6,
  FileOutput6,
  FileInput6,
  FileKey6,
  FileSignature6,
  FileStack6,
  FileVolume11,
  FileVolume12,
  FileX12,
  FileHeart6,
  FileBarChart11,
  FileBarChart12,
  FileText7,
  FileJson11,
  FileJson12,
  FileKanban6,
  FileClock6,
  FileSearch7,
  FileSettings11,
  FileSettings12,
  FileTerminal7,
  FileWarning7,
  FileDigit7,
  FileCheck7,
  FileArchive7,
  FileQuestion7,
  FileX13,
  FileUp7,
  FileDown7,
  FileEdit7,
  FileOutput7,
  FileInput7,
  FileKey7,
  FileSignature7,
  FileStack7,
  FileVolume13,
  FileVolume14,
  FileX14,
  FileHeart7,
  FileBarChart13,
  FileBarChart14,
  FileText8,
  FileJson13,
  FileJson14,
  FileKanban7,
  FileClock7,
  FileSearch8,
  FileSettings13,
  FileSettings14,
  FileTerminal8,
  FileWarning8,
  FileDigit8,
  FileCheck8,
  FileArchive8,
  FileQuestion8,
  FileX15,
  FileUp8,
  FileDown8,
  FileEdit8,
  FileOutput8,
  FileInput8,
  FileKey8,
  FileSignature8,
  FileStack8,
  FileVolume15,
  FileVolume16,
  FileX16,
  FileHeart8,
  FileBarChart15,
  FileBarChart16,
  FileText9,
  FileJson15,
  FileJson16,
  FileKanban8,
  FileClock8,
  FileSearch9,
  FileSettings15,
  FileSettings16,
  FileTerminal9,
  FileWarning9,
  FileDigit9,
  FileCheck9,
  FileArchive9,
  FileQuestion9,
  FileX17,
  FileUp9,
  FileDown9,
  FileEdit9,
  FileOutput9,
  FileInput9,
  FileKey9,
  FileSignature9,
  FileStack9,
  FileVolume17,
  FileVolume18,
  FileX18,
  FileHeart9,
  FileBarChart17,
  FileBarChart18,
  FileText10,
  FileJson17,
  FileJson18,
  FileKanban9,
  FileClock9,
  FileSearch10,
  FileSettings17,
  FileSettings18,
  FileTerminal10,
  FileWarning10,
  FileDigit10,
  FileCheck10,
  FileArchive10,
  FileQuestion10,
  FileX19,
  FileUp10,
  FileDown10,
  FileEdit10,
  FileOutput10,
  FileInput10,
  FileKey10,
  FileSignature10,
  FileStack10,
  FileVolume19,
  FileVolume20,
  FileX20,
  FileHeart10,
  FileBarChart19,
  FileBarChart20,
  Circle,
  Link,
  Play,
} from "lucide-react";

// Define module data
const journeyModules = [
  {
    id: 1,
    title: "Fundamentos do Conhecimento",
    description: "Aprenda as bases para um estudo eficiente e produtivo",
    icon: <Lightbulb className="h-8 w-8 text-[#FF6B00]" />,
    progress: 100,
    status: "complete",
    tasks: [
      { id: "1-1", title: "Introdução aos métodos de estudo", completed: true },
      {
        id: "1-2",
        title: "Organização do ambiente de estudo",
        completed: true,
      },
      { id: "1-3", title: "Gestão de tempo e prioridades", completed: true },
      { id: "1-4", title: "Técnicas de concentração", completed: true },
    ],
    rewards: [
      {
        id: "r1-1",
        title: "Badge: Iniciante do Conhecimento",
        icon: <Award />,
      },
      { id: "r1-2", title: "100 Ponto Coins", icon: <Coins /> },
    ],
  },
  {
    id: 2,
    title: "Técnicas de Memorização",
    description: "Domine métodos eficazes para reter informações",
    icon: <Brain className="h-8 w-8 text-[#FF6B00]" />,
    progress: 75,
    status: "in-progress",
    tasks: [
      { id: "2-1", title: "Mapas mentais e associações", completed: true },
      { id: "2-2", title: "Técnica Pomodoro aplicada", completed: true },
      { id: "2-3", title: "Revisão espaçada", completed: true },
      { id: "2-4", title: "Prática de recuperação ativa", completed: false },
    ],
    rewards: [
      { id: "r2-1", title: "Badge: Mestre da Memória", icon: <Award /> },
      { id: "r2-2", title: "150 Ponto Coins", icon: <Coins /> },
    ],
  },
  {
    id: 3,
    title: "Foco e Concentração",
    description: "Desenvolva habilidades para manter o foco nos estudos",
    icon: <Target className="h-8 w-8 text-[#FF6B00]" />,
    progress: 0,
    status: "locked",
    tasks: [
      { id: "3-1", title: "Eliminando distrações digitais", completed: false },
      { id: "3-2", title: "Mindfulness para estudantes", completed: false },
      { id: "3-3", title: "Ambiente ideal de estudo", completed: false },
      { id: "3-4", title: "Técnicas de respiração e foco", completed: false },
    ],
    rewards: [
      { id: "r3-1", title: "Badge: Especialista em Foco", icon: <Award /> },
      { id: "r3-2", title: "200 Ponto Coins", icon: <Coins /> },
    ],
  },
  {
    id: 4,
    title: "Resolução de Problemas",
    description: "Aprenda a abordar e resolver problemas complexos",
    icon: <Puzzle className="h-8 w-8 text-[#FF6B00]" />,
    progress: 0,
    status: "locked",
    tasks: [
      { id: "4-1", title: "Pensamento crítico e analítico", completed: false },
      { id: "4-2", title: "Metodologias de resolução", completed: false },
      { id: "4-3", title: "Prática com problemas reais", completed: false },
      { id: "4-4", title: "Feedback e iteração", completed: false },
    ],
    rewards: [
      {
        id: "r4-1",
        title: "Badge: Solucionador de Problemas",
        icon: <Award />,
      },
      { id: "r4-2", title: "250 Ponto Coins", icon: <Coins /> },
    ],
  },
  {
    id: 5,
    title: "Comunicação Eficaz",
    description: "Desenvolva habilidades de comunicação escrita e oral",
    icon: <MessageCircle className="h-8 w-8 text-[#FF6B00]" />,
    progress: 0,
    status: "locked",
    tasks: [
      { id: "5-1", title: "Estruturação de ideias", completed: false },
      { id: "5-2", title: "Técnicas de apresentação", completed: false },
      { id: "5-3", title: "Escrita acadêmica", completed: false },
      { id: "5-4", title: "Comunicação em grupo", completed: false },
    ],
    rewards: [
      { id: "r5-1", title: "Badge: Comunicador Excelente", icon: <Award /> },
      { id: "r5-2", title: "300 Ponto Coins", icon: <Coins /> },
    ],
  },
];

// Define current module tasks
const currentModuleTasks = [
  {
    id: "2-1",
    title: "Mapas mentais e associações",
    description:
      "Aprenda a criar mapas mentais para organizar informações e facilitar a memorização",
    completed: true,
    points: 25,
    type: "prática",
    duration: "30 minutos",
    resources: [
      { type: "video", title: "Tutorial de Mapas Mentais", url: "#" },
      { type: "pdf", title: "Guia de Associações Mentais", url: "#" },
    ],
  },
  {
    id: "2-2",
    title: "Técnica Pomodoro aplicada",
    description:
      "Utilize a técnica Pomodoro para melhorar sua concentração e produtividade nos estudos",
    completed: true,
    points: 25,
    type: "prática",
    duration: "45 minutos",
    resources: [
      { type: "article", title: "Dominando o Pomodoro", url: "#" },
      { type: "tool", title: "Timer Pomodoro Online", url: "#" },
    ],
  },
  {
    id: "2-3",
    title: "Revisão espaçada",
    description:
      "Implemente a técnica de revisão espaçada para retenção de longo prazo",
    completed: true,
    points: 25,
    type: "teórica",
    duration: "40 minutos",
    resources: [
      { type: "video", title: "Explicação da Revisão Espaçada", url: "#" },
      { type: "template", title: "Planilha de Revisão Espaçada", url: "#" },
    ],
  },
  {
    id: "2-4",
    title: "Prática de recuperação ativa",
    description:
      "Aprenda e aplique técnicas de recuperação ativa para fortalecer a memória",
    completed: false,
    points: 25,
    type: "prática",
    duration: "50 minutos",
    resources: [
      { type: "article", title: "Guia de Recuperação Ativa", url: "#" },
      { type: "quiz", title: "Exercícios de Recuperação", url: "#" },
    ],
  },
];

const ChallengesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState("jornada");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<number | null>(2); // Default to module 2 (in progress)
  const [showModuleDetails, setShowModuleDetails] = useState(false);

  useEffect(() => {
    // Simular carregamento para garantir que os componentes sejam renderizados corretamente
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  // Challenge types for the empty state
  const challengeTypes = [
    {
      id: "academic",
      title: "Acadêmico",
      description:
        "Desafios relacionados a matérias escolares e universitárias",
      icon: <GraduationCap className="h-12 w-12 text-[#FF6B00]" />,
      count: 5,
    },
    {
      id: "skills",
      title: "Habilidades",
      description: "Desenvolva competências essenciais para o sucesso",
      icon: <Brain className="h-12 w-12 text-[#FF6B00]" />,
      count: 3,
    },
    {
      id: "exam",
      title: "Preparatório",
      description: "Prepare-se para vestibulares, ENEM e outras provas",
      icon: <Target className="h-12 w-12 text-[#FF6B00]" />,
      count: 7,
    },
    {
      id: "project",
      title: "Projeto",
      description: "Desafios baseados em projetos práticos e aplicados",
      icon: <Rocket className="h-12 w-12 text-[#FF6B00]" />,
      count: 4,
    },
    {
      id: "group",
      title: "Colaborativo",
      description:
        "Desafios para realizar em grupo e desenvolver trabalho em equipe",
      icon: <Users className="h-12 w-12 text-[#FF6B00]" />,
      count: 2,
    },
    {
      id: "ai",
      title: "IA Adaptativo",
      description: "Desafios personalizados com inteligência artificial",
      icon: <Cpu className="h-12 w-12 text-[#FF6B00]" />,
      count: 6,
    },
  ];

  // Recommended challenge for the user
  const recommendedChallenge = {
    id: "rec-1",
    title: "Desafio de Matemática: Funções e Gráficos",
    description:
      "Aprofunde seus conhecimentos em funções matemáticas e suas representações gráficas",
    image:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&q=90",
    progress: 45,
    totalTasks: 12,
    completedTasks: 5,
    daysLeft: 7,
    difficulty: "Intermediário",
    category: "Matemática",
  };

  // How it works steps
  const howItWorks = [
    {
      id: "step1",
      title: "Escolha seu desafio",
      description:
        "Selecione entre diversos tipos de desafios ou crie o seu próprio",
      icon: <Compass className="h-8 w-8 text-white" />,
    },
    {
      id: "step2",
      title: "Complete as tarefas",
      description: "Avance através das atividades no seu próprio ritmo",
      icon: <CheckSquare className="h-8 w-8 text-white" />,
    },
    {
      id: "step3",
      title: "Acompanhe seu progresso",
      description: "Visualize seu avanço e mantenha-se motivado",
      icon: <BarChart className="h-8 w-8 text-white" />,
    },
    {
      id: "step4",
      title: "Ganhe recompensas",
      description: "Desbloqueie conquistas e acumule pontos",
      icon: <Award className="h-8 w-8 text-white" />,
    },
  ];

  // Get current module
  const getCurrentModule = () => {
    return (
      journeyModules.find((module) => module.id === selectedModule) ||
      journeyModules[1]
    );
  };

  // Get module status icon
  const getModuleStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-[#FF6B00]" />;
      case "locked":
        return <Lock className="h-5 w-5 text-gray-400" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get task type icon
  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case "prática":
        return <Pencil className="h-4 w-4 text-[#FF6B00]" />;
      case "teórica":
        return <BookOpen className="h-4 w-4 text-[#FF6B00]" />;
      case "quiz":
        return <FileQuestion className="h-4 w-4 text-[#FF6B00]" />;
      case "projeto":
        return <Rocket className="h-4 w-4 text-[#FF6B00]" />;
      default:
        return <FileText className="h-4 w-4 text-[#FF6B00]" />;
    }
  };

  // Handle module selection
  const handleModuleSelect = (moduleId: number) => {
    setSelectedModule(moduleId);
    setShowModuleDetails(true);
  };

  // Handle task completion toggle
  const handleTaskToggle = (taskId: string) => {
    // In a real app, this would update the task status in the backend
    console.log(`Task ${taskId} toggled`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-[#001427] p-6 rounded-xl shadow-md">
      {/* Header with search and create button */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white font-montserrat">
              Desafios
            </h1>
            <p className="text-gray-300 text-sm font-open-sans">
              Crie e participe de desafios educacionais para impulsionar seu
              aprendizado
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              <Input
                placeholder="Buscar desafios..."
                className="pl-9 w-[250px] bg-[#29335C]/30 border-[#29335C]/50 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] uppercase font-montserrat font-semibold">
              <Plus className="h-4 w-4 mr-1" /> Criar Desafio
            </Button>
          </div>
        </div>
      </div>

      {/* Jornada do Conhecimento - Card Principal */}
      <div className="bg-gradient-to-r from-[#001427] to-[#29335C] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-[#FF6B00]/20">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 relative">
            <img
              src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=90"
              alt="Jornada do Conhecimento"
              className="w-full h-full object-cover md:absolute inset-0 opacity-90"
              style={{ minHeight: "250px" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/50 md:to-transparent"></div>
            <div className="absolute top-4 left-4">
              <Badge className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white px-3 py-1.5 uppercase font-montserrat text-xs">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Desafio Especial
              </Badge>
            </div>
          </div>

          <div className="p-6 md:w-2/3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-2xl font-bold text-white font-montserrat bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent">
                  Jornada do Conhecimento
                </h2>
                <Badge
                  variant="outline"
                  className="border-[#FF6B00] text-[#FF6B00] font-montserrat text-xs"
                >
                  Módulo 2 de 5
                </Badge>
              </div>

              <p className="text-gray-300 mb-5 font-open-sans">
                Uma jornada completa para desenvolver habilidades essenciais de
                estudo e aprendizado. Domine técnicas de memorização, foco,
                resolução de problemas e muito mais.
              </p>

              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-300 font-montserrat">
                    Progresso Geral
                  </span>
                  <span className="text-sm font-bold text-[#FF6B00] font-montserrat">
                    35%
                  </span>
                </div>
                <div className="h-3 bg-[#29335C]/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full transition-all duration-500"
                    style={{ width: `35%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2 font-open-sans">
                  <span className="flex items-center">
                    <CheckSquare className="h-3 w-3 mr-1 text-[#FF6B00]" /> 7 de
                    20 tarefas concluídas
                  </span>
                  <span className="flex items-center">
                    <Award className="h-3 w-3 mr-1 text-[#FF6B00]" /> 350 Ponto
                    Coins acumulados
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 bg-[#29335C]/30 p-3 rounded-lg">
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-[#FF6B00] mr-2" />
                  <span className="text-xs text-gray-300 font-montserrat">
                    Módulo atual:{" "}
                    <span className="font-semibold text-white">
                      Técnicas de Memorização
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                variant="outline"
                className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 font-montserrat font-semibold w-full sm:w-auto"
                onClick={() => setActiveTab("jornada")}
              >
                <Eye className="h-4 w-4 mr-2" /> Ver Detalhes
              </Button>
              <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat font-semibold uppercase w-full sm:w-auto">
                <Rocket className="h-4 w-4 mr-2" /> Continuar Jornada
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#29335C]/30 my-6"></div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
        defaultValue="jornada"
      >
        <div className="flex justify-center items-center">
          <TabsList className="bg-transparent p-2 rounded-xl shadow-md">
            <TabsTrigger
              value="jornada"
              className="data-[state=active]:text-white data-[state=active]:border-b-4 data-[state=active]:border-[#FF6B00] px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg text-gray-400 hover:text-white font-montserrat"
            >
              <Route className="h-4 w-4 mr-1.5" /> Jornada
            </TabsTrigger>
            <TabsTrigger
              value="em-andamento"
              className="data-[state=active]:text-white data-[state=active]:border-b-4 data-[state=active]:border-[#FF6B00] px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg text-gray-400 hover:text-white font-montserrat"
            >
              Em Andamento
            </TabsTrigger>
            <TabsTrigger
              value="disponivel"
              className="data-[state=active]:text-white data-[state=active]:border-b-4 data-[state=active]:border-[#FF6B00] px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg text-gray-400 hover:text-white font-montserrat"
            >
              Disponíveis
            </TabsTrigger>
            <TabsTrigger
              value="concluido"
              className="data-[state=active]:text-white data-[state=active]:border-b-4 data-[state=active]:border-[#FF6B00] px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg text-gray-400 hover:text-white font-montserrat"
            >
              Concluídos
            </TabsTrigger>
            <TabsTrigger
              value="recomendados"
              className="data-[state=active]:text-white data-[state=active]:border-b-4 data-[state=active]:border-[#FF6B00] px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg text-gray-400 hover:text-white font-montserrat"
            >
              Recomendados
            </TabsTrigger>
            <TabsTrigger
              value="populares"
              className="data-[state=active]:text-white data-[state=active]:border-b-4 data-[state=active]:border-[#FF6B00] px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg text-gray-400 hover:text-white font-montserrat"
            >
              Populares (8)
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Jornada do Conhecimento Tab */}
        <TabsContent value="jornada" className="mt-0">
          {showModuleDetails ? (
            <div className="space-y-6">
              {/* Module Details Header */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 bg-[#29335C]/30 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 flex items-center justify-center">
                    {getCurrentModule().icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-montserrat">
                      {getCurrentModule().title}
                    </h3>
                    <p className="text-gray-300 text-sm font-open-sans">
                      {getCurrentModule().description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] px-3 py-1">
                    {getCurrentModule().progress}% Concluído
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-[#29335C]/50 hover:bg-[#29335C]/50"
                    onClick={() => setShowModuleDetails(false)}
                  >
                    <ArrowRight className="h-4 w-4 mr-1 rotate-180" /> Voltar
                    para Módulos
                  </Button>
                </div>
              </div>

              {/* Module Tasks */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white font-montserrat flex items-center">
                  <CheckSquare className="h-5 w-5 mr-2 text-[#FF6B00]" />{" "}
                  Tarefas do Módulo
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {currentModuleTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow-md transition-all duration-300 border ${task.completed ? "border-green-500/30" : "border-[#FF6B00]/20"} hover:shadow-lg`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={task.completed}
                          onCheckedChange={() => handleTaskToggle(task.id)}
                          className={`mt-1 h-5 w-5 ${task.completed ? "bg-green-500 text-white border-green-500" : "border-[#FF6B00]/50 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white"}`}
                        />
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <label
                              htmlFor={`task-${task.id}`}
                              className={`font-medium text-gray-900 dark:text-white text-base cursor-pointer font-montserrat ${task.completed ? "line-through text-gray-500 dark:text-gray-400" : ""}`}
                            >
                              {task.title}
                            </label>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] flex items-center gap-1">
                                {getTaskTypeIcon(task.type)}
                                <span>{task.type}</span>
                              </Badge>
                              <Badge
                                variant="outline"
                                className="border-[#FF6B00]/30 text-[#FF6B00]"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                {task.duration}
                              </Badge>
                            </div>
                          </div>
                          <p
                            className={`text-sm text-gray-600 dark:text-gray-300 mt-2 font-open-sans ${task.completed ? "line-through text-gray-400 dark:text-gray-500" : ""}`}
                          >
                            {task.description}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {task.resources.map((resource, idx) => (
                              <Button
                                key={idx}
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 font-medium rounded-lg transition-colors"
                              >
                                {resource.type === "video" ? (
                                  <Play className="h-3 w-3 mr-1" />
                                ) : resource.type === "pdf" ? (
                                  <FileText className="h-3 w-3 mr-1" />
                                ) : resource.type === "article" ? (
                                  <FileText className="h-3 w-3 mr-1" />
                                ) : resource.type === "quiz" ? (
                                  <FileQuestion className="h-3 w-3 mr-1" />
                                ) : resource.type === "tool" ? (
                                  <Sliders className="h-3 w-3 mr-1" />
                                ) : resource.type === "template" ? (
                                  <FileText className="h-3 w-3 mr-1" />
                                ) : (
                                  <Link className="h-3 w-3 mr-1" />
                                )}
                                {resource.title}
                              </Button>
                            ))}
                          </div>
                          <div className="mt-3 flex justify-between items-center">
                            <span className="text-xs text-[#FF6B00] font-medium">
                              {task.points} Ponto Coins
                            </span>
                            {!task.completed && (
                              <Button
                                size="sm"
                                className="h-8 text-xs bg-[#FF6B00] hover:bg-[#FF8C40] text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                              >
                                Iniciar Tarefa
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Module Rewards */}
              <div className="bg-[#29335C]/30 rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center font-montserrat">
                  <Gift className="h-5 w-5 mr-2 text-[#FF6B00]" /> Recompensas
                  do Módulo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getCurrentModule().rewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="bg-white/5 rounded-lg p-4 border border-[#FF6B00]/20 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00]">
                        {reward.icon}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">
                          {reward.title}
                        </h4>
                        <p className="text-xs text-gray-400">
                          Desbloqueado ao completar o módulo
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Journey Overview */}
              <div className="bg-[#29335C]/30 p-6 rounded-xl">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white font-montserrat flex items-center">
                      <Route className="h-5 w-5 mr-2 text-[#FF6B00]" /> Jornada
                      do Conhecimento
                    </h3>
                    <p className="text-gray-300 text-sm font-open-sans mt-1">
                      Uma jornada completa para desenvolver habilidades
                      essenciais de estudo e aprendizado
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-[#FF6B00]/10 px-3 py-1 rounded-full">
                      <Trophy className="h-4 w-4 text-[#FF6B00]" />
                      <span className="text-sm text-[#FF6B00] font-medium">
                        350 Ponto Coins
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#FF6B00]/10 px-3 py-1 rounded-full">
                      <Award className="h-4 w-4 text-[#FF6B00]" />
                      <span className="text-sm text-[#FF6B00] font-medium">
                        2 Badges
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-300 font-montserrat">
                      Progresso Geral
                    </span>
                    <span className="text-sm font-bold text-[#FF6B00] font-montserrat">
                      35%
                    </span>
                  </div>
                  <div className="h-3 bg-[#29335C]/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full transition-all duration-500"
                      style={{ width: `35%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-[#FF6B00]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckSquare className="h-5 w-5 text-[#FF6B00]" />
                      <h4 className="text-white font-medium">
                        Tarefas Concluídas
                      </h4>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      7{" "}
                      <span className="text-sm text-gray-400 font-normal">
                        / 20
                      </span>
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-[#FF6B00]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Milestone className="h-5 w-5 text-[#FF6B00]" />
                      <h4 className="text-white font-medium">
                        Módulos Concluídos
                      </h4>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      1{" "}
                      <span className="text-sm text-gray-400 font-normal">
                        / 5
                      </span>
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-[#FF6B00]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-[#FF6B00]" />
                      <h4 className="text-white font-medium">Tempo Dedicado</h4>
                    </div>
                    <p className="text-2xl font-bold text-white">4h 30min</p>
                  </div>
                </div>
              </div>

              {/* Module List */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white font-montserrat flex items-center">
                  <Milestone className="h-5 w-5 mr-2 text-[#FF6B00]" /> Módulos
                  da Jornada
                </h3>

                <div className="space-y-4">
                  {journeyModules.map((module) => (
                    <div
                      key={module.id}
                      className={`bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border ${module.status === "locked" ? "border-gray-300/30 opacity-75" : module.status === "complete" ? "border-green-500/30" : "border-[#FF6B00]/20"}`}
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <div className="flex-shrink-0">
                            <div
                              className={`w-12 h-12 rounded-full ${module.status === "locked" ? "bg-gray-200 dark:bg-gray-700/30" : module.status === "complete" ? "bg-green-100 dark:bg-green-900/20" : "bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20"} flex items-center justify-center`}
                            >
                              {module.icon}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat">
                                  {module.title}
                                </h3>
                                {getModuleStatusIcon(module.status)}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={`${module.status === "locked" ? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400" : module.status === "complete" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-[#FF6B00]/10 text-[#FF6B00]"}`}
                                >
                                  {module.status === "locked"
                                    ? "Bloqueado"
                                    : module.status === "complete"
                                      ? "Concluído"
                                      : "Em Progresso"}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm mb-4 text-gray-600 dark:text-gray-300 font-open-sans">
                              {module.description}
                            </p>

                            <div className="mb-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 font-montserrat">
                                  Progresso
                                </span>
                                <span className="text-xs font-bold text-[#FF6B00] font-montserrat">
                                  {module.progress}%
                                </span>
                              </div>
                              <Progress
                                value={module.progress}
                                className={`h-1.5 ${module.status === "locked" ? "bg-gray-100 dark:bg-gray-700" : "bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20"}`}
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-open-sans">
                                  <CheckSquare className="h-3.5 w-3.5 mr-1 text-[#FF6B00]" />
                                  {
                                    module.tasks.filter((t) => t.completed)
                                      .length
                                  }{" "}
                                  de {module.tasks.length} tarefas
                                </div>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-open-sans">
                                  <Award className="h-3.5 w-3.5 mr-1 text-[#FF6B00]" />
                                  {module.rewards.length} recompensas
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {module.status !== "locked" && (
                                  <Button
                                    size="sm"
                                    className="h-8 text-xs bg-[#FF6B00] hover:bg-[#FF8C40] text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300 uppercase font-montserrat"
                                    onClick={() =>
                                      handleModuleSelect(module.id)
                                    }
                                  >
                                    {module.status === "complete" ? (
                                      <>
                                        <Eye className="h-3.5 w-3.5 mr-1" /> Ver
                                        Detalhes
                                      </>
                                    ) : (
                                      <>
                                        <Rocket className="h-3.5 w-3.5 mr-1" />{" "}
                                        Continuar
                                      </>
                                    )}
                                  </Button>
                                )}
                                {module.status === "locked" && (
                                  <Button
                                    size="sm"
                                    className="h-8 text-xs bg-gray-400 text-white font-medium rounded-lg opacity-70 cursor-not-allowed uppercase font-montserrat"
                                    disabled
                                  >
                                    <Lock className="h-3.5 w-3.5 mr-1" />{" "}
                                    Bloqueado
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Other tabs content */}
        <TabsContent value="em-andamento" className="mt-0">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-montserrat">
              Nenhum desafio em andamento
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6 font-open-sans">
              Você ainda não iniciou nenhum desafio. Explore os desafios
              disponíveis ou crie o seu próprio desafio personalizado.
            </p>
            <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat font-semibold uppercase">
              <Plus className="h-4 w-4 mr-2" /> Criar Desafio
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="disponivel" className="mt-0">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-4">
              <Compass className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-montserrat">
              Explore desafios por categoria
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6 font-open-sans">
              Escolha entre diversos tipos de desafios educacionais para
              impulsionar seu aprendizado e desenvolvimento acadêmico.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {challengeTypes.map((type) => (
                <div
                  key={type.id}
                  className="bg-white/5 rounded-xl p-6 border border-[#FF6B00]/20 hover:border-[#FF6B00]/50 transition-all duration-300 hover:bg-[#FF6B00]/5 cursor-pointer group"
                >
                  <div className="w-16 h-16 mx-auto bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#FF6B00]/20 transition-all duration-300">
                    {type.icon}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 font-montserrat group-hover:text-[#FF6B00] transition-colors">
                    {type.title}
                  </h4>
                  <p className="text-gray-400 text-sm mb-4 font-open-sans">
                    {type.description}
                  </p>
                  <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] font-montserrat">
                    {type.count} desafios
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="concluido" className="mt-0">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-montserrat">
              Nenhum desafio concluído
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6 font-open-sans">
              Você ainda não concluiu nenhum desafio. Complete desafios para
              ganhar recompensas e acompanhar seu progresso acadêmico.
            </p>
            <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat font-semibold uppercase">
              <Compass className="h-4 w-4 mr-2" /> Explorar Desafios
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="recomendados" className="mt-0">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#001427] to-[#29335C] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-[#FF6B00]/20">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 relative">
                  <img
                    src={recommendedChallenge.image}
                    alt={recommendedChallenge.title}
                    className="w-full h-full object-cover md:absolute inset-0 opacity-90"
                    style={{ minHeight: "250px" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/50 md:to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white px-3 py-1.5 uppercase font-montserrat text-xs">
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Recomendado
                      para você
                    </Badge>
                  </div>
                </div>

                <div className="p-6 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-2xl font-bold text-white font-montserrat bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent">
                        {recommendedChallenge.title}
                      </h2>
                      <Badge
                        variant="outline"
                        className="border-[#FF6B00] text-[#FF6B00] font-montserrat text-xs"
                      >
                        {recommendedChallenge.difficulty}
                      </Badge>
                    </div>

                    <p className="text-gray-300 mb-5 font-open-sans">
                      {recommendedChallenge.description}
                    </p>

                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-300 font-montserrat">
                          Progresso
                        </span>
                        <span className="text-sm font-bold text-[#FF6B00] font-montserrat">
                          {recommendedChallenge.progress}%
                        </span>
                      </div>
                      <div className="h-3 bg-[#29335C]/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full transition-all duration-500"
                          style={{ width: `${recommendedChallenge.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-2 font-open-sans">
                        <span className="flex items-center">
                          <CheckSquare className="h-3 w-3 mr-1 text-[#FF6B00]" />{" "}
                          {recommendedChallenge.completedTasks} de{" "}
                          {recommendedChallenge.totalTasks} tarefas concluídas
                        </span>
                        <span className="flex items-center">
                          <Hourglass className="h-3 w-3 mr-1 text-[#FF6B00]" />{" "}
                          {recommendedChallenge.daysLeft} dias restantes
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4 bg-[#29335C]/30 p-3 rounded-lg">
                      <div className="flex items-center">
                        <GraduationCap className="h-5 w-5 text-[#FF6B00] mr-2" />
                        <span className="text-xs text-gray-300 font-montserrat">
                          Categoria:{" "}
                          <span className="font-semibold text-white">
                            {recommendedChallenge.category}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <Button
                      variant="outline"
                      className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 font-montserrat font-semibold w-full sm:w-auto"
                    >
                      <Eye className="h-4 w-4 mr-2" /> Ver Detalhes
                    </Button>
                    <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat font-semibold uppercase w-full sm:w-auto">
                      <Rocket className="h-4 w-4 mr-2" /> Iniciar Desafio
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center py-4">
              <p className="text-gray-400 mb-4 font-open-sans">
                Estas recomendações são baseadas no seu perfil de aprendizado e
                histórico de atividades.
              </p>
              <Button
                variant="outline"
                className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 font-montserrat font-semibold"
              >
                <Compass className="h-4 w-4 mr-2" /> Ver Mais Recomendações
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="populares" className="mt-0">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-4">
              <Flame className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-montserrat">
              Desafios Populares
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6 font-open-sans">
              Descubra os desafios mais populares entre os estudantes. Participe
              e compare seu desempenho com outros alunos.
            </p>

            <div className="text-center py-4">
              <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat font-semibold uppercase">
                <Compass className="h-4 w-4 mr-2" /> Explorar Desafios Populares
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* How It Works Section */}
      <div className="bg-[#29335C]/30 rounded-xl p-6 mt-8">
        <h3 className="text-xl font-bold text-white mb-6 text-center font-montserrat">
          Como Funcionam os Desafios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorks.map((step, index) => (
            <div
              key={step.id}
              className="bg-[#FF6B00]/5 rounded-xl p-6 border border-[#FF6B00]/20 relative"
            >
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <div className="w-14 h-14 mx-auto bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h4 className="text-lg font-bold text-white mb-2 text-center font-montserrat">
                {step.title}
              </h4>
              <p className="text-gray-300 text-sm text-center font-open-sans">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChallengesView;
