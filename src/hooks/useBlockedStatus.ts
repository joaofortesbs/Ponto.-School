
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface BlockedInfo {
  isBlocked: boolean;
  reason?: string;
  blockedAt?: string;
  blockedBy?: string;
}

export const useBlockedStatus = (groupId: string | undefined, userId: string | undefined) => {
  const [blockedInfo, setBlockedInfo] = useState<BlockedInfo>({ isBlocked: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBlockedStatus = async () => {
      if (!groupId || !userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Verificar se o usuário está bloqueado
        const { data, error } = await supabase
          .from('blocked_group_members')
          .select(`
            reason,
            blocked_at,
            blocked_by_user_id,
            profiles:blocked_by_user_id (
              display_name,
              username
            )
          `)
          .eq('group_id', groupId)
          .eq('blocked_user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao verificar status de bloqueio:', error);
          setBlockedInfo({ isBlocked: false });
          return;
        }

        if (data) {
          setBlockedInfo({
            isBlocked: true,
            reason: data.reason,
            blockedAt: data.blocked_at,
            blockedBy: data.profiles?.display_name || data.profiles?.username || 'Administrador'
          });
        } else {
          setBlockedInfo({ isBlocked: false });
        }
      } catch (error) {
        console.error('Erro ao verificar bloqueio:', error);
        setBlockedInfo({ isBlocked: false });
      } finally {
        setLoading(false);
      }
    };

    checkBlockedStatus();
  }, [groupId, userId]);

  return { blockedInfo, loading };
};
