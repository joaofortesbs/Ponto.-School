
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
    const shadowLog = (message: string) => console.log(`[SHADOW REMOVE] ${message} - Group: ${groupId}, User: ${memberId}`);
    
    try {
      shadowLog('Iniciando processo de remoção replicando lógica do botão Sair');
      
      // Verificar autenticação do usuário atual
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        shadowLog('Erro de autenticação detectado');
        console.error('Usuário não autenticado ao tentar remover membro');
        return false; // Não exibir erro ao usuário, apenas logar
      }

      // Verificar permissões - apenas criadores podem remover membros
      const { data: groupData, error: groupError } = await supabase
        .from('grupos_estudo')
        .select('criador_id')
        .eq('id', groupId)
        .single();

      if (groupError) {
        shadowLog('Erro ao verificar permissões do grupo');
        console.error('Erro ao verificar permissões:', groupError.message);
        return false; // Não exibir erro ao usuário
      }

      if (groupData.criador_id !== user.id) {
        shadowLog('Permissão negada - usuário não é criador do grupo');
        console.warn(`Usuário ${user.id} não tem permissão para remover membros do grupo ${groupId}`);
        return false; // Não exibir erro ao usuário
      }

      // Remoção otimista imediata na interface
      shadowLog('Removendo membro da interface imediatamente');
      setMembers(prevMembers => {
        const updatedMembers = prevMembers.filter(member => member.id !== memberId);
        shadowLog(`Interface atualizada. Membros restantes: ${updatedMembers.length}`);
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
        console.error('Erro na verificação:', checkError.message);
        // Forçar refresh para sincronizar estado
        refreshMembers();
        return false;
      }

      if (!existingMember) {
        shadowLog('Membro não encontrado na tabela membros_grupos');
        console.warn(`Membro ${memberId} não encontrado no grupo ${groupId}`);
        // Manter remoção da interface já que não existe no DB
        return true;
      }

      shadowLog(`Membro encontrado: user_id=${existingMember.user_id}, grupo_id=${existingMember.grupo_id}`);

      // Retry system robusto - 5 tentativas com 500ms de intervalo (igual ao botão Sair)
      const maxRetries = 5;
      const retryDelay = 500;
      let lastError;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          shadowLog(`Tentativa ${attempt} de ${maxRetries} - Executando DELETE na tabela membros_grupos`);
          
          // Query idêntica ao botão "Sair"
          const { data, error: deleteError } = await supabase
            .from('membros_grupos')
            .delete()
            .eq('grupo_id', groupId)
            .eq('user_id', memberId);

          if (deleteError) {
            throw deleteError;
          }

          shadowLog(`Remoção executada com sucesso na tentativa ${attempt}`);
          
          // Verificação adicional para confirmar remoção
          const { data: verifyRemoval, error: verifyError } = await supabase
            .from('membros_grupos')
            .select('user_id')
            .eq('grupo_id', groupId)
            .eq('user_id', memberId);

          if (verifyError) {
            shadowLog(`Erro na verificação: ${verifyError.message}`);
            throw verifyError;
          }

          if (verifyRemoval && verifyRemoval.length === 0) {
            shadowLog('✅ Remoção confirmada: membro não existe mais na tabela');
            
            // Limpar cache relacionado
            const cacheKey = `members-${groupId}`;
            const timestampKey = `members-${groupId}-timestamp`;
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(timestampKey);
            shadowLog('Cache limpo após remoção bem-sucedida');
            
            // Agendar refresh para garantir sincronização
            setTimeout(() => {
              shadowLog('Executando refresh agendado após remoção');
              refreshMembers();
            }, 300);
            
            // Toast de sucesso sem interromper fluxo
            toast({
              title: "Sucesso",
              description: "Membro removido com sucesso do grupo.",
              variant: "default"
            });

            return true;
          } else {
            shadowLog('⚠️ Aviso: membro ainda encontrado na tabela após DELETE');
            throw new Error('Membro ainda existe após operação DELETE');
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

      // Todas as tentativas falharam
      shadowLog(`❌ Todas as ${maxRetries} tentativas falharam. Última tentativa de recovery.`);
      
      // Forçar remoção da interface e refresh
      setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
      
      // Refresh forçado para tentar sincronizar
      setTimeout(() => {
        shadowLog('Executando refresh de recovery');
        refreshMembers();
      }, 1000);
      
      // Logar erro no console mas não interromper fluxo do usuário
      console.error(`Falha na remoção do membro ${memberId} do grupo ${groupId}:`, lastError?.message || 'Erro desconhecido');

      return false;

    } catch (err) {
      shadowLog(`💥 Erro crítico inesperado: ${err.message}`);
      console.error('Erro crítico na remoção de membro:', err);
      
      // Forçar remoção da interface como fallback
      setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
      
      // Refresh de emergência
      setTimeout(() => {
        shadowLog('Executando refresh de emergência');
        refreshMembers();
      }, 1500);
      
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
