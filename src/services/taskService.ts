// Serviço para gerenciar tarefas - funciona com Supabase ou localStorage
import { supabase } from "@/lib/supabase";
import { checkSupabaseConnection } from "@/lib/supabase";
import { getCurrentUser } from "@/services/databaseService";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'a-fazer' | 'em-andamento' | 'concluido' | 'atrasado';
  priority: 'alta' | 'média' | 'baixa';
  dueDate?: string;
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export const LOCAL_STORAGE_KEY_PREFIX = "user_tasks_";

export const taskService = {
  /**
   * Salvar tarefas no banco de dados e localmente
   * @param userId ID do usuário
   * @param tasks Lista de tarefas
   * @returns Verdadeiro se a operação foi bem-sucedida
   */
  async saveTasks(userId: string, tasks: Task[]): Promise<boolean> {
    if (!userId) {
      console.error("ID do usuário inválido");
      return false;
    }

    const timestamp = new Date().toISOString();

    // Salvar localmente primeiro (como backup)
    this.saveTasksLocally(userId, tasks);

    try {
      // Verificar conexão com Supabase
      const isConnected = await checkSupabaseConnection();

      if (!isConnected) {
        console.warn("Sem conexão com Supabase, tarefas salvas apenas localmente");
        return true; // Consideramos sucesso se salvou localmente
      }

      // Verificar se já existe registro para este usuário
      const { data: existingData, error: checkError } = await supabase
        .from("user_tasks")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Erro ao verificar tarefas existentes:", checkError);
        return true; // Retornamos true pois já salvamos localmente
      }

      // Preparar dados para JSON
      const tasksJSON = JSON.stringify(tasks);

      if (existingData) {
        // Atualizar registro existente
        const { error: updateError } = await supabase
          .from("user_tasks")
          .update({ 
            tasks: tasksJSON,
            updated_at: timestamp 
          })
          .eq("user_id", userId);

        if (updateError) {
          console.error("Erro ao atualizar tarefas no Supabase:", updateError);
          return true; // Retornamos true pois já salvamos localmente
        }
      } else {
        // Criar novo registro
        const { error: insertError } = await supabase
          .from("user_tasks")
          .insert({ 
            user_id: userId, 
            tasks: tasksJSON,
            created_at: timestamp,
            updated_at: timestamp 
          });

        if (insertError) {
          console.error("Erro ao inserir tarefas no Supabase:", insertError);
          return true; // Retornamos true pois já salvamos localmente
        }
      }

      console.log("Tarefas salvas com sucesso no Supabase e localmente");
      return true;
    } catch (err) {
      console.error("Erro ao salvar tarefas:", err);
      return true; // Retornamos true pois já salvamos localmente
    }
  },

  /**
   * Salvar tarefas apenas localmente (função auxiliar)
   * @param userId ID do usuário
   * @param tasks Lista de tarefas
   */
  saveTasksLocally(userId: string, tasks: Task[]): void {
    try {
      const key = `${LOCAL_STORAGE_KEY_PREFIX}${userId}`;
      const data = {
        tasks,
        updated_at: new Date().getTime()
      };
      localStorage.setItem(key, JSON.stringify(data));
      console.log("Tarefas salvas localmente com sucesso");
    } catch (err) {
      console.error("Erro ao salvar tarefas localmente:", err);
    }
  },

  /**
   * Carregar tarefas do usuário (tenta Supabase primeiro, depois local)
   * @param userId ID do usuário
   * @returns Lista de tarefas
   */
  async loadTasks(userId: string): Promise<Task[]> {
    if (!userId) {
      console.error("ID do usuário inválido");
      return [];
    }

    try {
      // Tentar carregar do Supabase primeiro
      const isConnected = await checkSupabaseConnection();

      if (isConnected) {
        const { data, error } = await supabase
          .from("user_tasks")
          .select("tasks")
          .eq("user_id", userId)
          .single();

        if (!error && data && data.tasks) {
          console.log("Tarefas carregadas do Supabase com sucesso");
          return typeof data.tasks === 'string' 
            ? JSON.parse(data.tasks) 
            : (Array.isArray(data.tasks) ? data.tasks : []);
        }
      }

      // Se falhar, carregar do armazenamento local
      return this.loadTasksLocally(userId);
    } catch (err) {
      console.error("Erro ao carregar tarefas:", err);
      return this.loadTasksLocally(userId);
    }
  },

  /**
   * Carregar tarefas do armazenamento local
   * @param userId ID do usuário
   * @returns Lista de tarefas
   */
  loadTasksLocally(userId: string): Task[] {
    try {
      const key = `${LOCAL_STORAGE_KEY_PREFIX}${userId}`;
      const json = localStorage.getItem(key);

      if (!json) {
        console.log("Nenhuma tarefa encontrada localmente");
        return [];
      }

      const data = JSON.parse(json);
      console.log("Tarefas carregadas localmente com sucesso");
      return Array.isArray(data.tasks) ? data.tasks : [];
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
      // Carregar dados do armazenamento local
      const key = `${LOCAL_STORAGE_KEY_PREFIX}${userId}`;
      const localJson = localStorage.getItem(key);

      let localTasks: Task[] = [];
      let localUpdatedAt: number = 0;

      if (localJson) {
        try {
          const localData = JSON.parse(localJson);
          localTasks = Array.isArray(localData.tasks) ? localData.tasks : [];
          localUpdatedAt = localData.updated_at || 0;
        } catch (err) {
          console.warn("Erro ao carregar tarefas locais:", err);
        }
      }

      // Carregar dados do Supabase
      let supabaseTasks: Task[] = [];
      let supabaseUpdatedAt: number = 0;
      let supabaseError = false;

      // Verificar conexão com Supabase
      const isConnected = await checkSupabaseConnection();

      if (!isConnected) {
        console.warn("Sem conexão com Supabase, usando apenas dados locais");
        return localTasks;
      }

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
        // Atualizar armazenamento local com dados do Supabase
        this.saveTasksLocally(userId, supabaseTasks);
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
      // Em caso de erro, retornar os dados locais como fallback
      return this.loadTasksLocally(userId);
    }
  },

  /**
   * Adicionar uma nova tarefa
   * @param userId ID do usuário
   * @param task Nova tarefa
   * @returns Verdadeiro se a operação foi bem-sucedida
   */
  async addTask(userId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
    if (!userId) {
      console.error("ID do usuário inválido");
      return false;
    }

    try {
      // Primeiro, carregar tarefas existentes
      const existingTasks = await this.loadTasks(userId);

      // Criar nova tarefa com campos adicionais
      const newTask: Task = {
        ...task,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Adicionar à lista e salvar
      const updatedTasks = [...existingTasks, newTask];
      return await this.saveTasks(userId, updatedTasks);
    } catch (err) {
      console.error("Erro ao adicionar tarefa:", err);
      return false;
    }
  },

  /**
   * Atualizar uma tarefa existente
   * @param userId ID do usuário
   * @param taskId ID da tarefa
   * @param updates Atualizações para a tarefa
   * @returns Verdadeiro se a operação foi bem-sucedida
   */
  async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<boolean> {
    if (!userId || !taskId) {
      console.error("ID do usuário ou da tarefa inválido");
      return false;
    }

    try {
      // Carregar tarefas existentes
      const tasks = await this.loadTasks(userId);

      // Encontrar e atualizar a tarefa
      const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            ...updates,
            updatedAt: new Date().toISOString()
          };
        }
        return task;
      });

      // Salvar tarefas atualizadas
      return await this.saveTasks(userId, updatedTasks);
    } catch (err) {
      console.error("Erro ao atualizar tarefa:", err);
      return false;
    }
  },

  /**
   * Excluir uma tarefa
   * @param userId ID do usuário
   * @param taskId ID da tarefa
   * @returns Verdadeiro se a operação foi bem-sucedida
   */
  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    if (!userId || !taskId) {
      console.error("ID do usuário ou da tarefa inválido");
      return false;
    }

    try {
      // Carregar tarefas existentes
      const tasks = await this.loadTasks(userId);

      // Filtrar a tarefa a ser excluída
      const updatedTasks = tasks.filter(task => task.id !== taskId);

      // Salvar tarefas atualizadas
      return await this.saveTasks(userId, updatedTasks);
    } catch (err) {
      console.error("Erro ao excluir tarefa:", err);
      return false;
    }
  },

  /**
   * Obter tarefas filtradas por status
   * @param userId ID do usuário
   * @param status Status da tarefa
   * @returns Lista de tarefas filtradas
   */
  async getTasksByStatus(userId: string, status: Task['status']): Promise<Task[]> {
    if (!userId) {
      console.error("ID do usuário inválido");
      return [];
    }

    try {
      const tasks = await this.loadTasks(userId);
      return tasks.filter(task => task.status === status);
    } catch (err) {
      console.error("Erro ao buscar tarefas por status:", err);
      return [];
    }
  },

  /**
   * Obter tarefas filtradas por categoria
   * @param userId ID do usuário
   * @param category Categoria da tarefa
   * @returns Lista de tarefas filtradas
   */
  async getTasksByCategory(userId: string, category: string): Promise<Task[]> {
    if (!userId) {
      console.error("ID do usuário inválido");
      return [];
    }

    try {
      const tasks = await this.loadTasks(userId);
      return tasks.filter(task => task.category === category);
    } catch (err) {
      console.error("Erro ao buscar tarefas por categoria:", err);
      return [];
    }
  },

