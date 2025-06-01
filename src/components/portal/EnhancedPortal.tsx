import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BookMarked,
  Search,
  BookOpen,
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
  ChevronRight,
  ChevronLeft,
  Video,
  FileText,
  Headphones,
  Link as LinkIcon,
  PenTool,
  Network,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Maximize2,
  Timer,
  Music,
  Volume2,
  CheckCircle,
  Heart,
  MoreHorizontal,
  Calendar,
  User,
  Tag,
  Download,
  Eye,
  Bell,
  Rocket,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
  lastAccessed?: string;
}

interface Turma {
  id: string;
  name: string;
  professor: string;
  students: number;
  progress: number;
  nextClass: string;
  image?: string;
  materialsCount?: number;
}

interface Disciplina {
  id: string;
  name: string;
  materialsCount: number;
  image: string;
  progress?: number;
}

interface Trilha {
  id: string;
  name: string;
  progress: number;
  nextStep: string;
  materialsCount: number;
  image: string;
  enrolled: number;
  description?: string;
}

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
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
      return <LinkIcon className={className} />;
    case "exercise":
      return <PenTool className={className} />;
    case "mindmap":
      return <Network className={className} />;
    default:
      return <BookOpen className={className} />;
  }
};

const getColorForMaterialType = (type: MaterialType) => {
  switch (type) {
    case "video":
      return "#4C6EF5"; // Blue
    case "pdf":
      return "#FA5252"; // Red
    case "audio":
      return "#7950F2"; // Purple
    case "link":
      return "#40C057"; // Green
    case "exercise":
      return "#FD7E14"; // Orange
    case "mindmap":
      return "#15AABF"; // Cyan
    default:
      return "#6C757D"; // Gray
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

// Components
const MaterialTypeIcon = ({
  type,
  className,
}: {
  type: MaterialType;
  className?: string;
}) => {
  const icon = getIconForMaterialType(type, className || "h-5 w-5");
  const color = getColorForMaterialType(type);
  return (
    <div className="flex items-center justify-center" style={{ color }}>
      {icon}
    </div>
  );
};

const MaterialTypeBadge = ({ type }: { type: MaterialType }) => {
  const icon = getIconForMaterialType(type, "h-3.5 w-3.5 mr-1");
  const color = getColorForMaterialType(type);
  const background = getBackgroundForMaterialType(type);

  return (
    <Badge
      variant="outline"
      className={cn("flex items-center gap-1 px-2 py-0.5", background)}
      style={{ color }}
    >
      {icon}
      <span className="capitalize">{type}</span>
    </Badge>
  );
};

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      <svg
        className="h-3.5 w-3.5 fill-amber-500 text-amber-500"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span className="ml-1 text-xs font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

const MaterialCard = ({
  material,
  onClick,
  className,
}: {
  material: Material;
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800/60 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      <div className="h-40 overflow-hidden">
        <img
          src={
            material.thumbnail ||
            "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80"
          }
          alt={material.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <div
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-full",
              getBackgroundForMaterialType(material.type),
            )}
            style={{ color: getColorForMaterialType(material.type) }}
          >
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
                : "bg-white/10 text-white hover:bg-white/20",
            )}
            onClick={(e) => {
              e.stopPropagation();
              // Toggle favorite logic would go here
            }}
          >
            <Heart
              className={cn("h-4 w-4", material.isFavorite && "fill-red-500")}
            />
          </Button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-70"></div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-semibold text-lg line-clamp-1">
            {material.title}
          </h3>
          <div className="flex items-center mt-1 text-white/80 text-sm">
            <span className="mr-2">{material.disciplina}</span>
            <span>•</span>
            <span className="mx-2">{formatDate(material.date)}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <MaterialTypeBadge type={material.type} />
          {material.status === "new" && (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
            >
              Novo
            </Badge>
          )}
          {material.status === "recommended" && (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400"
            >
              Recomendado
            </Badge>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {material.rating && <StarRating rating={material.rating} />}
            {material.views && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {material.views} visualizações
              </span>
            )}
          </div>
          <Button
            size="sm"
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            onClick={(e) => {
              e.stopPropagation();
              // Access logic would go here
            }}
          >
            Acessar
          </Button>
        </div>
      </div>
    </div>
  );
};

