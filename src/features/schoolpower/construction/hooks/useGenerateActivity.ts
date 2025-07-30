import { useState } from 'react';
import { generateActivityContent } from '../api/generateActivity';
import { validateAndNormalizeQuestions, isValidExerciseList } from '../../services/questionValidator';

interface UseGenerateActivityProps {
  activityId: string;
  activityType: string;
}

export const useGenerateActivity = ({ activityId, activityType }: UseGenerateActivityProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateActivity = async (formData: any) => {
    try {
      setIsGenerating(true);
      setError(null);

      console.log('🚀 Iniciando geração de atividade:', { activityId, activityType });
      console.log('📋 Dados do formulário:', formData);

      const rawContent = await generateActivityContent(activityType, formData.contextData || formData);

      console.log('📦 Conteúdo bruto da IA:', rawContent);

      let processedContent = rawContent;

      // Para lista de exercícios, aplicar validação e normalização rigorosa
      if (activityType === 'lista-exercicios') {
        console.log('📝 Aplicando validação para lista de exercícios...');

        if (!isValidExerciseList(rawContent)) {
          throw new Error('IA não gerou uma lista de exercícios válida');
        }

        try {
          processedContent = validateAndNormalizeQuestions(rawContent, formData.contextData || formData);
          console.log('✅ Questões validadas e normalizadas:', processedContent);
        } catch (validationError) {
          console.error('❌ Erro na validação das questões:', validationError);
          throw new Error(`Erro na validação: ${validationError.message}`);
        }
      }

      setGeneratedContent(processedContent);

      // Salvar no localStorage com metadados
      const savedData = {
        ...processedContent,
        activityId,
        activityType,
        savedAt: new Date().toISOString(),
        formData: formData.contextData || formData
      };

      localStorage.setItem(`activity_${activityId}`, JSON.stringify(savedData));
      console.log('💾 Conteúdo salvo no localStorage');

      return processedContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro na geração da atividade:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateActivity,
    isGenerating,
    generatedContent,
    error
  };
};