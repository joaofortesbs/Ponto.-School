
// DEPRECATED: Este arquivo foi migrado para taskService.ts
// Use taskService em vez deste arquivo

console.warn('DEPRECATED: supabaseTaskService.ts is deprecated. Use taskService.ts instead.');

export interface TarefaSupabase {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string | null;
  status: boolean;
  data_criacao: string;
  data_atualizacao: string;
}

export const supabaseTaskService = {
  async buscarTarefas(): Promise<TarefaSupabase[]> {
    throw new Error('Use taskService.getTasks() instead');
  },

  async criarTarefa(): Promise<TarefaSupabase | null> {
    throw new Error('Use taskService.createTask() instead');
  },

  async atualizarTarefa(): Promise<TarefaSupabase | null> {
    throw new Error('Use taskService.updateTask() instead');
  },

  async deletarTarefa(): Promise<boolean> {
    throw new Error('Use taskService.deleteTask() instead');
  },

  getCurrentUserId(): string | null {
    throw new Error('Use auth.getUser() instead');
  }
};
