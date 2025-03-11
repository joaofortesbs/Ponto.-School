import React from "react";
import { useDrop } from "react-dnd";
import TaskCard from "./TaskCard";
import { Task, TaskStatus } from "./TasksView";
import { Plus } from "lucide-react";

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  onTaskClick: (task: Task) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onCompleteTask: (taskId: string, completed: boolean) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  tasks,
  status,
  onTaskClick,
  onMoveTask,
  onCompleteTask,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TASK",
    drop: (item: { id: string }) => {
      onMoveTask(item.id, status);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Definir cores com base no status
  const getColumnColors = () => {
    switch (status) {
      case "a-fazer":
        return {
          header: "bg-blue-500 dark:bg-blue-600",
          body: isOver
            ? "bg-blue-50 dark:bg-blue-900/20"
            : "bg-white dark:bg-[#1E293B]",
          border: isOver
            ? "border-blue-300 dark:border-blue-700"
            : "border-gray-200 dark:border-gray-700",
        };
      case "em-andamento":
        return {
          header: "bg-purple-500 dark:bg-purple-600",
          body: isOver
            ? "bg-purple-50 dark:bg-purple-900/20"
            : "bg-white dark:bg-[#1E293B]",
          border: isOver
            ? "border-purple-300 dark:border-purple-700"
            : "border-gray-200 dark:border-gray-700",
        };
      case "concluido":
        return {
          header: "bg-green-500 dark:bg-green-600",
          body: isOver
            ? "bg-green-50 dark:bg-green-900/20"
            : "bg-white dark:bg-[#1E293B]",
          border: isOver
            ? "border-green-300 dark:border-green-700"
            : "border-gray-200 dark:border-gray-700",
        };
      case "atrasado":
        return {
          header: "bg-red-500 dark:bg-red-600",
          body: isOver
            ? "bg-red-50 dark:bg-red-900/20"
            : "bg-white dark:bg-[#1E293B]",
          border: isOver
            ? "border-red-300 dark:border-red-700"
            : "border-gray-200 dark:border-gray-700",
        };
      default:
        return {
          header: "bg-gray-500 dark:bg-gray-600",
          body: isOver
            ? "bg-gray-50 dark:bg-gray-800"
            : "bg-white dark:bg-[#1E293B]",
          border: isOver
            ? "border-gray-300 dark:border-gray-600"
            : "border-gray-200 dark:border-gray-700",
        };
    }
  };

  const colors = getColumnColors();

  return (
    <div
      ref={drop}
      className={`flex flex-col h-[550px] rounded-xl shadow-md overflow-hidden border ${colors.border} transition-all duration-300 ${isOver ? "scale-[1.02] shadow-lg border-[#FF6B00]/50" : "hover:shadow-lg hover:border-[#FF6B00]/30"} custom-scrollbar`}
      data-status={status}
    >
      <div
        className={`p-3 ${colors.header} text-white flex justify-between items-center`}
      >
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div
        className={`flex-1 p-2 overflow-y-auto ${colors.body} transition-colors duration-200 custom-scrollbar`}
      >
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
                onComplete={(completed) => onCompleteTask(task.id, completed)}
              />
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
              <Plus className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nenhuma tarefa aqui.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Arraste tarefas ou adicione novas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
