import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, CheckSquare, Plus, ExternalLink, Settings } from "lucide-react";
import AddTaskModal from "../modals/add-task-modal";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  subject: string;
  completed: boolean;
  priority?: "alta" | "media" | "baixa";
}

const defaultTasks: Task[] = [
  {
    id: "1",
    title: "Entrega de Relatório - Física",
    dueDate: "2024-03-25",
    subject: "Física",
    completed: false,
    priority: "alta",
  },
  {
    id: "2",
    title: "Questionário - Matemática",
    dueDate: "2024-03-26",
    subject: "Matemática",
    completed: false,
    priority: "media",
  },
  {
    id: "3",
    title: "Apresentação - Biologia",
    dueDate: "2024-03-27",
    subject: "Biologia",
    completed: false,
    priority: "baixa",
  },
];

const TarefasPendentes = () => {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"pendente" | "em-andamento" | "concluido">("pendente");

  const handleAddTask = (newTask: any) => {
    // Format the due date for display
    let dueDateDisplay = "";
    if (newTask.dueDate) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dueDate = new Date(newTask.dueDate);

      if (dueDate.toDateString() === today.toDateString()) {
        dueDateDisplay = `hoje, ${newTask.startTime || "23:59"}`;
      } else if (dueDate.toDateString() === tomorrow.toDateString()) {
        dueDateDisplay = `amanhã, ${newTask.startTime || "23:59"}`;
      } else {
        const diffTime = Math.abs(dueDate.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        dueDateDisplay = `em ${diffDays} dias`;
      }
    }

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      dueDate: dueDateDisplay || newTask.dueDate.toISOString().split("T")[0],
      subject: newTask.discipline || "Geral",
      completed: false,
      priority: newTask.priority || "media",
    };

    setTasks([...tasks, task]);
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const priorityColors = {
    alta: "bg-red-500/10 text-red-500 border-red-500/30",
    media: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    baixa: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-4">
        <CheckSquare className="h-8 w-8 text-[#FF6B00]" />
      </div>
      <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-2">
        Sem tarefas pendentes
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-[250px]">
        Adicione novas tarefas para organizar seu fluxo de trabalho.
      </p>
      <Button
        onClick={() => setIsAddTaskModalOpen(true)}
        className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
      >
        <Plus className="h-4 w-4 mr-2" /> Adicionar Tarefa
      </Button>
    </div>
  );

  const MainContent = () => (
    <>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="w-full">
            {/* Título removido do CardHeader */}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[300px] pr-2">
          <div className="space-y-2 pb-4">
            {tasks
              .filter((task) => {
                if (viewMode === "pendente") return !task.completed;
                if (viewMode === "em-andamento") return !task.completed && task.priority === "media";
                if (viewMode === "concluido") return task.completed;
                return true;
              })
              .map((task) => (
                <div
                  key={task.id}
                  className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskCompletion(task.id)}
                      className="mt-1 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <label
                          htmlFor={`task-${task.id}`}
                          className="font-medium text-sm cursor-pointer"
                        >
                          {task.title}
                        </label>
                        {task.priority && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              priorityColors[task.priority as keyof typeof priorityColors]
                            }`}
                          >
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-3">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" /> {task.dueDate}
                        </span>
                        <span className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                          {task.subject}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>

        {/* Ver todas as tarefas */}
        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
            onClick={() => window.location.href = "/agenda?view=tasks"}
          >
            <ExternalLink className="h-4 w-4 mr-2" /> Ver todas as tarefas
          </Button>
        </div>
      </CardContent>
    </>
  );

  return (
    <Card className="h-full overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-md transition-shadow flex flex-col bg-white dark:bg-gradient-to-b dark:from-[#001427] dark:to-[#001a2f] rounded-xl">
      {/* Título dentro do card com o mesmo estilo do TempoEstudo */}
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <div className="bg-white/10 p-1.5 rounded-lg mr-2">
            <CheckSquare className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-white font-semibold text-sm">Tarefas Pendentes</h3>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span 
            className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${viewMode === "pendente" ? "bg-white/20 font-medium" : "hover:bg-white/30"}`}
            onClick={() => setViewMode("pendente")}
          >
            Pendente
          </span>
          <span 
            className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${viewMode === "em-andamento" ? "bg-white/20 font-medium" : "hover:bg-white/30"}`}
            onClick={() => setViewMode("em-andamento")}
          >
            Em Andamento
          </span>
          <span 
            className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${viewMode === "concluido" ? "bg-white/20 font-medium" : "hover:bg-white/30"}`}
            onClick={() => setViewMode("concluido")}
          >
            Concluído
          </span>
          <button className="p-1 rounded-full hover:bg-white/30 transition-colors" onClick={() => setIsAddTaskModalOpen(true)}>
            <Plus className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {tasks.filter((task) => {
        if (viewMode === "pendente") return !task.completed;
        if (viewMode === "em-andamento") return !task.completed && task.priority === "media";
        if (viewMode === "concluido") return task.completed;
        return true;
      }).length === 0 ? (
        <EmptyState />
      ) : (
        <MainContent />
      )}

      <AddTaskModal
        open={isAddTaskModalOpen}
        onOpenChange={setIsAddTaskModalOpen}
        onAddTask={handleAddTask}
      />
    </Card>
  );
};

export default TarefasPendentes;