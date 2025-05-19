import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskStore } from '@/services/sharedTaskService';
import { Check, Timer, CalendarClock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  tags?: string[];
  category?: string;
}

export default function TarefasPendentes() {
  const tasks = useTaskStore((state) => state.tasks);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Filtra apenas tarefas pendentes (não completadas)
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

    // Limita a 5 tarefas para exibição
    setPendingTasks(sorted.slice(0, 5));
  }, [tasks]);

  // Função para formatação de data
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  };

  // Função para obter classe CSS baseada na prioridade
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <Card className="h-full shadow-sm border border-[#E0E1DD] dark:border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center text-[#29335C] dark:text-white">
          <Timer className="h-4 w-4 mr-2 text-[#FF6B00]" />
          Tarefas Pendentes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {pendingTasks.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
            <p>Sem tarefas pendentes</p>
            <p className="mt-1 text-xs">Adicione tarefas na sua agenda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-start justify-between p-2 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start space-x-2 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    <button 
                      className="h-5 w-5 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label="Marcar como concluída"
                    >
                      <Check className="h-3 w-3 text-transparent hover:text-gray-500 dark:hover:text-gray-400" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{task.description}</p>
                    )}
                    <div className="flex items-center mt-1.5 space-x-2">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(task.priority)}`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                      {task.dueDate && (
                        <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
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
              className="w-full mt-2 text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
            >
              Ver todas as tarefas
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}