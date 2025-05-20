import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, CheckCircle, Plus } from "lucide-react";
import { useState } from "react";
import AddTaskModal from "../agenda/modals/add-task-modal";
import { useTaskCompletion } from "@/hooks/useTaskCompletion";
import { taskService } from "@/services/taskService";
import { useAuth } from "@/hooks/useAuth";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  subject?: string;
  discipline?: string;
  completed?: boolean;
  status?: "a-fazer" | "em-andamento" | "concluido" | "atrasado";
  priority?: "alta" | "média" | "baixa";
  description?: string;
  progress?: number;
  type?: string;
  professor?: string;
  attachments?: string[];
  subtasks?: { id: string; title: string; completed: boolean }[];
  comments?: { id: string; user: string; text: string; timestamp: string }[];
  createdAt?: string;
  updatedAt?: string;
  timeSpent?: number;
  notes?: string;
  isPersonal?: boolean;
  tags?: string[];
  reminderSet?: boolean;
  reminderTime?: string;
  associatedClass?: string;
}

interface PendingTasksCardProps {
  tasks?: Task[];
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
  {
    id: "4",
    title: "Prova Final - Química",
    dueDate: "2024-03-28",
    subject: "Química",
    completed: false,
    priority: "media",
  },
];

const PendingTasksCard = ({
  tasks: initialTasks = defaultTasks,
}: PendingTasksCardProps) => {
  const { user } = useAuth();
  const { tasks, setTasks, toggleTaskCompletion } = useTaskCompletion<Task>(
    initialTasks,
    {
      onCompleteTask: (taskId) => {
        console.log(`Tarefa ${taskId} marcada como concluída`);
      },
      onUncompleteTask: (taskId) => {
        console.log(`Tarefa ${taskId} desmarcada como concluída`);
      },
    }
  );
  
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // Carrega as tarefas do serviço quando o componente é montado
  useEffect(() => {
    if (user) {
      console.log("PendingTasksCard: Inicializando com usuário", user.id);
      
      const loadTasks = async () => {
        try {
          console.log("PendingTasksCard: Carregando tarefas do usuário", user.id);
          const userTasks = await taskService.loadTasks(user.id);
          if (userTasks && userTasks.length > 0) {
            console.log("PendingTasksCard: Tarefas carregadas com sucesso", userTasks.length);
            setTasks(userTasks);
          } else {
            console.log("PendingTasksCard: Nenhuma tarefa encontrada para o usuário");
          }
        } catch (error) {
          console.error("PendingTasksCard: Erro ao carregar tarefas:", error);
        }
      };
      
      // Carregar tarefas inicialmente
      loadTasks();
      
      // Configurar listener para atualizações de tarefas
      const unsubscribeFromTasksUpdated = taskService.onTasksUpdated((userId) => {
        console.log("PendingTasksCard: Evento onTasksUpdated recebido para usuário", userId);
        if (userId === user.id) {
          loadTasks();
        }
      });
      
      // Configurar listener para adição de tarefas
      const unsubscribeFromTaskAdded = taskService.onTaskAdded((newTask) => {
        console.log("PendingTasksCard: Evento onTaskAdded recebido", newTask);
        if (newTask) {
          setTasks(currentTasks => {
            // Verificar se a tarefa já existe para evitar duplicação
            const taskExists = currentTasks.some(task => task.id === newTask.id);
            if (taskExists) {
              console.log("PendingTasksCard: Tarefa já existe, ignorando duplicação", newTask.id);
              return currentTasks;
            }
            console.log("PendingTasksCard: Adicionando nova tarefa", newTask.title);
            return [...currentTasks, newTask];
          });
        }
      });
      
      // Função para manipular evento de tarefa adicionada via DOM
      const handleTaskAddedDOMEvent = (event: any) => {
        if (event.detail) {
          console.log("PendingTasksCard: Evento refresh-tasks recebido via DOM", event.detail);
          setTasks(currentTasks => {
            const newTask = event.detail;
            // Verificar se a tarefa já existe para evitar duplicação
            const taskExists = currentTasks.some(task => task.id === newTask.id);
            if (taskExists) {
              console.log("PendingTasksCard: Tarefa já existe (evento DOM), ignorando", newTask.id);
              return currentTasks;
            }
            console.log("PendingTasksCard: Adicionando nova tarefa via evento DOM", newTask.title);
            return [...currentTasks, newTask];
          });
        }
      };
      
      // Escutar evento DOM específico para o PendingTasksCard
      const handlePendingTasksUpdated = (event: any) => {
        if (event.detail) {
          console.log("PendingTasksCard: Evento pending-tasks-updated recebido", event.detail);
          setTasks(currentTasks => {
            const newTask = event.detail;
            // Verificar se a tarefa já existe para evitar duplicação
            const taskExists = currentTasks.some(task => task.id === newTask.id);
            if (taskExists) {
              console.log("PendingTasksCard: Tarefa já existe (evento específico), ignorando", newTask.id);
              return currentTasks;
            }
            console.log("PendingTasksCard: Adicionando nova tarefa via evento específico", newTask.title);
            return [...currentTasks, newTask];
          });
        }
      };
      
      // Registrar elemento atual para receber eventos diretamente
      const cardElement = document.querySelector('[data-testid="pending-tasks-card"]');
      if (cardElement) {
        console.log("PendingTasksCard: Elemento encontrado para eventos diretos");
        cardElement.addEventListener('refresh-tasks', handleTaskAddedDOMEvent);
      } else {
        console.log("PendingTasksCard: Elemento não encontrado para eventos diretos");
      }
      
      // Registrar eventos globais
      document.addEventListener('refresh-tasks', handleTaskAddedDOMEvent);
      document.addEventListener('pending-tasks-updated', handlePendingTasksUpdated);
      
      // Registrar evento para forçar atualização do componente
      const forceRefreshTasks = () => {
        console.log("PendingTasksCard: Forçando atualização de tarefas");
        loadTasks();
      };
      
      // Evento para forçar atualização a cada 30 segundos (como backup)
      const refreshInterval = setInterval(forceRefreshTasks, 30000);
      
      return () => {
        unsubscribeFromTasksUpdated();
        unsubscribeFromTaskAdded();
        document.removeEventListener('refresh-tasks', handleTaskAddedDOMEvent);
        document.removeEventListener('pending-tasks-updated', handlePendingTasksUpdated);
        if (cardElement) {
          cardElement.removeEventListener('refresh-tasks', handleTaskAddedDOMEvent);
        }
        clearInterval(refreshInterval);
        console.log("PendingTasksCard: Limpeza de listeners concluída");
      };
    }
  }, [user, setTasks]);

  // Salva as tarefas quando são atualizadas
  useEffect(() => {
    if (user && tasks !== initialTasks) {
      taskService.saveTasks(user.id, tasks)
        .catch(err => console.error("Erro ao salvar tarefas:", err));
    }
  }, [tasks, user]);

  const handleAddTask = (newTask: any) => {
    try {
      // Verificar se a tarefa já existe pelo ID
      if (newTask.id && tasks.some(task => task.id === newTask.id)) {
        console.log("Tarefa já existe, ignorando duplicação:", newTask.id);
        return;
      }
      
      console.log("Adicionando tarefa no PendingTasksCard:", newTask);
      
      // Format the due date for display
      let dueDateDisplay = "";
      let originalDueDate = newTask.dueDate;
      
      if (newTask.dueDate) {
        try {
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
        } catch (error) {
          console.error("Erro ao formatar data de vencimento:", error);
          dueDateDisplay = String(newTask.dueDate);
        }
      }

      // Criando uma tarefa compatível com ambos os componentes
      const task: Task = {
        id: newTask.id || `task-${Date.now()}`,
        title: newTask.title,
        description: newTask.description || "",
        dueDate: originalDueDate, // Manter a data original para compatibilidade
        subject: newTask.discipline || newTask.subject || "Geral",
        discipline: newTask.discipline || newTask.subject || "Geral",
        completed: newTask.completed || false,
        status: newTask.status || "a-fazer",
        priority: newTask.priority || "média",
        progress: newTask.progress || 0,
        type: newTask.type || "tarefa",
        professor: newTask.professor || "",
        attachments: newTask.attachments || [],
        subtasks: newTask.subtasks || [],
        createdAt: newTask.createdAt || new Date().toISOString(),
        updatedAt: newTask.updatedAt || new Date().toISOString(),
        timeSpent: newTask.timeSpent || 0,
        notes: newTask.notes || "",
        isPersonal: newTask.isPersonal !== undefined ? newTask.isPersonal : true,
        tags: newTask.tags || [],
        reminderSet: newTask.reminderSet || false,
        reminderTime: newTask.reminderTime,
        associatedClass: newTask.associatedClass || "",
      };

      // Adicionar a nova tarefa sem duplicar
      setTasks(currentTasks => {
        const updatedTasks = [...currentTasks, task];
        
        // Se o usuário estiver autenticado, salva as tarefas
        if (user) {
          taskService.saveTasks(user.id, updatedTasks)
            .catch(err => console.error("Erro ao salvar nova tarefa:", err));
        }
        
        return updatedTasks;
      });
      
      console.log("Tarefa adicionada com sucesso no PendingTasksCard");
    } catch (error) {
      console.error("Erro ao adicionar tarefa no PendingTasksCard:", error);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "alta":
        return "bg-red-500";
      case "media":
        return "bg-yellow-500";
      case "baixa":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="w-full h-[520px] bg-white dark:bg-[#001427]/20 border-brand-border dark:border-white/10" data-testid="pending-tasks-card">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#E0E1DD]/20">
            <CheckCircle className="h-5 w-5 text-[#001427] dark:text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-[#001427] dark:text-white">
              Tarefas Pendentes
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Organize suas atividades
            </p>
          </div>
        </div>
        <button
          className="p-2 rounded-full hover:bg-[#E0E1DD]/20 transition-colors"
          onClick={() => setIsAddTaskModalOpen(true)}
        >
          <Plus className="h-5 w-5 text-[#001427] dark:text-white" />
        </button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[420px] w-full pr-4">
          <div className="space-y-4 p-4">
            {tasks
              .filter((task) => !task.completed && (!task.status || task.status !== "concluido"))
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-start space-x-4 p-3 rounded-lg hover:bg-[#E0E1DD]/10 dark:hover:bg-white/5 transition-all duration-300 hover:translate-x-1 cursor-pointer"
                >
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed || task.status === "concluido"}
                    onCheckedChange={() => toggleTaskCompletion(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`task-${task.id}`}
                      className="text-sm font-medium text-[#001427] dark:text-white leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {task.title}
                    </label>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-sm text-[#64748B] dark:text-white/60">
                        <Clock className="h-4 w-4 mr-1" />
                        {typeof task.dueDate === "string" &&
                        task.dueDate.includes("-")
                          ? new Date(task.dueDate).toLocaleDateString()
                          : task.dueDate}
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs dark:bg-white/10 dark:text-white/80"
                      >
                        {task.discipline || task.subject || "Geral"}
                      </Badge>
                      <div
                        className={`w-2 h-2 ${getPriorityColor(task.priority)} rounded-full`}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            {tasks.filter((task) => !task.completed && (!task.status || task.status !== "concluido")).length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nenhuma tarefa pendente
                </h4>
                <p className="text-sm max-w-[250px] mx-auto">
                  Você não tem tarefas pendentes. Adicione uma nova tarefa.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <AddTaskModal
        open={isAddTaskModalOpen}
        onOpenChange={setIsAddTaskModalOpen}
        onAddTask={handleAddTask}
      />
    </Card>
  );
};

export default PendingTasksCard;
