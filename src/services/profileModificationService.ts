import { supabase } from '@/lib/supabase';
import { profileService } from './profileService';
import type { UserProfile } from '@/types/user-profile';

/**
 * Serviço para permitir que a IA modifique informações do perfil do usuário
 */
export const ProfileModificationService = {
  async getDetailedUserProfile() {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;

      if (!userId) {
        console.log('Usuário não autenticado');
        return { success: false, message: 'Usuário não autenticado', profile: null, formattedInfo: null };
      }

      // Obter o perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        return { success: false, message: 'Perfil não encontrado', profile: null, formattedInfo: null };
      }

      // Se não encontrou perfil, tentar usar dados do localStorage
      if (!profileData) {
        const localUsername = localStorage.getItem('username') || 'Usuário';
        const localEmail = localStorage.getItem('userEmail') || 'email@exemplo.com';
        const localDisplayName = localStorage.getItem('userDisplayName') || localUsername;
        const localFullName = localStorage.getItem('userFullName') || localDisplayName;

        const mockProfile = {
          user_id: userId,
          username: localUsername,
          email: localEmail,
          display_name: localDisplayName,
          full_name: localFullName,
          created_at: new Date().toISOString(),
          level: 1,
          plan_type: 'lite',
          bio: 'Biografia não disponível'
        };

        // Formatar as informações
        const formattedInfo = `
🆔 **ID do Usuário**: ${userId}
📅 **Conta criada**: Recentemente
👤 **Nome**: ${localFullName || 'Não fornecido'}
👤 **Nome de Usuário**: ${localUsername}
🎭 **Nome de Exibição**: ${localDisplayName}
📧 **Email**: ${localEmail}
🎖️ **Nível**: 1
🏆 **Plano**: Lite
        `;

        return { 
          success: true, 
          profile: mockProfile, 
          formattedInfo: formattedInfo.trim() 
        };
      }

      // Formatar as informações para uma visualização mais amigável
      const formattedInfo = `
🆔 **ID do Usuário**: ${profileData.user_id || userId}
📅 **Conta criada em**: ${profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
👤 **Nome Completo**: ${profileData.full_name || 'Não fornecido'}
👤 **Nome de Usuário**: ${profileData.username || 'Não definido'}
🎭 **Nome de Exibição**: ${profileData.display_name || 'Não definido'}
📧 **Email**: ${profileData.email || 'Não disponível'}
📱 **Telefone**: ${profileData.phone || 'Não fornecido'}
📍 **Localização**: ${profileData.location || 'Não fornecida'}
🎖️ **Nível**: ${profileData.level || '1'}
🏆 **Plano**: ${profileData.plan_type || 'Lite'}
📝 **Biografia**: ${profileData.bio || 'Nenhuma biografia adicionada'}
      `;

      return { 
        success: true, 
        profile: profileData, 
        formattedInfo: formattedInfo.trim() 
      };
    } catch (error) {
      console.error('Erro ao obter perfil detalhado:', error);
      return { success: false, message: 'Erro ao obter informações do perfil', profile: null, formattedInfo: null };
    }
  },

  async updateUserBio(newBio) {
    try {
      if (!newBio || newBio.trim() === '') {
        return { success: false, message: 'A biografia não pode estar vazia' };
      }

      if (newBio.length > 500) {
        return { success: false, message: 'A biografia deve ter no máximo 500 caracteres' };
      }

      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;

      if (!userId) {
        return { success: false, message: 'Usuário não autenticado' };
      }

      try {
        // Verificar se o perfil existe
        const { data: profileExists } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', userId)
          .single();

        if (!profileExists) {
          // Se não existir, criar um novo perfil
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ 
              user_id: userId, 
              bio: newBio,
              username: localStorage.getItem('username') || 'usuario',
              email: localStorage.getItem('userEmail') || null
            });

          if (insertError) {
            console.error('Erro ao criar perfil:', insertError);
            return { success: false, message: 'Erro ao criar perfil com biografia' };
          }
        } else {
          // Se existir, atualizar a bio
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ bio: newBio })
            .eq('user_id', userId);

          if (updateError) {
            console.error('Erro ao atualizar bio:', updateError);
            return { success: false, message: 'Erro ao atualizar biografia' };
          }
        }

        return { success: true, message: 'Biografia atualizada com sucesso' };
      } catch (dbError) {
        console.error('Erro na operação do banco de dados:', dbError);
        return { success: false, message: 'Erro no banco de dados ao atualizar biografia' };
      }
    } catch (error) {
      console.error('Erro ao atualizar biografia:', error);
      return { success: false, message: 'Erro ao processar a solicitação' };
    }
  },

  async updateDisplayName(newDisplayName) {
    try {
      if (!newDisplayName || newDisplayName.trim() === '') {
        return { success: false, message: 'O nome de exibição não pode estar vazio' };
      }

      if (newDisplayName.length > 50) {
        return { success: false, message: 'O nome de exibição deve ter no máximo 50 caracteres' };
      }

      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;

      if (!userId) {
        return { success: false, message: 'Usuário não autenticado' };
      }

      try {
        // Verificar se o perfil existe
        const { data: profileExists } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', userId)
          .single();

        if (!profileExists) {
          // Se não existir, criar um novo perfil
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ 
              user_id: userId, 
              display_name: newDisplayName,
              username: localStorage.getItem('username') || 'usuario',
              email: localStorage.getItem('userEmail') || null
            });

          if (insertError) {
            console.error('Erro ao criar perfil:', insertError);
            return { success: false, message: 'Erro ao criar perfil com nome de exibição' };
          }
        } else {
          // Se existir, atualizar o nome de exibição
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ display_name: newDisplayName })
            .eq('user_id', userId);

          if (updateError) {
            console.error('Erro ao atualizar nome de exibição:', updateError);
            return { success: false, message: 'Erro ao atualizar nome de exibição' };
          }
        }

        // Atualizar também no localStorage para uso imediato em outros componentes
        localStorage.setItem('userDisplayName', newDisplayName);

        return { success: true, message: 'Nome de exibição atualizado com sucesso' };
      } catch (dbError) {
        console.error('Erro na operação do banco de dados:', dbError);
        return { success: false, message: 'Erro no banco de dados ao atualizar nome de exibição' };
      }
    } catch (error) {
      console.error('Erro ao atualizar nome de exibição:', error);
      return { success: false, message: 'Erro ao processar a solicitação' };
    }
  }
};
import { supabase } from '@/lib/supabase';
import { aiChatDatabase } from './aiChatDatabaseService';

