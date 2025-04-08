
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
      // Verificar primeiro o perfil do usuário atual (mais recente)
      const currentProfile = localStorage.getItem('currentUserProfile');
      if (currentProfile) {
        try {
          const profile = JSON.parse(currentProfile);
          const displayName = profile.display_name || profile.username || profile.full_name || "Usuário";
          
          // Atualizar o cache para futuras consultas
          localStorage.setItem('cachedUserDisplayName', displayName);
          
          return displayName;
        } catch (parseErr) {
          console.warn("Erro ao analisar perfil atual:", parseErr);
        }
      }
      
      // Verificar se estamos em modo offline
      if (localStorage.getItem('isOfflineMode') === 'true') {
        console.log("Modo offline ativo, usando dados locais");
        
        // Tentar obter do cache direto para ser mais rápido
        const cachedName = localStorage.getItem('cachedUserDisplayName');
        if (cachedName) {
          return cachedName;
        }
        
        // Tente obter do perfil temporário salvo
        const tempProfile = localStorage.getItem('tempUserProfile');
        if (tempProfile) {
          try {
            const profile = JSON.parse(tempProfile);
            const displayName = profile.display_name || profile.username || profile.full_name || "Usuário";
            
            // Atualizar o cache para futuras consultas
            localStorage.setItem('cachedUserDisplayName', displayName);
            
            return displayName;
          } catch (parseErr) {
            console.warn("Erro ao analisar perfil temporário:", parseErr);
          }
        }
        
        // Se ainda não encontrou, buscar na lista de perfis
        try {
          const localProfiles = localStorage.getItem('tempUserProfiles');
          if (localProfiles) {
            const profiles = JSON.parse(localProfiles);
            // Pegar o primeiro perfil (normalmente seria o do usuário logado)
            if (profiles.length > 0) {
              const profile = profiles[0];
              const displayName = profile.display_name || profile.username || profile.full_name || "Usuário";
              localStorage.setItem('cachedUserDisplayName', displayName);
              return displayName;
            }
          }
        } catch (err) {
          console.warn("Erro ao buscar nos perfis salvos:", err);
        }
        
        return "Usuário";
      }
      
      // Se não estamos em modo offline, tentar obter o perfil da API
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Tentar obter o perfil do banco de dados
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          
          if (data && !error) {
            const displayName = data.display_name || data.username || data.full_name || "Usuário";
            localStorage.setItem('cachedUserDisplayName', displayName);
            
            // Atualizar o perfil atual também
            localStorage.setItem('currentUserProfile', JSON.stringify(data));
            return displayName;
          }
          
          // Se não encontrou o perfil, usar os metadados do usuário
          if (user.user_metadata) {
            const displayName = 
              user.user_metadata.display_name || 
              user.user_metadata.username || 
              user.user_metadata.full_name || 
              user.email || 
              "Usuário";
            
            localStorage.setItem('cachedUserDisplayName', displayName);
            return displayName;
          }
          
          // Último recurso, usar email
          if (user.email) {
            const displayName = user.email.split('@')[0];
            localStorage.setItem('cachedUserDisplayName', displayName);
            return displayName;
          }
        }
      } catch (apiErr) {
        console.warn("Erro ao obter perfil da API:", apiErr);
      }
      
      // Se o perfil não estiver disponível, tente obter do cache
      const cachedName = localStorage.getItem('cachedUserDisplayName');
      if (cachedName) {
        return cachedName;
      }
      
      // Último recurso, retornar valor padrão
      return "Usuário";
    } catch (err) {
      console.error("Erro ao obter nome do usuário:", err);
      
      // Em caso de erro, tentar o cache
      const cachedName = localStorage.getItem('cachedUserDisplayName');
      if (cachedName) return cachedName;
      
      return "Usuário";
    }
  },
  
  // Método para sincronizar dados locais com o Supabase quando a conexão for restaurada
  async syncLocalDataWithSupabase() {
    if (localStorage.getItem('isOfflineMode') !== 'true') {
      // Não estamos no modo offline, não é necessário sincronizar
      return;
    }
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Erro ao obter usuário autenticado para sincronização:", userError);
        return;
      }
      
      // Obter perfil do armazenamento local
      const currentProfile = localStorage.getItem('currentUserProfile');
      if (!currentProfile) {
        console.log("Nenhum perfil local para sincronizar");
        return;
      }
      
      // Analisar perfil local
      const localProfile = JSON.parse(currentProfile);
      
      // Verificar se o perfil existe no Supabase
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Erro ao verificar perfil existente:", profileError);
        return;
      }
      
      if (existingProfile) {
        // Atualizar perfil existente
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            full_name: localProfile.full_name,
            username: localProfile.username,
            display_name: localProfile.display_name,
            level: localProfile.level || 1,
            rank: localProfile.rank || "Aprendiz",
            coins: localProfile.coins || 100,
            // Não atualizar campos sensíveis como email
          })
          .eq("id", user.id);
        
        if (updateError) {
          console.error("Erro ao atualizar perfil:", updateError);
          return;
        }
        
        console.log("Perfil sincronizado com sucesso");
      } else {
        // Criar perfil
        const { error: insertError } = await supabase
          .from("profiles")
          .insert([{
            id: user.id,
            user_id: localProfile.user_id || `user-${Date.now()}`,
            email: user.email,
            full_name: localProfile.full_name,
            username: localProfile.username,
            display_name: localProfile.display_name,
            level: localProfile.level || 1,
            rank: localProfile.rank || "Aprendiz",
            coins: localProfile.coins || 100,
          }]);
        
        if (insertError) {
          console.error("Erro ao criar perfil:", insertError);
          return;
        }
        
        console.log("Perfil criado com sucesso a partir dos dados locais");
      }
      
      // Limpar flag de modo offline
      localStorage.removeItem('isOfflineMode');
    } catch (err) {
      console.error("Erro ao sincronizar dados locais:", err);
    }
  },
  
  async isOfflineMode() {
    return localStorage.getItem('isOfflineMode') === 'true';
  }
};
