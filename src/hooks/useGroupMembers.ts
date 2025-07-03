
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  isOnline: boolean;
  lastActive: string;
  isBlocked?: boolean;
}

export const useGroupMembers = (groupId: string) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const { toast } = useToast();

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se o usuário atual está bloqueado
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userMembership } = await supabase
          .from('membros_grupos')
          .select('is_blocked')
          .eq('grupo_id', groupId)
          .eq('user_id', user.id)
          .single();

        if (userMembership?.is_blocked) {
          setIsBlocked(true);
          setLoading(false);
          return;
        }
      }

      // Buscar membros do grupo (apenas não bloqueados)
      const { data: membersData, error: membersError } = await supabase
        .from('membros_grupos')
        .select(`
          user_id,
          is_blocked,
          profiles!inner(
            id,
            display_name,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('grupo_id', groupId)
        .eq('is_blocked', false);

      if (membersError) {
        console.error('Erro ao carregar membros:', membersError);
        setError('Erro ao carregar membros do grupo');
        return;
      }

      // Buscar informações do criador do grupo
      const { data: groupData, error: groupError } = await supabase
        .from('grupos_estudo')
        .select('criador_id, profiles!inner(id, display_name, full_name, email, avatar_url)')
        .eq('id', groupId)
        .single();

      if (groupError) {
        console.error('Erro ao carregar dados do grupo:', groupError);
        setError('Erro ao carregar dados do grupo');
        return;
      }

      // Combinar membros e criador
      const allMembers: GroupMember[] = [];

      // Adicionar criador primeiro
      if (groupData?.profiles) {
        allMembers.push({
          id: groupData.criador_id,
          name: groupData.profiles.display_name || groupData.profiles.full_name || groupData.profiles.email || 'Usuário',
          avatar: groupData.profiles.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(groupData.profiles.display_name || 'U')}&background=FF6B00&color=fff&size=40`,
          role: 'Criador',
          isOnline: true,
          lastActive: '',
          isBlocked: false
        });
      }

      // Adicionar membros (excluir criador se já estiver na lista de membros)
      membersData?.forEach((memberData: any) => {
        if (memberData.user_id !== groupData.criador_id) {
          allMembers.push({
            id: memberData.user_id,
            name: memberData.profiles.display_name || memberData.profiles.full_name || memberData.profiles.email || 'Usuário',
            avatar: memberData.profiles.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberData.profiles.display_name || 'U')}&background=FF6B00&color=fff&size=40`,
            role: 'Membro',
            isOnline: false,
            lastActive: 'Há 2 horas',
            isBlocked: memberData.is_blocked || false
          });
        }
      });

      setMembers(allMembers);
      console.log(`Carregados ${allMembers.length} membros para o grupo ${groupId}`);

    } catch (err) {
      console.error('Erro inesperado ao carregar membros:', err);
      setError('Erro inesperado ao carregar membros');
    } finally {
      setLoading(false);
    }
  };

  const refreshMembers = () => {
    console.log('Atualizando lista de membros...');
    loadMembers();
  };

  const blockMember = async (memberId: string, retries = 3, delay = 500) => {
    try {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`Tentativa ${attempt} de bloquear membro ${memberId}`);
          
          const { error } = await supabase
            .from('membros_grupos')
            .update({ is_blocked: true })
            .eq('grupo_id', groupId)
            .eq('user_id', memberId);

          if (error) {
            throw error;
          }

          console.log(`Membro ${memberId} bloqueado com sucesso no grupo ${groupId}`);
          
          // Atualizar lista local removendo o membro bloqueado
          setMembers(prev => prev.filter(member => member.id !== memberId));
          
          toast({
            title: "Sucesso",
            description: "Membro removido com sucesso.",
            variant: "default"
          });

          return true;
        } catch (error: any) {
          console.error(`Tentativa ${attempt} falhou:`, error.message);
          if (attempt === retries) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } catch (err: any) {
      console.error('Erro ao bloquear membro:', err);
      toast({
        title: "Erro",
        description: "Erro ao remover membro do grupo.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Configurar realtime para mudanças na tabela membros_grupos
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`members-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'membros_grupos',
          filter: `grupo_id=eq.${groupId}`
        },
        (payload) => {
          console.log('Mudança detectada em membros_grupos:', payload);
          
          // Se algum usuário foi bloqueado, atualizar lista
          if (payload.new.is_blocked) {
            console.log('Membro foi bloqueado, atualizando lista');
            refreshMembers();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      loadMembers();
    }
  }, [groupId]);

  return {
    members,
    loading,
    error,
    isBlocked,
    refreshMembers,
    blockMember
  };
};
