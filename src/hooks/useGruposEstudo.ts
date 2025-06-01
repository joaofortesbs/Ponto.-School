
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface GrupoEstudo {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  membros: number;
  topico: string;
  topico_nome: string;
  topico_icon: string;
  privado: boolean;
  visibilidade: string;
  codigo_unico: string;
  is_publico: boolean;
  data_criacao: string;
  user_id: string;
}

export interface CreateGrupoEstudoData {
  nome: string;
  descricao: string;
  cor?: string;
  topico?: string;
  topico_nome?: string;
  topico_icon?: string;
  privado?: boolean;
  visibilidade?: string;
  is_publico?: boolean;
}

export const useGruposEstudo = () => {
  const [grupos, setGrupos] = useState<GrupoEstudo[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  // Function to generate unique code
  const generateUniqueCode = (): string => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  // Load user's study groups
  const loadGrupos = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user found');
        return;
      }

      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('user_id', user.id)
        .order('data_criacao', { ascending: false });

      if (error) {
        console.error('Error loading groups:', error);
        toast({
          title: "Erro ao carregar grupos",
          description: "Não foi possível carregar seus grupos de estudo.",
          variant: "destructive"
        });
        return;
      }

      setGrupos(data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: "Erro ao carregar grupos",
        description: "Erro inesperado ao carregar grupos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new study group
  const createGrupo = async (grupoData: CreateGrupoEstudoData): Promise<boolean> => {
    // Prevent multiple simultaneous creation attempts
    if (creating) {
      console.log('Creation already in progress, ignoring duplicate request');
      return false;
    }

    try {
      setCreating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para criar um grupo.",
          variant: "destructive"
        });
        return false;
      }

      // Generate unique code
      const codigoUnico = generateUniqueCode();

      const { data, error } = await supabase
        .from('grupos_estudo')
        .insert({
          user_id: user.id,
          nome: grupoData.nome,
          descricao: grupoData.descricao || '',
          cor: grupoData.cor || '#FF6B00',
          topico: grupoData.topico || '',
          topico_nome: grupoData.topico_nome || '',
          topico_icon: grupoData.topico_icon || '',
          privado: grupoData.privado || false,
          visibilidade: grupoData.visibilidade || 'todos',
          is_publico: grupoData.is_publico || false,
          codigo_unico: codigoUnico,
          membros: 1
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating group:', error);
        toast({
          title: "Erro ao criar grupo",
          description: "Não foi possível criar o grupo. Tente novamente.",
          variant: "destructive"
        });
        return false;
      }

      if (data) {
        setGrupos(prev => [data, ...prev]);
        toast({
          title: "Grupo criado com sucesso!",
          description: `Grupo "${grupoData.nome}" foi criado com o código ${codigoUnico}.`,
          className: "bg-green-50 border-green-200 text-green-800"
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro inesperado ao criar grupo.",
        variant: "destructive"
      });
      return false;
    } finally {
      setCreating(false);
    }
  };

  // Delete study group
  const deleteGrupo = async (grupoId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('grupos_estudo')
        .delete()
        .eq('id', grupoId);

      if (error) {
        console.error('Error deleting group:', error);
        toast({
          title: "Erro ao excluir grupo",
          description: "Não foi possível excluir o grupo.",
          variant: "destructive"
        });
        return false;
      }

      setGrupos(prev => prev.filter(grupo => grupo.id !== grupoId));
      toast({
        title: "Grupo excluído",
        description: "Grupo foi excluído com sucesso.",
        className: "bg-green-50 border-green-200 text-green-800"
      });
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      return false;
    }
  };

  // Load groups on mount
  useEffect(() => {
    loadGrupos();
  }, []);

  return {
    grupos,
    loading,
    creating,
    loadGrupos,
    createGrupo,
    deleteGrupo
  };
};
