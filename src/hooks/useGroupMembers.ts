
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

  const loadMembers = async () => {
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

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('membros_grupos')
        .delete()
        .eq('grupo_id', groupId)
        .eq('user_id', memberId);

      if (error) {
        console.error('Erro ao remover membro:', error);
        toast({
          title: "Erro",
          description: "Erro ao remover membro do grupo.",
          variant: "destructive"
        });
        return false;
      }

      // Atualizar lista local removendo o membro
      setMembers(prev => prev.filter(member => member.id !== memberId));
      
      toast({
        title: "Sucesso",
        description: "Membro removido com sucesso.",
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
