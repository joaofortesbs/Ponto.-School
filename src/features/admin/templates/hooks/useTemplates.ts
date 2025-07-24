
import { useState, useCallback } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Template } from '../types';
import schoolPowerActivities from '../../../schoolpower/data/schoolPowerActivities.json';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  const syncTemplates = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Buscar templates existentes no Supabase
      const { data: existingTemplates, error: fetchError } = await supabase
        .from('school_power_templates')
        .select('*');

      if (fetchError) {
        console.error('Error fetching templates:', fetchError);
        return;
      }

      // 2. Converter JSON para array de templates
      const jsonTemplates = Object.entries(schoolPowerActivities).map(([id, activity]) => ({
        id,
        name: activity.name,
        status: 'draft' as const,
        ia_provider: 'Gemini',
        fields: {},
        last_generated_preview: {},
      }));

      // 3. Sincronizar: inserir novos, manter existentes, remover deletados
      const existingIds = new Set(existingTemplates?.map(t => t.id) || []);
      const jsonIds = new Set(jsonTemplates.map(t => t.id));

      // Inserir novos templates
      const newTemplates = jsonTemplates.filter(t => !existingIds.has(t.id));
      if (newTemplates.length > 0) {
        const { error: insertError } = await supabase
          .from('school_power_templates')
          .insert(newTemplates);

        if (insertError) {
          console.error('Error inserting new templates:', insertError);
        }
      }

      // Remover templates que não existem mais no JSON
      const deletedIds = Array.from(existingIds).filter(id => !jsonIds.has(id));
      if (deletedIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('school_power_templates')
          .delete()
          .in('id', deletedIds);

        if (deleteError) {
          console.error('Error deleting templates:', deleteError);
        }
      }

      // 4. Buscar todos os templates atualizados
      const { data: updatedTemplates, error: finalFetchError } = await supabase
        .from('school_power_templates')
        .select('*')
        .order('name', { ascending: true });

      if (finalFetchError) {
        console.error('Error fetching updated templates:', finalFetchError);
        return;
      }

      setTemplates(updatedTemplates || []);
    } catch (error) {
      console.error('Error syncing templates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (template: Template) => {
    try {
      const { error } = await supabase
        .from('school_power_templates')
        .update({
          name: template.name,
          status: template.status,
          ia_provider: template.ia_provider,
          fields: template.fields,
          last_generated_preview: template.last_generated_preview,
          updated_at: new Date().toISOString(),
        })
        .eq('id', template.id);

      if (error) {
        console.error('Error updating template:', error);
        throw error;
      }

      // Atualizar estado local
      setTemplates(prev => 
        prev.map(t => t.id === template.id ? { ...t, ...template } : t)
      );
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }, []);

  return {
    templates,
    loading,
    syncTemplates,
    updateTemplate,
  };
};
