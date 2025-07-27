
import { useState, useCallback } from 'react';
import { ActivityFormData, GeneratedActivity, ActivityGenerationPayload } from '../types/ActivityTypes';
import { generateActivityAPI, validateActivityData } from '../api/generateActivity';

interface UseGenerateActivityProps {
  activityId: string;
  activityType?: string;
}

export const useGenerateActivity = ({ activityId, activityType }: UseGenerateActivityProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const generateActivity = useCallback(async (formData: ActivityFormData) => {
    setIsGenerating(true);
    setError(null);

    try {
      const payload: ActivityGenerationPayload = {
        ...formData,
        activityId,
        activityType: activityType || ''
      };

      // Validar dados
      const validationErrors = validateActivityData(payload);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        setIsGenerating(false);
        return;
      }

      // Gerar atividade
      const result = await generateActivityAPI(payload);
      setGeneratedContent(result.content);
      
      // Salvar no localStorage para persistência
      localStorage.setItem(`generated_activity_${activityId}`, JSON.stringify({
        content: result.content,
        metadata: result.metadata,
        timestamp: Date.now()
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsGenerating(false);
    }
  }, [activityId, activityType]);

  const loadSavedContent = useCallback(() => {
    try {
      const saved = localStorage.getItem(`generated_activity_${activityId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setGeneratedContent(parsed.content);
      }
    } catch (err) {
      console.error('Erro ao carregar conteúdo salvo:', err);
    }
  }, [activityId]);

  const clearContent = useCallback(() => {
    setGeneratedContent('');
    localStorage.removeItem(`generated_activity_${activityId}`);
  }, [activityId]);

  return {
    generateActivity,
    loadSavedContent,
    clearContent,
    isGenerating,
    generatedContent,
    error
  };
};
