
import { supabase } from "@/integrations/supabase/client";

export interface TarefaSupabase {
  id: string;
  user_id: string;
  titulo: string;
  descricao?: string;
  status: boolean;
  data_criacao: string;
  data_atualizacao: string;
}

export const supabaseTaskService = {
  // Buscar todas as tarefas do usuário atual
  async buscarTarefas(): Promise<TarefaSupabase[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('Usuário não autenticado');
        return [];
      }

      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .eq('user_id', user.id)
        .order('data_criacao', { ascending: false });

      if (error) {
        console.error('Erro ao buscar tarefas:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      return [];
    }
  },

  // Criar nova tarefa
  async criarTarefa(titulo: string, descricao?: string): Promise<TarefaSupabase | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('Usuário não autenticado');
        return null;
      }

      const { data, error } = await supabase
        .from('tarefas')
        .insert({
          user_id: user.id,
          titulo,
          descricao: descricao || '',
          status: false
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar tarefa:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      return null;
    }
  },

  // Atualizar tarefa
  async atualizarTarefa(id: string, updates: Partial<Pick<TarefaSupabase, 'titulo' | 'descricao' | 'status'>>): Promise<TarefaSupabase | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('Usuário não autenticado');
        return null;
      }

      const { data, error } = await supabase
        .from('tarefas')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar tarefa:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      return null;
    }
  },

  // Deletar tarefa
  async deletarTarefa(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('Usuário não autenticado');
        return false;
      }

      const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar tarefa:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      return false;
    }
  }
};
