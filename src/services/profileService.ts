import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/user-profile";

export const profileService = {
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      console.log("Buscando perfil do usuário...");
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log("getCurrentUserProfile: Usuário não autenticado");
        // Criar usuário mock para desenvolvimento
        return {
          id: "mock-user-id",
          user_id: "mock-user-id",
          username: "usuario_teste",
          display_name: "Usuário Teste",
          email: "usuario@teste.com",
          full_name: "Usuário de Teste",
          level: 1,
          rank: "Aprendiz",
          plan_type: "premium",
          coins: 100,
          created_at: new Date().toISOString()
        } as UserProfile;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.warn("Erro ao buscar perfil, criando mock:", error);
        // Criar usuário mock para desenvolvimento
        return {
          id: user.id,
          user_id: user.id,
          username: user.email?.split('@')[0] || "usuario",
          display_name: user.user_metadata?.name || "Usuário",
          email: user.email || "usuario@teste.com",
          full_name: user.user_metadata?.name || "Usuário",
          level: 1,
          rank: "Aprendiz",
          plan_type: "premium",
          coins: 100,
          created_at: new Date().toISOString()
        } as UserProfile;
      }

      return data as UserProfile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Retornar um perfil mock mesmo em caso de erro
      return {
        id: "error-user-id",
        user_id: "error-user-id",
        username: "usuario_fallback",
        display_name: "Usuário",
        email: "usuario@fallback.com",
        full_name: "Usuário Fallback",
        level: 1,
        rank: "Aprendiz",
        plan_type: "premium",
        coins: 100,
        created_at: new Date().toISOString()
      } as UserProfile;
    }
  },

  async getUserDisplayName(): Promise<string> {
    try {
      console.log("getUserDisplayName: Obtendo nome de exibição");
      const profile = await this.getCurrentUserProfile();

      if (!profile || !profile.display_name) {
        console.log("getUserDisplayName: Perfil não encontrado, usando nome padrão");
        return "Usuário";
      }

      return profile.display_name;
    } catch (error) {
      console.error("Error getting user display name:", error);
      return "Usuário";
    }
  },
  async updateProfile(profile: Partial<UserProfile>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const { data, error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id);

    return { data, error };
  },

  async updateDisplayName(displayName: string) {
    return this.updateProfile({ display_name: displayName });
  },

  async createProfileIfNotExists() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Erro ao verificar perfil existente:", profileError);
      return { data: null, error: profileError };
    }

    if (existingProfile) return { data: existingProfile, error: null };

    // Create profile if it doesn't exist
    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert([
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || "",
            username: user.user_metadata?.username || "",
            display_name:
              user.user_metadata?.display_name ||
              user.user_metadata?.username ||
              user.user_metadata?.full_name ||
              user.email,
            level: 1,
            rank: "Aprendiz",
            balance: 150,
            expert_balance: 320,
          },
        ])
        .select();

      if (error) {
        console.error("Erro ao criar perfil:", error);

        // Tentar atualizar se o erro for de duplicidade (pode acontecer em condições de corrida)
        if (error.code === '23505') { // Código para violação de chave única
          console.log("Perfil já existe, tentando buscar...");
          const { data: existingData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          return { data: existingData, error: null };
        }
      }

      return { data, error };
    } catch (err) {
      console.error("Erro ao criar perfil:", err);
      return { data: null, error: err as any };
    }
  }
};