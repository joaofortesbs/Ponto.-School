
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

  const checkIfUserIsBlocked = async (currentUserId: string) => {
    try {
      console.log(`🔍 Verificando imediatamente se usuário ${currentUserId} está bloqueado no grupo ${groupId}`);
      if (!groupId || !currentUserId) return false;

      // Fazer a verificação IMEDIATAMENTE sem delay
      const { data: blockData, error: blockError } = await supabase
        .from('bloqueios_grupos')
        .select('id, grupo_id, user_id, bloqueado_em')
        .eq('grupo_id', groupId)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (blockError) {
        console.error('❌ Erro ao verificar bloqueio:', blockError);
        return false;
      }

      const blocked = !!blockData;
      console.log(`🚫 Usuário ${currentUserId} ${blocked ? 'ESTÁ BLOQUEADO' : 'não está bloqueado'} no grupo ${groupId}`, blockData);
      
      if (blocked) {
        setIsBlocked(true);
        setLoading(false); // Parar o loading imediatamente
        return true;
      }
      
      setIsBlocked(false);
      return false;
    } catch (error) {
      console.error('❌ Erro crítico ao verificar se usuário está bloqueado:', error);
      return false;
    }
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      // 🔥 PRIMEIRO: Verificar se o usuário atual está bloqueado IMEDIATAMENTE
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log(`🔥 PRIORIDADE MÁXIMA: Verificando bloqueio para usuário ${user.id} no grupo ${groupId}`);
        const userIsBlocked = await checkIfUserIsBlocked(user.id);
        if (userIsBlocked) {
          console.log(`🚫 BLOQUEADO CONFIRMADO: Usuário ${user.id} está bloqueado no grupo ${groupId}. Parando tudo.`);
          // NÃO carregar mais nada, apenas definir como bloqueado
          return;
        }
      }

      console.log(`✅ Usuário não está bloqueado. Continuando carregamento normal dos membros.`);

      // Buscar membros do grupo
      const { data: membersData, error: membersError } = await supabase
        .from('membros_grupos')
        .select(`
          user_id,
          profiles!inner(
            id,
            display_name,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('grupo_id', groupId);

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

      // Buscar bloqueios para filtrar membros bloqueados
      const { data: blockedMembers } = await supabase
        .from('bloqueios_grupos')
        .select('user_id')
        .eq('grupo_id', groupId);

      const blockedUserIds = blockedMembers?.map(b => b.user_id) || [];

      // Combinar membros e criador
      const allMembers: GroupMember[] = [];

      // Adicionar criador primeiro (se não estiver bloqueado)
      if (groupData?.profiles && !blockedUserIds.includes(groupData.criador_id)) {
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

      // Adicionar membros (excluir criador se já estiver na lista e filtrar bloqueados)
      membersData?.forEach((memberData: any) => {
        if (memberData.user_id !== groupData.criador_id && !blockedUserIds.includes(memberData.user_id)) {
          allMembers.push({
            id: memberData.user_id,
            name: memberData.profiles.display_name || memberData.profiles.full_name || memberData.profiles.email || 'Usuário',
            avatar: memberData.profiles.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberData.profiles.display_name || 'U')}&background=FF6B00&color=fff&size=40`,
            role: 'Membro',
            isOnline: false,
            lastActive: 'Há 2 horas',
            isBlocked: false
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

  const blockMember = async (memberId: string) => {
    try {
      console.log(`Tentando bloquear membro ${memberId}`);
      
      const { error } = await supabase
        .from('bloqueios_grupos')
        .insert({
          grupo_id: groupId,
          user_id: memberId,
          bloqueado_em: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      console.log(`Membro ${memberId} bloqueado com sucesso no grupo ${groupId}`);
      
      // Atualizar lista local removendo o membro bloqueado
      setMembers(prev => prev.filter(member => member.id !== memberId));
      
      toast({
        title: "Sucesso",
        description: "Membro bloqueado com sucesso.",
        variant: "default"
      });

      return true;
    } catch (err: any) {
      console.error('Erro ao bloquear membro:', err);
      toast({
        title: "Erro",
        description: "Erro ao bloquear membro do grupo.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Configurar realtime para mudanças na tabela bloqueios_grupos
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`members-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bloqueios_grupos',
          filter: `grupo_id=eq.${groupId}`
        },
        (payload: any) => {
          console.log('🔥 REALTIME: Novo bloqueio detectado:', payload);
          
          // Verificar se o usuário atual foi bloqueado
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user && payload.new.user_id === user.id) {
              console.log('🚫 REALTIME: Usuário atual foi bloqueado em tempo real');
              setIsBlocked(true);
            }
          });
          
          // Remover membro bloqueado da lista
          if (payload.new.user_id) {
            console.log('Removendo membro bloqueado da lista:', payload.new.user_id);
            setMembers(prev => prev.filter(member => member.id !== payload.new.user_id));
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
