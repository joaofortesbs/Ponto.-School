import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TaskColumn from './TaskColumn';
import TaskSearch from './TaskSearch';
import TaskFilters from './TaskFilters';
import { useTaskStore } from '@/services/sharedTaskService';
import { Button } from '@/components/ui/button';
import { Plus, KanbanSquare, List, CheckSquare } from 'lucide-react';
import { useModal } from '@/hooks/useModal';
import AddTaskModal from '../modals/add-task-modal';
import TaskDetailsModal from './TaskDetailsModal';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { taskService } from "@/services/taskService";
import { getCurrentUser } from "@/services/databaseService";

// Modelo básico de uma tarefa
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  tags?: string[];
  category?: string;
  status: 'todo' | 'in-progress' | 'done' | "a-fazer" | "em-andamento" | "concluido" | "atrasado";
  discipline?: string;
  progress?: number;
}

const TasksView = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);

  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);

  // Organizar tarefas por status
  const todoTasks = filteredTasks.filter(task => task.status === 'todo' || task.status === 'a-fazer');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress' || task.status === 'em-andamento');
  const doneTasks = filteredTasks.filter(task => task.status === 'done' || task.status === 'concluido');
  const overdueTasks = filteredTasks.filter(task => task.status === 'atrasado');

  // Efeito para filtrar tarefas baseado nos critérios de busca e filtros
  useEffect(() => {
    let result = [...tasks];

    // Aplicar busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) || 
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Aplicar filtro de prioridade
    if (selectedPriority) {
      result = result.filter(task => task.priority === selectedPriority);
    }

    // Aplicar filtro de tag
    if (selectedTag) {
      result = result.filter(task => task.tags && task.tags.includes(selectedTag));
    }

    setFilteredTasks(result);
  }, [tasks, searchQuery, selectedPriority, selectedTag]);

  // Manipular movimentação de tarefas entre colunas
  const handleMoveTask = (taskId: string, newStatus: 'todo' | 'in-progress' | 'done' | "a-fazer" | "em-andamento" | "concluido" | "atrasado") => {
    updateTask(taskId, { status: newStatus });
  };

  const allTags = Array.from(new Set(
    tasks.flatMap(task => task.tags || [])
  ));

    // Abrir modal de detalhes da tarefa
    const handleTaskClick = (task: Task) => {
      setSelectedTask(task);
      setShowTaskDetails(true);
    };

    const handleCompleteTask = (taskId: string, completed: boolean) => {
      updateTask(taskId, { completed: completed });
    };
  
    const handleUpdateTask = (updatedTask: Task) => {
      updateTask(updatedTask.id, updatedTask);
      toast({
        title: "Tarefa atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    };
  
    const handleDeleteTask = (taskId: string) => {
      useTaskStore.getState().deleteTask(taskId);
      setShowTaskDetails(false);
  
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída permanentemente.",
      });
    };

    const handleAddTask = (newTask: Task) => {
      useTaskStore.getState().addTask(newTask);
    };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tarefas</h2>
        <Button
          onClick={() => setIsAddTaskModalOpen(true)}
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
        >
          <Plus className="mr-1 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[240px]">
          <TaskSearch value={searchQuery} onChange={setSearchQuery} />
        </div>
        {/* <TaskFilters // Removed because it requires more complex integration
          priorities={['high', 'medium', 'low']}
          tags={allTags}
          selectedPriority={selectedPriority}
          selectedTag={selectedTag}
          onPriorityChange={setSelectedPriority}
          onTagChange={setSelectedTag}
        /> */}
      </div>

      <Tabs
          defaultValue="kanban"
          value={viewMode}
          onValueChange={(value) => setViewMode(value as "kanban" | "list")}
          className="w-auto mb-4"
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

      {viewMode === "kanban" ? (
        <DndProvider backend={HTML5Backend}>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
            <TaskColumn
              title="A Fazer"
              tasks={todoTasks}
              status="todo"
              onMoveTask={handleMoveTask}
            />
            <TaskColumn
              title="Em Progresso"
              tasks={inProgressTasks}
              status="in-progress"
              onMoveTask={handleMoveTask}
            />
            <TaskColumn
              title="Concluídas"
              tasks={doneTasks}
              status="done"
              onMoveTask={handleMoveTask}
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
                      checked={task.completed}
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
                        className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900 dark:text-white"}`}
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
                        {task.priority && (
                          <Badge
                            className={`text-xs ${task.priority === "high" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : task.priority === "medium" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"}`}
                          >
                            {task.priority.charAt(0).toUpperCase() +
                              task.priority.slice(1)}
                          </Badge>
                        )}
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
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          {new Date(task.dueDate).toLocaleDateString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )}
                        </span>
                      )}
                      {task.progress && (
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
              </div>
            ))}
          </div>
        </div>
      )}

      {isAddTaskModalOpen && (
        <AddTaskModal 
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          onAddTask={handleAddTask}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          open={showTaskDetails}
          onOpenChange={setShowTaskDetails}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default TasksView;