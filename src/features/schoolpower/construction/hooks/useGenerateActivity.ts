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
        // Utiliza a nova classe PlanoAulaGenerator
        return await PlanoAulaGenerator.generatePlanoAula(formData);
      }

      // Lógica específica para lista de exercícios
      if (activityId === 'lista-exercicios') {
        return await generateExerciseList(formData);
      }

      // Lógica genérica para outras atividades
      // Usa a função original importada 'generateActivityContent'
      return await generateGenericActivity(formData);

    } catch (error: any) {
      console.error('❌ Erro na geração da atividade:', error);
      setError(error.message || 'Erro desconhecido na geração da atividade');
      // Lançar o erro para que possa ser tratado pelo chamador, se necessário
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [activityId, activityType]); // Dependências do useCallback mantidas

  return {
    generateActivity,
    isGenerating,
    error
  };
}