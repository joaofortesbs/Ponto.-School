import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import TaskColumn from "./TaskColumn";
import TaskFilters from "./TaskFilters";
import TaskSearch from "./TaskSearch";
import TaskDetailsModal from "./TaskDetailsModal";
import AddTaskModal from "../modals/add-task-modal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  KanbanSquare,
  List,
  Calendar as CalendarIcon,
  Clock,
  Brain,
  CheckSquare,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export type TaskPriority = "alta" | "média" | "baixa";
export type TaskStatus = "a-fazer" | "em-andamento" | "concluido" | "atrasado";

export interface Task {
  id: string;
  title: string;
  description?: string;
  discipline: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  type: string;
  professor?: string;
  attachments?: string[];
  subtasks?: { id: string; title: string; completed: boolean }[];
  comments?: { id: string; user: string; text: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
  timeSpent?: number; // em minutos
  notes?: string;
  isPersonal?: boolean;
  tags?: string[];
  reminderSet?: boolean;
  reminderTime?: string;
  associatedClass?: string;
}

interface TasksViewProps {
  onOpenAddTask?: () => void;
  onOpenAISuggestions?: () => void;
}

const TasksView: React.FC<TasksViewProps> = ({
  onOpenAddTask,
  onOpenAISuggestions,
}) => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: [] as TaskStatus[],
    priority: [] as TaskPriority[],
    discipline: [] as string[],
    dueDate: "all",
  });

  // Listen for external task additions
  useEffect(() => {
    const handleExternalTaskAdd = (event: any) => {
      if (event.detail) {
        handleAddTask(event.detail);
      }
    };

    const tasksView = document.querySelector('[data-testid="tasks-view"]');
    if (tasksView) {
      tasksView.addEventListener("refresh-tasks", handleExternalTaskAdd);
    }

    return () => {
      if (tasksView) {
        tasksView.removeEventListener("refresh-tasks", handleExternalTaskAdd);
      }
    };
  }, []);

  // Carregar tarefas de exemplo
  useEffect(() => {
    const sampleTasks: Task[] = [
      {
        id: "1",
        title: "Lista de Exercícios - Funções Trigonométricas",
        description:
          "Resolver os exercícios 1 a 20 do capítulo 3 do livro de Matemática.",
        discipline: "Matemática",
        dueDate: "2023-07-15T18:00:00",
        status: "em-andamento",
        priority: "alta",
        progress: 75,
        type: "exercício",
        professor: "Prof. Carlos Santos",
        attachments: ["lista_exercicios.pdf"],
        subtasks: [
          { id: "1-1", title: "Exercícios 1-5", completed: true },
          { id: "1-2", title: "Exercícios 6-10", completed: true },
          { id: "1-3", title: "Exercícios 11-15", completed: true },
          { id: "1-4", title: "Exercícios 16-20", completed: false },
        ],
        comments: [
          {
            id: "c1",
            user: "Você",
            text: "Preciso revisar os exercícios 16-20 antes da aula de amanhã.",
            timestamp: "2023-07-14T10:30:00",
          },
        ],
        createdAt: "2023-07-10T09:00:00",
        updatedAt: "2023-07-14T10:30:00",
        timeSpent: 120,
        notes: "Revisar conceitos de funções trigonométricas inversas.",
        tags: ["matemática", "trigonometria", "exercícios"],
      },
      {
        id: "2",
        title: "Relatório de Experimento - Titulação",
        description:
          "Escrever relatório sobre o experimento de titulação realizado no laboratório.",
        discipline: "Química",
        dueDate: "2023-07-20T23:59:00",
        status: "a-fazer",
        priority: "média",
        progress: 30,
        type: "relatório",
        professor: "Profa. Ana Martins",
        attachments: ["dados_experimento.xlsx", "template_relatorio.docx"],
        subtasks: [
          { id: "2-1", title: "Introdução", completed: true },
          { id: "2-2", title: "Metodologia", completed: true },
          { id: "2-3", title: "Resultados", completed: false },
          { id: "2-4", title: "Discussão", completed: false },
          { id: "2-5", title: "Conclusão", completed: false },
        ],
        createdAt: "2023-07-12T14:00:00",
        updatedAt: "2023-07-14T16:45:00",
        timeSpent: 90,
        tags: ["química", "laboratório", "relatório"],
        reminderSet: true,
        reminderTime: "2023-07-19T18:00:00",
      },
      {
        id: "3",
        title: "Preparação para Prova - Mecânica Quântica",
        description:
          "Revisar todos os conceitos de Mecânica Quântica para a prova.",
        discipline: "Física",
        dueDate: "2023-07-22T14:00:00",
        status: "a-fazer",
        priority: "alta",
        progress: 10,
        type: "estudo",
        professor: "Prof. Roberto Alves",
        subtasks: [
          { id: "3-1", title: "Equação de Schrödinger", completed: true },
          { id: "3-2", title: "Princípio da Incerteza", completed: false },
          { id: "3-3", title: "Efeito Túnel", completed: false },
          { id: "3-4", title: "Spin e Momento Angular", completed: false },
        ],
        createdAt: "2023-07-15T09:30:00",
        updatedAt: "2023-07-15T09:30:00",
        tags: ["física", "mecânica quântica", "prova"],
        reminderSet: true,
        reminderTime: "2023-07-21T20:00:00",
      },
      {
        id: "4",
        title: "Apresentação - Evolução das Espécies",
        description:
          "Preparar apresentação sobre a Teoria da Evolução de Darwin.",
        discipline: "Biologia",
        dueDate: "2023-07-25T10:00:00",
        status: "em-andamento",
        priority: "média",
        progress: 50,
        type: "apresentação",
        professor: "Prof. Marcos Silva",
        attachments: ["template_slides.pptx"],
        subtasks: [
          { id: "4-1", title: "Pesquisa de Conteúdo", completed: true },
          { id: "4-2", title: "Criação de Slides", completed: true },
          { id: "4-3", title: "Revisão de Conteúdo", completed: false },
          { id: "4-4", title: "Ensaio da Apresentação", completed: false },
        ],
        createdAt: "2023-07-13T11:20:00",
        updatedAt: "2023-07-16T15:10:00",
        timeSpent: 150,
        tags: ["biologia", "evolução", "apresentação"],
      },
      {
        id: "5",
        title: "Leitura - O Príncipe (Maquiavel)",
        description: "Ler os capítulos 1-5 do livro O Príncipe de Maquiavel.",
        discipline: "História",
        dueDate: "2023-07-18T23:59:00",
        status: "atrasado",
        priority: "baixa",
        progress: 20,
        type: "leitura",
        professor: "Profa. Carla Mendes",
        subtasks: [
          { id: "5-1", title: "Capítulo 1", completed: true },
          { id: "5-2", title: "Capítulo 2", completed: false },
          { id: "5-3", title: "Capítulo 3", completed: false },
          { id: "5-4", title: "Capítulo 4", completed: false },
          { id: "5-5", title: "Capítulo 5", completed: false },
        ],
        createdAt: "2023-07-10T16:00:00",
        updatedAt: "2023-07-10T16:00:00",
        tags: ["história", "leitura", "filosofia política"],
      },
      {
        id: "6",
        title: "Projeto Final - Aplicativo de Gestão de Tarefas",
        description:
          "Desenvolver um aplicativo de gestão de tarefas usando React Native.",
        discipline: "Computação",
        dueDate: "2023-08-10T23:59:00",
        status: "em-andamento",
        priority: "alta",
        progress: 40,
        type: "projeto",
        professor: "Prof. André Costa",
        attachments: ["especificacoes_projeto.pdf", "mockups.fig"],
        subtasks: [
          { id: "6-1", title: "Planejamento e Design", completed: true },
          { id: "6-2", title: "Configuração do Ambiente", completed: true },
          { id: "6-3", title: "Implementação do Backend", completed: true },
          { id: "6-4", title: "Implementação do Frontend", completed: false },
          { id: "6-5", title: "Testes e Depuração", completed: false },
          { id: "6-6", title: "Documentação", completed: false },
        ],
        comments: [
          {
            id: "c2",
            user: "Prof. André Costa",
            text: "Lembre-se de incluir autenticação de usuários no aplicativo.",
            timestamp: "2023-07-12T14:30:00",
          },
          {
            id: "c3",
            user: "Você",
            text: "Vou implementar usando Firebase Authentication.",
            timestamp: "2023-07-12T15:45:00",
          },
        ],
        createdAt: "2023-07-01T10:00:00",
        updatedAt: "2023-07-12T15:45:00",
        timeSpent: 720,
        notes: "Considerar adicionar funcionalidade de notificações push.",
        tags: ["computação", "react native", "projeto", "desenvolvimento"],
        reminderSet: true,
        reminderTime: "2023-07-25T18:00:00",
      },
      {
        id: "7",
        title: "Resumo - Metabolismo Celular",
        description:
          "Criar um resumo sobre os processos de metabolismo celular.",
        discipline: "Biologia",
        dueDate: "2023-07-19T23:59:00",
        status: "concluido",
        priority: "média",
        progress: 100,
        type: "resumo",
        professor: "Prof. Marcos Silva",
        attachments: ["resumo_metabolismo.pdf"],
        createdAt: "2023-07-14T09:00:00",
        updatedAt: "2023-07-16T18:30:00",
        timeSpent: 180,
        tags: ["biologia", "metabolismo", "resumo"],
      },
    ];

    setTasks(sampleTasks);
  }, []);

  // Filtrar tarefas com base nos filtros e na busca
  useEffect(() => {
    let result = [...tasks];

    // Aplicar filtro de busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description || "").toLowerCase().includes(query) ||
          task.discipline.toLowerCase().includes(query) ||
          (task.professor || "").toLowerCase().includes(query) ||
          (task.tags || []).some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Aplicar filtros de status
    if (filters.status.length > 0) {
      result = result.filter((task) => filters.status.includes(task.status));
    }

    // Aplicar filtros de prioridade
    if (filters.priority.length > 0) {
      result = result.filter((task) =>
        filters.priority.includes(task.priority),
      );
    }

    // Aplicar filtros de disciplina
    if (filters.discipline.length > 0) {
      result = result.filter((task) =>
        filters.discipline.includes(task.discipline),
      );
    }

    // Aplicar filtro de data de vencimento
    if (filters.dueDate !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      switch (filters.dueDate) {
        case "today":
          result = result.filter((task) => {
            const dueDate = new Date(task.dueDate);
            return (
              dueDate.getDate() === today.getDate() &&
              dueDate.getMonth() === today.getMonth() &&
              dueDate.getFullYear() === today.getFullYear()
            );
          });
          break;
        case "week":
          result = result.filter((task) => {
            const dueDate = new Date(task.dueDate);
            return dueDate >= today && dueDate < nextWeek;
          });
          break;
        case "month":
          result = result.filter((task) => {
            const dueDate = new Date(task.dueDate);
            return dueDate >= today && dueDate < nextMonth;
          });
          break;
      }
    }

    setFilteredTasks(result);
  }, [tasks, searchQuery, filters]);

  // Agrupar tarefas por status
  const tasksByStatus = {
    "a-fazer": filteredTasks.filter((task) => task.status === "a-fazer"),
    "em-andamento": filteredTasks.filter(
      (task) => task.status === "em-andamento",
    ),
    concluido: filteredTasks.filter((task) => task.status === "concluido"),
    atrasado: filteredTasks.filter((task) => task.status === "atrasado"),
  };

  // Abrir modal de detalhes da tarefa
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  // Mover tarefa para outro status
  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task,
    );
    setTasks(updatedTasks);

    // Mostrar toast de confirmação
    toast({
      title: "Tarefa movida",
      description: `A tarefa foi movida para ${newStatus.replace("-", " ")}.`,
    });
  };

  // Marcar tarefa como concluída/não concluída
  const handleCompleteTask = (taskId: string, completed: boolean) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const newStatus = completed ? "concluido" : "a-fazer";
        const progress = completed ? 100 : 0;
        return { ...task, status: newStatus, progress };
      }
      return task;
    });
    setTasks(updatedTasks);

    // Mostrar toast de confirmação
    toast({
      title: completed ? "Tarefa concluída" : "Tarefa reaberta",
      description: completed
        ? "A tarefa foi marcada como concluída."
        : "A tarefa foi marcada como não concluída.",
    });
  };

  // Atualizar tarefa
  const handleUpdateTask = (updatedTask: Task) => {
    const updatedTasks = tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task,
    );
    setTasks(updatedTasks);

    // Mostrar toast de confirmação
    toast({
      title: "Tarefa atualizada",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  // Excluir tarefa
  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    setShowTaskDetails(false);

    // Mostrar toast de confirmação
    toast({
      title: "Tarefa excluída",
      description: "A tarefa foi excluída permanentemente.",
    });
  };

  // Adicionar nova tarefa
  const handleAddTask = (taskData: any) => {
    try {
      console.log("Adding task:", taskData);

      // Validate required fields
      if (!taskData.title) {
        toast({
          title: "Erro ao adicionar tarefa",
          description: "O título da tarefa é obrigatório.",
          variant: "destructive",
        });
        return null;
      }

      // Create a new task with all fields properly handled
      const newTask: Task = {
        id: taskData.id || `task-${Date.now()}`,
        title: taskData.title,
        description: taskData.description || "",
        discipline: taskData.discipline || "Geral",
        dueDate: taskData.dueDate || new Date().toISOString(),
        status: taskData.status || "a-fazer",
        priority: taskData.priority || "média",
        progress: taskData.progress || 0,
        type: taskData.type || "tarefa",
        professor: taskData.professor || "",
        subtasks: taskData.subtasks || [],
        createdAt: taskData.createdAt || new Date().toISOString(),
        updatedAt: taskData.updatedAt || new Date().toISOString(),
        tags: taskData.tags || [],
        reminderSet: taskData.reminderSet || false,
        reminderTime: taskData.reminderTime,
        attachments: taskData.attachments || [],
        timeSpent: taskData.timeSpent || 0,
        notes: taskData.notes || "",
        isPersonal:
          taskData.isPersonal !== undefined ? taskData.isPersonal : true,
        associatedClass: taskData.associatedClass || "",
        comments: [],
      };

      // Add the new task to the beginning of the tasks array immediately
      setTasks((prevTasks) => [newTask, ...prevTasks]);

      // Close the modal
      setShowAddTask(false);

      // Show confirmation toast
      toast({
        title: "Tarefa adicionada",
        description: "A nova tarefa foi adicionada com sucesso.",
      });

      // Check if task is overdue and update status accordingly
      const now = new Date();
      const dueDate = new Date(newTask.dueDate);
      if (dueDate < now && newTask.status === "a-fazer") {
        // Update the task to be marked as overdue
        setTimeout(() => {
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === newTask.id ? { ...task, status: "atrasado" } : task,
            ),
          );
        }, 100);
      }

      return newTask;
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Erro ao adicionar tarefa",
        description: "Ocorreu um erro ao adicionar a tarefa. Tente novamente.",
        variant: "destructive",
      });
      return null;
    }
  };

  return (
    <div
      className="container mx-auto p-4 animate-fadeIn"
      data-testid="tasks-view"
    >
      <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-lg overflow-hidden border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 mb-6">
        <div className="p-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-lg shadow-inner">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold">Gerenciamento de Tarefas</h2>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-lg transition-colors"
                onClick={() => {
                  // Open AI Suggestions Modal
                  if (onOpenAISuggestions) {
                    onOpenAISuggestions();
                  }
                  toast({
                    title: "Sugestões IA",
                    description:
                      "Abrindo sugestões personalizadas do Epictus IA...",
                  });
                }}
              >
                <Brain className="h-4 w-4 mr-1" /> Sugestões IA
              </Button>
              <Button
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]"
                onClick={() => {
                  setShowAddTask(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar Tarefas
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-1/3">
              <TaskSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
            <div className="flex-1 overflow-x-auto">
              <TaskFilters
                filters={filters}
                setFilters={setFilters}
                tasks={tasks}
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Suas Tarefas
              </h3>
              <Badge className="bg-[#FF6B00] text-white">
                {filteredTasks.length}
              </Badge>
            </div>
            <Tabs
              defaultValue="kanban"
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "kanban" | "list")}
              className="w-auto"
            >
              <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 h-9">
                <TabsTrigger
                  value="kanban"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C] data-[state=active]:text-[#FF6B00] px-3 h-7"
                >
                  <KanbanSquare className="h-4 w-4 mr-1" /> Kanban
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C] data-[state=active]:text-[#FF6B00] px-3 h-7"
                >
                  <List className="h-4 w-4 mr-1" /> Lista
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {filteredTasks.length > 0 ? (
            viewMode === "kanban" ? (
              <DndProvider backend={HTML5Backend}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slideInUp overflow-visible">
                  <TaskColumn
                    title="A Fazer"
                    tasks={tasksByStatus["a-fazer"]}
                    status="a-fazer"
                    onTaskClick={handleTaskClick}
                    onMoveTask={handleMoveTask}
                    onCompleteTask={handleCompleteTask}
                  />
                  <TaskColumn
                    title="Em Andamento"
                    tasks={tasksByStatus["em-andamento"]}
                    status="em-andamento"
                    onTaskClick={handleTaskClick}
                    onMoveTask={handleMoveTask}
                    onCompleteTask={handleCompleteTask}
                  />
                  <TaskColumn
                    title="Concluído"
                    tasks={tasksByStatus.concluido}
                    status="concluido"
                    onTaskClick={handleTaskClick}
                    onMoveTask={handleMoveTask}
                    onCompleteTask={handleCompleteTask}
                  />
                  <TaskColumn
                    title="Atrasado"
                    tasks={tasksByStatus.atrasado}
                    status="atrasado"
                    onTaskClick={handleTaskClick}
                    onMoveTask={handleMoveTask}
                    onCompleteTask={handleCompleteTask}
                  />
                </div>
              </DndProvider>
            ) : (
              <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Lista de tarefas */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5">
                          <Checkbox
                            checked={task.status === "concluido"}
                            onCheckedChange={(checked) =>
                              handleCompleteTask(task.id, checked as boolean)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="h-5 w-5 rounded-sm border-gray-300 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h4
                              className={`font-medium ${task.status === "concluido" ? "line-through text-gray-500" : "text-gray-900 dark:text-white"}`}
                            >
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-xs border-[#FF6B00]/30 bg-transparent text-[#FF6B00]"
                              >
                                {task.discipline}
                              </Badge>
                              <Badge
                                className={`text-xs ${task.priority === "alta" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : task.priority === "média" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"}`}
                              >
                                {task.priority.charAt(0).toUpperCase() +
                                  task.priority.slice(1)}
                              </Badge>
                              <Badge
                                className={`text-xs ${task.status === "a-fazer" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : task.status === "em-andamento" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" : task.status === "concluido" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}
                              >
                                {task.status === "a-fazer"
                                  ? "A Fazer"
                                  : task.status === "em-andamento"
                                    ? "Em Andamento"
                                    : task.status === "concluido"
                                      ? "Concluído"
                                      : "Atrasado"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-[#FF6B00]" />
                              {new Date(task.dueDate).toLocaleDateString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                },
                              )}{" "}
                              às{" "}
                              {new Date(task.dueDate).toLocaleTimeString(
                                "pt-BR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                            {task.subtasks && task.subtasks.length > 0 && (
                              <span className="flex items-center gap-1">
                                <CheckSquare className="h-3.5 w-3.5 text-[#FF6B00]" />
                                {
                                  task.subtasks.filter((st) => st.completed)
                                    .length
                                }
                                /{task.subtasks.length}
                              </span>
                            )}
                          </div>
                          {task.progress > 0 && (
                            <div className="mt-2">
                              <Progress
                                value={task.progress}
                                className="h-1.5 bg-gray-100 dark:bg-gray-800"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-8 animate-fadeIn">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <CheckSquare className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma tarefa encontrada
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
                Tente ajustar os filtros ou adicione uma nova tarefa para
                começar a organizar suas atividades.
              </p>
              <Button
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                onClick={() => {
                  setShowAddTask(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar Tarefas
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes da Tarefa */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          open={showTaskDetails}
          onOpenChange={setShowTaskDetails}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {/* Modal de Adicionar Tarefa */}
      <AddTaskModal
        open={showAddTask}
        onOpenChange={(open) => setShowAddTask(open)}
        onAddTask={handleAddTask}
      />
    </div>
  );
};

export default TasksView;
