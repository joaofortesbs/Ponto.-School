import React, { useState, useEffect } from "react";
import { Task, TaskStatus, TaskPriority } from "./TasksView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter, X, Calendar, Flag, BookOpen, User } from "lucide-react";

interface TaskFiltersProps {
  filters: {
    status: TaskStatus[];
    priority: TaskPriority[];
    discipline: string[];
    dueDate: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      status: TaskStatus[];
      priority: TaskPriority[];
      discipline: string[];
      dueDate: string;
    }>
  >;
  tasks: Task[];
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  setFilters,
  tasks,
}) => {
  const [disciplines, setDisciplines] = useState<string[]>([]);

  // Extrair disciplinas únicas dos dados de tarefas
  useEffect(() => {
    const uniqueDisciplines = Array.from(
      new Set(tasks.map((task) => task.discipline)),
    );
    setDisciplines(uniqueDisciplines);
  }, [tasks]);

  const handleStatusChange = (status: TaskStatus) => {
    setFilters((prev) => {
      if (prev.status.includes(status)) {
        return {
          ...prev,
          status: prev.status.filter((s) => s !== status),
        };
      } else {
        return {
          ...prev,
          status: [...prev.status, status],
        };
      }
    });
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    setFilters((prev) => {
      if (prev.priority.includes(priority)) {
        return {
          ...prev,
          priority: prev.priority.filter((p) => p !== priority),
        };
      } else {
        return {
          ...prev,
          priority: [...prev.priority, priority],
        };
      }
    });
  };

  const handleDisciplineChange = (discipline: string) => {
    setFilters((prev) => {
      if (prev.discipline.includes(discipline)) {
        return {
          ...prev,
          discipline: prev.discipline.filter((d) => d !== discipline),
        };
      } else {
        return {
          ...prev,
          discipline: [...prev.discipline, discipline],
        };
      }
    });
  };

  const handleDueDateChange = (dueDate: string) => {
    setFilters((prev) => ({
      ...prev,
      dueDate,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      discipline: [],
      dueDate: "all",
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.status.length > 0 ||
      filters.priority.length > 0 ||
      filters.discipline.length > 0 ||
      filters.dueDate !== "all"
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.discipline.length > 0) count++;
    if (filters.dueDate !== "all") count++;
    return count;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Filtro de Status */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`h-9 gap-1 ${filters.status.length > 0 ? "border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00]" : ""}`}
          >
            <Filter className="h-4 w-4" />
            Status
            {filters.status.length > 0 && (
              <Badge className="ml-1 bg-[#FF6B00] text-white h-5 min-w-5 flex items-center justify-center p-0 text-xs">
                {filters.status.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Status</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-a-fazer"
                  checked={filters.status.includes("a-fazer")}
                  onCheckedChange={() => handleStatusChange("a-fazer")}
                />
                <Label htmlFor="status-a-fazer" className="text-sm">
                  A Fazer
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-em-andamento"
                  checked={filters.status.includes("em-andamento")}
                  onCheckedChange={() => handleStatusChange("em-andamento")}
                />
                <Label htmlFor="status-em-andamento" className="text-sm">
                  Em Andamento
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-concluido"
                  checked={filters.status.includes("concluido")}
                  onCheckedChange={() => handleStatusChange("concluido")}
                />
                <Label htmlFor="status-concluido" className="text-sm">
                  Concluído
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-atrasado"
                  checked={filters.status.includes("atrasado")}
                  onCheckedChange={() => handleStatusChange("atrasado")}
                />
                <Label htmlFor="status-atrasado" className="text-sm">
                  Atrasado
                </Label>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Filtro de Prioridade */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`h-9 gap-1 ${filters.priority.length > 0 ? "border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00]" : ""}`}
          >
            <Flag className="h-4 w-4" />
            Prioridade
            {filters.priority.length > 0 && (
              <Badge className="ml-1 bg-[#FF6B00] text-white h-5 min-w-5 flex items-center justify-center p-0 text-xs">
                {filters.priority.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Prioridade</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="priority-alta"
                  checked={filters.priority.includes("alta")}
                  onCheckedChange={() => handlePriorityChange("alta")}
                />
                <Label htmlFor="priority-alta" className="text-sm">
                  Alta
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="priority-media"
                  checked={filters.priority.includes("média")}
                  onCheckedChange={() => handlePriorityChange("média")}
                />
                <Label htmlFor="priority-media" className="text-sm">
                  Média
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="priority-baixa"
                  checked={filters.priority.includes("baixa")}
                  onCheckedChange={() => handlePriorityChange("baixa")}
                />
                <Label htmlFor="priority-baixa" className="text-sm">
                  Baixa
                </Label>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Filtro de Disciplina */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`h-9 gap-1 ${filters.discipline.length > 0 ? "border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00]" : ""}`}
          >
            <BookOpen className="h-4 w-4" />
            Disciplina
            {filters.discipline.length > 0 && (
              <Badge className="ml-1 bg-[#FF6B00] text-white h-5 min-w-5 flex items-center justify-center p-0 text-xs">
                {filters.discipline.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Disciplina</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {disciplines.map((discipline) => (
                <div key={discipline} className="flex items-center space-x-2">
                  <Checkbox
                    id={`discipline-${discipline}`}
                    checked={filters.discipline.includes(discipline)}
                    onCheckedChange={() => handleDisciplineChange(discipline)}
                  />
                  <Label
                    htmlFor={`discipline-${discipline}`}
                    className="text-sm"
                  >
                    {discipline}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Filtro de Data de Vencimento */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`h-9 gap-1 ${filters.dueDate !== "all" ? "border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00]" : ""}`}
          >
            <Calendar className="h-4 w-4" />
            Prazo
            {filters.dueDate !== "all" && (
              <Badge className="ml-1 bg-[#FF6B00] text-white h-5 min-w-5 flex items-center justify-center p-0 text-xs">
                1
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Prazo</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="due-all"
                  checked={filters.dueDate === "all"}
                  onCheckedChange={() => handleDueDateChange("all")}
                />
                <Label htmlFor="due-all" className="text-sm">
                  Todos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="due-today"
                  checked={filters.dueDate === "today"}
                  onCheckedChange={() => handleDueDateChange("today")}
                />
                <Label htmlFor="due-today" className="text-sm">
                  Hoje
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="due-week"
                  checked={filters.dueDate === "week"}
                  onCheckedChange={() => handleDueDateChange("week")}
                />
                <Label htmlFor="due-week" className="text-sm">
                  Esta Semana
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="due-month"
                  checked={filters.dueDate === "month"}
                  onCheckedChange={() => handleDueDateChange("month")}
                />
                <Label htmlFor="due-month" className="text-sm">
                  Este Mês
                </Label>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Botão para limpar filtros */}
      {hasActiveFilters() && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          onClick={clearFilters}
        >
          <X className="h-4 w-4 mr-1" />
          Limpar Filtros ({getActiveFiltersCount()})
        </Button>
      )}
    </div>
  );
};

export default TaskFilters;
