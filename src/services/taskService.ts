
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

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

// Converter objeto para esquema da tabela
const formatTaskForDB = (task: any) => {
  return {
    id: task.id || uuidv4(),
    title: task.title,
    description: task.description || '',
    priority: task.priority || 'medium',
    status: task.status || 'todo',
    due_date: task.dueDate,
    category: task.category || '',
    user_id: task.userId,
    created_at: task.createdAt || new Date().toISOString(),
    updated_at: task.updatedAt || new Date().toISOString()
  };
};

// Converter esquema da tabela para objeto da interface
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

// Adicionar uma nova tarefa
export const addTask = async (task: Omit<Task, "id" | "createdAt">): Promise<Task | null> => {
  try {
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("Usuário não autenticado");
      // Fallback para armazenamento local
      const taskWithMeta = {
        ...task,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      return saveTaskLocally(taskWithMeta);
    }

    const taskWithMeta = {
      ...task,
      id: uuidv4(),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    const dbTask = formatTaskForDB(taskWithMeta);

    const { data, error } = await supabase
      .from("user_tasks")
      .insert(dbTask)
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar tarefa no DB:", error);
      // Fallback para armazenamento local
      return saveTaskLocally(taskWithMeta);
    }

    const formattedTask = formatDBTaskForApp(data);

    // Notificar a interface sobre a nova tarefa
    try {
      window.dispatchEvent(new CustomEvent('task-added', { 
        detail: { task: formattedTask }
      }));
      window.dispatchEvent(new CustomEvent('tasks-updated'));
    } catch (e) {
      console.warn("Não foi possível emitir evento de atualização:", e);
    }

    return formattedTask;
  } catch (error) {
    console.error("Erro ao adicionar tarefa:", error);
    // Fallback para armazenamento local
    const taskWithMeta = {
      ...task,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    return saveTaskLocally(taskWithMeta);
  }
};

// Obter todas as tarefas de um usuário
export const getTasksByUserId = async (userId?: string): Promise<Task[]> => {
  try {
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("Usuário não autenticado, carregando tarefas locais");
      return getLocalTasks('anonymous');
    }

    const { data, error } = await supabase
      .from("user_tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar tarefas do usuário no DB:", error);
      // Fallback para armazenamento local
      return getLocalTasks(user.id);
    }

    const formattedTasks = (data || []).map(formatDBTaskForApp);

    // Mesclar com tarefas locais se existirem
    const localTasks = getLocalTasks(user.id);
    const localOnlyTasks = localTasks.filter(lt => 
      !formattedTasks.some(ft => ft.id === lt.id)
    );

    return [...formattedTasks, ...localOnlyTasks];
  } catch (error) {
    console.error("Erro ao buscar tarefas do usuário:", error);
    return getLocalTasks('anonymous');
  }
};

// Obter todas as tarefas
export const getAllTasks = async (): Promise<Task[]> => {
  return getTasksByUserId();
};

// Atualizar uma tarefa existente
export const updateTask = async (task: Task): Promise<Task | null> => {
  try {
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("Usuário não autenticado");
      return updateTaskLocally(task);
    }

    if (!task.id) {
      console.error("ID é obrigatório para atualizar uma tarefa");
      return null;
    }

    if (task.id.startsWith('local-')) {
      // Para tarefas locais, atualizar apenas no localStorage
      return updateTaskLocally(task);
    }

    const dbTask = formatTaskForDB({
      ...task,
      userId: user.id,
      updatedAt: new Date().toISOString()
    });

    const { data, error } = await supabase
      .from("user_tasks")
      .update(dbTask)
      .eq("id", task.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar tarefa:", error);
      // Fallback para armazenamento local
      return updateTaskLocally(task);
    }

    return formatDBTaskForApp(data);
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    return updateTaskLocally(task);
  }
};

