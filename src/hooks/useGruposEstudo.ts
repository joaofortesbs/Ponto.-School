
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface GrupoEstudo {
  id: string;
  nome: string;
  descricao?: string;
  user_id: string;
  codigo_unico: string;
  is_publico: boolean;
  created_at: string;
  membros: number;
}

export const useGruposEstudo = () => {
  const [grupos, setGrupos] = useState<GrupoEstudo[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const loadGrupos = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('Usuário não autenticado');
        return;
      }

      // Buscar grupos onde o usuário é membro
      const { data: gruposData, error } = await supabase
        .from('grupos_estudo')
        .select(`
          id,
          nome,
          descricao,
          user_id,
          codigo_unico,
          is_publico,
          created_at,
          membros
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar grupos:', error);
        return;
      }

      setGrupos(gruposData || []);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGrupo = async (dadosGrupo: {
    nome: string;
    descricao?: string;
    is_publico: boolean;
  }) => {
    if (creating) return null; // Previne duplicação

    try {
      setCreating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return null;
      }

      // Gerar código único
      const codigoUnico = Math.random().toString(36).substr(2, 8).toUpperCase();

      const { data: novoGrupo, error } = await supabase
        .from('grupos_estudo')
        .insert({
          nome: dadosGrupo.nome,
          descricao: dadosGrupo.descricao,
          user_id: user.id,
          codigo_unico: codigoUnico,
          is_publico: dadosGrupo.is_publico,
          membros: 1
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar grupo:', error);
        toast({
          title: "Erro ao criar grupo",
          description: "Tente novamente.",
          variant: "destructive"
        });
        return null;
      }

      toast({
        title: "Grupo criado com sucesso!",
        description: `Código do grupo: ${codigoUnico}`,
        className: "bg-green-50 border-green-200 text-green-800"
      });

      // Recarregar grupos
      await loadGrupos();
      return novoGrupo;
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast({
        title: "Erro ao criar grupo",
        description: "Tente novamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setCreating(false);
    }
  };

  const deleteGrupo = async (grupoId: string) => {
    try {
      const { error } = await supabase
        .from('grupos_estudo')
        .delete()
        .eq('id', grupoId);

      if (error) {
        console.error('Erro ao excluir grupo:', error);
        toast({
          title: "Erro ao excluir grupo",
          description: "Tente novamente.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Grupo excluído com sucesso!",
        className: "bg-green-50 border-green-200 text-green-800"
      });

      // Recarregar grupos
      await loadGrupos();
      return true;
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      return false;
    }
  };

  useEffect(() => {
    loadGrupos();
  }, []);

  return {
    grupos,
    loading,
    creating,
    createGrupo,
    deleteGrupo,
    reloadGrupos: loadGrupos
  };
};
