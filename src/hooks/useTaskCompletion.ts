
import { useState } from 'react';

interface Task {
  id: string;
  completed: boolean;
  [key: string]: any;
}

/**
 * Custom hook for managing task completion state
 */
export function useTaskCompletion<T extends Task>(initialTasks: T[]) {
  const [tasks, setTasks] = useState<T[]>(initialTasks);

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const addTask = (task: T) => {
    setTasks([...tasks, task]);
  };

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const updateTask = (taskId: string, updates: Partial<T>) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task,
      ),
    );
  };

  return {
    tasks,
    toggleTaskCompletion,
    addTask,
    removeTask,
    updateTask,
    completedTasks: tasks.filter(task => task.completed),
    pendingTasks: tasks.filter(task => !task.completed),
  };
}
