import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Template } from '../types';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('school_power_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Mapear os dados para o formato esperado
      const mappedTemplates: Template[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category || 'geral',
        tags: item.tags || [],
        difficulty: item.difficulty || 'medio',
        apiType: item.api_provider || 'gemini',
        enabled: item.enabled,
        prompt: item.prompt || '',
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setTemplates(mappedTemplates);
    } catch (err: any) {
      console.error('Erro ao buscar templates:', err);
      setError(err.message || 'Erro ao carregar templates');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTemplate = async (id: string, updates: Partial<Template>) => {
    try {
      const { error: updateError } = await supabase
        .from('school_power_templates')
        .update({
          name: updates.name,
          description: updates.description,
          category: updates.category,
          tags: updates.tags,
          difficulty: updates.difficulty,
          api_provider: updates.apiType,
          enabled: updates.enabled,
          prompt: updates.prompt,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Atualizar o estado local
      setTemplates(prev => 
        prev.map(template => 
          template.id === id ? { ...template, ...updates } : template
        )
      );

      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar template:', err);
      setError(err.message || 'Erro ao atualizar template');
      return false;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('school_power_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== id));
      toast({
        title: 'Template excluído',
        description: 'Template foi excluído com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir template.',
        variant: 'destructive',
      });
    }
  };

  const saveGeneratedActivity = async (
    templateId: string,
    title: string,
    content: string,
    formData: Record<string, string>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('generated_activities')
        .insert({
          template_id: templateId,
          user_id: user.id,
          title,
          content,
          form_data: formData,
          status: 'generated'
        });

      if (error) throw error;

      // Atualizar contador de gerações do template
      await supabase
        .from('school_power_templates')
        .update({
          last_generated_preview: content.substring(0, 500),
          last_generated_at: new Date().toISOString(),
          generation_count: supabase.sql`generation_count + 1`
        })
        .eq('id', templateId);

      toast({
        title: 'Atividade salva',
        description: 'A atividade foi salva com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar atividade.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    error,
    refetch: fetchTemplates,
    updateTemplate,
    deleteTemplate,
        saveGeneratedActivity,
    refetch: fetchTemplates
  };
};