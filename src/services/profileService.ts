
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types/user-profile";

export const profileService = {
  async getCurrentUserProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("getCurrentUserProfile: Usuário não autenticado");
        return null;
      }

      console.log("getCurrentUserProfile: Buscando perfil para usuário", user.id);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("getCurrentUserProfile: Erro ao buscar perfil:", error);
        
        // Se o perfil não for encontrado, tente criá-lo
        if (error.code === 'PGRST116') {
          console.log("getCurrentUserProfile: Perfil não encontrado, tentando criar...");
          const { data: newProfileData, error: createError } = await this.createProfileIfNotExists();
          
          if (createError) {
            console.error("getCurrentUserProfile: Erro ao criar perfil:", createError);
            return null;
          }
          
          return newProfileData as UserProfile;
        }
        
        return null;
      }

      console.log("getCurrentUserProfile: Perfil encontrado:", data);
      return data as UserProfile;
    } catch (err) {
      console.error("getCurrentUserProfile: Erro inesperado:", err);
      return null;
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
    console.log("createProfileIfNotExists: Iniciando verificação de perfil");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("createProfileIfNotExists: Usuário não autenticado");
        return { error: "Not authenticated", data: null };
      }

      console.log("createProfileIfNotExists: Verificando perfil existente para usuário", user.id);
      
      // Check if profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("createProfileIfNotExists: Erro ao verificar perfil existente:", profileError);
        return { data: null, error: profileError };
      }

      if (existingProfile) {
        console.log("createProfileIfNotExists: Perfil já existe:", existingProfile);
        return { data: existingProfile, error: null };
      }

      console.log("createProfileIfNotExists: Criando novo perfil para usuário", user.id);
      
      // Create profile if it doesn't exist
      try {
        const { data, error } = await supabase
          .from("profiles")
          .insert([
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || "",
              username: user.user_metadata?.username || user.email?.split('@')[0] || "",
              display_name:
                user.user_metadata?.display_name ||
                user.user_metadata?.username ||
                user.user_metadata?.full_name ||
                user.email?.split('@')[0] ||
                "Usuário",
              level: 1,
              rank: "Aprendiz",
              balance: 150,
              expert_balance: 320,
              bio: "Olá! Sou estudante de Engenharia de Software na Universidade de São Paulo. Apaixonado por tecnologia, programação e matemática.",
            },
          ])
          .select();

        if (error) {
          console.error("createProfileIfNotExists: Erro ao criar perfil:", error);
          
          // Tentar atualizar se o erro for de duplicidade (pode acontecer em condições de corrida)
          if (error.code === '23505') { // Código para violação de chave única
            console.log("createProfileIfNotExists: Perfil já existe, tentando buscar...");
            const { data: existingData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();
              
            return { data: existingData, error: null };
          }
          return { data: null, error };
        }

        console.log("createProfileIfNotExists: Perfil criado com sucesso:", data);
        return { data, error: null };
      } catch (err) {
        console.error("createProfileIfNotExists: Erro ao criar perfil:", err);
        return { data: null, error: err as any };
      }
    } catch (err) {
      console.error("createProfileIfNotExists: Erro inesperado:", err);
      return { data: null, error: err as any };
    }
  },

  async getUserDisplayName() {
    try {
      console.log("getUserDisplayName: Obtendo nome de exibição");
      const profile = await this.getCurrentUserProfile();
      
      if (!profile) {
        console.log("getUserDisplayName: Perfil não encontrado, usando nome padrão");
        return "Usuário";
      }
      
      const displayName = profile?.display_name || profile?.username || profile?.full_name || "Usuário";
      console.log("getUserDisplayName: Nome de exibição obtido:", displayName);
      return displayName;
    } catch (err) {
      console.error("getUserDisplayName: Erro ao obter nome de exibição:", err);
      return "Usuário";
    }
  }
};