// Constante para armazenamento local de tarefas
  TASKS_STORAGE_KEY: "user_tasks",

// Inicializar storage local para tarefas
  initTasksLocalStorage: () => {
    if (!localStorage.getItem(taskService.TASKS_STORAGE_KEY)) {
      localStorage.setItem(taskService.TASKS_STORAGE_KEY, JSON.stringify([]));
      console.log("Armazenamento local de tarefas inicializado");
    }
  },

// Obter todas as tarefas do storage local
  getAllLocalTasks: (): Task[] => {
    try {
      const tasksJson = localStorage.getItem(taskService.TASKS_STORAGE_KEY);
      if (!tasksJson) {
        taskService.initTasksLocalStorage();
        return [];
      }
      return JSON.parse(tasksJson);
    } catch (error) {
      console.error("Erro ao obter tarefas do armazenamento local:", error);
      return [];
    }
  },

// Salvar todas as tarefas no armazenamento local
  saveTasksLocally2: (tasks: Task[]) => {
    try {
      localStorage.setItem(taskService.TASKS_STORAGE_KEY, JSON.stringify(tasks));
      return true;
    } catch (error) {
      console.error("Erro ao salvar tarefas localmente:", error);
      return false;
    }
  },
// Função para salvar tarefa no banco de dados
  saveTask: async (task: Task): Promise<Task | null> => {
    try {
      console.log("Tentando salvar tarefa:", task);

      if (!task.userId) {
        console.error("userId é obrigatório");
        return null;
      }

      // Atualiza o status da tarefa se estiver atrasada
      if (task.dueDate) {
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        if (dueDate < now && task.status === 'a-fazer') {
          task.status = 'atrasado';
        }
      }

      // Garantir que a tarefa tenha um ID único
      if (!task.id) {
        task.id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Atualiza os campos de data se não existirem
      if (!task.createdAt) {
        task.createdAt = new Date().toISOString();
      }
      task.updatedAt = new Date().toISOString();

      try {
        // Tenta salvar no Supabase
        const { data, error } = await supabase
          .from('user_tasks')
          .insert({
            id: task.id,
            user_id: task.userId,
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            due_date: task.dueDate || null,
            created_at: task.createdAt,
            updated_at: task.updatedAt,
            category: task.category || 'geral',
            tags: task.tags || []
          })
          .select()
          .single();

        if (error) {
          console.error("Erro ao salvar tarefa no Supabase:", error);
          // Se falhar, salvamos localmente e retornamos a tarefa
          taskService.saveTaskLocally(task);
          return task;
        }

        console.log("Tarefa salva com sucesso no Supabase:", data);
        return {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          description: data.description,
          status: data.status as TaskStatus,
          priority: data.priority as TaskPriority,
          dueDate: data.due_date,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          category: data.category,
          tags: data.tags
        };
      } catch (supabaseError) {
        console.error("Erro ao salvar tarefa no Supabase:", supabaseError);
        // Fallback para armazenamento local
        taskService.saveTaskLocally(task);
        return task;
      }
    } catch (error) {
      console.error("Erro geral ao salvar tarefa:", error);
      // Último recurso: tenta salvar localmente mesmo em caso de erro geral
      try {
        taskService.saveTaskLocally(task);
        return task;
      } catch {
        return null;
      }
    }
  },

// Função para salvar tarefa localmente
  saveTaskLocally: (task: Task): Task => {
    const allTasks = taskService.getAllLocalTasks();

    // Remover qualquer versão anterior da mesma tarefa
    const filteredTasks = allTasks.filter(t => t.id !== task.id);

    // Adicionar a nova versão da tarefa
    filteredTasks.push(task);

    // Salvar no localStorage
    taskService.saveTasksLocally2(filteredTasks);

    console.log("Tarefa salva localmente:", task.id);
    return task;
  },
// Função para obter tarefas do usuário
  getUserTasks: async (userId: string): Promise<Task[]> => {
    try {
      console.log("Buscando tarefas para o usuário:", userId);

      if (!userId) {
        console.error("userId é obrigatório");
        return [];
      }

      // Inicializar o armazenamento local se necessário
      taskService.initTasksLocalStorage();

      // Buscar tarefas do Supabase
      let dbTasks: Task[] = [];
      try {
        const { data, error } = await supabase
          .from('user_tasks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Erro ao buscar tarefas do Supabase:", error);
        } else {
          console.log(`${data.length} tarefas encontradas no Supabase para o usuário ${userId}`);

          // Mapear os dados do banco para o formato das tarefas
          dbTasks = data.map(item => ({
            id: item.id,
            userId: item.user_id,
            title: item.title,
            description: item.description,
            status: item.status as TaskStatus,
            priority: item.priority as TaskPriority,
            dueDate: item.due_date,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            category: item.category,
            tags: item.tags
          }));
        }
      } catch (supabaseError) {
        console.error("Erro ao acessar Supabase:", supabaseError);
      }

      // Buscar tarefas do localStorage
      const localTasks = taskService.getAllLocalTasks().filter(task => task.userId === userId);
      console.log(`${localTasks.length} tarefas encontradas no localStorage para o usuário ${userId}`);

      // Combinar tarefas do banco e do localStorage (sem duplicatas)
      const allTaskIds = new Set(dbTasks.map(task => task.id));

      // Adicionar apenas tarefas locais que não existem no banco
      const uniqueLocalTasks = localTasks.filter(task => !allTaskIds.has(task.id));

      // Combinar os dois conjuntos de tarefas
      const allTasks = [...dbTasks, ...uniqueLocalTasks];

      // Ordenar por data de criação (mais recente primeiro)
      allTasks.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      console.log(`Total de ${allTasks.length} tarefas combinadas para o usuário ${userId}`);
      return allTasks;
    } catch (error) {
      console.error("Erro geral ao buscar tarefas:", error);

      // Em caso de erro geral, tenta retornar pelo menos as tarefas locais
      try {
        const localTasks = taskService.getAllLocalTasks().filter(task => task.userId === userId);
        console.log(`Fallback: retornando ${localTasks.length} tarefas do localStorage`);
        return localTasks;
      } catch {
        return [];
      }
    }
  }
};