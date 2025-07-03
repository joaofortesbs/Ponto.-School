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
}

export const useGroupMembers = (groupId: string) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadMembers = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      console.log(`[LOAD MEMBERS] Carregando membros para o grupo ${groupId}`);

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
        console.error('[LOAD MEMBERS] Erro ao carregar membros:', membersError);
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
        console.error('[LOAD MEMBERS] Erro ao carregar dados do grupo:', groupError);
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
          lastActive: ''
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
            lastActive: 'Há 2 horas'
          });
        }
      });

      setMembers(allMembers);
      console.log(`[LOAD MEMBERS] Carregados ${allMembers.length} membros para o grupo ${groupId}`);

    } catch (err) {
      console.error('[LOAD MEMBERS] Erro inesperado ao carregar membros:', err);
      setError('Erro inesperado ao carregar membros');
    } finally {
      setLoading(false);
    }
  };

  const refreshMembers = async () => {
    console.log('[REFRESH] Iniciando refresh da lista de membros...');
    await loadMembers();
  };

  const removeMember = async (memberId: string): Promise<boolean> => {
    console.log(`[REMOVE MEMBER] === INICIANDO REMOÇÃO ===`);
    console.log(`[REMOVE MEMBER] Grupo: ${groupId}, Membro: ${memberId}`);

    try {
      // 1. Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('[REMOVE MEMBER] Usuário não autenticado');
        toast({
          title: "Erro",
          description: "Você precisa estar logado para remover membros.",
          variant: "destructive"
        });
        return false;
      }

      console.log(`[REMOVE MEMBER] Usuário autenticado: ${user.id}`);

      // 2. Verificar se o usuário é o criador do grupo
      const { data: groupData, error: groupError } = await supabase
        .from('grupos_estudo')
        .select('criador_id')
        .eq('id', groupId)
        .single();

      if (groupError) {
        console.error('[REMOVE MEMBER] Erro ao verificar criador:', groupError);
        toast({
          title: "Erro",
          description: "Erro ao verificar permissões do grupo.",
          variant: "destructive"
        });
        return false;
      }

      if (groupData.criador_id !== user.id) {
        console.error('[REMOVE MEMBER] Usuário não é criador do grupo');
        toast({
          title: "Erro",
          description: "Apenas o criador do grupo pode remover membros.",
          variant: "destructive"
        });
        return false;
      }

      console.log(`[REMOVE MEMBER] Permissão verificada - usuário é criador do grupo`);

      // 3. Verificar se o membro existe antes de remover
      const { data: existingMember, error: checkError } = await supabase
        .from('membros_grupos')
        .select('user_id, grupo_id')
        .eq('grupo_id', groupId)
        .eq('user_id', memberId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('[REMOVE MEMBER] Erro ao verificar membro:', checkError);
        toast({
          title: "Erro",
          description: "Erro ao verificar dados do membro.",
          variant: "destructive"
        });
        return false;
      }

      if (!existingMember) {
        console.log('[REMOVE MEMBER] Membro não encontrado na tabela - já foi removido');
        // Atualizar interface removendo da lista local
        setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
        toast({
          title: "Aviso",
          description: "Membro já foi removido anteriormente.",
          variant: "default"
        });
        return true;
      }

      console.log(`[REMOVE MEMBER] Membro encontrado na tabela - prosseguindo com remoção`);

      // 4. Executar remoção com retry
      let success = false;
      const maxRetries = 3;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`[REMOVE MEMBER] Tentativa ${attempt}/${maxRetries}`);

        try {
          // Executar DELETE
          const { error: deleteError } = await supabase
            .from('membros_grupos')
            .delete()
            .eq('grupo_id', groupId)
            .eq('user_id', memberId);

          if (deleteError) {
            console.error(`[REMOVE MEMBER] DELETE falhou na tentativa ${attempt}:`, deleteError);
            throw deleteError;
          }

          console.log(`[REMOVE MEMBER] DELETE executado com sucesso na tentativa ${attempt}`);

          // Aguardar um pouco para garantir consistência
          await new Promise(resolve => setTimeout(resolve, 300));

          // Verificar se realmente foi removido
          const { data: verification, error: verifyError } = await supabase
            .from('membros_grupos')
            .select('user_id')
            .eq('grupo_id', groupId)
            .eq('user_id', memberId);

          if (verifyError) {
            console.error(`[REMOVE MEMBER] Erro na verificação:`, verifyError);
            throw verifyError;
          }

          if (verification && verification.length === 0) {
            console.log(`[REMOVE MEMBER] ✅ SUCESSO - Membro removido e verificado na tentativa ${attempt}`);
            success = true;
            break;
          } else {
            console.warn(`[REMOVE MEMBER] ⚠️ Membro ainda encontrado após DELETE na tentativa ${attempt}`);
            if (attempt === maxRetries) {
              throw new Error('Membro ainda encontrado após todas as tentativas de remoção');
            }
          }

        } catch (error) {
          console.error(`[REMOVE MEMBER] Erro na tentativa ${attempt}:`, error);
          if (attempt === maxRetries) {
            throw error;
          }
          // Aguardar antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (success) {
        // 5. Atualizar interface removendo o membro
        setMembers(prevMembers => {
          const newMembers = prevMembers.filter(member => member.id !== memberId);
          console.log(`[REMOVE MEMBER] Interface atualizada - ${newMembers.length} membros restantes`);
          return newMembers;
        });

        // 6. Toast de sucesso
        toast({
          title: "Sucesso",
          description: "Membro removido com sucesso do grupo.",
          variant: "default"
        });

        console.log(`[REMOVE MEMBER] === REMOÇÃO CONCLUÍDA COM SUCESSO ===`);
        return true;
      } else {
        throw new Error('Falha na remoção após todas as tentativas');
      }

    } catch (error) {
      console.error('[REMOVE MEMBER] === ERRO CRÍTICO ===', error);

      toast({
        title: "Erro",
        description: "Erro ao remover membro do grupo. Tente novamente.",
        variant: "destructive"
      });

      return false;
    }
  };

  useEffect(() => {
    if (groupId) {
      loadMembers();
    }
  }, [groupId]);

  return {
    members,
    loading,
    error,
    refreshMembers,
    removeMember
  };
};