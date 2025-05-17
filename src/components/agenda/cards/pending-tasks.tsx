import React from "react";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, ClipboardList } from "lucide-react";

interface Task {
  id: number;
  title: string;
  discipline: string;
  dueDate: string;
  progress: number;
  urgent: boolean;
}

interface PendingTasksProps {
  tasks?: Task[];
}

const PendingTasks: React.FC<PendingTasksProps> = ({ tasks = [] }) => {
  const hasTasks = tasks.length > 0;

  return (
    <div className="bg-[#001427] text-white rounded-lg overflow-hidden shadow-md">
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          <h3 className="text-base font-bold text-white">Tarefas Pendentes</h3>
        </div>
      </div>

      {!hasTasks ? (
        <div className="py-12 px-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#29335C]/30 flex items-center justify-center mb-4">
            <ClipboardList className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-white font-medium text-lg mb-2">Não há tarefas pendentes</h4>
          <p className="text-gray-400 text-sm text-center mb-6 max-w-[90%]">
            Comece adicionando suas primeiras tarefas para organizar seus estudos e atividades.
          </p>
          <Button
            variant="outline"
            className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF8C40]"
          >
            <Plus className="h-4 w-4 mr-1" /> Criar Primeira Tarefa
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-[#29335C]/20">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 hover:bg-[#29335C]/10 cursor-pointer transition-colors"
            >
              {/* Conteúdo da tarefa */}
            </div>
          ))}
        </div>
      )}

      {hasTasks && (
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
      )}
    </div>
  );
};

export default PendingTasks;
