
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types/user-profile";
import { generateUserId, generateUserIdWithDB } from "@/lib/generate-user-id";

/**
 * Obtém o perfil do usuário atual
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.warn("Usuário não autenticado ao tentar obter perfil");
      return null;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', session.user.email)
      .single();
    
    if (error) {
      console.error("Erro ao buscar perfil:", error);
      return null;
    }
    
    console.log("getCurrentUserProfile: Perfil encontrado:", data);
    return data as UserProfile;
  } catch (error) {
    console.error("Erro ao obter perfil do usuário:", error);
    return null;
  }
}

/**
 * Obtém o perfil de um usuário específico por ID
 */
export async function getUserProfile(userId?: string): Promise<UserProfile | null> {
  try {
    // Se não houver userId, obtém o perfil do usuário atual
    if (!userId) {
      return getCurrentUserProfile();
    }
    
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
    console.error("Erro ao obter perfil do usuário por ID:", error);
    return null;
  }
}

/**
 * Obtém o nome de exibição do usuário
 */
export async function getUserDisplayName(userId?: string): Promise<string> {
  try {
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      console.warn("Perfil não encontrado para obter nome de exibição");
      return "Usuário";
    }
    
    // Ordem de prioridade: display_name -> full_name -> email -> "Usuário"
    const displayName = profile.display_name || profile.full_name || profile.email || "Usuário";
    console.log("getUserDisplayName: Nome de exibição obtido:", displayName);
    
    return displayName;
  } catch (error) {
    console.error("Erro ao obter nome de exibição:", error);
    return "Usuário";
  }
}

/**
 * Atualiza um campo específico do perfil do usuário
 */
export async function updateUserProfileField(
  field: string, 
  value: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { 
        success: false, 
        error: "Usuário não autenticado" 
      };
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('email', session.user.email);
    
    if (error) {
      console.error(`Erro ao atualizar campo ${field}:`, error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Erro ao atualizar campo ${field}:`, error);
    return { 
      success: false, 
      error: "Erro ao atualizar o perfil" 
    };
  }
}

/**
 * Atualiza múltiplos campos do perfil do usuário
 */
export async function updateUserProfile(
  profileData: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { 
        success: false, 
        error: "Usuário não autenticado" 
      };
    }
    
    // Adicionar updated_at automaticamente
    const dataToUpdate = {
      ...profileData,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('profiles')
      .update(dataToUpdate)
      .eq('email', session.user.email);
    
    if (error) {
      console.error("Erro ao atualizar perfil:", error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { 
      success: false, 
      error: "Erro ao atualizar o perfil" 
    };
  }
}

/**
 * Verifica se o usuário tem um ID gerado e cria um se necessário
 */
export async function ensureUserIdExists(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.warn("Usuário não autenticado ao tentar verificar ID");
      return null;
    }
    
    // Verificar se o usuário já tem um ID no controle
    const { data: existingIdControl } = await supabase
      .from('user_id_control')
      .select('user_id')
      .eq('email', session.user.email)
      .single();
    
    if (existingIdControl?.user_id) {
      return existingIdControl.user_id;
    }
    
    // Gerar um novo ID e salvar
    const newUserId = generateUserId();
    
    const { error } = await supabase
      .from('user_id_control')
      .insert({
        email: session.user.email,
        user_id: newUserId,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error("Erro ao criar ID para usuário:", error);
      return null;
    }
    
    return newUserId;
  } catch (error) {
    console.error("Erro ao garantir ID de usuário:", error);
    return null;
  }
}
