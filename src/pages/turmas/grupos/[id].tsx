
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GroupDetail from "@/components/turmas/GroupDetail";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) {
        navigate("/turmas/grupos");
        return;
      }

      try {
        console.log('🔍 Buscando dados do grupo:', id);
        
        // Verificar se o usuário é membro do grupo
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('❌ Usuário não autenticado');
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
          console.error('❌ Erro ao buscar grupo:', groupError);
          navigate("/turmas/grupos");
          return;
        }

        // Verificar se o usuário é membro
        const { data: memberData, error: memberError } = await supabase
          .from('membros_grupos')
          .select('user_id')
          .eq('grupo_id', id)
          .eq('user_id', user.id)
          .single();

        if (memberError || !memberData) {
          console.error('❌ Usuário não é membro do grupo:', memberError);
          navigate("/turmas/grupos");
          return;
        }

        console.log('✅ Dados do grupo carregados:', groupData);
        setGroup({
          id: groupData.id,
          nome: groupData.nome,
          descricao: groupData.descricao || '',
          membros: groupData.membros || 0,
          tags: groupData.tags || [],
        });
      } catch (error) {
        console.error('❌ Erro geral ao buscar grupo:', error);
        navigate("/turmas/grupos");
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id, navigate]);

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

  return (
    <div className="min-h-screen bg-[#001427] p-4">
      <div className="container mx-auto max-w-7xl">
        <GroupDetail group={group} onBack={handleBack} />
      </div>
    </div>
  );
}
