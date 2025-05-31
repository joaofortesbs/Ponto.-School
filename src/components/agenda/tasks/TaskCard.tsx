import React from "react";
import { useDrag } from "react-dnd";
import { Task } from "./TasksView";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Clock,
  FileText,
  CheckSquare,
  BookOpen,
  Presentation,
  FileEdit,
  AlertCircle,
  Users,
  Beaker,
  Lightbulb,
  Paperclip,
  MessageSquare,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onComplete: (completed: boolean) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onComplete }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TASK",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getTaskTypeIcon = () => {
    switch (task.type.toLowerCase()) {
      case "exercício":
        return <CheckSquare className="h-3.5 w-3.5 text-blue-500" />;
      case "relatório":
        return <FileEdit className="h-3.5 w-3.5 text-amber-500" />;
      case "estudo":
        return <BookOpen className="h-3.5 w-3.5 text-purple-500" />;
      case "apresentação":
        return <Presentation className="h-3.5 w-3.5 text-green-500" />;
      case "leitura":
        return <FileText className="h-3.5 w-3.5 text-teal-500" />;
      case "projeto":
        return <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />;
      case "resumo":
        return <FileText className="h-3.5 w-3.5 text-indigo-500" />;
      case "prova":
        return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
      case "laboratório":
        return <Beaker className="h-3.5 w-3.5 text-pink-500" />;
      default:
        return <CheckSquare className="h-3.5 w-3.5 text-gray-500" />;
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case "alta":
        return "border-l-red-500";
      case "média":
        return "border-l-yellow-500";
      case "baixa":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  const formatDueDate = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday =
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear();

    const isTomorrow =
      dueDate.getDate() === tomorrow.getDate() &&
      dueDate.getMonth() === tomorrow.getMonth() &&
      dueDate.getFullYear() === tomorrow.getFullYear();

    if (isToday) {
      return `Hoje, ${dueDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (isTomorrow) {
      return `Amanhã, ${dueDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return (
        dueDate.toLocaleDateString() +
        ", " +
        dueDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
  };

  const isOverdue = () => {
    try {
      const now = new Date();
      const dueDate = new Date(task.dueDate);
      return dueDate < now && task.status !== "concluido";
    } catch (error) {
      console.error("Error checking if task is overdue:", error);
      return false;
    }
  };

  return (
    <div
      ref={drag}
      className={`bg-white dark:bg-[#29335C]/30 rounded-lg p-3 shadow-sm border-l-4 ${getPriorityColor()} hover:shadow-md transition-all duration-300 cursor-grab ${isDragging ? "opacity-50 scale-95" : "hover:scale-[1.02]"} ${task.status === "concluido" ? "opacity-70" : ""}`}
      onClick={onClick}
      data-task-id={task.id}
      data-task-status={task.status}
    >
      <div className="flex items-start gap-2">
        <Checkbox
          checked={task.status === "concluido"}
          onCheckedChange={(checked) => {
            onComplete(checked as boolean);
          }}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 h-4 w-4 rounded-sm border-gray-300 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4
              className={`text-sm font-medium truncate ${task.status === "concluido" ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}
            >
              {task.title}
            </h4>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
              {getTaskTypeIcon()}
              <span>{task.type}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3 text-[#FF6B00]" />
              <span className={isOverdue() ? "text-red-500 font-medium" : ""}>
                {formatDueDate(task.dueDate)}
              </span>
            </span>
          </div>

          {task.progress > 0 && task.progress < 100 && (
            <div className="mt-2">
              <Progress
                value={task.progress}
                className="h-1.5 bg-gray-100 dark:bg-gray-800"
              />
              <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>{task.progress}%</span>
                {task.subtasks && (
                  <span>
                    {task.subtasks.filter((st) => st.completed).length}/
                    {task.subtasks.length} subtarefas
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {task.discipline}
            </span>

            <div className="flex -space-x-1">
              {task.attachments && task.attachments.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700">
                  <Paperclip className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                </span>
              )}
              {task.comments && task.comments.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700">
                  <MessageSquare className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                </span>
              )}
              {task.reminderSet && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700">
                  <Clock className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
