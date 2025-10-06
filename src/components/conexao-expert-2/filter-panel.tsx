import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  X,
  Clock,
  CheckCircle,
  DollarSign,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Calendar,
  Image,
  Video,
  FileText,
  Tag,
  SortAsc,
  SortDesc,
  Eye,
  MessageCircle,
  Calculator,
  Atom,
  Beaker,
  BookText,
  Globe,
  Code,
} from "lucide-react";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  activeFilters: any;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  activeFilters,
}) => {
  const [filters, setFilters] = useState({
    subjects: activeFilters.subjects || [],
    levels: activeFilters.levels || [],
    statuses: activeFilters.statuses || [],
    isUrgent: activeFilters.isUrgent || false,
    hasAttachments: activeFilters.hasAttachments || false,
    myBids: activeFilters.myBids || false,
    withPaidResponses: activeFilters.withPaidResponses || false,
    dateRange: activeFilters.dateRange || null,
    bidRange: activeFilters.bidRange || [0, 100],
    keywords: activeFilters.keywords || "",
    sortBy: activeFilters.sortBy || null,
    sortOrder: activeFilters.sortOrder || "desc",
  });

  const handleSubjectToggle = (subject: string) => {
    setFilters((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s: string) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const handleLevelToggle = (level: string) => {
    setFilters((prev) => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter((l: string) => l !== level)
        : [...prev.levels, level],
    }));
  };

  const handleStatusToggle = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s: string) => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFilters((prev) => ({ ...prev, [name]: checked }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (value: number[]) => {
    setFilters((prev) => ({ ...prev, bidRange: value }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: prev.sortBy === sortBy ? null : sortBy,
      sortOrder:
        prev.sortBy === sortBy && prev.sortOrder === "desc" ? "asc" : "desc",
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({
      subjects: [],
      levels: [],
      statuses: [],
      isUrgent: false,
      hasAttachments: false,
      myBids: false,
      withPaidResponses: false,
      dateRange: null,
      bidRange: [0, 100],
      keywords: "",
      sortBy: null,
      sortOrder: "desc",
    });
  };

  const subjects = [
    {
      id: "matematica",
      name: "Matemática",
      icon: <Calculator className="h-3.5 w-3.5 text-[#FF6B00]" />,
    },
    {
      id: "fisica",
      name: "Física",
      icon: <Atom className="h-3.5 w-3.5 text-[#4361EE]" />,
    },
    {
      id: "quimica",
      name: "Química",
      icon: <Beaker className="h-3.5 w-3.5 text-[#E85D04]" />,
    },
    {
      id: "biologia",
      name: "Biologia",
      icon: <BookOpen className="h-3.5 w-3.5 text-[#38B000]" />,
    },
    {
      id: "literatura",
      name: "Literatura",
      icon: <BookText className="h-3.5 w-3.5 text-[#6D597A]" />,
    },
    {
      id: "programacao",
      name: "Programação",
      icon: <Code className="h-3.5 w-3.5 text-[#3A86FF]" />,
    },
    {
      id: "geografia",
      name: "Geografia",
      icon: <Globe className="h-3.5 w-3.5 text-[#38B000]" />,
    },
    {
      id: "historia",
      name: "História",
      icon: <BookOpen className="h-3.5 w-3.5 text-[#BC4749]" />,
    },
  ];

  const levels = [
    { id: "ensino_fundamental", name: "Ensino Fundamental" },
    { id: "ensino_medio", name: "Ensino Médio" },
    { id: "graduacao", name: "Graduação" },
    { id: "pos_graduacao", name: "Pós-Graduação" },
    { id: "outro", name: "Outro" },
  ];

  const statuses = [
    {
      id: "aberto",
      name: "Aberto",
      icon: <Clock className="h-3.5 w-3.5 text-green-500" />,
    },
    {
      id: "em_leilao",
      name: "Com Propostas",
      icon: <DollarSign className="h-3.5 w-3.5 text-blue-500" />,
    },
    {
      id: "respondido",
      name: "Respondido",
      icon: <MessageCircle className="h-3.5 w-3.5 text-orange-500" />,
    },
    {
      id: "resolvido",
      name: "Resolvido",
      icon: <CheckCircle className="h-3.5 w-3.5 text-green-500" />,
    },
  ];

  const sortOptions = [
    { id: "date", name: "Data", icon: <Calendar className="h-3.5 w-3.5" /> },
    {
      id: "responses",
      name: "Respostas",
      icon: <MessageCircle className="h-3.5 w-3.5" />,
    },
    {
      id: "bid",
      name: "Valor da Proposta",
      icon: <DollarSign className="h-3.5 w-3.5" />,
    },
    {
      id: "views",
      name: "Visualizações",
      icon: <Eye className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden absolute top-full left-0 right-0 mt-2 z-20"
        >
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#29335C] dark:text-white flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#FF6B00]" /> Filtros Avançados
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Disciplinas */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-[#29335C] dark:text-white flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-[#FF6B00]" /> Disciplinas
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="flex items-center space-x-2 bg-white dark:bg-gray-800/50 p-2 rounded-md border border-gray-100 dark:border-gray-700"
                      >
                        <Checkbox
                          id={`subject-${subject.id}`}
                          checked={filters.subjects.includes(subject.id)}
                          onCheckedChange={() =>
                            handleSubjectToggle(subject.id)
                          }
                          className="data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]"
                        />
                        <Label
                          htmlFor={`subject-${subject.id}`}
                          className="text-sm cursor-pointer flex items-center gap-1"
                        >
                          {subject.icon} {subject.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Níveis */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-[#29335C] dark:text-white flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-[#FF6B00]" /> Nível
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {levels.map((level) => (
                      <div
                        key={level.id}
                        className="flex items-center space-x-2 bg-white dark:bg-gray-800/50 p-2 rounded-md border border-gray-100 dark:border-gray-700"
                      >
                        <Checkbox
                          id={`level-${level.id}`}
                          checked={filters.levels.includes(level.id)}
                          onCheckedChange={() => handleLevelToggle(level.id)}
                          className="data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]"
                        />
                        <Label
                          htmlFor={`level-${level.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {level.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Palavras-chave */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-[#29335C] dark:text-white flex items-center gap-1.5">
                    <Tag className="h-4 w-4 text-[#FF6B00]" /> Palavras-chave
                  </h4>
                  <Input
                    name="keywords"
                    value={filters.keywords}
                    onChange={handleInputChange}
                    placeholder="Ex: equações, derivadas..."
                    className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 bg-white dark:bg-gray-800/50"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Status */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-[#29335C] dark:text-white flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-[#FF6B00]" /> Status
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {statuses.map((status) => (
                      <div
                        key={status.id}
                        className="flex items-center space-x-2 bg-white dark:bg-gray-800/50 p-2 rounded-md border border-gray-100 dark:border-gray-700"
                      >
                        <Checkbox
                          id={`status-${status.id}`}
                          checked={filters.statuses.includes(status.id)}
                          onCheckedChange={() => handleStatusToggle(status.id)}
                          className="data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]"
                        />
                        <Label
                          htmlFor={`status-${status.id}`}
                          className="text-sm cursor-pointer flex items-center gap-1"
                        >
                          {status.icon} {status.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outras opções */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-[#29335C] dark:text-white flex items-center gap-1.5">
                    <Filter className="h-4 w-4 text-[#FF6B00]" /> Outras opções
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800/50 p-2 rounded-md border border-gray-100 dark:border-gray-700">
                      <Checkbox
                        id="isUrgent"
                        checked={filters.isUrgent}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("isUrgent", !!checked)
                        }
                        className="data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]"
                      />
                      <Label
                        htmlFor="isUrgent"
                        className="text-sm cursor-pointer flex items-center gap-1"
                      >
                        <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                        Apenas pedidos urgentes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800/50 p-2 rounded-md border border-gray-100 dark:border-gray-700">
                      <Checkbox
                        id="hasAttachments"
                        checked={filters.hasAttachments}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("hasAttachments", !!checked)
                        }
                        className="data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]"
                      />
                      <Label
                        htmlFor="hasAttachments"
                        className="text-sm cursor-pointer flex items-center gap-1"
                      >
                        <Image className="h-3.5 w-3.5 text-blue-500" /> Com
                        imagens/anexos
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800/50 p-2 rounded-md border border-gray-100 dark:border-gray-700">
                      <Checkbox
                        id="myBids"
                        checked={filters.myBids}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("myBids", !!checked)
                        }
                        className="data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]"
                      />
                      <Label
                        htmlFor="myBids"
                        className="text-sm cursor-pointer flex items-center gap-1"
                      >
                        <DollarSign className="h-3.5 w-3.5 text-[#FF6B00]" />
                        Apenas pedidos com minhas propostas
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800/50 p-2 rounded-md border border-gray-100 dark:border-gray-700">
                      <Checkbox
                        id="withPaidResponses"
                        checked={filters.withPaidResponses}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("withPaidResponses", !!checked)
                        }
                        className="data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]"
                      />
                      <Label
                        htmlFor="withPaidResponses"
                        className="text-sm cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5 text-green-500" /> Com
                        resposta paga
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Valor da Proposta */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-[#29335C] dark:text-white flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-[#FF6B00]" /> Valor da
                    Proposta (Ponto Coins)
                  </h4>
                  <div className="px-2 py-3 bg-white dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-700">
                    <Slider
                      defaultValue={[0, 100]}
                      value={filters.bidRange}
                      max={100}
                      step={5}
                      onValueChange={handleSliderChange}
                      className="[&>span]:bg-[#FF6B00]"
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{filters.bidRange[0]} PC</span>
                      <span>{filters.bidRange[1]} PC</span>
                    </div>
                  </div>
                </div>

                {/* Ordenação */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-[#29335C] dark:text-white flex items-center gap-1.5">
                    {filters.sortOrder === "desc" ? (
                      <SortDesc className="h-4 w-4 text-[#FF6B00]" />
                    ) : (
                      <SortAsc className="h-4 w-4 text-[#FF6B00]" />
                    )}
                    Ordenar por
                  </h4>
                  <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-700">
                    {sortOptions.map((option) => (
                      <Badge
                        key={option.id}
                        variant={
                          filters.sortBy === option.id ? "default" : "outline"
                        }
                        className={`cursor-pointer ${filters.sortBy === option.id ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90" : "border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"}`}
                        onClick={() => handleSortChange(option.id)}
                      >
                        <div className="flex items-center gap-1">
                          {option.icon}
                          {option.name}
                          {filters.sortBy === option.id && (
                            <span>
                              {filters.sortOrder === "desc" ? " ↓" : " ↑"}
                            </span>
                          )}
                        </div>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50 flex justify-between">
            <Button
              variant="ghost"
              onClick={handleClear}
              className="text-[#FF6B00] hover:bg-[#FF6B00]/10"
            >
              Limpar Filtros
            </Button>
            <Button
              onClick={handleApply}
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
            >
              Aplicar Filtros
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
