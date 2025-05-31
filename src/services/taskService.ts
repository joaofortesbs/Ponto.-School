
import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  dueDate?: string;
  category?: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

// Converter do formato DB para o formato da aplicação
const formatDBTaskForApp = (dbTask: any): Task => {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    priority: dbTask.priority || 'medium',
    status: dbTask.status || 'todo',
    dueDate: dbTask.due_date,
    category: dbTask.category,
    userId: dbTask.user_id,
    createdAt: dbTask.created_at,
    updatedAt: dbTask.updated_at
  };
};

// Converter do formato da aplicação para o formato DB
const formatAppTaskForDB = (task: Partial<Task>) => {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority || 'medium',
    status: task.status || 'todo',
    due_date: task.dueDate,
    category: task.category,
    user_id: task.userId
  };
};

// Obter tarefas de um usuário específico
export const getTasksByUserId = async (userId: string): Promise<Task[]> => {
  if (!userId) {
    console.error("UserId inválido:", userId);
    return [];
  }

  try {
    console.log("Buscando tarefas para o usuário:", userId);

    const { data, error } = await supabase
      .from("user_tasks")
      .select("*")
      .eq("user_id", userId)
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Erro ao buscar tarefas do usuário no DB:", error);
      return [];
    }

    // Converter do formato DB para o formato da aplicação
    const formattedTasks = (data || []).map(formatDBTaskForApp);
    console.log(`${formattedTasks.length} tarefas encontradas para o usuário ${userId}`);

    return formattedTasks;
  } catch (error) {
    console.error("Erro ao buscar tarefas do usuário:", error);
    return [];
  }
};

// Adicionar uma nova tarefa
export const addTask = async (task: Omit<Task, "id" | "createdAt">): Promise<Task | null> => {
  try {
    const taskForDB = formatAppTaskForDB(task);

    const { data, error } = await supabase
      .from("user_tasks")
      .insert(taskForDB)
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar tarefa:", error);
      return null;
    }

    return formatDBTaskForApp(data);
  } catch (error) {
    console.error("Erro ao adicionar tarefa:", error);
    return null;
  }
};

// Atualizar uma tarefa existente
export const updateTask = async (task: Task): Promise<Task | null> => {
  try {
    const taskForDB = formatAppTaskForDB(task);

    const { data, error } = await supabase
      .from("user_tasks")
      .update(taskForDB)
      .eq("id", task.id)
      .eq("user_id", task.userId)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar tarefa:", error);
      return null;
    }

    return formatDBTaskForApp(data);
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    return null;
  }
};

// Deletar uma tarefa
export const deleteTask = async (taskId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("user_tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao deletar tarefa:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao deletar tarefa:", error);
    return false;
  }
};

// Marcar tarefa como concluída
export const markTaskAsCompleted = async (taskId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("user_tasks")
      .update({ status: 'completed' })
      .eq("id", taskId)
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao marcar tarefa como concluída:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao marcar tarefa como concluída:", error);
    return false;
  }
};
