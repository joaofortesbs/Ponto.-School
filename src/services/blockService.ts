
import { supabase } from "@/integrations/supabase/client";

export interface BlockedMember {
  id: string;
  group_id: string;
  blocked_user_id: string;
  blocked_by_user_id: string;
  blocked_at: string;
  reason?: string;
  blocked_user?: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export const blockService = {
  // Bloquear um usuário de um grupo
  async blockUser(groupId: string, userId: string, reason?: string): Promise<boolean> {
    try {
      console.log('Bloqueando usuário:', { groupId, userId, reason });
      
      const { data, error } = await supabase.rpc('block_user_from_group', {
        p_group_id: groupId,
        p_user_to_block_id: userId,
        p_reason: reason || null
      });

      if (error) {
        console.error('Erro ao bloquear usuário:', error);
        return false;
      }

      console.log('Usuário bloqueado com sucesso:', data);
      return true;
    } catch (error) {
      console.error('Erro ao bloquear usuário:', error);
      return false;
    }
  },

  // Verificar se um usuário está bloqueado
  async isUserBlocked(groupId: string, userId: string): Promise<{
    isBlocked: boolean;
    reason?: string;
    blockedAt?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('blocked_group_members')
        .select('reason, blocked_at')
        .eq('group_id', groupId)
        .eq('blocked_user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar bloqueio:', error);
        return { isBlocked: false };
      }

      if (data) {
        return {
          isBlocked: true,
          reason: data.reason,
          blockedAt: data.blocked_at
        };
      }

      return { isBlocked: false };
    } catch (error) {
      console.error('Erro ao verificar bloqueio:', error);
      return { isBlocked: false };
    }
  },

  // Listar membros bloqueados de um grupo
  async getBlockedMembers(groupId: string): Promise<BlockedMember[]> {
    try {
      const { data, error } = await supabase
        .from('blocked_group_members')
        .select(`
          id,
          group_id,
          blocked_user_id,
          blocked_by_user_id,
          blocked_at,
          reason,
          profiles:blocked_user_id (
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .order('blocked_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar membros bloqueados:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        group_id: item.group_id,
        blocked_user_id: item.blocked_user_id,
        blocked_by_user_id: item.blocked_by_user_id,
        blocked_at: item.blocked_at,
        reason: item.reason,
        blocked_user: item.profiles ? {
          display_name: item.profiles.display_name,
          username: item.profiles.username,
          avatar_url: item.profiles.avatar_url
        } : undefined
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar membros bloqueados:', error);
      return [];
    }
  },

  // Desbloquear um usuário
  async unblockUser(groupId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('blocked_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('blocked_user_id', userId);

      if (error) {
        console.error('Erro ao desbloquear usuário:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao desbloquear usuário:', error);
      return false;
    }
  }
};
