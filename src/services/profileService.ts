
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types/user-profile";
import { generateSimpleUserId } from "@/lib/generate-user-id";

// Função para obter o perfil do usuário atual
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    // Primeiro, obter a sessão atual para pegar o ID do usuário
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("Nenhuma sessão ativa encontrada");
      return null;
    }

    const userId = session.user.id;

    // Buscar o perfil do usuário no banco de dados
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Erro ao buscar perfil:", error);
      
      // Criar um perfil fictício para desenvolvimento se o perfil real não for encontrado
      const fallbackProfile: UserProfile = {
        id: userId,
        user_id: generateSimpleUserId("BR", 1),
        username: "usuario_temporario",
        full_name: "Usuário Temporário",
        display_name: "Usuário da Plataforma",
        bio: "Este é um perfil temporário.",
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        email: session.user.email || "usuario@exemplo.com",
        phone: "",
        website: "",
        status: "active",
        country: "Brasil",
        state: "SP",
        city: "São Paulo",
        address: "",
        postal_code: "",
        language: "pt-BR",
        timezone: "America/Sao_Paulo",
        role: "student",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        plan_type: "premium",
        school_points: 500,
        interests: ["matemática", "ciência", "tecnologia"],
        achievements: [],
        social_links: {},
      };
      
      return fallbackProfile;
    }

    // Transformar dados para o formato UserProfile
    const userProfile: UserProfile = {
      id: data.id,
      user_id: data.user_id || generateSimpleUserId("BR", 1),
      username: data.username || data.email?.split('@')[0] || "usuario",
      full_name: data.full_name || "",
      display_name: data.display_name || data.full_name || data.username || "Usuário",
      bio: data.bio || "",
      avatar_url: data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.id}`,
      email: data.email || session.user.email || "",
      phone: data.phone || "",
      website: data.website || "",
      status: data.status || "active",
      country: data.country || "Brasil",
      state: data.state || "",
      city: data.city || "",
      address: data.address || "",
      postal_code: data.postal_code || "",
      language: data.language || "pt-BR",
      timezone: data.timezone || "America/Sao_Paulo",
      role: data.role || "student",
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      last_login: data.last_login || new Date().toISOString(),
      plan_type: data.plan_type || "premium",
      school_points: data.school_points || 500,
      interests: data.interests || [],
      achievements: data.achievements || [],
      social_links: data.social_links || {},
    };

    return userProfile;
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    return null;
  }
}

// Serviço principal que contém métodos para gerenciar perfis de usuários
export const profileService = {
  getCurrentUserProfile,
  
  // Método para atualizar o perfil do usuário
  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Usuário não autenticado");
      }
      
      const userId = session.user.id;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();
        
      if (error) {
        console.error("Erro ao atualizar perfil:", error);
        return null;
      }
      
      return data as UserProfile;
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      return null;
    }
  },
  
  // Método para obter perfil por ID de usuário
  async getUserProfileById(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Erro ao buscar perfil por ID:", error);
        return null;
      }
      
      return data as UserProfile;
    } catch (error) {
      console.error("Erro ao buscar perfil por ID:", error);
      return null;
    }
  }
};
