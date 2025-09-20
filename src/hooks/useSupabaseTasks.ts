
import { useState, useEffect } from 'react';
import { supabaseTaskService, TarefaSupabase } from '@/services/supabaseTaskService';

export interface TaskForUI {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useSupabaseTasks = () => {
  const [tasks, setTasks] = useState<TaskForUI[]>([]);
  const [loading, setLoading] = useState(true);

  // Converter tarefa do Supabase para formato da UI
  const convertToUIFormat = (tarefaSupabase: TarefaSupabase): TaskForUI => ({
    id: tarefaSupabase.id,
    title: tarefaSupabase.titulo,
    description: tarefaSupabase.descricao,
    completed: tarefaSupabase.status,
    createdAt: tarefaSupabase.data_criacao,
    updatedAt: tarefaSupabase.data_atualizacao
  });

  // Carregar tarefas do Supabase
  const loadTasks = async () => {
    setLoading(true);
    try {
      const tarefas = await supabaseTaskService.buscarTarefas();
      const tasksForUI = tarefas.map(convertToUIFormat);
      setTasks(tasksForUI);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar nova tarefa
  const addTask = async (title: string, description?: string) => {
    try {
      const novaTarefa = await supabaseTaskService.criarTarefa(title, description);
      if (novaTarefa) {
        const taskForUI = convertToUIFormat(novaTarefa);
        setTasks(prev => [taskForUI, ...prev]);
        return taskForUI;
      }
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
    }
    return null;
  };

  // Atualizar tarefa
  const updateTask = async (id: string, updates: Partial<Pick<TaskForUI, 'title' | 'description' | 'completed'>>) => {
    try {
      const supabaseUpdates: any = {};
      if (updates.title !== undefined) supabaseUpdates.titulo = updates.title;
      if (updates.description !== undefined) supabaseUpdates.descricao = updates.description;
      if (updates.completed !== undefined) supabaseUpdates.status = updates.completed;

      const tarefaAtualizada = await supabaseTaskService.atualizarTarefa(id, supabaseUpdates);
      if (tarefaAtualizada) {
        const taskForUI = convertToUIFormat(tarefaAtualizada);
        setTasks(prev => prev.map(task => task.id === id ? taskForUI : task));
        return taskForUI;
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
    return null;
  };

  // Deletar tarefa
  const deleteTask = async (id: string) => {
    try {
      const sucesso = await supabaseTaskService.deletarTarefa(id);
      if (sucesso) {
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
    const task = tasks.find(t => t.id === id);
    if (task) {
      return await updateTask(id, { completed: !task.completed });
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
