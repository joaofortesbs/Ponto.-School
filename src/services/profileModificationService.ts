
import { supabase } from '@/lib/supabase';
import { profileService } from './profileService';
import type { UserProfile } from '@/types/user-profile';

/**
 * Serviço para permitir que a IA modifique informações do perfil do usuário
 */
export class ProfileModificationService {
  /**
   * Atualiza a biografia do usuário
   */
  static async updateUserBio(newBio: string): Promise<{ success: boolean; message: string }> {
    try {
      // Obter usuário atual
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        return { 
          success: false, 
          message: 'Usuário não autenticado. Faça login para atualizar seu perfil.' 
        };
      }

      // Atualizar a biografia no perfil
      const { error } = await supabase
        .from('profiles')
        .update({ 
          bio: newBio,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.user.id);

      if (error) {
        console.error('Erro ao atualizar biografia:', error);
        return { 
          success: false, 
          message: `Erro ao atualizar a biografia: ${error.message}` 
        };
      }

      // Atualizar cache local
      try {
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          const profile = JSON.parse(cachedProfile);
          profile.bio = newBio;
          localStorage.setItem('userProfile', JSON.stringify(profile));
        }
      } catch (e) {
        console.error('Erro ao atualizar cache do perfil:', e);
      }

      return { 
        success: true, 
        message: 'Biografia atualizada com sucesso!' 
      };
    } catch (error) {
      console.error('Erro ao atualizar biografia:', error);
      return { 
        success: false, 
        message: 'Ocorreu um erro ao tentar atualizar sua biografia. Tente novamente mais tarde.' 
      };
    }
  }

  /**
   * Atualiza o nome de exibição do usuário
   */
  static async updateDisplayName(newDisplayName: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        return { 
          success: false, 
          message: 'Usuário não autenticado. Faça login para atualizar seu perfil.' 
        };
      }

      // Atualizar nome de exibição
      const { error } = await supabase
        .from('profiles')
        .update({ 
          display_name: newDisplayName,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.user.id);

      if (error) {
        console.error('Erro ao atualizar nome de exibição:', error);
        return { 
          success: false, 
          message: `Erro ao atualizar o nome de exibição: ${error.message}` 
        };
      }

      // Atualizar cache local
      try {
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          const profile = JSON.parse(cachedProfile);
          profile.display_name = newDisplayName;
          localStorage.setItem('userProfile', JSON.stringify(profile));
        }
        
        // Atualizar também no localStorage para uso direto
        localStorage.setItem('userDisplayName', newDisplayName);
      } catch (e) {
        console.error('Erro ao atualizar cache do perfil:', e);
      }

      return { 
        success: true, 
        message: 'Nome de exibição atualizado com sucesso!' 
      };
    } catch (error) {
      console.error('Erro ao atualizar nome de exibição:', error);
      return { 
        success: false, 
        message: 'Ocorreu um erro ao tentar atualizar seu nome de exibição. Tente novamente mais tarde.' 
      };
    }
  }

  /**
   * Atualiza informações de contato do usuário
   */
  static async updateContactInfo(
    updateData: { phone?: string; location?: string; state?: string }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        return { 
          success: false, 
          message: 'Usuário não autenticado. Faça login para atualizar seu perfil.' 
        };
      }

      // Preparar dados a serem atualizados
      const updateFields: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      if (updateData.phone !== undefined) {
        updateFields.phone = updateData.phone;
      }
      
      if (updateData.location !== undefined) {
        updateFields.location = updateData.location;
      }
      
      if (updateData.state !== undefined) {
        updateFields.state = updateData.state;
      }

      // Atualizar informações de contato
      const { error } = await supabase
        .from('profiles')
        .update(updateFields)
        .eq('id', userData.user.id);

      if (error) {
        console.error('Erro ao atualizar informações de contato:', error);
        return { 
          success: false, 
          message: `Erro ao atualizar as informações de contato: ${error.message}` 
        };
      }

      // Atualizar cache local
      try {
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          const profile = JSON.parse(cachedProfile);
          
          if (updateData.phone !== undefined) {
            profile.phone = updateData.phone;
          }
          
          if (updateData.location !== undefined) {
            profile.location = updateData.location;
          }
          
          if (updateData.state !== undefined) {
            profile.state = updateData.state;
          }
          
          localStorage.setItem('userProfile', JSON.stringify(profile));
        }
        
        // Atualizar estado no localStorage, se fornecido
        if (updateData.state) {
          localStorage.setItem('selectedState', updateData.state);
        }
      } catch (e) {
        console.error('Erro ao atualizar cache do perfil:', e);
      }

      return { 
        success: true, 
        message: 'Informações de contato atualizadas com sucesso!' 
      };
    } catch (error) {
      console.error('Erro ao atualizar informações de contato:', error);
      return { 
        success: false, 
        message: 'Ocorreu um erro ao tentar atualizar suas informações de contato. Tente novamente mais tarde.' 
      };
    }
  }

  /**
   * Obtém informações detalhadas do perfil para a IA responder
   */
  static async getDetailedUserProfile(): Promise<{
    profile: UserProfile | null;
    formattedInfo: string;
  }> {
    try {
      // Obter perfil do usuário usando o serviço existente
      const profile = await profileService.getCurrentUserProfile();
      
      if (!profile) {
        return {
          profile: null,
          formattedInfo: "Não foi possível encontrar seu perfil. Por favor, verifique se você está logado."
        };
      }
      
      // Criar texto formatado com informações do perfil
      const formattedInfo = `
Informações detalhadas do seu perfil:

- ID de usuário: ${profile.user_id || 'Não disponível'}
- Nome completo: ${profile.full_name || 'Não disponível'}
- Nome de usuário: ${profile.username || profile.display_name || 'Não disponível'}
- E-mail: ${profile.email || 'Não disponível'}
- Plano: ${profile.plan_type || 'Lite (padrão)'}
- Nível: ${profile.level || '1'}
- Classificação: ${profile.rank || 'Aprendiz'}
- Data de criação da conta: ${profile.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : 'Não disponível'}
- Última atualização: ${profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('pt-BR') : 'Não disponível'}
      `;
      
      return {
        profile,
        formattedInfo
      };
    } catch (error) {
      console.error('Erro ao obter informações detalhadas do perfil:', error);
      return {
        profile: null,
        formattedInfo: "Ocorreu um erro ao buscar suas informações de perfil. Por favor, tente novamente mais tarde."
      };
    }
  }
}
