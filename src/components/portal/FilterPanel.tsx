import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Filter, ChevronDown } from "lucide-react";
import { Turma } from "./TurmaCard";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  mockTurmas?: Turma[];
  onApplyFilters?: (filters: any) => void;
}

const FilterPanel = ({
  isOpen,
  onClose,
  mockTurmas = [],
  onApplyFilters,
}: FilterPanelProps) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({
    tipos: [],
    status: [],
    disciplina: "",
    turma: "",
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleCheckboxChange = (
    field: "tipos" | "status",
    value: string,
    checked: boolean,
  ) => {
    const updatedFilters = { ...activeFilters };
    if (checked) {
      updatedFilters[field] = [...updatedFilters[field], value];
    } else {
      updatedFilters[field] = updatedFilters[field].filter(
        (item: string) => item !== value,
      );
    }
    setActiveFilters(updatedFilters);
  };

  const handleSelectChange = (field: string, value: string) => {
    setActiveFilters({
      ...activeFilters,
      [field]: value,
    });
  };

  const handleApplyFilters = () => {
    // Count active filters
    let count = 0;
    if (activeFilters.disciplina) count++;
    if (activeFilters.turma) count++;
    if (activeFilters.tipos.length > 0) count++;
    if (activeFilters.status.length > 0) count++;

    setActiveFiltersCount(count);
    if (onApplyFilters) {
      onApplyFilters(activeFilters);
    }
    setPopoverOpen(false);
  };

  const handleClearFilters = () => {
    setActiveFilters({
      tipos: [],
      status: [],
      disciplina: "",
      turma: "",
    });
    setActiveFiltersCount(0);
    if (onApplyFilters) {
      onApplyFilters({});
    }
  };

  // If using the popover version
  if (onApplyFilters) {
    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 relative"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-[#FF6B00]">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Filtros</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPopoverOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Disciplina */}
            <div className="space-y-2">
              <Label htmlFor="disciplina">Disciplina</Label>
              <Select
                value={activeFilters.disciplina}
                onValueChange={(value) =>
                  handleSelectChange("disciplina", value)
                }
              >
                <SelectTrigger id="disciplina">
                  <SelectValue placeholder="Selecione uma disciplina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisica">Física</SelectItem>
                  <SelectItem value="matematica">Matemática</SelectItem>
                  <SelectItem value="portugues">Português</SelectItem>
                  <SelectItem value="historia">História</SelectItem>
                  <SelectItem value="quimica">Química</SelectItem>
                  <SelectItem value="biologia">Biologia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Turma */}
            <div className="space-y-2">
              <Label htmlFor="turma">Turma</Label>
              <Select
                value={activeFilters.turma}
                onValueChange={(value) => handleSelectChange("turma", value)}
              >
                <SelectTrigger id="turma">
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisica-avancada">
                    Física Avançada
                  </SelectItem>
                  <SelectItem value="calculo-1">Cálculo I</SelectItem>
                  <SelectItem value="literatura">
                    Literatura Contemporânea
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Material */}
            <div className="space-y-2">
              <Label>Tipo de Material</Label>
              <div className="grid grid-cols-2 gap-2">
                {["video", "pdf", "audio", "link", "exercise", "mindmap"].map(
                  (type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tipo-${type}`}
                        checked={activeFilters.tipos.includes(type)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            "tipos",
                            type,
                            checked as boolean,
                          )
                        }
                      />
                      <Label
                        htmlFor={`tipo-${type}`}
                        className="text-sm cursor-pointer capitalize"
                      >
                        {type}
                      </Label>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="grid grid-cols-2 gap-2">
                {["novo", "recomendado", "lido", "não lido"].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={activeFilters.status.includes(status)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          "status",
                          status,
                          checked as boolean,
                        )
                      }
                    />
                    <Label
                      htmlFor={`status-${status}`}
                      className="text-sm cursor-pointer capitalize"
                    >
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-gray-500"
              >
                Limpar filtros
              </Button>
              <Button
                size="sm"
                onClick={handleApplyFilters}
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
              >
                Aplicar filtros
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Original expandable panel version
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
              <h3 className="text-lg font-semibold text-[#001427] dark:text-white">
                Filtros
              </h3>
              <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-[#001427] dark:text-white mb-2">
                  Tipo de Material
                </h4>
                <div className="space-y-2">
                  {["video", "pdf", "audio", "link", "exercise", "mindmap"].map(
                    (type) => (
                      <div key={type} className="flex items-center">
                        <Checkbox
                          id={`type-${type}`}
                          checked={activeFilters.tipos.includes(type)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(
                              "tipos",
                              type,
                              checked as boolean,
                            )
                          }
                        />
                        <Label
                          htmlFor={`type-${type}`}
                          className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize"
                        >
                          {type}
                        </Label>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#001427] dark:text-white mb-2">
                  Turma
                </h4>
                <div className="space-y-2">
                  {mockTurmas.map((turma) => (
                    <div key={turma.id} className="flex items-center">
                      <Checkbox
                        id={`turma-${turma.id}`}
                        checked={activeFilters.turma === turma.id}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleSelectChange("turma", turma.id);
                          } else {
                            handleSelectChange("turma", "");
                          }
                        }}
                      />
                      <Label
                        htmlFor={`turma-${turma.id}`}
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        {turma.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#001427] dark:text-white mb-2">
                  Status
                </h4>
                <div className="space-y-2">
                  {[
                    "Todos",
                    "Novos",
                    "Recomendados",
                    "Favoritos",
                    "Lidos",
                    "Não lidos",
                  ].map((status) => (
                    <div key={status} className="flex items-center">
                      <Checkbox
                        id={`status-${status}`}
                        checked={activeFilters.status.includes(
                          status.toLowerCase(),
                        )}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            "status",
                            status.toLowerCase(),
                            checked as boolean,
                          )
                        }
                      />
                      <Label
                        htmlFor={`status-${status}`}
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" onClick={handleClearFilters}>
                Limpar Filtros
              </Button>
              <Button
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                onClick={handleApplyFilters}
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilterPanel;
