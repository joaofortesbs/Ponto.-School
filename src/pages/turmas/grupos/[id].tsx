
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import GroupDetail from "@/components/turmas/group-detail";
import BlockedGroupModal from "@/components/turmas/group-detail/BlockedGroupModal";

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockCheckComplete, setBlockCheckComplete] = useState(false);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser && id) {
      // 🔥 PRIORIDADE MÁXIMA: Verificar bloqueio IMEDIATAMENTE
      checkBlockedStatusFirst();
    }
  }, [id, currentUser]);

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Erro ao obter usuário:', error);
        toast({
          title: "Erro",
          description: "Erro ao verificar autenticação",
          variant: "destructive"
        });
        navigate("/turmas/grupos");
        return;
      }
      
      if (!user) {
        toast({
          title: "Acesso negado",
          description: "Faça login para acessar este grupo",
          variant: "destructive"
        });
        navigate("/turmas/grupos");
        return;
      }
      
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      navigate("/turmas/grupos");
    }
  };

  const checkBlockedStatusFirst = async () => {
    if (!currentUser || !id) return;
    
    try {
      console.log(`🔥 VERIFICAÇÃO CRÍTICA: Checando bloqueio para usuário ${currentUser.id} no grupo ${id}`);

      // PRIMEIRA COISA: Verificar se o usuário está bloqueado
      const { data: blockData, error: blockError } = await supabase
        .from('bloqueios_grupos')
        .select('id, grupo_id, user_id, bloqueado_em')
        .eq('grupo_id', id)
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (blockError && blockError.code !== 'PGRST116') {
        console.error('Erro ao verificar bloqueio:', blockError);
      }

      if (blockData) {
        console.log(`🚫 BLOQUEIO CONFIRMADO: Usuário ${currentUser.id} está bloqueado no grupo ${id}`);
        
        // Carregar dados básicos do grupo APENAS para o modal
        const { data: groupData, error: groupError } = await supabase
          .from('grupos_estudo')
          .select('id, nome, descricao')
          .eq('id', id)
          .single();

        if (groupError || !groupData) {
          console.error('Erro ao carregar grupo:', groupError);
          toast({
            title: "Erro",
            description: "Grupo não encontrado",
            variant: "destructive"
          });
          navigate("/turmas/grupos");
          return;
        }

        setGroup(groupData);
        setIsBlocked(true);
        setShowBlockedModal(true);
        setBlockCheckComplete(true);
        setLoading(false);
        return;
      }

      console.log(`✅ Usuário ${currentUser.id} NÃO está bloqueado no grupo ${id}. Continuando carregamento normal.`);
      setIsBlocked(false);
      setBlockCheckComplete(true);
      
      // Agora sim, carregar o grupo normalmente
      fetchGroup();
    } catch (error) {
      console.error('Erro crítico ao verfiicar bloqueio:', error);
      setBlockCheckComplete(true);
      fetchGroup(); // Tentar carregar normalmente em caso de erro
    }
  };

  const fetchGroup = async () => {
    if (!currentUser || !id) return;
    
    try {
      setLoading(true);
      console.log('Carregando dados do grupo:', id);

      // Verificar se é membro do grupo
      const { data: membership, error: membershipError } = await supabase
        .from('membros_grupos')
        .select('*')
        .eq('grupo_id', id)
        .eq('user_id', currentUser.id)
        .single();

      if (membershipError || !membership) {
        console.error('Usuário não é membro do grupo:', membershipError);
        toast({
          title: "Acesso negado",
          description: "Você não é membro deste grupo",
          variant: "destructive"
        });
        navigate("/turmas/grupos");
        return;
      }

      // Carregar dados completos do grupo
      const { data: groupData, error: groupError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', id)
        .single();

      if (groupError || !groupData) {
        console.error('Erro ao carregar grupo:', groupError);
        toast({
          title: "Erro",
          description: "Grupo não encontrado",
          variant: "destructive"
        });
        navigate("/turmas/grupos");
        return;
      }

      setGroup(groupData);
      console.log('Dados do grupo carregados:', groupData);
    } catch (error) {
      console.error('Erro ao carregar grupo:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar grupo",
        variant: "destructive"
      });
      navigate("/turmas/grupos");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/turmas/grupos");
  };

  // Configurar realtime para detectar quando o usuário é bloqueado
  useEffect(() => {
    if (!id || !currentUser) return;

    const channel = supabase
      .channel(`group-access-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bloqueios_grupos',
          filter: `grupo_id=eq.${id}`
        },
        (payload: any) => {
          console.log('🔥 REALTIME: Novo bloqueio detectado:', payload);
          
          // Se o usuário atual foi bloqueado
          if (payload.new.user_id === currentUser.id) {
            console.log('🚫 REALTIME: Usuário atual foi bloqueado em tempo real');
            setIsBlocked(true);
            setShowBlockedModal(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, currentUser]);

  // Mostrar loading apenas se ainda não terminou de verificar o bloqueio
  if (loading || !blockCheckComplete) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#001427]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  if (!group || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#001427]">
        <div className="text-center text-white">
          <h2 className="text-xl mb-2">Grupo não encontrado</h2>
          <button 
            onClick={handleBack}
            className="bg-[#FF6B00] hover:bg-[#FF8C40] px-4 py-2 rounded text-white"
          >
            Voltar aos Grupos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001427] p-4 relative">
      <div className="container mx-auto max-w-7xl">
        {isBlocked ? (
          <>
            <div 
              className="blur-sm pointer-events-none opacity-50"
              style={{ filter: 'blur(5px)' }}
            >
              <GroupDetail 
                group={group} 
                currentUser={currentUser}
                onBack={handleBack} 
              />
            </div>
            
            <BlockedGroupModal
              isOpen={showBlockedModal}
              groupName={group?.nome || 'Grupo'}
              onBack={handleBack}
            />
          </>
        ) : (
          <GroupDetail 
            group={group} 
            currentUser={currentUser}
            onBack={handleBack} 
          />
        )}
      </div>
    </div>
  );
}
