import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/user-profile";

/**
 * Serviço para operações relacionadas ao perfil do usuário
 */
export const profileService = {
  /**
   * Recupera o perfil do usuário atual do servidor
   */
  getCurrentUserProfile: async (): Promise<{
    profile: UserProfile | null;
    error: Error | null;
  }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { profile: null, error: new Error("Usuário não autenticado") };
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        return { profile: null, error: new Error(error.message) };
      }

      if (!data) {
        return { profile: null, error: null };
      }

      // Garantir que level e rank tenham valores padrão se não estiverem presentes
      const profile = {
        ...(data as unknown as UserProfile),
        level: data.level || 1,
        rank: data.rank || "Aprendiz",
      };

      return { profile, error: null };
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      return { 
        profile: null, 
        error: error instanceof Error ? error : new Error("Erro desconhecido ao buscar perfil") 
      };
    }
  },

  /**
   * Salva o perfil no cache (localStorage)
   */
  saveProfileToCache: (profile: UserProfile): void => {
    try {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (error) {
      console.error('Erro ao salvar perfil no cache:', error);
    }
  },

  /**
   * Recupera o perfil do cache (localStorage)
   */
  getProfileFromCache: async (): Promise<UserProfile | null> => {
    try {
      const cachedProfile = localStorage.getItem('userProfile');
      if (cachedProfile) {
        return JSON.parse(cachedProfile) as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Erro ao recuperar perfil do cache:', error);
      return null;
    }
  },

  /**
   * Atualiza informações do perfil do usuário
   */
  updateUserProfile: async (profileData: Partial<UserProfile>): Promise<{
    success: boolean;
    error: Error | null;
  }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: new Error("Usuário não autenticado") };
      }

      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user.id);

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error("Erro desconhecido ao atualizar perfil") 
      };
    }
  }
};