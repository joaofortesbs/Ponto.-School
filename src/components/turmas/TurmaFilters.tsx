import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Filter,
  Star,
  ChevronDown,
  Check,
  SortAsc,
  SortDesc,
  User,
  BookOpen,
  Heart,
  BarChart,
  X,
} from "lucide-react";

interface Professor {
  id: string;
  nome: string;
}

interface Disciplina {
  id: string;
  nome: string;
}

interface TurmaFiltersProps {
  professores: Professor[];
  disciplinas: Disciplina[];
  onFilterChange: (filters: any) => void;
  favoritos: string[];
}

const TurmaFilters: React.FC<TurmaFiltersProps> = ({
  professores,
  disciplinas,
  onFilterChange,
  favoritos,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedProfessores, setSelectedProfessores] = useState<string[]>([]);
  const [selectedDisciplinas, setSelectedDisciplinas] = useState<string[]>([]);
  const [showFavoritos, setShowFavoritos] = useState(false);
  const [progressoSort, setProgressoSort] = useState<"asc" | "desc" | null>(
    null,
  );
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleProfessorToggle = (professorId: string) => {
    setSelectedProfessores((prev) =>
      prev.includes(professorId)
        ? prev.filter((id) => id !== professorId)
        : [...prev, professorId],
    );
  };

  const handleDisciplinaToggle = (disciplinaId: string) => {
    setSelectedDisciplinas((prev) =>
      prev.includes(disciplinaId)
        ? prev.filter((id) => id !== disciplinaId)
        : [...prev, disciplinaId],
    );
  };

  const handleFavoritosToggle = () => {
    setShowFavoritos(!showFavoritos);
  };

  const handleProgressoSort = () => {
    setProgressoSort((prev) => {
      if (prev === null) return "desc";
      if (prev === "desc") return "asc";
      return null;
    });
  };

  const applyFilters = () => {
    const filters = {
      professores: selectedProfessores,
      disciplinas: selectedDisciplinas,
      favoritos: showFavoritos,
      progressoSort,
    };

    // Update active filters for display
    const newActiveFilters = [];
    if (selectedProfessores.length > 0) {
      newActiveFilters.push("professores");
    }
    if (selectedDisciplinas.length > 0) {
      newActiveFilters.push("disciplinas");
    }
    if (showFavoritos) {
      newActiveFilters.push("favoritos");
    }
    if (progressoSort) {
      newActiveFilters.push("progresso");
    }
    setActiveFilters(newActiveFilters);

    onFilterChange(filters);
    setOpen(false);
  };

  const clearFilters = () => {
    setSelectedProfessores([]);
    setSelectedDisciplinas([]);
    setShowFavoritos(false);
    setProgressoSort(null);
    setActiveFilters([]);
    onFilterChange({});
  };

  const removeFilter = (filter: string) => {
    if (filter === "professores") {
      setSelectedProfessores([]);
    } else if (filter === "disciplinas") {
      setSelectedDisciplinas([]);
    } else if (filter === "favoritos") {
      setShowFavoritos(false);
    } else if (filter === "progresso") {
      setProgressoSort(null);
    }

    setActiveFilters((prev) => prev.filter((f) => f !== filter));

    onFilterChange({
      professores: filter === "professores" ? [] : selectedProfessores,
      disciplinas: filter === "disciplinas" ? [] : selectedDisciplinas,
      favoritos: filter === "favoritos" ? false : showFavoritos,
      progressoSort: filter === "progresso" ? null : progressoSort,
    });
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 flex items-center gap-1"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Filtrar</span>
              <ChevronDown className="h-3.5 w-3.5 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar filtros..." />
              <CommandList>
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                <CommandGroup heading="Professores">
                  {professores.map((professor) => (
                    <CommandItem
                      key={professor.id}
                      onSelect={() => handleProfessorToggle(professor.id)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`flex items-center gap-2 w-full ${selectedProfessores.includes(professor.id) ? "font-medium" : ""}`}
                      >
                        <Checkbox
                          checked={selectedProfessores.includes(professor.id)}
                          onCheckedChange={() =>
                            handleProfessorToggle(professor.id)
                          }
                          className="data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white"
                        />
                        <User className="h-3.5 w-3.5 text-[#FF6B00]" />
                        <span>{professor.nome}</span>
                      </div>
                      {selectedProfessores.includes(professor.id) && (
                        <Check className="h-4 w-4 text-[#FF6B00]" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Disciplinas">
                  {disciplinas.map((disciplina) => (
                    <CommandItem
                      key={disciplina.id}
                      onSelect={() => handleDisciplinaToggle(disciplina.id)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`flex items-center gap-2 w-full ${selectedDisciplinas.includes(disciplina.id) ? "font-medium" : ""}`}
                      >
                        <Checkbox
                          checked={selectedDisciplinas.includes(disciplina.id)}
                          onCheckedChange={() =>
                            handleDisciplinaToggle(disciplina.id)
                          }
                          className="data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white"
                        />
                        <BookOpen className="h-3.5 w-3.5 text-[#FF6B00]" />
                        <span>{disciplina.nome}</span>
                        {favoritos.includes(disciplina.id) && (
                          <Star
                            className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 ml-auto"
                            aria-label="Favorito"
                          />
                        )}
                      </div>
                      {selectedDisciplinas.includes(disciplina.id) && (
                        <Check className="h-4 w-4 text-[#FF6B00]" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Outros Filtros">
                  <CommandItem
                    onSelect={handleFavoritosToggle}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={`flex items-center gap-2 w-full ${showFavoritos ? "font-medium" : ""}`}
                    >
                      <Checkbox
                        checked={showFavoritos}
                        onCheckedChange={handleFavoritosToggle}
                        className="data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white"
                      />
                      <Heart className="h-3.5 w-3.5 text-[#FF6B00]" />
                      <span>Apenas Favoritos</span>
                    </div>
                    {showFavoritos && (
                      <Check className="h-4 w-4 text-[#FF6B00]" />
                    )}
                  </CommandItem>

                  <CommandItem
                    onSelect={handleProgressoSort}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={`flex items-center gap-2 w-full ${progressoSort ? "font-medium" : ""}`}
                    >
                      <Checkbox
                        checked={progressoSort !== null}
                        onCheckedChange={handleProgressoSort}
                        className="data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white"
                      />
                      <BarChart className="h-3.5 w-3.5 text-[#FF6B00]" />
                      <span>
                        Ordenar por Progresso{" "}
                        {progressoSort === "desc"
                          ? "(Maior → Menor)"
                          : progressoSort === "asc"
                            ? "(Menor → Maior)"
                            : ""}
                      </span>
                    </div>
                    {progressoSort && (
                      <div className="flex items-center">
                        {progressoSort === "desc" ? (
                          <SortDesc className="h-4 w-4 text-[#FF6B00]" />
                        ) : (
                          <SortAsc className="h-4 w-4 text-[#FF6B00]" />
                        )}
                      </div>
                    )}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
              <div className="border-t p-2 flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-[#FF6B00] hover:bg-[#FF6B00]/10"
                >
                  Limpar Filtros
                </Button>
                <Button
                  size="sm"
                  onClick={applyFilters}
                  className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                >
                  Aplicar Filtros
                </Button>
              </div>
            </Command>
          </PopoverContent>
        </Popover>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeFilters.map((filter) => (
              <Badge
                key={filter}
                variant="outline"
                className="flex items-center gap-1 bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/30 hover:bg-[#FF6B00]/20 transition-colors py-1 h-8"
              >
                {filter === "professores" && (
                  <>
                    <User className="h-3 w-3" />
                    <span>
                      {selectedProfessores.length}{" "}
                      {selectedProfessores.length === 1
                        ? "Professor"
                        : "Professores"}
                    </span>
                  </>
                )}
                {filter === "disciplinas" && (
                  <>
                    <BookOpen className="h-3 w-3" />
                    <span>
                      {selectedDisciplinas.length}{" "}
                      {selectedDisciplinas.length === 1
                        ? "Disciplina"
                        : "Disciplinas"}
                    </span>
                  </>
                )}
                {filter === "favoritos" && (
                  <>
                    <Heart className="h-3 w-3" />
                    <span>Favoritos</span>
                  </>
                )}
                {filter === "progresso" && (
                  <>
                    <BarChart className="h-3 w-3" />
                    <span>
                      Progresso {progressoSort === "desc" ? "(↓)" : "(↑)"}
                    </span>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1 hover:bg-[#FF6B00]/20 rounded-full"
                  onClick={() => removeFilter(filter)}
                >
                  <X className="h-2.5 w-2.5" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TurmaFilters;