const MaterialListItem = ({
  material,
  onClick,
}: {
  material: Material;
  onClick?: () => void;
}) => {
  return (
    <div
      className="flex items-start p-4 rounded-lg bg-white dark:bg-gray-800/60 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/80"
      onClick={onClick}
    >
      <div
        className={cn(
          "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center mr-4",
          getBackgroundForMaterialType(material.type),
        )}
        style={{ color: getColorForMaterialType(material.type) }}
      >
        {getIconForMaterialType(material.type, "h-6 w-6")}
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
          {material.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {material.disciplina}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {material.type}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(material.date)}
          </span>
          {material.author && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              <User className="inline h-3.5 w-3.5 mr-1" />
              {material.author}
            </span>
          )}
          {material.duration && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              <Clock className="inline h-3.5 w-3.5 mr-1" />
              {material.duration}
            </span>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2 ml-4">
        {material.isFavorite && (
          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
        )}
        <Button
          size="sm"
          className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
        >
          Acessar
        </Button>
      </div>
    </div>
  );
};

const TurmaCard = ({ turma }: { turma: Turma }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 h-40 md:h-auto">
          <img
            src={
              turma.image ||
              "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80"
            }
            alt={turma.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-2/3 p-5">
          <h3 className="text-xl font-bold text-[#001427] dark:text-white">
            {turma.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {turma.professor}
          </p>
          <div className="mt-4">
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
          </div>
          <div className="mt-4">
            <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
              Acessar turma
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const DisciplinaCard = ({ disciplina }: { disciplina: Disciplina }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="relative h-40">
        <img
          src={disciplina.image}
          alt={disciplina.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-xl font-bold text-white">{disciplina.name}</h3>
          <p className="text-white/80 text-sm">
            {disciplina.materialsCount} materiais
          </p>
        </div>
      </div>
      <CardContent className="p-4">
        {disciplina.progress !== undefined && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Progresso
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: getColorForDisciplina(disciplina.name) }}
              >
                {disciplina.progress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${disciplina.progress}%`,
                  backgroundColor: getColorForDisciplina(disciplina.name),
                }}
              ></div>
            </div>
          </div>
        )}
        <Button className="w-full mt-4 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
          Ver materiais
        </Button>
      </CardContent>
    </Card>
  );
};

const TrilhaCard = ({ trilha }: { trilha: Trilha }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="relative h-40">
        <img
          src={trilha.image}
          alt={trilha.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-xl font-bold text-white">{trilha.name}</h3>
          <p className="text-white/80 text-sm">
            {trilha.enrolled} alunos inscritos
          </p>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Progresso
            </span>
            <span className="text-sm font-medium text-[#FF6B00]">
              {trilha.progress}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF6B00] rounded-full"
              style={{ width: `${trilha.progress}%` }}
            ></div>
          </div>
        </div>
        <div className="mb-4">
          <h4 className="text-sm font-medium flex items-center">
            <Rocket className="h-4 w-4 mr-1 text-[#FF6B00]" />
            Próximo passo:
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {trilha.nextStep}
          </p>
        </div>
        <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
          Continuar trilha
        </Button>
      </CardContent>
    </Card>
  );
};

const SearchBar = ({
  value,
  onChange,
  onSearch,
  className = "",
  placeholder = "Buscar materiais, disciplinas, turmas...",
}: {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  className?: string;
  placeholder?: string;
}) => {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-4 py-2 border-b border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSearch(value);
          }
        }}
      />
    </div>
  );
};

const FilterPanel = ({
  onApplyFilters,
}: {
  onApplyFilters: (filters: any) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [disciplinaFilter, setDisciplinaFilter] = useState<string[]>([]);
  const [turmaFilter, setTurmaFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<MaterialType[]>([]);
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Mock data for filters
  const disciplinas = [
    { id: "1", name: "Física" },
    { id: "2", name: "Matemática" },
    { id: "3", name: "Português" },
    { id: "4", name: "História" },
    { id: "5", name: "Química" },
    { id: "6", name: "Biologia" },
  ];

  const turmas = [
    { id: "1", name: "Física Avançada" },
    { id: "2", name: "Cálculo I" },
    { id: "3", name: "Literatura Contemporânea" },
  ];

  const materialTypes: { id: MaterialType; name: string }[] = [
    { id: "video", name: "Vídeo" },
    { id: "pdf", name: "PDF" },
    { id: "audio", name: "Áudio" },
    { id: "link", name: "Link" },
    { id: "exercise", name: "Exercício" },
    { id: "mindmap", name: "Mapa Mental" },
  ];

  const dateOptions = [
    { id: "all", name: "Todos" },
    { id: "today", name: "Hoje" },
    { id: "week", name: "Esta semana" },
    { id: "month", name: "Este mês" },
    { id: "year", name: "Este ano" },
  ];

  const handleApplyFilters = () => {
    const filters = {
      disciplinas: disciplinaFilter,
      turmas: turmaFilter,
      types: typeFilter,
      date: dateFilter,
    };
    onApplyFilters(filters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setDisciplinaFilter([]);
    setTurmaFilter([]);
    setTypeFilter([]);
    setDateFilter("all");
    onApplyFilters({});
    setIsOpen(false);
  };

  const activeFiltersCount =
    disciplinaFilter.length +
    turmaFilter.length +
    typeFilter.length +
    (dateFilter !== "all" ? 1 : 0);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border-gray-300 dark:border-gray-600"
      >
        <Filter className="h-4 w-4" />
        <span>Filtros</span>
        {activeFiltersCount > 0 && (
          <Badge className="ml-1 bg-[#FF6B00] text-white">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filtros
            </h3>
          </div>

          <ScrollArea className="h-[60vh] max-h-[500px] p-4">
            <div className="space-y-6">
              {/* Disciplina Filter */}
              <div>
                <h4 className="text-sm font-medium mb-2">Disciplina</h4>
                <div className="space-y-2">
                  {disciplinas.map((disciplina) => (
                    <div key={disciplina.id} className="flex items-center">
                      <Checkbox
                        id={`disciplina-${disciplina.id}`}
                        checked={disciplinaFilter.includes(disciplina.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setDisciplinaFilter([
                              ...disciplinaFilter,
                              disciplina.id,
                            ]);
                          } else {
                            setDisciplinaFilter(
                              disciplinaFilter.filter(
                                (id) => id !== disciplina.id,
                              ),
                            );
                          }
                        }}
                      />
                      <Label
                        htmlFor={`disciplina-${disciplina.id}`}
                        className="ml-2 text-sm font-normal"
                      >
                        {disciplina.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Turma Filter */}
              <div>
                <h4 className="text-sm font-medium mb-2">Turma</h4>
                <div className="space-y-2">
                  {turmas.map((turma) => (
                    <div key={turma.id} className="flex items-center">
                      <Checkbox
                        id={`turma-${turma.id}`}
                        checked={turmaFilter.includes(turma.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTurmaFilter([...turmaFilter, turma.id]);
                          } else {
                            setTurmaFilter(
                              turmaFilter.filter((id) => id !== turma.id),
                            );
                          }
                        }}
                      />
                      <Label
                        htmlFor={`turma-${turma.id}`}
                        className="ml-2 text-sm font-normal"
                      >
                        {turma.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Material Type Filter */}
              <div>
                <h4 className="text-sm font-medium mb-2">Tipo de Material</h4>
                <div className="space-y-2">
                  {materialTypes.map((type) => (
                    <div key={type.id} className="flex items-center">
                      <Checkbox
                        id={`type-${type.id}`}
                        checked={typeFilter.includes(type.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTypeFilter([...typeFilter, type.id]);
                          } else {
                            setTypeFilter(
                              typeFilter.filter((id) => id !== type.id),
                            );
                          }
                        }}
                      />
                      <Label
                        htmlFor={`type-${type.id}`}
                        className="ml-2 text-sm font-normal flex items-center"
                      >
                        <span
                          className="mr-2"
                          style={{ color: getColorForMaterialType(type.id) }}
                        >
                          {getIconForMaterialType(type.id, "h-4 w-4")}
                        </span>
                        {type.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Date Filter */}
              <div>
                <h4 className="text-sm font-medium mb-2">Data de Publicação</h4>
                <div className="space-y-2">
                  {dateOptions.map((option) => (
                    <div key={option.id} className="flex items-center">
                      <input
                        type="radio"
                        id={`date-${option.id}`}
                        name="dateFilter"
                        value={option.id}
                        checked={dateFilter === option.id}
                        onChange={() => setDateFilter(option.id)}
                        className="h-4 w-4 text-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                      <Label
                        htmlFor={`date-${option.id}`}
                        className="ml-2 text-sm font-normal"
                      >
                        {option.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-4 border-t dark:border-gray-700 flex justify-between">
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="text-gray-500"
            >
              Limpar Filtros
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const ViewToggle = ({
  viewMode,
  onViewModeChange,
}: {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}) => {
  return (
    <div className="flex border rounded-md overflow-hidden">
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        className={`rounded-none ${viewMode === "grid" ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white" : "text-gray-500"}`}
        onClick={() => onViewModeChange("grid")}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        className={`rounded-none ${viewMode === "list" ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white" : "text-gray-500"}`}
        onClick={() => onViewModeChange("list")}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};

const SortDropdown = ({
  sortOption,
  onSortChange,
}: {
  sortOption: "relevance" | "date" | "alphabetical" | "type" | "popular";
  onSortChange: (
    option: "relevance" | "date" | "alphabetical" | "type" | "popular",
  ) => void;
}) => {
  const sortOptions = [
    { value: "relevance", label: "Relevância" },
    { value: "date", label: "Data (mais recente)" },
    { value: "alphabetical", label: "Ordem alfabética" },
    { value: "type", label: "Tipo de material" },
    { value: "popular", label: "Mais acessados" },
  ];

  const currentOption = sortOptions.find(
    (option) => option.value === sortOption,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-gray-300 dark:border-gray-600"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Ordenar: {currentOption?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className={cn(
              "cursor-pointer",
              option.value === sortOption && "bg-gray-100 dark:bg-gray-800",
            )}
            onClick={() => onSortChange(option.value as any)}
          >
            {option.value === sortOption && (
              <CheckCircle className="h-4 w-4 mr-2 text-[#FF6B00]" />
            )}
            {option.value !== sortOption && <div className="w-6 mr-2" />}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FocusMode = ({
  material,
  onClose,
}: {
  material: Material | null;
  onClose: () => void;
}) => {
  if (!material) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-[#001427] overflow-auto">
      <div className="container mx-auto py-6 px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#001427] dark:text-white">
            {material.title}
          </h1>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <Timer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Timer Pomodoro</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <Music className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Música ambiente</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5 mr-2" />
              Sair do modo foco
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
          {material.type === "video" ? (
            <div className="aspect-video bg-black">
              <div className="w-full h-full flex items-center justify-center text-white">
                <p>Player de vídeo simulado</p>
              </div>
            </div>
          ) : material.type === "pdf" ? (
            <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 p-8">
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Visualizador de PDF simulado
                </p>
              </div>
            </div>
          ) : material.type === "audio" ? (
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
                      {material.disciplina} com foco em{" "}
                      {material.title.toLowerCase()}.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">
                        Disciplina
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {material.disciplina}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">
                        Turma
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {material.turma}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">
                        Tipo
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {material.type}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">
                        Data de publicação
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(material.date).toLocaleDateString()}
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

export const EnhancedPortal = () => {
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
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel refs
  const carouselRef = useRef<HTMLDivElement>(null);

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

  const handleNextSlide = () => {
    if (carouselRef.current && recommendedMaterials.length > 0) {
      setCurrentSlide((prev) =>
        prev === Math.ceil(recommendedMaterials.length / 3) - 1 ? 0 : prev + 1,
      );
    }
  };

  const handlePrevSlide = () => {
    if (carouselRef.current && recommendedMaterials.length > 0) {
      setCurrentSlide((prev) =>
        prev === 0 ? Math.ceil(recommendedMaterials.length / 3) - 1 : prev - 1,
      );
    }
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
      lastAccessed: "2 horas atrás",
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
      lastAccessed: "Ontem",
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
      lastAccessed: "3 dias atrás",
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
      lastAccessed: "1 semana atrás",
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
      description: "Baseado no seu interesse em Física Quântica",
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
      description: "Complemento para seus estudos de Cálculo",
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
      description: "Sugerido pelo seu professor",
    },
    {
      id: "8",
      title: "História da Ciência",
      type: "video",
      date: "2023-05-13",
      turma: "História Geral",
      disciplina: "História",
      progress: 0,
      isFavorite: false,
      isRead: false,
      status: "recommended",
      thumbnail:
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
      description: "Relacionado aos seus interesses",
    },
    {
      id: "9",
      title: "Química Orgânica Básica",
      type: "pdf",
      date: "2023-05-12",
      turma: "Química Geral",
      disciplina: "Química",
      progress: 0,
      isFavorite: false,
      isRead: false,
      status: "recommended",
      thumbnail:
        "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80",
      description: "Novo material disponível",
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
      image:
        "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
      materialsCount: 24,
    },
    {
      id: "2",
      name: "Cálculo I",
      professor: "Dra. Maria Silva",
      students: 35,
      progress: 50,
      nextClass: "Quinta, 10:00",
      image:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
      materialsCount: 32,
    },
    {
      id: "3",
      name: "Literatura Contemporânea",
      professor: "Prof. João Costa",
      students: 22,
      progress: 80,
      nextClass: "Sexta, 16:00",
      image:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
      materialsCount: 18,
    },
  ] as Turma[];

  const disciplinas = [
    {
      id: "1",
      name: "Física",
      materialsCount: 24,
      image:
        "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
      progress: 70,
    },
    {
      id: "2",
      name: "Matemática",
      materialsCount: 32,
      image:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
      progress: 45,
    },
    {
      id: "3",
      name: "Português",
      materialsCount: 18,
      image:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
      progress: 60,
    },
    {
      id: "4",
      name: "História",
      materialsCount: 15,
      image:
        "https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=800&q=80",
      progress: 85,
    },
    {
      id: "5",
      name: "Química",
      materialsCount: 22,
      image:
        "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80",
      progress: 30,
    },
    {
      id: "6",
      name: "Biologia",
      materialsCount: 20,
      image:
        "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
      progress: 55,
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#001427]">
      {showFocusMode && (
        <FocusMode
          material={selectedMaterial}
          onClose={() => setShowFocusMode(false)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#001427] to-[#294D61] text-white py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold">Portal</h1>
              <p className="text-gray-300 mt-2">
                Seu universo de conhecimento ao seu alcance
              </p>
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
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Featured Cards Section - Only on visao-geral */}
        {activeTab === "visao-geral" && (
          <div className="mb-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            {material.description}
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
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-[#FF6B00] mr-2" />
                  <h2 className="text-2xl font-bold text-[#001427] dark:text-white">
                    Continue Estudando
                  </h2>
                </div>
                <Button variant="ghost" className="text-[#FF6B00]">
                  Ver todos
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {recentMaterials.map((material) => (
                  <div key={material.id} className="flex flex-col">
                    <MaterialCard
                      material={material}
                      onClick={() => handleMaterialClick(material)}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      Acessado {material.lastAccessed}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-[#FF6B00] mr-2" />
                  <h2 className="text-2xl font-bold text-[#001427] dark:text-white">
                    Recomendado para Você
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevSlide}
                    className="rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextSlide}
                    className="rounded-full"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" className="text-[#FF6B00]">
                    Ver todos
                  </Button>
                </div>
              </div>
              <div className="relative overflow-hidden" ref={carouselRef}>
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${currentSlide * 100}%)`,
                  }}
                >
                  <div className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {recommendedMaterials.slice(0, 3).map((material) => (
                        <MaterialCard
                          key={material.id}
                          material={material}
                          onClick={() => handleMaterialClick(material)}
                        />
                      ))}
                    </div>
                  </div>
                  {recommendedMaterials.length > 3 && (
                    <div className="w-full flex-shrink-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recommendedMaterials.slice(3).map((material) => (
                          <MaterialCard
                            key={material.id}
                            material={material}
                            onClick={() => handleMaterialClick(material)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                            {disciplina.progress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${disciplina.progress}%`,
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
                        <div className="flex items-center">
                          <div
                            className={cn(
                              "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-3",
                              getBackgroundForMaterialType(favorito.type),
                            )}
                            style={{
                              color: getColorForMaterialType(favorito.type),
                            }}
                          >
                            {getIconForMaterialType(favorito.type, "h-5 w-5")}
                          </div>
                          <div>
                            <h3 className="font-medium text-[#001427] dark:text-white">
                              {favorito.title}
                            </h3>
                            <div className="flex items-center mt-1">
                              <Badge
                                variant="outline"
                                className="mr-2 text-xs"
                                style={{
                                  color: getColorForMaterialType(favorito.type),
                                }}
                              >
                                {favorito.type}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {favorito.disciplina}
                              </span>
                            </div>
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
                <TurmaCard key={turma.id} turma={turma} />
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
