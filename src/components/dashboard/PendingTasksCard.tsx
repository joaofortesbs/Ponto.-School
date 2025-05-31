
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Plus } from "lucide-react";
import AddTaskModal from "../agenda/modals/add-task-modal";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";

const PendingTasksCard = () => {
  const { user } = useAuth();
  const { tasks, loading, addTask, toggleTaskCompletion } = useSupabaseTasks();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const handleAddTask = async (newTask: any) => {
    if (!user) {
      console.error("Usuário não autenticado");
      return;
    }

    try {
      const taskData = {
        title: newTask.title || "Nova Tarefa",
        description: newTask.description || "",
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

  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleTaskCompletion(taskId);
    } catch (error) {
      console.error("Erro ao alterar status da tarefa:", error);
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

  // Filtrar apenas tarefas não concluídas
  const pendingTasks = tasks.filter(task => !task.completed);

  if (loading) {
    return (
      <Card className="w-full h-[520px] bg-white dark:bg-[#001427]/20 border-brand-border dark:border-white/10">
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
                Carregando tarefas...
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start space-x-4 p-3 rounded-lg hover:bg-[#E0E1DD]/10 dark:hover:bg-white/5 transition-all duration-300 hover:translate-x-1 cursor-pointer"
              >
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => handleToggleTask(task.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor={`task-${task.id}`}
                    className="text-sm font-medium text-[#001427] dark:text-white leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {task.title}
                  </label>
                  {task.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center text-sm text-[#64748B] dark:text-white/60">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs dark:bg-white/10 dark:text-white/80"
                    >
                      Tarefa
                    </Badge>
                    <div className={`w-2 h-2 ${getPriorityColor("media")} rounded-full`}></div>
                  </div>
                </div>
              </div>
            ))}
            {pendingTasks.length === 0 && (
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
