
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/user-profile";

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

      return {
        id: data.id || crypto.randomUUID(),
        user_id: data.user_id || `USR${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        full_name: data.full_name || "Usuário Demonstração",
        display_name: data.display_name || "Usuário",
        email: data.email || "usuario@exemplo.com",
        avatar_url: data.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
        level: data.level || 1,
        plan_type: data.plan_type || "lite",
        website: data.website,
        bio: data.bio,
        created_at: data.created_at,
        updated_at: data.updated_at,
        skills: data.skills,
        interests: data.interests,
        education: data.education,
        contact_info: data.contact_info
      };
    } catch (error) {
      console.error("Erro inesperado ao buscar perfil:", error);
      return this.getMockProfile();
    }
  },

  // Perfil padrão para quando não conseguir buscar do banco
  getMockProfile(): UserProfile {
    const userId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return {
      id: crypto.randomUUID(),
      user_id: `USR${userId}`,
      full_name: "Usuário Demonstração",
      display_name: "Usuário",
      email: "usuario@exemplo.com",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
      level: 15,
      plan_type: "lite"
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
