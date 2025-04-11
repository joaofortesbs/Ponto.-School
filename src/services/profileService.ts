
// Serviço para gerenciamento de perfis de usuário
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user-profile';
import { generateUserId, generateSimpleUserId, generateUserIdSupabase } from '@/lib/generate-user-id';

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
        return existingProfile as UserProfile;
      }

      // Gerar um ID único para o usuário
      const userIdResult = await generateUserId();
      
      // Criar novo perfil
      const newProfile: Partial<UserProfile> = {
        user_id: userIdResult.id,
        email,
        role: 'student',
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
}

// Exportar uma instância única do serviço
export const profileService = new ProfileService();
