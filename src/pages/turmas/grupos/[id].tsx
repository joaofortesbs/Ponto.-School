
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GroupDetail from "@/components/turmas/GroupDetail";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState({
    id: "",
    nome: "",
    descricao: "",
    membros: 0,
    tags: [],
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) {
        navigate("/turmas/grupos");
        return;
      }

      try {
        // Verificar se o usuário está autenticado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Acesso negado",
            description: "Você precisa estar logado para acessar grupos",
            variant: "destructive",
          });
          navigate("/turmas/grupos");
          return;
        }

        // Verificar se o usuário é membro do grupo
        const { data: membership, error: membershipError } = await supabase
          .from('membros_grupos')
          .select('id')
          .eq('grupo_id', id)
          .eq('user_id', user.id)
          .single();

        if (membershipError || !membership) {
          toast({
            title: "Acesso negado",
            description: "Você não é membro deste grupo",
            variant: "destructive",
          });
          navigate("/turmas/grupos");
          return;
        }

        // Buscar dados do grupo
        const { data: groupData, error: groupError } = await supabase
          .from('grupos_estudo')
          .select('*')
          .eq('id', id)
          .single();

        if (groupError || !groupData) {
          console.error('Erro ao buscar grupo:', groupError);
          toast({
            title: "Erro",
            description: "Grupo não encontrado",
            variant: "destructive",
          });
          navigate("/turmas/grupos");
          return;
        }

        // Contar membros
        const { data: membersCount } = await supabase
          .from('membros_grupos')
          .select('id', { count: 'exact' })
          .eq('grupo_id', id);

        setGroup({
          id: groupData.id,
          nome: groupData.nome,
          descricao: groupData.descricao || "",
          membros: membersCount?.length || 0,
          tags: groupData.tags || [],
        });

      } catch (error) {
        console.error("Error fetching group:", error);
        toast({
          title: "Erro",
          description: "Erro inesperado ao carregar grupo",
          variant: "destructive",
        });
        navigate("/turmas/grupos");
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id, navigate, toast]);

  const handleBack = () => {
    navigate("/turmas/grupos");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#001427]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  return <GroupDetail group={group} onBack={handleBack} />;
}
