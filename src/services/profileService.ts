
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/user-profile";
import { generateUserId } from "@/lib/generate-user-id";

export const profileService = {
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      // Tentar buscar usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.warn("Usuário não autenticado, retornando perfil mock");
        return this.getFullMockProfile();
      }

      // Tentar buscar perfil do usuário
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        return this.getFullMockProfile();
      }

      // Garantir que todos os campos essenciais estejam presentes
      return {
        id: data.id || crypto.randomUUID(),
        user_id: data.user_id || generateUserId(),
        full_name: data.full_name || "Usuário Demonstração",
        display_name: data.display_name || "Usuário",
        email: data.email || "usuario@exemplo.com",
        avatar_url: data.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
        level: data.level || 1,
        plan_type: data.plan_type || "lite",
        website: data.website || "",
        bio: data.bio || "Estudante utilizando a plataforma Epictus",
        created_at: data.created_at,
        updated_at: data.updated_at,
        skills: data.skills || ["Aprendizado", "Organização"],
        interests: data.interests || ["Educação", "Tecnologia"],
        education: data.education || [
          {
            institution: "Epictus Academy",
            degree: "Curso Online",
            years: "2024-Presente"
          }
        ],
        contact_info: data.contact_info || {
          phone: "",
          address: "",
          social: {
            twitter: "",
            linkedin: "",
            github: ""
          }
        },
        coins: data.coins || 100,
        rank: data.rank || "Iniciante"
      };
    } catch (error) {
      console.error("Erro inesperado ao buscar perfil:", error);
      return this.getFullMockProfile();
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
  
  // Perfil mock completo com todos os campos necessários
  getFullMockProfile(): UserProfile {
    const userId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return {
      id: crypto.randomUUID(),
      user_id: `USR${userId}`,
      full_name: "Usuário Demonstração",
      display_name: "Usuário",
      email: "usuario@exemplo.com",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
      level: 15,
      plan_type: "lite",
      bio: "Estudante utilizando a plataforma Epictus",
      website: "",
      skills: ["Aprendizado", "Organização"],
      interests: ["Educação", "Tecnologia"],
      education: [
        {
          institution: "Epictus Academy",
          degree: "Curso Online",
          years: "2024-Presente"
        }
      ],
      contact_info: {
        phone: "",
        address: "",
        social: {
          twitter: "",
          linkedin: "",
          github: ""
        }
      },
      coins: 100,
      rank: "Iniciante"
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
