
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Trash2, Edit3, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  addTask, 
  getTasksByUserId, 
  updateTask, 
  deleteTask,
  type Task 
} from "@/services/taskService";
import { useAuth } from "@/hooks/useAuth";

const TasksView = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
    category: ""
  });

  // Carregar tarefas
  useEffect(() => {
    const loadTasks = async () => {
      if (user) {
        try {
          const userTasks = await getTasksByUserId(user.id);
          setTasks(userTasks);
        } catch (error) {
          console.error("Erro ao carregar tarefas:", error);
          toast.error("Erro ao carregar tarefas");
        }
      }
    };

    loadTasks();
  }, [user]);

  // Adicionar nova tarefa
  const handleAddTask = async () => {
    if (!newTask.title.trim() || !user) return;

    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: "todo" as const,
        dueDate: newTask.dueDate || undefined,
        category: newTask.category,
        userId: user.id
      };

      const savedTask = await addTask(taskData);
      if (savedTask) {
        setTasks(prev => [...prev, savedTask]);
        setNewTask({
          title: "",
          description: "",
          priority: "medium",
          dueDate: "",
          category: ""
        });
        setIsAddingTask(false);
        toast.success("Tarefa adicionada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      toast.error("Erro ao adicionar tarefa");
    }
  };

  // Atualizar tarefa
  const handleUpdateTask = async (task: Task) => {
    try {
      const updatedTask = await updateTask(task);
      if (updatedTask) {
        setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
        setEditingTask(null);
        toast.success("Tarefa atualizada!");
      }
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      toast.error("Erro ao atualizar tarefa");
    }
  };

  // Excluir tarefa
  const handleDeleteTask = async (taskId: string) => {
    try {
      const success = await deleteTask(taskId);
      if (success) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        toast.success("Tarefa excluída!");
      }
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      toast.error("Erro ao excluir tarefa");
    }
  };

  // Marcar tarefa como concluída
  const handleToggleComplete = async (task: Task) => {
    const updatedTask = {
      ...task,
      status: task.status === "completed" ? "todo" : "completed"
    } as Task;
    
    await handleUpdateTask(updatedTask);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Minhas Tarefas
        </h2>
        <Button 
          onClick={() => setIsAddingTask(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Formulário para adicionar tarefa */}
      {isAddingTask && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Tarefa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Título da tarefa"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Descrição (opcional)"
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
            />
            <div className="grid grid-cols-3 gap-4">
              <Select
                value={newTask.priority}
                onValueChange={(value: "low" | "medium" | "high") => 
                  setNewTask(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
              />
              <Input
                placeholder="Categoria"
                value={newTask.category}
                onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddTask}>Adicionar</Button>
              <Button variant="outline" onClick={() => setIsAddingTask(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de tarefas */}
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className={`${task.status === "completed" ? "opacity-60" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleComplete(task)}
                    className="mt-1"
                  >
                    <CheckCircle2 
                      className={`h-5 w-5 ${
                        task.status === "completed" 
                          ? "text-green-600 fill-current" 
                          : "text-gray-400"
                      }`} 
                    />
                  </Button>
                  
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      task.status === "completed" ? "line-through" : ""
                    }`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                      
                      {task.dueDate && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </Badge>
                      )}
                      
                      {task.category && (
                        <Badge variant="secondary" className="text-xs">
                          {task.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTask(task)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhuma tarefa encontrada
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Adicione sua primeira tarefa para começar a organizar seu dia.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TasksView;
