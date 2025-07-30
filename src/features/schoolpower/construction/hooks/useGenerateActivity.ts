import { useState, useCallback } from 'react';
import { ActivityFormData } from '../types/ActivityTypes';
import { activityGenerationService } from '../services/activityGenerationService';

interface UseGenerateActivityProps {
  activityId: string;
  activityType: string;
}

export const useGenerateActivity = ({ activityId, activityType }: UseGenerateActivityProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const generateActivity = useCallback(async (formData: ActivityFormData) => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await activityGenerationService.generateActivity(activityId, formData);
      setGeneratedContent(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [activityId]);

  const loadSavedContent = useCallback(() => {
    try {
      const saved = localStorage.getItem(`activity_${activityId}`);
      if (saved) {
        const parsedContent = JSON.parse(saved);
        setGeneratedContent(parsedContent);
        return parsedContent;
      }
    } catch (err) {
      console.error('Erro ao carregar conteúdo salvo:', err);
    }
    return null;
  }, [activityId]);

  const clearContent = useCallback(() => {
    setGeneratedContent(null);
    localStorage.removeItem(`activity_${activityId}`);
  }, [activityId]);

  return {
    generateActivity,
    loadSavedContent,
    clearContent,
    isGenerating,
    error,
    generatedContent
  };
};