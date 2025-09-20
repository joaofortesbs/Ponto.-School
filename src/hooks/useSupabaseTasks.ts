import { useState, useEffect } from 'react';
import { taskService, TaskForUI } from '@/services/taskService';

export interface Task extends TaskForUI {}

export const useSupabaseTasks = () => {
  const [tasks, setTasks] = useState<TaskForUI[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar tarefas
  const loadTasks = async () => {
    setLoading(true);
    try {
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar nova tarefa
  const addTask = async (title: string, description?: string) => {
    try {
      const newTask = await taskService.createTask(title, description);
      if (newTask) {
        setTasks(prev => [newTask, ...prev]);
        return newTask;
      }
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
    }
    return null;
  };

  // Atualizar tarefa
  const updateTask = async (id: string, updates: Partial<TaskForUI>) => {
    try {
      const updatedTask = await taskService.updateTask(id, updates);
      if (updatedTask) {
        setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
        return updatedTask;
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
    return null;
  };

  // Deletar tarefa
  const deleteTask = async (id: string) => {
    try {
      const success = await taskService.deleteTask(id);
      if (success) {
        setTasks(prev => prev.filter(task => task.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
    }
    return false;
  };

  // Alternar status de conclusão
  const toggleTaskCompletion = async (id: string) => {
    try {
      const updatedTask = await taskService.toggleTaskCompletion(id);
      if (updatedTask) {
        setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
        return updatedTask;
      }
    } catch (error) {
      console.error('Erro ao alternar status da tarefa:', error);
    }
    return null;
  };

  // Carregar tarefas na inicialização
  useEffect(() => {
    loadTasks();
  }, []);

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    loadTasks
  };
};

// Exportar também como useTasks para compatibilidade
export const useTasks = useSupabaseTasks;