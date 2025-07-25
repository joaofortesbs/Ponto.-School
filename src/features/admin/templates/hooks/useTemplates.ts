
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
      const { error: deleteError } = await supabase
        .from('school_power_templates')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Remover do estado local
      setTemplates(prev => prev.filter(template => template.id !== id));
      return true;
    } catch (err: any) {
      console.error('Erro ao deletar template:', err);
      setError(err.message || 'Erro ao deletar template');
      return false;
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
    deleteTemplate
  };
};
