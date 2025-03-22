import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BookMarked,
  Search,
  Filter,
  BookOpen,
  Video,
  FileText,
  Headphones,
  Link,
  PenTool,
  Network,
  CheckCircle,
  ArrowUpRight,
  LayoutGrid,
  List,
  ChevronRight,
  ChevronLeft,
  Heart,
  Clock,
  Star,
  Brain,
  Rocket,
  FolderKanban,
  Plus,
  BookText,
  Home,
  CheckSquare,
  Target,
  Calendar,
  Users2,
  BarChart,
  X,
  Play,
  Maximize2,
  MessageSquare,
  Download,
  Share2,
  Info,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

// Type definitions
type MaterialType = "video" | "pdf" | "audio" | "link" | "exercise" | "mindmap";

interface Material {
  id: string;
  title: string;
  type: MaterialType;
  turma: string;
  disciplina: string;
  date: string;
  author?: string;
  fileSize?: string;
  duration?: string;
  rating?: number;
  views?: number;
  status?: "new" | "recommended" | "saved";
  isFavorite: boolean;
  isRead: boolean;
  thumbnail?: string;
  description?: string;
}

interface Turma {
  id: string;
  name: string;
  professor: string;
  materialsCount: number;
  progress?: number;
  image: string;
}

interface Disciplina {
  id: string;
  name: string;
  materialsCount: number;
  image: string;
}

interface Trilha {
  id: string;
  name: string;
  progress: number;
  nextStep: string;
  materialsCount: number;
  image: string;
}

// Mock data
const mockTurmas: Turma[] = [
  {
    id: "t1",
    name: "Cálculo I",
    professor: "Prof. Ricardo Oliveira",
    materialsCount: 24,
    progress: 65,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
  },
  {
    id: "t2",
    name: "Física Quântica",
    professor: "Profa. Ana Soares",
    materialsCount: 18,
    progress: 42,
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
  },
  {
    id: "t3",
    name: "Programação Avançada",
    professor: "Prof. Carlos Mendes",
    materialsCount: 32,
    progress: 78,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  },
  {
    id: "t4",
    name: "Estatística Aplicada",
    professor: "Profa. Juliana Costa",
    materialsCount: 15,
    progress: 30,
    image: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&q=80",
  },
];

const mockDisciplinas: Disciplina[] = [
  {
    id: "d1",
    name: "Matemática",
    materialsCount: 87,
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
  },
  {
    id: "d2",
    name: "Física",
    materialsCount: 64,
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
  },
  {
    id: "d3",
    name: "Computação",
    materialsCount: 112,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  },
  {
    id: "d4",
    name: "Estatística",
    materialsCount: 43,
    image: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&q=80",
  },
];

const mockTrilhas: Trilha[] = [
  {
    id: "tr1",
    name: "Fundamentos de Cálculo",
    progress: 65,
    nextStep: "Limites e Continuidade",
    materialsCount: 12,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
  },
  {
    id: "tr2",
    name: "Introdução à Física Quântica",
    progress: 30,
    nextStep: "Princípio da Incerteza",
    materialsCount: 15,
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
  },
  {
    id: "tr3",
    name: "Programação Orientada a Objetos",
    progress: 80,
    nextStep: "Padrões de Design",
    materialsCount: 18,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
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
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    description: "Uma introdução aos conceitos fundamentais do cálculo diferencial, incluindo limites, continuidade e derivadas.",
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
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
    description: "Este documento apresenta os princípios fundamentais da mecânica quântica, incluindo a dualidade onda-partícula e o princípio da incerteza.",
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
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    description: "Uma análise detalhada dos algoritmos de ordenação mais eficientes, incluindo QuickSort, MergeSort e HeapSort.",
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
    thumbnail: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&q=80",
    description: "Este documento aborda as principais distribuições de probabilidade, incluindo a distribuição normal, binomial e de Poisson.",
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
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
    description: "Uma conversa fascinante sobre os avanços recentes na física moderna, incluindo a teoria das cordas e a matéria escura.",
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
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    description: "Uma série de exercícios práticos sobre integração, incluindo técnicas de substituição e integração por partes.",
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
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    description: "Um artigo recente sobre os últimos avanços em inteligência artificial e aprendizado de máquina.",
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
    thumbnail: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&q=80",
    description: "Um mapa mental abrangente sobre testes de hipóteses, incluindo testes paramétricos e não paramétricos.",
  },
];

