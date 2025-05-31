
import React, { useState, useEffect } from "react";
import { Plus, Filter, Search } from "lucide-react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TaskCard from "./TaskCard";
import AddTaskModal from "../modals/add-task-modal";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { useAuth } from "@/hooks/useAuth";

export interface Task {
  id: string;
  title: string;
  description?: string;
  discipline?: string;
  subject?: string;
  dueDate: string;
  priority: "alta" | "média" | "baixa";
  status: "a-fazer" | "em-andamento" | "concluido" | "atrasado";
  progress: number;
  type: string;
  professor?: string;
  attachments?: string[];
  subtasks?: { id: string; title: string; completed: boolean }[];
  comments?: { id: string; user: string; text: string; timestamp: string }[];
  createdAt: string;
  updatedAt?: string;
  timeSpent?: number;
  notes?: string;
  isPersonal?: boolean;
  tags?: string[];
  reminderSet?: boolean;
  reminderTime?: string;
  associatedClass?: string;
  completed?: boolean;
}

export type TaskStatus = "a-fazer" | "em-andamento" | "concluido" | "atrasado";

const TasksView: React.FC = () => {
  const { user } = useAuth();
  const { 
    tasks: supabaseTasks, 
    loading, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskCompletion 
  } = useSupabaseTasks();
  
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Converter tarefas do Supabase para o formato esperado pelo TaskCard
  const convertToTaskFormat = (supabaseTask: any): Task => ({
    id: supabaseTask.id,
    title: supabaseTask.title,
    description: supabaseTask.description || "",
    discipline: "Geral",
    subject: "Geral",
    dueDate: supabaseTask.createdAt,
    priority: "média" as const,
    status: supabaseTask.completed ? "concluido" as const : "a-fazer" as const,
    progress: supabaseTask.completed ? 100 : 0,
    type: "tarefa",
    professor: "",
    attachments: [],
    subtasks: [],
    comments: [],
    createdAt: supabaseTask.createdAt,
    updatedAt: supabaseTask.updatedAt,
    timeSpent: 0,
    notes: "",
    isPersonal: true,
    tags: [],
    reminderSet: false,
    reminderTime: "",
    associatedClass: "",
    completed: supabaseTask.completed
  });

  const tasks = supabaseTasks.map(convertToTaskFormat);

  const handleAddTask = async (newTaskData: any) => {
    if (!user) {
      console.error("Usuário não autenticado");
      return;
    }

    try {
      const taskData = {
        title: newTaskData.title || "Nova Tarefa",
        description: newTaskData.description || "",
      };

      const addedTask = await addTask(taskData.title, taskData.description);
      
      if (addedTask) {
        console.log("Tarefa adicionada com sucesso:", addedTask);
      } else {
        console.error("Falha ao adicionar tarefa");
      }
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
    }
  };

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      await toggleTaskCompletion(taskId);
    } catch (error) {
      console.error("Erro ao alterar status da tarefa:", error);
    }
  };

  const handleTaskClick = (taskId: string) => {
    console.log(`Tarefa clicada: ${taskId}`);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    // Aqui você pode implementar a lógica de reordenação se necessário
    console.log("Drag end:", result);
  };

  // Filtrar tarefas
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "pending" && !task.completed) ||
                         (filterStatus === "completed" && task.completed);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col" data-testid="tasks-view">
        {/* Header com controles */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todas</option>
              <option value="pending">Pendentes</option>
              <option value="completed">Concluídas</option>
            </select>
            <Button onClick={() => setIsAddTaskModalOpen(true)} className="bg-[#FF6B00] hover:bg-[#E5590A]">
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
        </div>

        {/* Lista de tarefas */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => handleTaskClick(task.id)}
                onComplete={(completed) => handleTaskComplete(task.id, completed)}
              />
            ))}
            {filteredTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <h3 className="text-lg font-medium mb-2">Nenhuma tarefa encontrada</h3>
                <p className="text-sm">
                  {searchTerm || filterStatus !== "all" 
                    ? "Tente ajustar os filtros ou termo de busca."
                    : "Comece adicionando uma nova tarefa."}
                </p>
              </div>
            )}
          </div>
        </div>

        <AddTaskModal
          open={isAddTaskModalOpen}
          onOpenChange={setIsAddTaskModalOpen}
          onAddTask={handleAddTask}
        />
      </div>
    </DragDropContext>
  );
};

export default TasksView;
