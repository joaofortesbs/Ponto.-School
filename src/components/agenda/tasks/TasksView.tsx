
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, Filter, CheckSquare, AlertCircle, Clock, Calendar, Lightbulb } from "lucide-react";
import AddTaskModal from "../modals/add-task-modal";
import TaskCard from "./TaskCard";
import TaskFilters from "./TaskFilters";
import TaskSearch from "./TaskSearch";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  dueDate?: string;
  category?: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

interface TasksViewProps {
  className?: string;
}

const TasksView = ({ className }: TasksViewProps) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Carregar tarefas do Supabase
  const loadTasks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar tarefas:', error);
        toast.error('Erro ao carregar tarefas');
        return;
      }

      const formattedTasks: Task[] = (data || []).map(task => ({
        id: task.id || '',
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        dueDate: task.due_date || '',
        category: task.category || '',
        userId: task.user_id || '',
        createdAt: task.created_at || new Date().toISOString(),
        updatedAt: task.updated_at || ''
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  // Adicionar nova tarefa
  const handleAddTask = async (newTaskData: any) => {
    if (!user) return;

    try {
      const taskToInsert = {
        title: newTaskData.title || '',
        description: newTaskData.description || '',
        priority: newTaskData.priority || 'medium',
        status: 'todo',
        due_date: newTaskData.dueDate || null,
        category: newTaskData.category || '',
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('user_tasks')
        .insert([taskToInsert])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar tarefa:', error);
        toast.error('Erro ao adicionar tarefa');
        return;
      }

      if (data) {
        const newTask: Task = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          priority: data.priority || 'medium',
          status: data.status || 'todo',
          dueDate: data.due_date || '',
          category: data.category || '',
          userId: data.user_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at || ''
        };

        setTasks(prev => [newTask, ...prev]);
        toast.success('Tarefa adicionada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      toast.error('Erro ao adicionar tarefa');
    }
  };

  // Atualizar tarefa
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user || !taskId) return;

    try {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
      if (updates.category !== undefined) updateData.category = updates.category;

      const { error } = await supabase
        .from('user_tasks')
        .update(updateData)
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar tarefa:', error);
        toast.error('Erro ao atualizar tarefa');
        return;
      }

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
      toast.success('Tarefa atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  // Deletar tarefa
  const handleDeleteTask = async (taskId: string) => {
    if (!user || !taskId) return;

    try {
      const { error } = await supabase
        .from('user_tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar tarefa:', error);
        toast.error('Erro ao deletar tarefa');
        return;
      }

      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Tarefa removida com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      toast.error('Erro ao deletar tarefa');
    }
  };

  // Filtrar tarefas com verificações de segurança
  const filteredTasks = tasks.filter(task => {
    if (!task) return false;
    
    const matchesSearch = (task.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || (task.status || 'todo') === statusFilter;
    const matchesPriority = priorityFilter === "all" || (task.priority || 'medium') === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const todoTasks = filteredTasks.filter(task => task && (task.status || 'todo') === 'todo');
  const inProgressTasks = filteredTasks.filter(task => task && (task.status || 'todo') === 'in-progress');
  const completedTasks = filteredTasks.filter(task => task && (task.status || 'todo') === 'completed');

  if (loading) {
    return (
      <Card className={`w-full h-[600px] ${className}`} data-testid="tasks-view">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-xl font-bold">Gerenciamento de Tarefas</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando tarefas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full h-[600px] ${className}`} data-testid="tasks-view">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <CheckSquare className="h-5 w-5 text-orange-500" />
          <CardTitle className="text-xl font-bold">Gerenciamento de Tarefas</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <Lightbulb className="h-4 w-4 mr-1" />
            Sugestões IA
          </Button>
          <Button
            onClick={() => setIsAddTaskModalOpen(true)}
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Tarefas
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <TaskSearch 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <TaskFilters
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            onStatusFilterChange={setStatusFilter}
            onPriorityFilterChange={setPriorityFilter}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Suas Tarefas
            </span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {filteredTasks.length}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="text-orange-600">
              <Calendar className="h-4 w-4 mr-1" />
              Kanban
            </Button>
            <Button variant="outline" size="sm">
              Lista
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[320px]">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <CheckSquare className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma tarefa encontrada
              </h3>
              <p className="text-gray-500 mb-4">
                Tente ajustar os filtros ou adicione uma nova tarefa para começar a organizar suas atividades.
              </p>
              <Button 
                onClick={() => setIsAddTaskModalOpen(true)}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Tarefas
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="kanban" className="w-full">
              <TabsContent value="kanban" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <h4 className="font-medium text-gray-700">A Fazer</h4>
                      <Badge variant="secondary">{todoTasks.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {todoTasks.map((task) => (
                        task && (
                          <TaskCard 
                            key={task.id} 
                            task={task} 
                            onUpdate={handleUpdateTask}
                            onDelete={handleDeleteTask}
                          />
                        )
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      <h4 className="font-medium text-gray-700">Em Progresso</h4>
                      <Badge variant="secondary">{inProgressTasks.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {inProgressTasks.map((task) => (
                        task && (
                          <TaskCard 
                            key={task.id} 
                            task={task} 
                            onUpdate={handleUpdateTask}
                            onDelete={handleDeleteTask}
                          />
                        )
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckSquare className="h-4 w-4 text-green-500" />
                      <h4 className="font-medium text-gray-700">Concluído</h4>
                      <Badge variant="secondary">{completedTasks.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {completedTasks.map((task) => (
                        task && (
                          <TaskCard 
                            key={task.id} 
                            task={task} 
                            onUpdate={handleUpdateTask}
                            onDelete={handleDeleteTask}
                          />
                        )
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
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

export default TasksView;
