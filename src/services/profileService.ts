
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types/user-profile";

export const profileService = {
  async getCurrentUserProfile() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error getting authenticated user:", userError);
        return null;
      }

      if (!user) return null;

      // Add a timeout for profile fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        clearTimeout(timeoutId);

        if (error) {
          console.error("Error fetching profile:", error);
          return null;
        }

        return data as UserProfile;
      } catch (fetchError) {
        console.error("Profile fetch failed or timed out:", fetchError);
        return null;
      }
    } catch (err) {
      console.error("Unexpected error in getCurrentUserProfile:", err);
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (existingProfile) return { data: existingProfile, error: null };

    // Create profile if it doesn't exist
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
        },
      ])
      .select();

    return { data, error };
  },

  async getUserDisplayName() {
    try {
      // Primeiro, tente obter o perfil da API normalmente
      const profile = await this.getCurrentUserProfile();
      
      if (profile) {
        // Armazenar em cache local para uso offline
        try {
          localStorage.setItem('cachedUserDisplayName', profile.display_name || profile.username || profile.full_name || "Usuário");
        } catch (err) {
          console.warn("Não foi possível armazenar nome em cache:", err);
        }
        
        return profile.display_name || profile.username || profile.full_name || "Usuário";
      }
      
      // Se o perfil não estiver disponível, tente obter do cache
      const cachedName = localStorage.getItem('cachedUserDisplayName');
      if (cachedName) {
        return cachedName;
      }
      
      // Tente obter do perfil temporário salvo
      try {
        const tempProfile = localStorage.getItem('tempUserProfile');
        if (tempProfile) {
          const profile = JSON.parse(tempProfile);
          return profile.display_name || profile.username || profile.full_name || "Usuário";
        }
        
        // Verificar perfil atual no modo offline
        const currentProfile = localStorage.getItem('currentUserProfile');
        if (currentProfile) {
          const profile = JSON.parse(currentProfile);
          return profile.display_name || profile.username || profile.full_name || "Usuário";
        }
      } catch (parseErr) {
        console.warn("Erro ao analisar perfil local:", parseErr);
      }
      
      // Retornar valor padrão se todas as opções falharem
      return "Usuário";
    } catch (err) {
      console.error("Erro ao obter nome do usuário:", err);
      return "Usuário";
    }
  },
  
  async isOfflineMode() {
    return localStorage.getItem('isOfflineMode') === 'true';
  }
};
