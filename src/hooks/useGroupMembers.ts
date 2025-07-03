
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

      // Combinar membros e criador
      const allMembers: GroupMember[] = [];

      // Adicionar criador primeiro
      if (groupData?.profiles) {
        allMembers.push({
          id: groupData.criador_id,
          name: groupData.profiles.display_name || groupData.profiles.full_name || groupData.profiles.email || 'Usuário',
          avatar: groupData.profiles.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(groupData.profiles.display_name || 'U')}&background=FF6B00&color=fff&size=40`,
          role: 'Criador',
          isOnline: true, // TODO: Implementar status online real
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
            isOnline: false, // TODO: Implementar status online real
            lastActive: 'Há 2 horas' // TODO: Implementar última atividade real
          });
        }
      });

      setMembers(allMembers);
      console.log(`Carregados ${allMembers.length} membros para o grupo ${groupId}:`, allMembers.map(m => ({ id: m.id, name: m.name, role: m.role })));

    } catch (err) {
      console.error('Erro inesperado ao carregar membros:', err);
      setError('Erro inesperado ao carregar membros');
    } finally {
      setLoading(false);
    }
  };

  const refreshMembers = async () => {
    console.log('Iniciando refresh da lista de membros...');
    try {
      await loadMembers();
      console.log('Refresh da lista de membros concluído com sucesso');
    } catch (error) {
      console.error('Erro durante refresh da lista de membros:', error);
    }
  };

  const removeMember = async (memberId: string): Promise<boolean> => {
    try {
      console.log(`Iniciando remoção do membro ${memberId} do grupo ${groupId}`);
      
      // Verificar se o membro existe antes de tentar remover
      const { data: existingMember, error: checkError } = await supabase
        .from('membros_grupos')
        .select('user_id, grupo_id')
        .eq('grupo_id', groupId)
        .eq('user_id', memberId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erro ao verificar membro:', checkError);
        toast({
          title: "Erro",
          description: "Erro ao verificar membro no grupo.",
          variant: "destructive"
        });
        return false;
      }

      if (!existingMember) {
        console.log(`Membro ${memberId} não encontrado na tabela membros_grupos`);
        toast({
          title: "Aviso",
          description: "Membro não encontrado no grupo.",
          variant: "default"
        });
        return false;
      }

      console.log(`Membro encontrado: user_id=${existingMember.user_id}, grupo_id=${existingMember.grupo_id}`);

      // Remover o membro da tabela membros_grupos
      const { error: deleteError } = await supabase
        .from('membros_grupos')
        .delete()
        .eq('grupo_id', groupId)
        .eq('user_id', memberId);

      if (deleteError) {
        console.error('Erro ao remover membro da tabela membros_grupos:', deleteError);
        toast({
          title: "Erro",
          description: `Erro ao remover membro: ${deleteError.message}`,
          variant: "destructive"
        });
        return false;
      }

      console.log(`Membro ${memberId} removido da tabela membros_grupos com sucesso`);
      
      // Verificar se a remoção foi bem-sucedida
      const { data: verifyRemoval, error: verifyError } = await supabase
        .from('membros_grupos')
        .select('user_id')
        .eq('grupo_id', groupId)
        .eq('user_id', memberId);

      if (verifyError) {
        console.error('Erro ao verificar remoção:', verifyError);
      } else if (verifyRemoval && verifyRemoval.length === 0) {
        console.log('Remoção verificada: membro não está mais na tabela');
      } else {
        console.warn('Aviso: membro ainda encontrado na tabela após remoção');
      }
      
      // Atualizar estado local imediatamente
      setMembers(prevMembers => {
        const updatedMembers = prevMembers.filter(member => member.id !== memberId);
        console.log(`Lista de membros atualizada localmente. Membros restantes: ${updatedMembers.length}`);
        return updatedMembers;
      });

      // Recarregar a lista completa do banco de dados para garantir sincronização
      console.log('Recarregando lista completa de membros do banco de dados...');
      setTimeout(() => {
        refreshMembers();
      }, 1000);
      
      toast({
        title: "Sucesso",
        description: "Membro removido com sucesso do grupo.",
        variant: "default"
      });

      return true;
    } catch (err) {
      console.error('Erro inesperado ao remover membro:', err);
      toast({
        title: "Erro",
        description: "Erro inesperado ao remover membro.",
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
