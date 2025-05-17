import React, { useState } from "react";
import { CheckSquare, X, ChevronDown, ChevronUp, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Task {
  id: string;
  title: string;
  discipline: string;
  dueDate: string;
  progress: number;
  urgent: boolean;
  priority: string;
  completed?: boolean;
}

interface PendingTasksProps {
  tasks?: Task[];
  onTaskComplete?: (taskId: string) => void;
  isNewUser?: boolean;
}

const PendingTasks: React.FC<PendingTasksProps> = ({ tasks = [], onTaskComplete, isNewUser = true }) => {
  const [expandedTasks, setExpandedTasks] = useState<boolean>(true);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // Sort tasks - urgent first, then by progress (asc)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.urgent && !b.urgent) return -1;
    if (!a.urgent && b.urgent) return 1;
    return a.progress - b.progress;
  });

  const toggleTaskExpand = () => {
    setExpandedTasks(!expandedTasks);
  };

  const handleTaskComplete = (taskId: string) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(completedTasks.filter((id) => id !== taskId));
    } else {
      setCompletedTasks([...completedTasks, taskId]);
    }

    // Callback for parent component
    if (onTaskComplete) {
      onTaskComplete(taskId);
    }
  };

  // Get priority color for badges
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "média":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "baixa":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <div className="bg-white dark:bg-[#001427] rounded-xl border border-[#29335C]/10 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center text-[#001427] dark:text-white">
          <CheckSquare className="w-5 h-5 mr-2 text-[#FF6B00]" />
          Tarefas Pendentes
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTaskExpand}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            {expandedTasks ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {expandedTasks && (
        <div className="space-y-4 flex-grow overflow-hidden">
          {sortedTasks.length === 0 || isNewUser ? (
            <div className="text-center py-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-3">
                <CheckSquare className="w-6 h-6 text-[#FF6B00]" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">Nenhuma tarefa pendente</p>
              <p className="text-sm mt-1 text-gray-500 dark:text-gray-400 max-w-xs">
                Adicione tarefas para organizar seus estudos e acompanhar seu progresso
              </p>
              <Button 
                className="mt-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar Tarefa
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100%-2rem)] overflow-y-auto pr-1">
              {sortedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`border border-[#29335C]/10 rounded-lg p-3 transition duration-200 ${
                    completedTasks.includes(task.id)
                      ? "bg-green-50/50 dark:bg-green-900/5 border-green-100 dark:border-green-900/20"
                      : "bg-white dark:bg-[#001427]/60 hover:bg-gray-50 dark:hover:bg-[#001427]/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={completedTasks.includes(task.id)}
                        onCheckedChange={() => handleTaskComplete(task.id)}
                        className="text-[#FF6B00] border-[#29335C]/30 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-grow">
                          <div
                            className={`font-medium text-[#001427] dark:text-white ${
                              completedTasks.includes(task.id) &&
                              "line-through text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {task.title}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="inline-flex items-center mr-3">
                              <span className="inline-block w-3 h-3 rounded-full bg-[#FF6B00] mr-1"></span>
                              {task.discipline}
                            </span>
                            <span>{task.dueDate}</span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getPriorityColor(task.priority)} ml-2 capitalize`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="mb-1">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">
                            Progresso: {task.progress}%
                          </span>
                        </div>
                        <Progress
                          value={task.progress}
                          className="h-1.5 bg-gray-100 dark:bg-gray-800"
                          indicatorClassName={
                            task.progress < 30
                              ? "bg-red-500"
                              : task.progress < 70
                              ? "bg-amber-500"
                              : "bg-green-500"
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!isNewUser && tasks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#29335C]/10">
          <Button
            variant="ghost"
            className="w-full justify-center text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
            onClick={() => {
              // Handle view all
            }}
          >
            Ver Todas <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PendingTasks;