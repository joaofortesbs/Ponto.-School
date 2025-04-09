
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types/user-profile";

export const profileService = {
  async getCurrentUserProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data as UserProfile;
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
  },

  async getUserDisplayName() {
    const profile = await this.getCurrentUserProfile();
    return profile?.display_name || profile?.username || profile?.full_name || "Usuário";
  }
};
