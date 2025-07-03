
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

      const cacheKey = `members-${groupId}`;
      const timestampKey = `members-${groupId}-timestamp`;
      const cacheTimeout = 30000; // 30 segundos

      // Verificar cache primeiro
      const cachedMembers = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(timestampKey);
      
      if (cachedMembers && cacheTimestamp) {
        const isExpired = Date.now() - parseInt(cacheTimestamp) > cacheTimeout;
        if (!isExpired) {
          try {
            const parsedMembers = JSON.parse(cachedMembers);
            setMembers(parsedMembers);
            console.log(`Membros carregados do cache para o grupo ${groupId}:`, parsedMembers.length);
            setLoading(false);
            return;
          } catch (cacheError) {
            console.warn('Erro ao parsear cache, recarregando do banco:', cacheError);
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(timestampKey);
          }
        }
      }

      console.log(`Carregando membros do banco de dados para o grupo ${groupId}`);

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

      // Salvar no cache
      try {
        localStorage.setItem(cacheKey, JSON.stringify(allMembers));
        localStorage.setItem(timestampKey, Date.now().toString());
        console.log(`Membros salvos no cache para o grupo ${groupId}`);
      } catch (storageError) {
        console.warn('Erro ao salvar no cache:', storageError);
      }

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
      // Limpar cache antes de recarregar
      const cacheKey = `members-${groupId}`;
      const timestampKey = `members-${groupId}-timestamp`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(timestampKey);
      console.log('Cache limpo antes do refresh');
      
      await loadMembers();
      console.log('Refresh da lista de membros concluído com sucesso');
    } catch (error) {
      console.error('Erro durante refresh da lista de membros:', error);
    }
  };

  const removeMember = async (memberId: string): Promise<boolean> => {
    const shadowLog = (message: string) => console.log(`[SHADOW] ${message} - Group: ${groupId}, User: ${memberId}`);
    
    try {
      shadowLog('Iniciando processo de remoção híbrida');
      
      // Verificar autenticação do usuário atual
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        shadowLog('Erro de autenticação detectado');
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return false;
      }

      // Verificar permissões - apenas criadores podem remover membros
      const { data: groupData, error: groupError } = await supabase
        .from('grupos_estudo')
        .select('criador_id')
        .eq('id', groupId)
        .single();

      if (groupError) {
        shadowLog('Erro ao verificar permissões do grupo');
        toast({
          title: "Erro",
          description: "Erro ao verificar permissões do grupo.",
          variant: "destructive"
        });
        return false;
      }

      if (groupData.criador_id !== user.id) {
        shadowLog('Permissão negada - usuário não é criador do grupo');
        toast({
          title: "Erro",
          description: "Apenas o criador do grupo pode remover membros.",
          variant: "destructive"
        });
        return false;
      }

      // Salvar estado atual para rollback
      const currentMembers = [...members];
      shadowLog('Estado atual salvo para rollback');

      // Remoção otimista imediata na interface
      setMembers(prevMembers => {
        const updatedMembers = prevMembers.filter(member => member.id !== memberId);
        shadowLog(`Interface atualizada imediatamente. Membros restantes: ${updatedMembers.length}`);
        return updatedMembers;
      });

      // Verificar se o membro existe na tabela antes de tentar remover
      const { data: existingMember, error: checkError } = await supabase
        .from('membros_grupos')
        .select('user_id, grupo_id')
        .eq('grupo_id', groupId)
        .eq('user_id', memberId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        shadowLog('Erro ao verificar existência do membro');
        // Rollback na interface
        setMembers(currentMembers);
        toast({
          title: "Erro",
          description: "Erro ao verificar membro no grupo.",
          variant: "destructive"
        });
        return false;
      }

      if (!existingMember) {
        shadowLog('Membro não encontrado na tabela membros_grupos');
        // Rollback na interface
        setMembers(currentMembers);
        toast({
          title: "Aviso",
          description: "Membro não encontrado no grupo.",
          variant: "default"
        });
        return false;
      }

      shadowLog(`Membro encontrado: user_id=${existingMember.user_id}, grupo_id=${existingMember.grupo_id}`);

      // Tentar remover com retry system
      const maxRetries = 3;
      const retryDelay = 1000;
      let lastError;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          shadowLog(`Tentativa ${attempt} de remoção no banco de dados`);
          
          const { error: deleteError } = await supabase
            .from('membros_grupos')
            .delete()
            .eq('grupo_id', groupId)
            .eq('user_id', memberId);

          if (deleteError) {
            throw deleteError;
          }

          shadowLog(`Remoção bem-sucedida na tentativa ${attempt}`);
          
          // Verificar se a remoção foi realmente efetivada
          const { data: verifyRemoval, error: verifyError } = await supabase
            .from('membros_grupos')
            .select('user_id')
            .eq('grupo_id', groupId)
            .eq('user_id', memberId);

          if (verifyError) {
            throw verifyError;
          }

          if (verifyRemoval && verifyRemoval.length === 0) {
            shadowLog('Remoção verificada: membro não está mais na tabela');
            
            // Atualizar cache local
            localStorage.removeItem(`members-${groupId}-${memberId}`);
            
            // Recarregar lista completa para garantir sincronização
            setTimeout(() => {
              refreshMembers();
            }, 500);
            
            toast({
              title: "Sucesso",
              description: "Membro removido com sucesso do grupo.",
              variant: "default"
            });

            return true;
          } else {
            shadowLog('Aviso: membro ainda encontrado na tabela após remoção');
            throw new Error('Membro ainda encontrado após remoção');
          }

        } catch (error) {
          lastError = error;
          shadowLog(`Tentativa ${attempt} falhou: ${error.message}`);
          
          if (attempt < maxRetries) {
            shadowLog(`Aguardando ${retryDelay}ms antes da próxima tentativa`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }

      // Se chegou aqui, todas as tentativas falharam
      shadowLog(`Todas as ${maxRetries} tentativas falharam. Executando rollback.`);
      
      // Rollback na interface
      setMembers(currentMembers);
      
      toast({
        title: "Erro",
        description: `Erro ao remover membro: ${lastError?.message || 'Erro desconhecido'}`,
        variant: "destructive"
      });

      return false;

    } catch (err) {
      shadowLog(`Erro inesperado: ${err.message}`);
      
      // Rollback na interface em caso de erro inesperado
      setMembers(prevMembers => {
        const memberExists = prevMembers.find(member => member.id === memberId);
        if (!memberExists) {
          // Recarregar completamente se necessário
          refreshMembers();
        }
        return prevMembers;
      });
      
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
