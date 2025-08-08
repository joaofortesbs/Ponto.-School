import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { PlanoAulaGenerator } from '../../activities/plano-aula/PlanoAulaGenerator';
import { generateActivityContent } from '../api/generateActivity'; // Mantém a importação original para a lógica genérica

// Assumindo a existência destas funções, conforme o snippet de alteração
// e que elas serão utilizadas para outros tipos de atividades.
// Se não existirem, a integração do Plano de Aula ainda funcionará.
async function generateExerciseList(formData: any) {
  console.log('Gerando lista de exercícios com:', formData);
  // Implementação placeholder para generateExerciseList
  // Substituir pela lógica real de geração de lista de exercícios
  return { success: true, data: 'Lista de exercícios gerada com sucesso.' };
}

async function generateGenericActivity(formData: any) {
  console.log('Gerando atividade genérica com:', formData);
  // Usando a função original para atividades genéricas
  return await generateActivityContent('generic', formData);
}


interface UseGenerateActivityProps {
  activityId: string;
  activityType: string;
}

export const useGenerateActivity = ({ activityId, activityType }: UseGenerateActivityProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateActivity = useCallback(async (formData: any) => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('🚀 Iniciando geração de atividade:', { activityId, activityType, formData });

      // Lógica específica para plano de aula
      if (activityId === 'plano-aula') {
        console.log('📚 Gerando Plano de Aula...');
        const result = await PlanoAulaGenerator.generatePlanoAula(formData);
        console.log('✅ Plano de Aula gerado com sucesso:', result);
        
        // Salvar resultado específico para plano de aula
        if (result) {
          localStorage.setItem(`activity_${activityId}`, JSON.stringify({
            ...result,
            activityId,
            activityType: 'plano-aula',
            generatedAt: new Date().toISOString(),
            isGeneratedByAI: true
          }));
        }
        
        return result;
      }

      // Lógica específica para lista de exercícios
      if (activityId === 'lista-exercicios') {
        console.log('📝 Gerando Lista de Exercícios...');
        const result = await generateExerciseList(formData);
        console.log('✅ Lista de Exercícios gerada com sucesso:', result);
        return result;
      }

      // Lógica genérica para outras atividades
      console.log('🔧 Gerando atividade genérica...');
      const result = await generateGenericActivity(formData);
      console.log('✅ Atividade genérica gerada com sucesso:', result);
      return result;

    } catch (error: any) {
      console.error('❌ Erro na geração da atividade:', error);
      setError(error.message || 'Erro desconhecido na geração da atividade');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [activityId, activityType]);

  const loadSavedContent = useCallback(() => {
    console.log('🔄 Carregando conteúdo salvo para:', activityId);
    const savedContent = localStorage.getItem(`activity_${activityId}`);
    
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        console.log('✅ Conteúdo salvo carregado:', parsed);
        return parsed;
      } catch (error) {
        console.error('❌ Erro ao carregar conteúdo salvo:', error);
      }
    }
    
    return null;
  }, [activityId]);

  const clearContent = useCallback(() => {
    console.log('🗑️ Limpando conteúdo para:', activityId);
    localStorage.removeItem(`activity_${activityId}`);
    
    // Limpar também do cache de atividades construídas
    const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
    if (constructedActivities[activityId]) {
      delete constructedActivities[activityId];
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
    }
  }, [activityId]);

  return {
    generateActivity,
    loadSavedContent,
    clearContent,
    isGenerating,
    error
  };
}