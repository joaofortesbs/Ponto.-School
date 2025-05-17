import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, Clock, Plus } from "lucide-react";

interface Task {
  id: number;
  title: string;
  discipline: string;
  dueDate: string;
  progress: number;
  urgent: boolean;
}

interface PendingTasksProps {
  tasks: Task[];
}

const PendingTasks: React.FC<PendingTasksProps> = ({ tasks }) => {
  return (
    <div className="bg-[#001427] text-white rounded-lg overflow-hidden shadow-md">
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          <h3 className="text-base font-bold text-white">Tarefas Pendentes</h3>
        </div>
        <div className="text-xs text-white/80">
          {tasks.length} tarefas pendentes
        </div>
        <Badge className="bg-white/20 text-white text-xs">{tasks.length}</Badge>
      </div>
      <div className="divide-y divide-[#29335C]/20">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 hover:bg-[#29335C]/10 cursor-pointer transition-colors"
          >
            <div className="flex items-start gap-3">
              <Checkbox id={`task-${task.id}`} className="mt-1" />
              <div className="flex-1">
                <label
                  htmlFor={`task-${task.id}`}
                  className="font-medium text-white text-sm cursor-pointer"
                >
                  {task.title}
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="text-xs border-[#29335C] bg-transparent text-gray-400"
                  >
                    {task.discipline}
                  </Badge>
                  <span
                    className={`flex items-center ${task.urgent ? "text-red-400 font-medium" : "text-gray-400"} text-xs`}
                  >
                    <Clock className="h-3 w-3 mr-1" /> {task.dueDate}
                  </span>
                </div>
                <Progress
                  value={task.progress}
                  className="h-1.5 mt-2 bg-[#29335C]/30"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 text-center border-t border-[#29335C]/20 flex justify-between items-center">
        <Button
          variant="link"
          className="text-gray-400 hover:text-white p-0 h-auto text-sm"
        >
          Ver tarefas concluídas
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF8C40]"
        >
          <Plus className="h-3 w-3 mr-1" /> Adicionar Tarefa
        </Button>
      </div>
    </div>
  );
};

export default PendingTasks;
