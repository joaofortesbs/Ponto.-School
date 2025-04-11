
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/user-profile";

export const profileService = {
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      // Verificar se temos conexão com Supabase
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        console.warn("Sem conexão com Supabase, retornando perfil mock");
        return this.getMockProfile();
      }

      // Tentar buscar usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.warn("Usuário não autenticado ou erro de autenticação:", authError?.message);
        return this.getMockProfile();
      }

      // Tentar buscar perfil do usuário
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil:", error.message);
        return this.getMockProfile();
      }

      if (!data) {
        console.warn("Perfil não encontrado, retornando mock");
        return this.getMockProfile();
      }

      // Retornar perfil com valores padrão para campos ausentes
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
        contact_info: data.contact_info,
        phone: data.phone,
        location: data.location,
        birth_date: data.birth_date
      };
    } catch (error) {
      console.error("Erro inesperado ao buscar perfil:", error);
      return this.getMockProfile();
    }
  },

  // Verificar conexão com Supabase
  async checkConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      return !error;
    } catch (error) {
      console.error("Erro na verificação de conexão com Supabase:", error);
      return false;
    }
  },

  // Perfil padrão para quando não conseguir buscar do banco
  getMockProfile(): UserProfile {
    const userId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return {
      id: crypto.randomUUID(),
      user_id: `USR${userId}`,
      full_name: "Usuário Demonstração",
      display_name: "Usuário Demo",
      email: "usuario@exemplo.com",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
      level: 15,
      plan_type: "lite",
      bio: "Este é um perfil de demonstração criado automaticamente. Edite seu perfil para personalizar suas informações.",
      phone: "(11) 9xxxx-xxxx",
      location: "São Paulo, Brasil",
      birth_date: "01/01/2000"
    };
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<{ success: boolean; error?: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Erro de autenticação ao atualizar perfil:", authError?.message);
        return { success: false, error: "Usuário não autenticado" };
      }

      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", user.id);

      if (error) {
        console.error("Erro ao atualizar perfil:", error.message);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error("Erro inesperado ao atualizar perfil:", error);
      return { success: false, error };
    }
  }
};

export default profileService;
