
import React, { useState, useEffect } from "react";
import { Plus, Filter, Search, Calendar, BarChart3, BookOpen, Clock, List, Kanban } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TaskCard from "./TaskCard";
import TaskColumn from "./TaskColumn";
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
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterDiscipline, setFilterDiscipline] = useState<string>("all");
  const [filterDeadline, setFilterDeadline] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  // Converter tarefas do Supabase para o formato esperado
  const convertToTaskFormat = (supabaseTask: any): Task => ({
    id: supabaseTask.id,
    title: supabaseTask.title,
    description: supabaseTask.description || "",
    discipline: "Geral",
    subject: "Geral",
    dueDate: new Date().toISOString(),
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
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId !== destination.droppableId) {
      // Mover tarefa entre colunas - atualizar status
      const newStatus = destination.droppableId as TaskStatus;
      // Aqui você pode implementar a lógica para atualizar o status no Supabase
      console.log(`Mover tarefa ${draggableId} para ${newStatus}`);
    }
  };

  // Filtrar tarefas
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatusFilter = filterStatus === "all" || 
                               (filterStatus === "pending" && !task.completed) ||
                               (filterStatus === "completed" && task.completed);
    
    return matchesSearch && matchesStatusFilter;
  });

  // Organizar tarefas por status para o Kanban
  const tasksByStatus = {
    "a-fazer": filteredTasks.filter(task => task.status === "a-fazer"),
    "em-andamento": filteredTasks.filter(task => task.status === "em-andamento"),
    "concluido": filteredTasks.filter(task => task.status === "concluido"),
    "atrasado": filteredTasks.filter(task => task.status === "atrasado")
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-testid="tasks-view">
      {/* Header com título */}
      <div className="bg-[#FF6B00] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold">Gerenciamento de Tarefas</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-white hover:bg-white/20">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sugestões IA
          </Button>
          <Button onClick={() => setIsAddTaskModalOpen(true)} className="bg-white text-[#FF6B00] hover:bg-gray-100">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Tarefas
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Status
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Prioridade
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Disciplina
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Clock className="h-4 w-4" />
              Prazo
            </Button>
          </div>
        </div>
      </div>

      {/* Suas Tarefas */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Suas Tarefas</h2>
            <span className="bg-[#FF6B00] text-white text-xs px-2 py-1 rounded-full">
              {filteredTasks.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className="gap-2"
            >
              <Kanban className="h-4 w-4" />
              Kanban
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              Lista
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 p-4">
        {viewMode === "kanban" ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
              <TaskColumn
                title="A Fazer"
                tasks={tasksByStatus["a-fazer"]}
                status="a-fazer"
                onTaskClick={handleTaskClick}
                onMoveTask={() => {}}
                onCompleteTask={handleTaskComplete}
              />
              <TaskColumn
                title="Em Andamento"
                tasks={tasksByStatus["em-andamento"]}
                status="em-andamento"
                onTaskClick={handleTaskClick}
                onMoveTask={() => {}}
                onCompleteTask={handleTaskComplete}
              />
              <TaskColumn
                title="Concluído"
                tasks={tasksByStatus["concluido"]}
                status="concluido"
                onTaskClick={handleTaskClick}
                onMoveTask={() => {}}
                onCompleteTask={handleTaskComplete}
              />
              <TaskColumn
                title="Atrasado"
                tasks={tasksByStatus["atrasado"]}
                status="atrasado"
                onTaskClick={handleTaskClick}
                onMoveTask={() => {}}
                onCompleteTask={handleTaskComplete}
              />
            </div>
          </DragDropContext>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task, index) => (
              <div key={task.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={task.completed}
                    onChange={(e) => handleTaskComplete(task.id, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="font-medium">{task.title}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(task.dueDate).toLocaleDateString()} às {new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-800">Geral</span>
                  <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">{task.priority}</span>
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">{task.status}</span>
                </div>
              </div>
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
        )}
      </div>

      <AddTaskModal
        open={isAddTaskModalOpen}
        onOpenChange={setIsAddTaskModalOpen}
        onAddTask={handleAddTask}
      />
    </div>
  );
};

export default TasksView;
