
import { supabase } from "@/lib/supabase";

/**
 * Serviço para gerenciar operações relacionadas a turmas
 */
export const turmasService = {
  /**
   * Busca todas as turmas do usuário
   */
  getTurmas: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      const { data, error } = await supabase
        .from("turmas")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) {
        throw new Error(error.message);
      }
      
      return data || [];
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
      throw error;
    }
  },
  
  /**
   * Busca detalhes de uma turma específica
   */
  getTurmaDetails: async (turmaId: string) => {
    try {
      const { data, error } = await supabase
        .from("turmas")
        .select("*, professores(*), modulos(*), materiais(*)")
        .eq("id", turmaId)
        .single();
        
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar detalhes da turma ${turmaId}:`, error);
      throw error;
    }
  },
  
  /**
   * Busca grupos de estudo relacionados a uma disciplina
   */
  getGruposEstudo: async (disciplina?: string) => {
    try {
      let query = supabase.from("grupos_estudo").select("*");
      
      if (disciplina) {
        query = query.eq("disciplina", disciplina);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data || [];
    } catch (error) {
      console.error("Erro ao buscar grupos de estudo:", error);
      throw error;
    }
  },
  
  /**
   * Busca detalhes de um grupo específico
   */
  getGrupoDetails: async (grupoId: string) => {
    try {
      const { data, error } = await supabase
        .from("grupos_estudo")
        .select("*, membros(*), materiais(*), discussoes(*)")
        .eq("id", grupoId)
        .single();
        
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar detalhes do grupo ${grupoId}:`, error);
      throw error;
    }
  }
};
