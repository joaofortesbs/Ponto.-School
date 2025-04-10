import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/user-profile";
import crypto from 'crypto';

export const profileService = {
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      // Tentar buscar usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.warn("Usuário não autenticado, retornando perfil mock");
        return this.getMockProfile();
      }

      // Tentar buscar perfil do usuário
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        return this.getMockProfile();
      }

      return data as UserProfile;
    } catch (error) {
      console.error("Erro inesperado ao buscar perfil:", error);
      return this.getMockProfile();
    }
  },

  // Perfil padrão para quando não conseguir buscar do banco
  getMockProfile(): UserProfile {
    const userId = crypto.randomUUID().substring(0, 8).toUpperCase();
    return {
      id: crypto.randomUUID(),
      user_id: `USR${userId}`,
      full_name: "Usuário Demonstração",
      display_name: "Usuário",
      email: "usuario@example.com",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
      level: 15,
      plan_type: "lite",
      coins: 0, //Adding coins to meet UserProfile type
      rank: "Aprendiz", //Adding rank to meet UserProfile type
      created_at: new Date().toISOString() //Adding created_at to meet UserProfile type

    };
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<{ success: boolean; error?: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: "Usuário não autenticado" };
      }

      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", user.id);

      return { success: !error, error };
    } catch (error) {
      return { success: false, error };
    }
  }
};

export default profileService;