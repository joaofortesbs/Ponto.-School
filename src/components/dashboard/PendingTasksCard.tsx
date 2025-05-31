
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, CheckCircle, Plus } from "lucide-react";
import { useState } from "react";
import AddTaskModal from "../agenda/modals/add-task-modal";
import { useTaskCompletion } from "@/hooks/useTaskCompletion";
import { useAuth } from "@/hooks/useAuth";
import { getTasksByUserId, addTask, markTaskAsCompleted, Task } from "@/services/taskService";

interface PendingTasksCardProps {
  tasks?: Task[];
}

const PendingTasksCard = ({
  tasks: initialTasks = [],
}: PendingTasksCardProps) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar tarefas do usuário do Supabase
  useEffect(() => {
    if (user) {
      loadUserTasks();
    }
  }, [user]);

  const loadUserTasks = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userTasks = await getTasksByUserId(user.id);
      setTasks(userTasks);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (newTaskData: any) => {
    if (!user) return;

    try {
      const task: Omit<Task, "id" | "createdAt"> = {
        title: newTaskData.title,
        description: newTaskData.description || "",
        priority: newTaskData.priority || "medium",
        status: "todo",
        dueDate: newTaskData.dueDate,
        category: newTaskData.discipline || newTaskData.subject || "Geral",
        userId: user.id,
      };

      const savedTask = await addTask(task);
      if (savedTask) {
        setTasks(currentTasks => [...currentTasks, savedTask]);
        console.log("Tarefa adicionada com sucesso:", savedTask);
      }
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
    }
  };

  const handleToggleTaskCompletion = async (taskId: string) => {
    if (!user) return;

    try {
      const success = await markTaskAsCompleted(taskId, user.id);
      if (success) {
        setTasks(currentTasks =>
          currentTasks.map(task =>
            task.id === taskId
              ? { ...task, status: 'completed' as const }
              : task
          )
        );
      }
    } catch (error) {
      console.error("Erro ao marcar tarefa como concluída:", error);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
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
            {isLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Carregando tarefas...
              </div>
            ) : (
              <>
                {tasks
                  .filter((task) => task.status !== "completed")
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start space-x-4 p-3 rounded-lg hover:bg-[#E0E1DD]/10 dark:hover:bg-white/5 transition-all duration-300 hover:translate-x-1 cursor-pointer"
                    >
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.status === "completed"}
                        onCheckedChange={() => handleToggleTaskCompletion(task.id)}
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
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Sem prazo"}
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-xs dark:bg-white/10 dark:text-white/80"
                          >
                            {task.category || "Geral"}
                          </Badge>
                          <div
                            className={`w-2 h-2 ${getPriorityColor(task.priority)} rounded-full`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                {tasks.filter((task) => task.status !== "completed").length === 0 && !isLoading && (
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
              </>
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
