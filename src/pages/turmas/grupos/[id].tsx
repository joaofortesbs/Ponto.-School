
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

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser && id) {
      fetchGroup();
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

  const fetchGroup = async () => {
    if (!currentUser || !id) return;
    
    try {
      setLoading(true);
      console.log('Carregando dados do grupo:', id);

      // Verificar se o usuário é membro do grupo
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

      // Verificar se o usuário está bloqueado
      const { data: blockData, error: blockError } = await supabase
        .from('bloqueios_grupos')
        .select('id')
        .eq('grupo_id', id)
        .eq('user_id', currentUser.id)
        .single();

      if (blockError && blockError.code !== 'PGRST116') {
        console.error('Erro ao verificar bloqueio:', blockError);
      }

      // Carregar dados básicos do grupo sempre
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

      // Se o usuário está bloqueado, mostrar modal
      if (blockData) {
        console.log('Usuário está bloqueado neste grupo');
        setIsBlocked(true);
        setShowBlockedModal(true);
      } else {
        setIsBlocked(false);
        setShowBlockedModal(false);
      }

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
          console.log('Novo bloqueio detectado:', payload);
          
          // Se o usuário atual foi bloqueado
          if (payload.new.user_id === currentUser.id) {
            console.log('Usuário atual foi bloqueado em tempo real');
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

  if (loading) {
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
