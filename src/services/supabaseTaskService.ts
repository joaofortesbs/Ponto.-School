import { query } from '@/lib/supabase';

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
  async buscarTarefas(userId?: string): Promise<TarefaSupabase[]> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('Usuário não autenticado');
      }

      const result = await query(`
        SELECT id, user_id, titulo, descricao, status, data_criacao, data_atualizacao
        FROM tarefas
        WHERE user_id = $1
        ORDER BY data_criacao DESC
      `, [currentUserId]);

      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      throw error;
    }
  },

  async criarTarefa(titulo: string, descricao?: string, userId?: string): Promise<TarefaSupabase | null> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('Usuário não autenticado');
      }

      const result = await query(`
        INSERT INTO tarefas (user_id, titulo, descricao, status, data_criacao, data_atualizacao)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, user_id, titulo, descricao, status, data_criacao, data_atualizacao
      `, [currentUserId, titulo, descricao || '', false]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  },

  async atualizarTarefa(id: string, updates: Partial<TarefaSupabase>): Promise<TarefaSupabase | null> {
    try {
      const setFields = [];
      const values = [];
      let paramCount = 1;

      if (updates.titulo !== undefined) {
        setFields.push(`titulo = $${paramCount++}`);
        values.push(updates.titulo);
      }
      if (updates.descricao !== undefined) {
        setFields.push(`descricao = $${paramCount++}`);
        values.push(updates.descricao);
      }
      if (updates.status !== undefined) {
        setFields.push(`status = $${paramCount++}`);
        values.push(updates.status);
      }

      if (setFields.length === 0) {
        throw new Error('Nenhum campo para atualizar');
      }

      setFields.push(`data_atualizacao = NOW()`);
      values.push(id);

      const result = await query(`
        UPDATE tarefas
        SET ${setFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, user_id, titulo, descricao, status, data_criacao, data_atualizacao
      `, values);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  },

  async deletarTarefa(id: string): Promise<boolean> {
    try {
      const result = await query(`
        DELETE FROM tarefas
        WHERE id = $1
        RETURNING id
      `, [id]);

      return result.rows.length > 0;
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      throw error;
    }
  },

  getCurrentUserId(): string | null {
    // Implementar lógica de sessão
    return localStorage.getItem('currentUserId');
  }
};