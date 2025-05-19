import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTaskStore } from '@/services/sharedTaskService';
import { ArrowRight, Check, Clock, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  tags?: string[];
}

export default function PendingTasksCard() {
  const tasks = useTaskStore((state) => state.tasks);
  const navigate = useNavigate();
  const updateTask = useTaskStore((state) => state.updateTask);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);

  useEffect(() => {
    const filtered = tasks.filter(task => !task.completed);

    // Ordena por prioridade e data
    const sorted = [...filtered].sort((a, b) => {
      // Primeiro por prioridade (high > medium > low)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

      if (priorityDiff !== 0) return priorityDiff;

      // Depois por data de vencimento, se disponível
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      // Coloca tarefas com data antes das sem data
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      return 0;
    });

    // Limita a 3 tarefas para exibição no card do dashboard
    setPendingTasks(sorted.slice(0, 3));
  }, [tasks]);

  const handleCompleteTask = (taskId: string) => {
    updateTask(taskId, { completed: true });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className="h-full shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Clock className="h-5 w-5 mr-2 text-[#FF6B00]" />
          Tarefas Pendentes
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        {pendingTasks.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400">Sem tarefas pendentes</p>
            <Button 
              variant="link" 
              className="mt-2 text-[#FF6B00]"
              onClick={() => navigate('/agenda?view=tarefas')}
            >
              Adicionar tarefa
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3 w-full">
                  <button 
                    onClick={() => handleCompleteTask(task.id)}
                    className="h-5 w-5 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-[#FF6B00]/10 transition-colors"
                    aria-label="Marcar como concluída"
                  >
                    <Check className="h-3 w-3 text-transparent hover:text-[#FF6B00]" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{task.title}</h4>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <CalendarClock className="h-3 w-3 mr-1" />
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[#FF6B00] hover:bg-[#FF6B00]/10"
              onClick={() => navigate('/agenda?view=tarefas')}
            >
              Ver todas
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}