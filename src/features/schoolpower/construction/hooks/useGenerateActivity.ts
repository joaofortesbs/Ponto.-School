
import { useState } from 'react';
import { ActivityFormData } from '../types/ActivityTypes';
import { activityGenerationService } from '../services/activityGenerationService';
import { autoBuildService } from '../services/autoBuildService';

interface GenerationResult {
  success: boolean;
  content?: any;
  error?: string;
}

export const useGenerateActivity = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateActivity = async (
    activityType: string, 
    formData: ActivityFormData
  ): Promise<GenerationResult> => {
    console.log('🎯 Iniciando geração de atividade:', { activityType, formData });
    
    setIsGenerating(true);
    setError(null);
    
    try {
      let content: any;

      // Usar o serviço apropriado baseado no tipo
      if (activityType === 'lista-exercicios') {
        content = activityGenerationService.generateExerciseList(formData);
        console.log('📝 Lista de exercícios gerada:', content);
      } else {
        content = activityGenerationService.generateActivityContent(activityType, formData);
        console.log('📄 Conteúdo geral gerado:', content);
      }

      if (!content) {
        throw new Error('Falha na geração de conteúdo');
      }

      setGeneratedContent(content);
      
      console.log('✅ Geração concluída com sucesso:', {
        type: activityType,
        contentType: typeof content,
        hasQuestions: content.questions ? `${content.questions.length} questões` : 'Sem questões'
      });

      return {
        success: true,
        content
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido na geração';
      console.error('❌ Erro na geração:', errorMessage);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const getStoredActivity = (activityId: string) => {
    console.log('📖 Buscando atividade armazenada:', activityId);
    return autoBuildService.getActivityContent(activityId);
  };

  const clearGeneratedContent = () => {
    console.log('🧹 Limpando conteúdo gerado');
    setGeneratedContent(null);
    setError(null);
  };

  return {
    generateActivity,
    getStoredActivity,
    clearGeneratedContent,
    isGenerating,
    generatedContent,
    error
  };
};