const mockRecommendations = mockMaterials.filter(m => m.status === "recommended").slice(0, 4);
const mockRecentlyAccessed = mockMaterials.filter(m => m.isRead).slice(0, 3);
const mockNewMaterials = mockMaterials.filter(m => m.status === "new").slice(0, 4);

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

const getIconForMaterialType = (type: MaterialType, className = "h-5 w-5") => {
  switch (type) {
    case "video":
      return <Video className={className} />;
    case "pdf":
      return <FileText className={className} />;
    case "audio":
      return <Headphones className={className} />;
    case "link":
      return <Link className={className} />;
    case "exercise":
      return <PenTool className={className} />;
    case "mindmap":
      return <Network className={className} />;
    default:
      return <BookText className={className} />;
  }
};

const getColorForMaterialType = (type: MaterialType) => {
  switch (type) {
    case "video":
      return "text-blue-500";
    case "pdf":
      return "text-red-500";
    case "audio":
      return "text-purple-500";
    case "link":
      return "text-green-500";
    case "exercise":
      return "text-amber-500";
    case "mindmap":
      return "text-cyan-500";
    default:
      return "text-gray-500";
  }
};

const getBackgroundForMaterialType = (type: MaterialType) => {
  switch (type) {
    case "video":
      return "bg-blue-50 dark:bg-blue-900/20";
    case "pdf":
      return "bg-red-50 dark:bg-red-900/20";
    case "audio":
      return "bg-purple-50 dark:bg-purple-900/20";
    case "link":
      return "bg-green-50 dark:bg-green-900/20";
    case "exercise":
      return "bg-amber-50 dark:bg-amber-900/20";
    case "mindmap":
      return "bg-cyan-50 dark:bg-cyan-900/20";
    default:
      return "bg-gray-50 dark:bg-gray-900/20";
  }
};

// Components
const MaterialTypeIcon = ({ type, className }: { type: MaterialType; className?: string }) => {
  const icon = getIconForMaterialType(type, className || "h-5 w-5");
  const color = getColorForMaterialType(type);
  return <div className={cn("flex items-center justify-center", color)}>{icon}</div>;
};

const MaterialTypeBadge = ({ type }: { type: MaterialType }) => {
  const icon = getIconForMaterialType(type, "h-3.5 w-3.5 mr-1");
  const color = getColorForMaterialType(type);
  const background = getBackgroundForMaterialType(type);
  
  return (
    <Badge variant="outline" className={cn("flex items-center gap-1 px-2 py-0.5", background, color)}>
      {icon}
      <span className="capitalize">{type}</span>
    </Badge>
  );
};

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
      <span className="ml-1 text-xs font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

