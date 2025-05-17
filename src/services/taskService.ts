
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
    if (!userId || !tasks) {
      console.error("ID do usuário ou tarefas inválidos");
      return false;
    }

    // Primeiro, salvar localmente para garantir que os dados não sejam perdidos
    const localSaveSuccess = await this.saveTasksLocally(userId, tasks);
    
    try {
      // Tentar salvar no Supabase
      const { error } = await supabase
        .from("user_tasks")
        .upsert(
          { 
            user_id: userId, 
            tasks: JSON.stringify(tasks), 
            updated_at: new Date().toISOString() 
          },
          { onConflict: "user_id" }
        );

      if (error) {
        console.warn("Erro ao salvar tarefas no Supabase, usando apenas armazenamento local:", error);
        // Retorna o resultado do salvamento local
        return localSaveSuccess;
      }
      
      console.log(`Tarefas do usuário ${userId} salvas com sucesso (${tasks.length} tarefas)`);
      return true;
    } catch (err) {
      console.error("Erro ao salvar tarefas no Supabase:", err);
      // Retorna o resultado do salvamento local
      return localSaveSuccess;
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
      if (!userId) {
        console.error("ID do usuário inválido");
        return false;
      }

      // Obter mapa de tarefas por usuário do armazenamento local
      const allTasks = getWebPersistence(TASKS_LOCAL_STORAGE_KEY) || {};
      
      // Atualizar tarefas do usuário específico
      allTasks[userId] = {
        tasks: tasks || [],
        updatedAt: new Date().toISOString()
      };

      // Salvar o mapa atualizado
      const success = setWebPersistence(TASKS_LOCAL_STORAGE_KEY, allTasks);
      
      if (success) {
        console.log(`Tarefas do usuário ${userId} salvas localmente (${tasks.length} tarefas)`);
      } else {
        console.error("Falha ao salvar tarefas localmente");
      }
      
      return success;
    } catch (err) {
      console.error("Erro ao salvar tarefas localmente:", err);
      
      // Última tentativa: salvar apenas as tarefas deste usuário
      try {
        const success = setWebPersistence(`${TASKS_LOCAL_STORAGE_KEY}_${userId}`, {
          tasks: tasks || [],
          updatedAt: new Date().toISOString()
        });
        
        return success;
      } catch (finalError) {
        console.error("Falha total ao salvar tarefas localmente:", finalError);
        return false;
      }
    }
  },

  /**
   * Carregar tarefas de um usuário
   * @param userId ID do usuário
   * @returns Array de tarefas do usuário
   */
  async loadTasks(userId: string): Promise<Task[]> {
    if (!userId) {
      console.error("ID do usuário inválido");
      return [];
    }

    try {
      // Tentar carregar do Supabase primeiro
      const { data, error } = await supabase
        .from("user_tasks")
        .select("tasks, updated_at")
        .eq("user_id", userId)
        .single();

      // Se dados forem carregados do Supabase com sucesso
      if (data && !error) {
        const tasks = typeof data.tasks === 'string' 
          ? JSON.parse(data.tasks) 
          : (data.tasks || []);
          
        // Validar que os dados são um array
        if (!Array.isArray(tasks)) {
          console.warn("Dados do Supabase não são um array válido");
          return await this.loadTasksLocally(userId);
        }
        
        console.log(`Carregadas ${tasks.length} tarefas do usuário ${userId} do Supabase`);
        
        // Atualizar dados locais com os dados do servidor como backup
        this.saveTasksLocally(userId, tasks);
        return tasks;
      }

      // Se houve erro ou não há dados no Supabase, carregar do armazenamento local
      return await this.loadTasksLocally(userId);
    } catch (err) {
      console.error("Erro ao carregar tarefas do Supabase:", err);
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
      if (!userId) {
        console.error("ID do usuário inválido");
        return [];
      }
      
      // Obter mapa de tarefas por usuário
      const allTasks = getWebPersistence(TASKS_LOCAL_STORAGE_KEY) || {};
      
      // Verificar se há tarefas para este usuário
      if (allTasks[userId]?.tasks) {
        const tasks = allTasks[userId].tasks;
        console.log(`Carregadas ${tasks.length} tarefas do usuário ${userId} do armazenamento local`);
        return Array.isArray(tasks) ? tasks : [];
      }
      
      // Verificar armazenamento alternativo
      const backupTasks = getWebPersistence(`${TASKS_LOCAL_STORAGE_KEY}_${userId}`);
      if (backupTasks?.tasks) {
        console.log(`Carregadas ${backupTasks.tasks.length} tarefas do usuário ${userId} do armazenamento de backup`);
        return Array.isArray(backupTasks.tasks) ? backupTasks.tasks : [];
      }
      
      console.log(`Nenhuma tarefa encontrada para o usuário ${userId}`);
      return [];
    } catch (err) {
      console.error("Erro ao carregar tarefas localmente:", err);
      return [];
    }
  },

  /**
   * Sincronizar tarefas entre Supabase e armazenamento local
   * @param userId ID do usuário
   * @returns As tarefas mais recentes
   */
  async syncTasks(userId: string): Promise<Task[]> {
    if (!userId) {
      console.error("ID do usuário inválido");
      return [];
    }

    try {
      // Carregar dados do Supabase
      let supabaseTasks: Task[] = [];
      let supabaseUpdatedAt: number = 0;
      let supabaseError = false;
      
      try {
        const { data, error } = await supabase
          .from("user_tasks")
          .select("tasks, updated_at")
          .eq("user_id", userId)
          .single();
          
        if (error) {
          supabaseError = true;
          throw error;
        }
        
        if (data) {
          supabaseTasks = typeof data.tasks === 'string' 
            ? JSON.parse(data.tasks) 
            : (data.tasks || []);
            
          supabaseUpdatedAt = new Date(data.updated_at).getTime();
          
          // Validar que os dados são um array
          if (!Array.isArray(supabaseTasks)) {
            console.warn("Dados do Supabase não são um array válido");
            supabaseTasks = [];
          }
        }
      } catch (err) {
        console.warn("Erro ao carregar tarefas do Supabase:", err);
        supabaseError = true;
      }

      // Carregar dados locais
      let localTasks: Task[] = [];
      let localUpdatedAt: number = 0;
      
      try {
        const allTasks = getWebPersistence(TASKS_LOCAL_STORAGE_KEY) || {};
        const userData = allTasks[userId];
        
        if (userData) {
          localTasks = Array.isArray(userData.tasks) ? userData.tasks : [];
          localUpdatedAt = new Date(userData.updatedAt).getTime();
        } else {
          // Verificar armazenamento alternativo
          const backupData = getWebPersistence(`${TASKS_LOCAL_STORAGE_KEY}_${userId}`);
          if (backupData) {
            localTasks = Array.isArray(backupData.tasks) ? backupData.tasks : [];
            localUpdatedAt = new Date(backupData.updatedAt).getTime();
          }
        }
      } catch (err) {
        console.warn("Erro ao carregar tarefas locais:", err);
      }

      // Decidir quais dados usar
      let finalTasks: Task[] = [];
      
      // Se erro no Supabase, usar dados locais
      if (supabaseError) {
        finalTasks = localTasks;
        console.log("Usando dados locais devido a erro no Supabase");
      } 
      // Se só tem dados no Supabase
      else if (supabaseTasks.length > 0 && localTasks.length === 0) {
        finalTasks = supabaseTasks;
        console.log("Usando dados do Supabase (não há dados locais)");
      } 
      // Se só tem dados locais
      else if (localTasks.length > 0 && supabaseTasks.length === 0) {
        finalTasks = localTasks;
        console.log("Usando dados locais (não há dados no Supabase)");
        
        // Atualizar Supabase com dados locais
        this.saveTasks(userId, localTasks);
      } 
      // Se tem dados nos dois lugares, usar o mais recente
      else if (localTasks.length > 0 && supabaseTasks.length > 0) {
        if (localUpdatedAt > supabaseUpdatedAt) {
          finalTasks = localTasks;
          console.log("Dados locais são mais recentes, atualizando Supabase");
          this.saveTasks(userId, localTasks);
        } else {
          finalTasks = supabaseTasks;
          console.log("Dados do Supabase são mais recentes, atualizando armazenamento local");
          this.saveTasksLocally(userId, supabaseTasks);
        }
      }
      
      return finalTasks;
    } catch (err) {
      console.error("Erro ao sincronizar tarefas:", err);
      // Tentar carregar localmente como fallback
      return await this.loadTasksLocally(userId);
    }
  },
  
  /**
   * Adicionar uma nova tarefa
   * @param userId ID do usuário
   * @param newTask Nova tarefa
   * @returns Tarefa adicionada ou null em caso de falha
   */
  async addTask(userId: string, newTask: Task): Promise<Task | null> {
    try {
      if (!userId || !newTask) {
        console.error("ID do usuário ou tarefa inválidos");
        return null;
      }

      // Carregar tarefas existentes
      const existingTasks = await this.loadTasks(userId);
      
      // Adicionar nova tarefa no início da lista
      const updatedTasks = [newTask, ...existingTasks];
      
      // Salvar tarefas atualizadas
      const success = await this.saveTasks(userId, updatedTasks);
      
      return success ? newTask : null;
    } catch (err) {
      console.error("Erro ao adicionar tarefa:", err);
      return null;
    }
  },
  
  /**
   * Atualizar uma tarefa existente
   * @param userId ID do usuário
   * @param updatedTask Tarefa atualizada
   * @returns Boolean indicando sucesso
   */
  async updateTask(userId: string, updatedTask: Task): Promise<boolean> {
    try {
      if (!userId || !updatedTask || !updatedTask.id) {
        console.error("ID do usuário ou tarefa inválidos");
        return false;
      }

      // Carregar tarefas existentes
      const existingTasks = await this.loadTasks(userId);
      
      // Encontrar e atualizar a tarefa
      const taskIndex = existingTasks.findIndex(task => task.id === updatedTask.id);
      
      if (taskIndex === -1) {
        console.warn("Tarefa não encontrada para atualização");
        return false;
      }
      
      // Atualizar a tarefa
      existingTasks[taskIndex] = updatedTask;
      
      // Salvar tarefas atualizadas
      return await this.saveTasks(userId, existingTasks);
    } catch (err) {
      console.error("Erro ao atualizar tarefa:", err);
      return false;
    }
  },
  
  /**
   * Excluir uma tarefa
   * @param userId ID do usuário
   * @param taskId ID da tarefa
   * @returns Boolean indicando sucesso
   */
  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    try {
      if (!userId || !taskId) {
        console.error("ID do usuário ou tarefa inválidos");
        return false;
      }

      // Carregar tarefas existentes
      const existingTasks = await this.loadTasks(userId);
      
      // Filtrar a tarefa a ser excluída
      const updatedTasks = existingTasks.filter(task => task.id !== taskId);
      
      if (updatedTasks.length === existingTasks.length) {
        console.warn("Tarefa não encontrada para exclusão");
        return false;
      }
      
      // Salvar tarefas atualizadas
      return await this.saveTasks(userId, updatedTasks);
    } catch (err) {
      console.error("Erro ao excluir tarefa:", err);
      return false;
    }
  }
};
