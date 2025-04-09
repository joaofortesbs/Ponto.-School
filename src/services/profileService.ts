
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
        
        // Se não for erro de "não encontrado", retorne o erro
        if (profileError.code !== 'PGRST116') {
          return { data: null, error: profileError };
        }
      }

      if (existingProfile) {
        console.log("createProfileIfNotExists: Perfil já existe:", existingProfile);
        return { data: existingProfile, error: null };
      }

      console.log("createProfileIfNotExists: Criando novo perfil para usuário", user.id);
      
      // Prepare profile data
      const profileData = {
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
      };
      
      console.log("createProfileIfNotExists: Dados do perfil a serem inseridos:", profileData);
      
      // Try to create the profile
      const { data: insertData, error: insertError } = await supabase
        .from("profiles")
        .insert([profileData])
        .select();

      if (insertError) {
        console.error("createProfileIfNotExists: Erro ao criar perfil:", insertError);
        
        // If error is due to unique constraint violation, profile likely exists already
        if (insertError.code === '23505') { // Unique constraint violation
          console.log("createProfileIfNotExists: Perfil já existe (chave duplicada), tentando buscar...");
          const { data: existingData, error: fetchError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
            
          if (fetchError) {
            console.error("createProfileIfNotExists: Erro ao buscar perfil existente:", fetchError);
            return { data: null, error: fetchError };
          }
          
          return { data: existingData, error: null };
        }
        
        // Try upsert as fallback
        console.log("createProfileIfNotExists: Tentando upsert como fallback...");
        const { data: upsertData, error: upsertError } = await supabase
          .from("profiles")
          .upsert([profileData], { onConflict: 'id' })
          .select();
          
        if (upsertError) {
          console.error("createProfileIfNotExists: Erro no upsert:", upsertError);
          return { data: null, error: upsertError };
        }
        
        return { data: upsertData, error: null };
      }

      if (insertData && insertData.length > 0) {
        console.log("createProfileIfNotExists: Perfil criado com sucesso:", insertData[0]);
        return { data: insertData[0], error: null };
      } else {
        console.error("createProfileIfNotExists: Inserção retornou resultado vazio");
        
        // Try to fetch the profile as a fallback
        const { data: checkData, error: checkError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (checkError) {
          console.error("createProfileIfNotExists: Erro ao verificar perfil após inserção:", checkError);
          return { data: null, error: checkError };
        }
        
        return { data: checkData, error: null };
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
