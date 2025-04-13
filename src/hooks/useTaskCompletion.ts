
import { useState, useCallback } from "react";

interface Task {
  id: string;
  title: string;
  completed?: boolean;
  [key: string]: any;
}

interface UseTaskCompletionOptions {
  onCompleteTask?: (taskId: string) => void;
  onUncompleteTask?: (taskId: string) => void;
}

/**
 * Hook para gerenciar a conclusão de tarefas
 */
export function useTaskCompletion<T extends Task>(
  initialTasks: T[] = [],
  options: UseTaskCompletionOptions = {}
) {
  const [tasks, setTasks] = useState<T[]>(initialTasks);
  
  // Marca uma tarefa como concluída
  const completeTask = useCallback((taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    );
    
    if (options.onCompleteTask) {
      options.onCompleteTask(taskId);
    }
  }, [options.onCompleteTask]);
  
  // Desmarca uma tarefa como concluída
  const uncompleteTask = useCallback((taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: false } : task
      )
    );
    
    if (options.onUncompleteTask) {
      options.onUncompleteTask(taskId);
    }
  }, [options.onUncompleteTask]);
  
  // Alterna o estado de conclusão de uma tarefa
  const toggleTaskCompletion = useCallback((taskId: string) => {
    setTasks((currentTasks) => {
      const updatedTasks = currentTasks.map((task) => {
        if (task.id === taskId) {
          const newCompletedState = !task.completed;
          
          // Chama o callback apropriado
          if (newCompletedState && options.onCompleteTask) {
            options.onCompleteTask(taskId);
          } else if (!newCompletedState && options.onUncompleteTask) {
            options.onUncompleteTask(taskId);
          }
          
          return { ...task, completed: newCompletedState };
        }
        return task;
      });
      
      return updatedTasks;
    });
  }, [options.onCompleteTask, options.onUncompleteTask]);
  
  return {
    tasks,
    setTasks,
    completeTask,
    uncompleteTask,
    toggleTaskCompletion,
  };
}
