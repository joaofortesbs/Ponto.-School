
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
    console.log('[REFRESH] Iniciando refresh da lista de membros...');
    try {
      // Limpar cache completamente antes de recarregar
      const cacheKey = `members-${groupId}`;
      const timestampKey = `members-${groupId}-timestamp`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(timestampKey);
      console.log('[REFRESH] Cache limpo completamente');
      
      // Forçar loading state
      setLoading(true);
      setError(null);
      
      await loadMembers();
      console.log('[REFRESH] Lista de membros recarregada com sucesso');
    } catch (error) {
      console.error('[REFRESH] Erro durante refresh da lista de membros:', error);
      setError('Erro ao atualizar lista de membros');
    }
  };

  const removeMember = async (memberId: string): Promise<boolean> => {
    const shadowLog = (message: string) => console.log(`[FIXED REMOVE] ${message} - Group: ${groupId}, User: ${memberId}`);
    
    try {
      shadowLog('Iniciando processo de remoção com retry system melhorado');
      
      // Verificar autenticação do usuário atual
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        shadowLog('Erro de autenticação detectado');
        console.error('Usuário não autenticado ao tentar remover membro');
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
        console.error('Erro ao verificar permissões:', groupError.message);
        return false;
      }

      if (groupData.criador_id !== user.id) {
        shadowLog('Permissão negada - usuário não é criador do grupo');
        console.warn(`Usuário ${user.id} não tem permissão para remover membros do grupo ${groupId}`);
        return false;
      }

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
        return false;
      }

      if (!existingMember) {
        shadowLog('Membro não encontrado na tabela membros_grupos - removendo da interface');
        // Remover da interface mesmo que não exista no DB
        setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
        return true;
      }

      shadowLog(`Membro encontrado: user_id=${existingMember.user_id}, grupo_id=${existingMember.grupo_id}`);

      // Remoção otimista da interface antes da operação no banco
      shadowLog('Removendo membro da interface otimisticamente');
      setMembers(prevMembers => {
        const updatedMembers = prevMembers.filter(member => member.id !== memberId);
        shadowLog(`Interface atualizada otimisticamente. Membros restantes: ${updatedMembers.length}`);
        return updatedMembers;
      });

      // Sistema de retry robusto - 5 tentativas com validação rigorosa
      const maxRetries = 5;
      const retryDelay = 500;
      let lastError;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          shadowLog(`=== TENTATIVA ${attempt}/${maxRetries} ===`);
          
          // Executar DELETE com query robusta
          const { data: deleteData, error: deleteError } = await supabase
            .from('membros_grupos')
            .delete()
            .eq('grupo_id', groupId)
            .eq('user_id', memberId);

          if (deleteError) {
            shadowLog(`DELETE falhou na tentativa ${attempt}: ${deleteError.message}`);
            throw deleteError;
          }

          shadowLog(`DELETE executado na tentativa ${attempt} - Resultado: ${JSON.stringify(deleteData)}`);
          
          // Aguardar um pouco para garantir propagação no banco
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Validação rigorosa pós-exclusão com múltiplas verificações
          shadowLog(`Iniciando validação pós-exclusão (tentativa ${attempt})`);
          
          // Primeira validação: busca específica
          const { data: validation1, error: validationError1 } = await supabase
            .from('membros_grupos')
            .select('user_id, grupo_id')
            .eq('grupo_id', groupId)
            .eq('user_id', memberId);

          if (validationError1) {
            shadowLog(`Erro na primeira validação: ${validationError1.message}`);
            throw validationError1;
          }

          shadowLog(`Primeira validação: encontrados ${validation1?.length || 0} registros`);
          
          if (validation1 && validation1.length === 0) {
            shadowLog('✅ SUCESSO: Primeira validação confirmou remoção');
            
            // Segunda validação: busca geral para garantia dupla
            const { data: validation2, error: validationError2 } = await supabase
              .from('membros_grupos')
              .select('user_id')
              .eq('grupo_id', groupId);

            if (validationError2) {
              shadowLog(`Erro na segunda validação: ${validationError2.message}`);
              // Continuar mesmo com erro na segunda validação se a primeira passou
            } else {
              const memberStillExists = validation2?.some(m => m.user_id === memberId);
              shadowLog(`Segunda validação: membro ainda existe? ${memberStillExists}`);
              
              if (memberStillExists) {
                shadowLog('⚠️ INCONSISTÊNCIA: Segunda validação encontrou o membro');
                throw new Error('Membro ainda encontrado na segunda validação');
              }
            }
            
            // Limpar cache para forçar reload
            const cacheKey = `members-${groupId}`;
            const timestampKey = `members-${groupId}-timestamp`;
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(timestampKey);
            shadowLog('Cache limpo após remoção confirmada');
            
            // Refresh da lista para sincronizar
            setTimeout(() => {
              shadowLog('Executando refresh pós-remoção para sincronização final');
              refreshMembers();
            }, 300);
            
            // Toast de sucesso
            toast({
              title: "Sucesso",
              description: "Membro removido com sucesso do grupo.",
              variant: "default"
            });

            shadowLog(`🎉 REMOÇÃO CONCLUÍDA COM SUCESSO na tentativa ${attempt}`);
            return true;
          } else {
            shadowLog(`❌ FALHA NA VALIDAÇÃO: Membro ainda encontrado (${validation1?.length} registros)`);
            throw new Error(`Membro ainda encontrado após DELETE - encontrados ${validation1?.length} registros`);
          }

        } catch (error) {
          lastError = error;
          shadowLog(`Tentativa ${attempt} falhou: ${error.message}`);
          
          if (attempt < maxRetries) {
            shadowLog(`Aguardando ${retryDelay}ms antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }

      // Todas as tentativas falharam - estratégia de recovery
      shadowLog(`❌ TODAS AS ${maxRetries} TENTATIVAS FALHARAM - Iniciando recovery`);
      
      // Manter remoção da interface (já foi feita otimisticamente)
      shadowLog('Mantendo remoção otimística da interface');
      
      // Refresh forçado para tentar sincronizar estado real
      setTimeout(() => {
        shadowLog('Executando refresh de recovery para sincronizar estado real');
        refreshMembers();
      }, 1000);
      
      // Logar erro detalhado no console
      console.error(`[ERRO REMOÇÃO] Falha ao remover membro ${memberId} do grupo ${groupId} após ${maxRetries} tentativas:`);
      console.error(`[ERRO REMOÇÃO] Último erro:`, lastError?.message || 'Erro desconhecido');
      console.error(`[ERRO REMOÇÃO] A interface foi atualizada otimisticamente, mas pode haver inconsistência com o banco`);

      return false;

    } catch (err) {
      shadowLog(`💥 ERRO CRÍTICO INESPERADO: ${err.message}`);
      console.error('Erro crítico na remoção de membro:', err);
      
      // Forçar remoção da interface como último recurso
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
