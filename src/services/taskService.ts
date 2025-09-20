
// Serviço de tarefas usando API endpoints com Neon PostgreSQL

const API_BASE_URL = '/api';

export interface Task {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string | null;
  status: boolean;
  data_criacao: string;
  data_atualizacao: string;
}

export interface TaskForUI {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Utilitário para fazer requisições
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Converter tarefa do banco para formato da UI
const convertToUIFormat = (task: Task): TaskForUI => ({
  id: task.id,
  title: task.titulo,
  description: task.descricao || undefined,
  completed: task.status,
  createdAt: task.data_criacao,
  updatedAt: task.data_atualizacao
});

// Converter tarefa da UI para formato do banco
const convertFromUIFormat = (task: Partial<TaskForUI>): Partial<Task> => ({
  titulo: task.title,
  descricao: task.description || null,
  status: task.completed
});

export const taskService = {
  // Buscar todas as tarefas do usuário
  async getTasks(): Promise<TaskForUI[]> {
    try {
      const response = await apiRequest('/tasks');
      return response.tasks.map(convertToUIFormat);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      return [];
    }
  },

  // Criar nova tarefa
  async createTask(title: string, description?: string): Promise<TaskForUI | null> {
    try {
      const response = await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, description }),
      });
      return convertToUIFormat(response.task);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      return null;
    }
  },

  // Atualizar tarefa
  async updateTask(id: string, updates: Partial<TaskForUI>): Promise<TaskForUI | null> {
    try {
      const taskUpdates = convertFromUIFormat(updates);
      const response = await apiRequest(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(taskUpdates),
      });
      return convertToUIFormat(response.task);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      return null;
    }
  },

  // Deletar tarefa
  async deleteTask(id: string): Promise<boolean> {
    try {
      await apiRequest(`/tasks/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      return false;
    }
  },

  // Alternar status de conclusão
  async toggleTaskCompletion(id: string): Promise<TaskForUI | null> {
    try {
      const response = await apiRequest(`/tasks/${id}/toggle`, {
        method: 'PUT',
      });
      return convertToUIFormat(response.task);
    } catch (error) {
      console.error('Erro ao alternar status da tarefa:', error);
      return null;
    }
  },
};

export default taskService;