/**
 * Serviço para permitir que a IA de chat modifique informações do perfil do usuário
 */
export const ProfileModificationService = {
  /**
   * Obtém o perfil completo e detalhado do usuário atual
   */
  getDetailedUserProfile: async (): Promise<{ profile: any, formattedInfo: string }> => {
    try {
      // Obter dados do usuário autenticado
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        console.log('Usuário não autenticado para acesso ao perfil');
        return { profile: null, formattedInfo: 'Usuário não autenticado' };
      }

      // Usar o serviço de acesso ao banco para obter perfil detalhado
      const detailedProfile = await aiChatDatabase.getDetailedUserProfile();
      if (!detailedProfile) {
        return { 
          profile: null, 
          formattedInfo: 'Não foi possível obter informações detalhadas do perfil. Tente novamente mais tarde.' 
        };
      }

      // Formatar informações do perfil para exibição
      const formattedInfo = aiChatDatabase.formatUserProfile(detailedProfile);

      return { profile: detailedProfile, formattedInfo };
    } catch (error) {
      console.error('Erro ao obter perfil detalhado:', error);
      return { 
        profile: null, 
        formattedInfo: 'Ocorreu um erro ao processar as informações do perfil. Tente novamente mais tarde.' 
      };
    }
  },

  /**
   * Atualiza a biografia do usuário
   * @param newBio Nova biografia
   */
  updateUserBio: async (newBio: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Verificar se o usuário está autenticado
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        return { 
          success: false, 
          message: 'Você precisa estar autenticado para atualizar sua biografia.' 
        };
      }

      // Validar a biografia
      if (!newBio || newBio.trim().length === 0) {
        return { success: false, message: 'A biografia não pode estar vazia.' };
      }

      if (newBio.length > 500) {
        return { 
          success: false, 
          message: `A biografia é muito longa (${newBio.length} caracteres). O limite é de 500 caracteres.` 
        };
      }

      // Atualizar no banco de dados
      const { error } = await supabase
        .from('profiles')
        .update({ 
          bio: newBio,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionData.session.user.id);

      if (error) {
        console.error('Erro ao atualizar biografia:', error);
        return { 
          success: false, 
          message: `Erro ao atualizar: ${error.message}` 
        };
      }

      return { 
        success: true, 
        message: 'Biografia atualizada com sucesso!' 
      };
    } catch (error) {
      console.error('Erro ao atualizar biografia:', error);
      return { 
        success: false, 
        message: 'Ocorreu um erro ao atualizar sua biografia. Tente novamente mais tarde.' 
      };
    }
  },

  /**
   * Atualiza o nome de exibição do usuário
   * @param newName Novo nome de exibição
   */
  updateDisplayName: async (newName: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Verificar se o usuário está autenticado
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        return { 
          success: false, 
          message: 'Você precisa estar autenticado para atualizar seu nome de exibição.' 
        };
      }

      // Validar o nome
      if (!newName || newName.trim().length === 0) {
        return { success: false, message: 'O nome de exibição não pode estar vazio.' };
      }

      if (newName.length > 50) {
        return { 
          success: false, 
          message: `O nome é muito longo (${newName.length} caracteres). O limite é de 50 caracteres.` 
        };
      }

      // Atualizar no banco de dados
      const { error } = await supabase
        .from('profiles')
        .update({ 
          display_name: newName,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionData.session.user.id);

      if (error) {
        console.error('Erro ao atualizar nome de exibição:', error);
        return { 
          success: false, 
          message: `Erro ao atualizar: ${error.message}` 
        };
      }

      return { 
        success: true, 
        message: 'Nome de exibição atualizado com sucesso!' 
      };
    } catch (error) {
      console.error('Erro ao atualizar nome de exibição:', error);
      return { 
        success: false, 
        message: 'Ocorreu um erro ao atualizar seu nome. Tente novamente mais tarde.' 
      };
    }
  },

  /**
   * Atualiza informações de contato do usuário
   * @param data Objeto com as informações a serem atualizadas
   */
  updateContactInfo: async (data: {
    phone?: string;
    location?: string;
    website?: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      // Verificar se o usuário está autenticado
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        return { 
          success: false, 
          message: 'Você precisa estar autenticado para atualizar suas informações de contato.' 
        };
      }

      // Validações básicas
      if (data.phone && data.phone.length > 20) {
        return { 
          success: false, 
          message: 'O número de telefone é muito longo. O limite é de 20 caracteres.' 
        };
      }

      if (data.location && data.location.length > 100) {
        return { 
          success: false, 
          message: 'A localização é muito longa. O limite é de 100 caracteres.' 
        };
      }

      if (data.website && data.website.length > 200) {
        return { 
          success: false, 
          message: 'A URL do website é muito longa. O limite é de 200 caracteres.' 
        };
      }

      // Preparar dados para atualização
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.website !== undefined) updateData.website = data.website;

      // Atualizar no banco de dados
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', sessionData.session.user.id);

      if (error) {
        console.error('Erro ao atualizar informações de contato:', error);
        return { 
          success: false, 
          message: `Erro ao atualizar: ${error.message}` 
        };
      }

      return { 
        success: true, 
        message: 'Informações de contato atualizadas com sucesso!' 
      };
    } catch (error) {
      console.error('Erro ao atualizar informações de contato:', error);
      return { 
        success: false, 
        message: 'Ocorreu um erro ao atualizar suas informações. Tente novamente mais tarde.' 
      };
    }
  }
};
