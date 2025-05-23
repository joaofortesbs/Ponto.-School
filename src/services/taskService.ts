
import { supabase } from "@/lib/supabase";
import { getWebPersistence, setWebPersistence } from "@/lib/web-persistence";
import { Task } from "@/components/agenda/tasks/TasksView";

const TASKS_LOCAL_STORAGE_KEY = "user_tasks";

/**
 * Serviço para gerenciar tarefas com persistência em banco de dados e fallback local
 */
// Eventos para sincronização entre componentes
const taskEvents = new EventTarget();

export const taskService = {
  // Métodos para eventos de atualização
  emitTasksUpdated: (userId: string) => {
    taskEvents.dispatchEvent(new CustomEvent('tasks-updated', { detail: { userId } }));
  },
  
  emitTaskAdded: (task: any) => {
    console.log("Emitindo evento de tarefa adicionada no taskService:", task);
    
    try {
      // Disparar evento global para sincronizar componentes (EventTarget)
      taskEvents.dispatchEvent(new CustomEvent('task-added', { detail: task }));
      
      // Disparar evento no DOM para componentes que estão em árvores de componentes diferentes
      const event = new CustomEvent('refresh-tasks', { detail: task, bubbles: true });
      document.dispatchEvent(event);
      
      // Tentar disparar evento diretamente nos componentes que precisam ser atualizados
      const componentsToNotify = [
        '[data-testid="tasks-view"]',
        '[data-testid="pending-tasks-card"]'
      ];
      
      componentsToNotify.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          console.log(`Emitindo evento para ${selector}`);
          element.dispatchEvent(new CustomEvent('refresh-tasks', { detail: task, bubbles: true }));
        }
      });
    } catch (error) {
      console.error("Erro ao emitir evento de tarefa adicionada:", error);
    }
  },
  
  onTasksUpdated: (callback: (userId: string) => void) => {
    const handler = (event: any) => callback(event.detail.userId);
    taskEvents.addEventListener('tasks-updated', handler);
    return () => taskEvents.removeEventListener('tasks-updated', handler);
  },
  
  onTaskAdded: (callback: (task: any) => void) => {
    const handler = (event: any) => callback(event.detail);
    taskEvents.addEventListener('task-added', handler);
    return () => taskEvents.removeEventListener('task-added', handler);
  },
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
        
        // Notifica outros componentes sobre a atualização
        this.emitTasksUpdated(userId);
        
        return true;
      }

      // Se houve erro no Supabase, tenta salvar apenas localmente
      console.warn("Erro ao salvar tarefas no Supabase, usando armazenamento local:", error);
      const success = await this.saveTasksLocally(userId, tasks);
      
      if (success) {
        // Notifica outros componentes sobre a atualização
        this.emitTasksUpdated(userId);
      }
      
      return success;
    } catch (err) {
      console.error("Erro ao salvar tarefas:", err);
      // Tenta salvar localmente como fallback
      const success = await this.saveTasksLocally(userId, tasks);
      
      if (success) {
        // Notifica outros componentes sobre a atualização
        this.emitTasksUpdated(userId);
      }
      
      return success;
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