// Remover uma tarefa
export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("Usuário não autenticado");
      return deleteTaskLocally(taskId);
    }

    if (!taskId) {
      console.error("ID é obrigatório para excluir uma tarefa");
      return false;
    }

    if (taskId.startsWith('local-')) {
      // Para tarefas locais, excluir apenas no localStorage
      return deleteTaskLocally(taskId);
    }

    const { error } = await supabase
      .from("user_tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Erro ao remover tarefa:", error);
      // Fallback para armazenamento local
      return deleteTaskLocally(taskId);
    }

    return true;
  } catch (error) {
    console.error("Erro ao remover tarefa:", error);
    return deleteTaskLocally(taskId);
  }
};

// Funções para armazenamento local como backup
const TASKS_STORAGE_KEY = "user_tasks";

// Salvar todas as tarefas localmente
const saveTasksLocally = (tasks: Task[]) => {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error("Erro ao salvar tarefas localmente:", error);
    return false;
  }
};

// Inicializar o armazenamento local se não existir
export const initLocalStorage = () => {
  if (!localStorage.getItem(TASKS_STORAGE_KEY)) {
    saveTasksLocally([]);
  }
};

// Obter todas as tarefas armazenadas localmente
export const getAllLocalTasks = (): Task[] => {
  try {
    const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!tasksJson) return [];
    return JSON.parse(tasksJson);
  } catch (error) {
    console.error("Erro ao obter todas as tarefas locais:", error);
    return [];
  }
};

// Obter tarefas locais para um usuário específico
const getLocalTasks = (userId: string): Task[] => {
  try {
    if (!userId) return [];
    const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!tasksJson) return [];
    const tasks: Task[] = JSON.parse(tasksJson);
    return tasks.filter(task => task.userId === userId);
  } catch (error) {
    console.error("Erro ao obter tarefas locais:", error);
    return [];
  }
};

// Salvar uma tarefa localmente
const saveTaskLocally = (task: any) => {
  try {
    const allTasks = getAllLocalTasks();
    const newTask = {
      ...task,
      id: task.id || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: task.createdAt || new Date().toISOString(),
    };

    // Remover qualquer duplicata
    const filteredTasks = allTasks.filter(t => t.id !== newTask.id);
    saveTasksLocally([...filteredTasks, newTask]);
    return newTask;
  } catch (error) {
    console.error("Erro ao salvar tarefa localmente:", error);
    return null;
  }
};

// Atualizar uma tarefa localmente
const updateTaskLocally = (task: Task) => {
  try {
    const allTasks = getAllLocalTasks();
    const updatedTasks = allTasks.map(t => 
      t.id === task.id ? { ...task, updatedAt: new Date().toISOString() } : t
    );
    saveTasksLocally(updatedTasks);
    return task;
  } catch (error) {
    console.error("Erro ao atualizar tarefa localmente:", error);
    return null;
  }
};

// Remover uma tarefa localmente
const deleteTaskLocally = (taskId: string) => {
  try {
    const allTasks = getAllLocalTasks();
    const updatedTasks = allTasks.filter(t => t.id !== taskId);
    saveTasksLocally(updatedTasks);
    return true;
  } catch (error) {
    console.error("Erro ao remover tarefa localmente:", error);
    return false;
  }
};

// Sincronizar tarefas locais com o banco de dados
export const syncLocalTasks = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("Usuário não autenticado para sincronização");
      return;
    }

    const localTasks = getLocalTasks(user.id);
    const localOnlyTasks = localTasks.filter(t => t.id.startsWith('local-'));

    for (const task of localOnlyTasks) {
      const { id, ...taskData } = task;
      const result = await addTask({ ...taskData, userId: user.id });
      if (result) {
        console.log("Tarefa sincronizada:", id, "->", result.id);
      }
    }

    // Limpar tarefas locais sincronizadas
    if (localOnlyTasks.length > 0) {
      const allTasks = getAllLocalTasks();
      const remainingTasks = allTasks.filter(t => !t.id.startsWith('local-') || t.userId !== user.id);
      saveTasksLocally(remainingTasks);
    }
  } catch (error) {
    console.error("Erro ao sincronizar tarefas locais:", error);
  }
};
