
import { supabase } from "@/lib/supabase";
import { getWebPersistence, setWebPersistence } from "@/lib/web-persistence";
import { Task } from "@/components/agenda/tasks/TasksView";

const TASKS_LOCAL_STORAGE_KEY = "user_tasks";

/**
 * Serviço para gerenciar tarefas com persistência em banco de dados e fallback local
 */
export const taskService = {
  /**
   * Salvar tarefas para um usuário
   * @param userId ID do usuário
   * @param tasks Array de tarefas
   * @returns boolean indicando sucesso
   */
  async saveTasks(userId: string, tasks: Task[]): Promise<boolean> {
    try {
      // Tentativa de salvar no Supabase
      const { error } = await supabase
        .from("user_tasks")
        .upsert(
          { user_id: userId, tasks: JSON.stringify(tasks), updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );

      // Se não houver erro, salvamento no Supabase foi bem-sucedido
      if (!error) {
        // Como backup adicional, salvar também localmente
        await this.saveTasksLocally(userId, tasks);
        return true;
      }

      // Se houve erro no Supabase, tenta salvar apenas localmente
      console.warn("Erro ao salvar tarefas no Supabase, usando armazenamento local:", error);
      return await this.saveTasksLocally(userId, tasks);
    } catch (err) {
      console.error("Erro ao salvar tarefas:", err);
      // Tenta salvar localmente como fallback
      return await this.saveTasksLocally(userId, tasks);
    }
  },

  /**
   * Salvar tarefas localmente
   * @param userId ID do usuário
   * @param tasks Array de tarefas
   * @returns boolean indicando sucesso
   */
  async saveTasksLocally(userId: string, tasks: Task[]): Promise<boolean> {
    try {
      // Obter mapa de tarefas por usuário do armazenamento local
      const allTasks = getWebPersistence(TASKS_LOCAL_STORAGE_KEY) || {};
      
      // Atualizar tarefas do usuário específico
      allTasks[userId] = {
        tasks,
        updatedAt: new Date().toISOString()
      };

      // Salvar o mapa atualizado
      return setWebPersistence(TASKS_LOCAL_STORAGE_KEY, allTasks);
    } catch (err) {
      console.error("Erro ao salvar tarefas localmente:", err);
      return false;
    }
  },

  /**
   * Carregar tarefas de um usuário
   * @param userId ID do usuário
   * @returns Array de tarefas do usuário
   */
  async loadTasks(userId: string): Promise<Task[]> {
    try {
      // Tentar carregar do Supabase primeiro
      const { data, error } = await supabase
        .from("user_tasks")
        .select("tasks")
        .eq("user_id", userId)
        .single();

      // Se dados forem carregados do Supabase com sucesso
      if (data && !error) {
        const tasks = typeof data.tasks === 'string' ? JSON.parse(data.tasks) : data.tasks;
        // Atualizar dados locais com os dados do servidor como backup
        this.saveTasksLocally(userId, tasks);
        return tasks;
      }

      // Se houve erro ou não há dados no Supabase, carregar do armazenamento local
      console.warn("Erro ao carregar tarefas do Supabase, usando armazenamento local:", error);
      return await this.loadTasksLocally(userId);
    } catch (err) {
      console.error("Erro ao carregar tarefas:", err);
      // Tentar carregar localmente como fallback
      return await this.loadTasksLocally(userId);
    }
  },

  /**
   * Carregar tarefas de um usuário do armazenamento local
   * @param userId ID do usuário
   * @returns Array de tarefas do usuário
   */
  async loadTasksLocally(userId: string): Promise<Task[]> {
    try {
      // Obter mapa de tarefas por usuário
      const allTasks = getWebPersistence(TASKS_LOCAL_STORAGE_KEY) || {};
      
      // Retornar tarefas do usuário específico ou array vazio
      return (allTasks[userId]?.tasks || []);
    } catch (err) {
      console.error("Erro ao carregar tarefas localmente:", err);
      return [];
    }
  },

  /**
   * Verificar se há dados de tarefas mais recentes entre Supabase e armazenamento local
   * @param userId ID do usuário
   * @returns As tarefas mais recentes
   */
  async syncTasks(userId: string): Promise<Task[]> {
    try {
      // Tentar carregar do Supabase
      const { data: supabaseData, error } = await supabase
        .from("user_tasks")
        .select("tasks, updated_at")
        .eq("user_id", userId)
        .single();

      // Carregar dados locais
      const allTasks = getWebPersistence(TASKS_LOCAL_STORAGE_KEY) || {};
      const localData = allTasks[userId];

      // Se não há dados no Supabase ou houve erro
      if (error || !supabaseData) {
        // Se há dados locais, retorná-los
        if (localData) {
          return localData.tasks;
        }
        return [];
      }

      // Se há dados no Supabase e localmente, comparar datas de atualização
      if (localData) {
        const supabaseUpdatedAt = new Date(supabaseData.updated_at).getTime();
        const localUpdatedAt = new Date(localData.updatedAt).getTime();

        // Usar os dados mais recentes
        if (localUpdatedAt > supabaseUpdatedAt) {
          // Dados locais são mais recentes, atualizar Supabase
          const tasks = localData.tasks;
          this.saveTasks(userId, tasks);
          return tasks;
        } else {
          // Dados do Supabase são mais recentes, atualizar local
          const tasks = typeof supabaseData.tasks === 'string' 
            ? JSON.parse(supabaseData.tasks) 
            : supabaseData.tasks;
          this.saveTasksLocally(userId, tasks);
          return tasks;
        }
      }

      // Se só há dados no Supabase, retorná-los e salvá-los localmente
      const tasks = typeof supabaseData.tasks === 'string' 
        ? JSON.parse(supabaseData.tasks) 
        : supabaseData.tasks;
      this.saveTasksLocally(userId, tasks);
      return tasks;
    } catch (err) {
      console.error("Erro ao sincronizar tarefas:", err);
      // Tentar carregar localmente como fallback
      return await this.loadTasksLocally(userId);
    }
  }
};