const TurmaCard = ({ turma }: { turma: Turma }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#001427]/60 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
      <div className="h-32 overflow-hidden">
        <img 
          src={turma.image} 
          alt={turma.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#FF6B00] transition-colors">{turma.name}</h3>
        <p className="text-sm text-gray-200 mb-2">{turma.professor}</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-300">{turma.materialsCount} materiais</span>
          {turma.progress !== undefined && (
            <span className="text-xs font-medium text-[#FF6B00]">{turma.progress}%</span>
          )}
        </div>
        {turma.progress !== undefined && (
          <Progress value={turma.progress} className="h-1 bg-gray-700" />
        )}
      </div>
      <div className="absolute top-3 right-3 z-20">
        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white">
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

const DisciplinaCard = ({ disciplina }: { disciplina: Disciplina }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#001427]/60 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
      <div className="h-32 overflow-hidden">
        <img 
          src={disciplina.image} 
          alt={disciplina.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#FF6B00] transition-colors">{disciplina.name}</h3>
        <p className="text-sm text-gray-200 mb-1">{disciplina.materialsCount} materiais</p>
      </div>
      <div className="absolute top-3 right-3 z-20">
        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white">
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

const TrilhaCard = ({ trilha }: { trilha: Trilha }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#001427]/60 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
      <div className="h-32 overflow-hidden">
        <img 
          src={trilha.image} 
          alt={trilha.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#FF6B00] transition-colors">{trilha.name}</h3>
        <p className="text-sm text-gray-200 mb-1">Próximo: {trilha.nextStep}</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-300">{trilha.materialsCount} materiais</span>
          <span className="text-xs font-medium text-[#FF6B00]">{trilha.progress}%</span>
        </div>
        <Progress value={trilha.progress} className="h-1 bg-gray-700" />
      </div>
      <div className="absolute top-3 right-3 z-20">
        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white">
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

const MaterialCard = ({ material }: { material: Material }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#001427]/60 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]"
    >
      <div className="h-40 overflow-hidden">
        <img 
          src={material.thumbnail} 
          alt={material.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        <div className="absolute top-3 left-3">
          <div className={cn(
            "flex items-center justify-center h-8 w-8 rounded-full", 
            getBackgroundForMaterialType(material.type),
            getColorForMaterialType(material.type)
          )}>
            {getIconForMaterialType(material.type, "h-4 w-4")}
          </div>
        </div>
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className={cn(
              "h-8 w-8 rounded-full backdrop-blur-sm",
              material.isFavorite 
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" 
                : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            <Heart className={cn("h-4 w-4", material.isFavorite && "fill-red-500")} />
          </Button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-bold text-[#001427] dark:text-white line-clamp-2 group-hover:text-[#FF6B00] transition-colors">
            {material.title}
          </h3>
        </div>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span className="mr-2">{material.turma}</span>
          <span>•</span>
          <span className="mx-2">{formatDate(material.date)}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <MaterialTypeBadge type={material.type} />
          {material.status === "new" && (
            <Badge variant="outline" className="bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400">
              Novo
            </Badge>
          )}
          {material.status === "recommended" && (
            <Badge variant="outline" className="bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400">
              Recomendado
            </Badge>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {material.rating && <StarRating rating={material.rating} />}
            {material.views && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{material.views} visualizações</span>
            )}
          </div>
          <Button size="sm" variant="ghost" className="h-8 px-2 text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10">
            Acessar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const MaterialListItem = ({ material }: { material: Material }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="group flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#001427]/40 transition-colors"
    >
      <div className={cn(
        "flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg mr-4", 
        getBackgroundForMaterialType(material.type),
        getColorForMaterialType(material.type)
      )}>
        {getIconForMaterialType(material.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <h3 className="text-base font-semibold text-[#001427] dark:text-white group-hover:text-[#FF6B00] transition-colors line-clamp-1">
            {material.title}
          </h3>
          <div className="flex items-center ml-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "h-8 w-8 rounded-full",
                material.isFavorite 
                  ? "text-red-500 hover:bg-red-500/10" 
                  : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <Heart className={cn("h-4 w-4", material.isFavorite && "fill-red-500")} />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <CheckCircle className={cn("h-4 w-4", material.isRead && "text-green-500 fill-green-500")} />
            </Button>
          </div>
        </div>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
          <span className="mr-2">{material.turma}</span>
          <span>•</span>
          <span className="mx-2">{material.disciplina}</span>
          <span>•</span>
          <span className="ml-2">{formatDate(material.date)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <MaterialTypeBadge type={material.type} />
          {material.status === "new" && (
            <Badge variant="outline" className="bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400">
              Novo
            </Badge>
          )}
          {material.status === "recommended" && (
            <Badge variant="outline" className="bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400">
              Recomendado
            </Badge>
          )}
          {material.author && (
            <Badge variant="outline" className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {material.author}
            </Badge>
          )}
          {material.duration && (
            <Badge variant="outline" className="bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400">
              <Clock className="h-3 w-3 mr-1" />
              {material.duration}
            </Badge>
          )}
          {material.fileSize && (
            <Badge variant="outline" className="bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400">
              {material.fileSize}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 ml-4 self-center">
        <Button size="sm" className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
          Acessar
        </Button>
      </div>
    </motion.div>
  );
};

const RecentlyAccessedItem = ({ material }: { material: Material }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="group flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#001427]/40 transition-colors"
    >
      <div className={cn(
        "flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg mr-3", 
        getBackgroundForMaterialType(material.type),
        getColorForMaterialType(material.type)
      )}>
        {getIconForMaterialType(material.type, "h-4 w-4")}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-[#001427] dark:text-white group-hover:text-[#FF6B00] transition-colors truncate">
          {material.title}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {material.turma} • {formatDate(material.date)}
        </p>
      </div>
      <Button 
        size="sm" 
        variant="ghost" 
        className="flex-shrink-0 h-8 px-2 ml-2 text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
      >
        Retomar
      </Button>
    </motion.div>
  );
};

const FilterPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="bg-white dark:bg-[#001427]/60 rounded-lg p-4 shadow-md mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#001427] dark:text-white">Filtros</h3>
              <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-[#001427] dark:text-white mb-2">Tipo de Material</h4>
                <div className="space-y-2">
                  {["video", "pdf", "audio", "link", "exercise", "mindmap"].map((type) => (
                    <div key={type} className="flex items-center">
                      <input 
                        type="checkbox" 
                        id={`type-${type}`} 
                        className="h-4 w-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]" 
                      />
                      <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-[#001427] dark:text-white mb-2">Turma</h4>
                <div className="space-y-2">
                  {mockTurmas.map((turma) => (
                    <div key={turma.id} className="flex items-center">
                      <input 
                        type="checkbox" 
                        id={`turma-${turma.id}`} 
                        className="h-4 w-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]" 
                      />
                      <label htmlFor={`turma-${turma.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {turma.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-[#001427] dark:text-white mb-2">Status</h4>
                <div className="space-y-2">
                  {["Todos", "Novos", "Recomendados", "Favoritos", "Lidos", "Não lidos"].map((status) => (
                    <div key={status} className="flex items-center">
                      <input 
                        type="radio" 
                        name="status" 
                        id={`status-${status}`} 
                        className="h-4 w-4 border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]" 
                      />
                      <label htmlFor={`status-${status}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" onClick={onClose}>Limpar Filtros</Button>
              <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">Aplicar Filtros</Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const MaterialViewer = ({ material, isOpen, onClose }: { material: Material | null; isOpen: boolean; onClose: () => void }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  if (!material) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "bg-white dark:bg-[#001427] rounded-xl shadow-2xl overflow-hidden",
              isFocusMode ? "w-full h-full" : "w-full max-w-4xl max-h-[90vh]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={cn("flex flex-col h-full", isFocusMode && "relative")}>
              <div className={cn(
                "flex items-center justify-between p-4 border-b dark:border-gray-800",
                isFocusMode && "absolute top-0 left-0 right-0 z-10 bg-white/10 backdrop-blur-md opacity-0 hover:opacity-100 transition-opacity"
              )}>
                <div className="flex items-center">
                  <div className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-lg mr-3", 
                    getBackgroundForMaterialType(material.type),
                    getColorForMaterialType(material.type)
                  )}>
                    {getIconForMaterialType(material.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#001427] dark:text-white">{material.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {material.turma} • {material.disciplina} • {formatDate(material.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 rounded-full"
                          onClick={() => setIsFocusMode(!isFocusMode)}
                        >
                          <Maximize2 className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Modo Foco</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 rounded-full"
                        >
                          <Download className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 rounded-full"
                        >
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Compartilhar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 rounded-full"
                          onClick={onClose}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Fechar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto">
                {material.type === "video" && (
                  <div className="relative pt-[56.25%] bg-black">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Button 
                          size="icon" 
                          className="h-16 w-16 rounded-full bg-[#FF6B00]/90 hover:bg-[#FF6B00] text-white"
                        >
                          <Play className="h-8 w-8 ml-1" />
                        </Button>
                        <p className="mt-4 text-white text-lg font-medium">Clique para reproduzir o vídeo</p>
                      </div>
                    </div>
                    <img 
                      src={material.thumbnail} 
                      alt={material.title} 
                      className="absolute inset-0 w-full h-full object-cover opacity-50" 
                    />
                  </div>
                )}
                
                {material.type === "pdf" && (
                  <div className="p-6">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
                      <FileText className="h-16 w-16 text-gray-400 mb-4" />
                      <h4 className="text-lg font-medium text-[#001427] dark:text-white mb-2">Visualizador de PDF</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                        Este é um documento PDF. Clique no botão abaixo para visualizá-lo.
                      </p>
                      <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                        Abrir PDF
                      </Button>
                    </div>
                  </div>
                )}
                
                {material.type === "audio" && (
                  <div className="p-6">
                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px]">
                      <div className="w-full max-w-md">
                        <div className="flex items-center justify-center mb-6">
                          <Headphones className="h-16 w-16 text-purple-500" />
                        </div>
                        <h4 className="text-lg font-medium text-center text-[#001427] dark:text-white mb-4">
                          {material.title}
                        </h4>
                        <div className="flex items-center justify-center space-x-4 mb-6">
                          <Button 
                            size="icon" 
                            className="h-12 w-12 rounded-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                          >
                            <Play className="h-6 w-6 ml-0.5" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: "30%" }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>0:00</span>
                            <span>{material.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {(material.type === "exercise" || material.type === "mindmap" || material.type === "link") && (
                  <div className="p-6">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
                      {material.type === "exercise" && <PenTool className="h-16 w-16 text-amber-500 mb-4" />}
                      {material.type === "mindmap" && <Network className="h-16 w-16 text-cyan-500 mb-4" />}
                      {material.type === "link" && <Link className="h-16 w-16 text-green-500 mb-4" />}
                      
                      <h4 className="text-lg font-medium text-[#001427] dark:text-white mb-2">
                        {material.type === "exercise" && "Exercício Interativo"}
                        {material.type === "mindmap" && "Mapa Mental"}
                        {material.type === "link" && "Link Externo"}
                      </h4>
                      
                      <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                        {material.type === "exercise" && "Este é um exercício interativo. Clique no botão abaixo para iniciá-lo."}
                        {material.type === "mindmap" && "Este é um mapa mental interativo. Clique no botão abaixo para visualizá-lo."}
                        {material.type === "link" && "Este é um link para um recurso externo. Clique no botão abaixo para acessá-lo."}
                      </p>
                      
                      <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                        {material.type === "exercise" && "Iniciar Exercício"}
                        {material.type === "mindmap" && "Abrir Mapa Mental"}
                        {material.type === "link" && "Acessar Link"}
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-[#001427] dark:text-white mb-3">Descrição</h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">{material.description}</p>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden mr-2">
                        <img 
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=teacher" 
                          alt={material.author || "Autor"} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#001427] dark:text-white">{material.author}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Professor</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-500 mr-2">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#001427] dark:text-white">Data de Publicação</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(material.date)}</p>
                      </div>
                    </div>
                    
                    {material.duration && (
                      <div className="flex items-center">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-500 mr-2">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#001427] dark:text-white">Duração</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{material.duration}</p>
                        </div>
                      </div>
                    )}
                    
                    {material.fileSize && (
                      <div className="flex items-center">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-500 mr-2">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#001427] dark:text-white">Tamanho</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{material.fileSize}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Tabs defaultValue="discussao">
                    <TabsList className="mb-4">
                      <TabsTrigger value="discussao">Discussão</TabsTrigger>
                      <TabsTrigger value="anotacoes">Anotações</TabsTrigger>
                      <TabsTrigger value="recursos">Recursos Adicionais</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="discussao">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Avatar>
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user1" />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium text-[#001427] dark:text-white">João Dias</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Há 2 dias</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                Alguém poderia me explicar melhor o conceito apresentado aos 15 minutos do vídeo? Estou tendo dificuldade para entender.
                              </p>
                            </div>
                            <div className="flex items-center mt-1 ml-1 space-x-4">
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-gray-500 dark:text-gray-400">
                                Responder
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-gray-500 dark:text-gray-400">
                                Curtir
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 ml-8">
                          <Avatar>
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=teacher" />
                            <AvatarFallback>PO</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-[#001427] dark:text-white">{material.author}</p>
                                  <Badge className="ml-2 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                                    Professor
                                  </Badge>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-2">Há 1 dia</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                Olá João! O conceito apresentado nesse momento do vídeo se refere à aplicação da regra da cadeia na derivação. Vou explicar com mais detalhes: quando temos uma função composta f(g(x)), a derivada é f'(g(x)) * g'(x). No exemplo do vídeo...
                              </p>
                            </div>
                            <div className="flex items-center mt-1 ml-1 space-x-4">
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-gray-500 dark:text-gray-400">
                                Responder
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-gray-500 dark:text-gray-400">
                                Curtir
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 mt-6">
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );