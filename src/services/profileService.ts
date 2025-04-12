
// Serviço para gerenciamento de perfis de usuário
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user-profile';
import { generateUserId, generateSimpleUserId, generateUserIdByPlan, isValidUserId } from '@/lib/generate-user-id';

/**
 * Cria um perfil de usuário com ID automático baseado na UF e tipo de plano
 */
export async function createUserProfile(userData: Partial<UserProfile>, uf: string = 'BR', planType: string = 'standard'): Promise<UserProfile | null> {
  try {
    // Gera um ID de usuário único
    const userId = await generateUserIdByPlan(planType, uf);
    
    // Adiciona o ID ao objeto de dados do usuário
    const userDataWithId = {
      ...userData,
      user_id: userId
    };
    
    // Insere o perfil no banco de dados
    const { data, error } = await supabase
      .from('profiles')
      .insert([userDataWithId])
      .select('*')
      .single();
      
    if (error) {
      console.error('Erro ao criar perfil de usuário:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao criar perfil de usuário:', error);
    return null;
  }
}

/**
 * Obtém um perfil de usuário pelo ID gerado automaticamente
 */
export async function getUserProfileById(userId: string): Promise<UserProfile | null> {
  if (!isValidUserId(userId)) {
    console.error('ID de usuário inválido:', userId);
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Erro ao buscar perfil de usuário:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar perfil de usuário:', error);
    return null;
  }
}

class ProfileService {
  /**
   * Obter o perfil do usuário atual
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.log('Usuário não autenticado');
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', session.session.user.email)
        .single();

      if (error) {
        console.error('Erro ao obter perfil:', error);
        return null;
      }

      if (data) {
        console.log('getCurrentUserProfile: Perfil encontrado:', data);
        return data as UserProfile;
      }

      // Se não encontrou perfil, tentar criar um novo
      return this.createUserProfile(session.session.user.id, session.session.user.email || '');
    } catch (error) {
      console.error('Erro ao obter perfil do usuário:', error);
      return null;
    }
  }

  /**
   * Criar um novo perfil de usuário
   */
  async createUserProfile(userId: string, email: string): Promise<UserProfile | null> {
    try {
      // Verificar se já existe um perfil para evitar duplicação
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (existingProfile) {
        // Se o perfil já existe mas não tem um user_id, atualizamos com um novo
        if (!existingProfile.user_id) {
          const generatedId = await generateUserIdByPlan('lite', 'BR');
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ user_id: generatedId, updated_at: new Date().toISOString() })
            .eq('id', existingProfile.id)
            .select()
            .single();
            
          if (updateError) {
            console.error('Erro ao atualizar ID do usuário:', updateError);
            return existingProfile as UserProfile;
          }
          
          return updatedProfile as UserProfile;
        }
        return existingProfile as UserProfile;
      }

      // Gerar um ID único para o usuário baseado no plano (padrão 'lite')
      const generatedId = await generateUserIdByPlan('lite', 'BR');
      
      // Criar novo perfil
      const newProfile: Partial<UserProfile> = {
        user_id: generatedId,
        email,
        role: 'student',
        plan_type: 'lite', // Definir o plano padrão
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar perfil:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Erro ao criar perfil de usuário:', error);
      return null;
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser.user) {
        console.log('Usuário não autenticado');
        return null;
      }

      // Obter o perfil atual para verificar se existe
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', currentUser.user.email)
        .single();

      if (!currentProfile) {
        console.error('Perfil não encontrado para atualização');
        return null;
      }

      // Atualizar apenas os campos fornecidos
      const updateData = {
        ...profileData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', currentProfile.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Erro ao atualizar perfil de usuário:', error);
      return null;
    }
  }

  /**
   * Obter o nome de exibição do usuário
   */
  async getUserDisplayName(): Promise<string> {
    try {
      const profile = await this.getCurrentUserProfile();
      
      if (!profile) {
        return 'Usuário';
      }

      if (profile.display_name) {
        console.log('getUserDisplayName: Nome de exibição obtido:', profile.display_name);
        return profile.display_name;
      }

      if (profile.full_name) {
        return profile.full_name;
      }

      return 'Usuário';
    } catch (error) {
      console.error('Erro ao obter nome de exibição:', error);
      return 'Usuário';
    }
  }
  
  /**
   * Garantir que o perfil do usuário tenha um ID válido
   * Esta função verifica se o usuário tem um ID e, se não tiver, gera um novo
   */
  async ensureUserHasId(): Promise<boolean> {
    try {
      const profile = await this.getCurrentUserProfile();
      
      if (!profile) {
        console.log('Nenhum perfil encontrado para adicionar ID');
        return false;
      }
      
      // Se já tem ID, não faz nada
      if (profile.user_id && isValidUserId(profile.user_id)) {
        console.log('Usuário já possui um ID válido:', profile.user_id);
        return true;
      }
      
      // Gerar um novo ID baseado no plano do usuário
      const planType = profile.plan_type || 'lite';
      const generatedId = await generateUserIdByPlan(planType, 'BR');
      
      // Atualizar o perfil com o novo ID
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          user_id: generatedId,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar perfil com novo ID:', error);
        return false;
      }
      
      console.log('ID gerado e atualizado com sucesso:', generatedId);
      return true;
    } catch (error) {
      console.error('Erro ao garantir ID do usuário:', error);
      return false;
    }
  }
}

// Exportar uma instância única do serviço
export const profileService = new ProfileService();
