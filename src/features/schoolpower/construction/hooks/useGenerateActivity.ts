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
  const [generatedContent, setGeneratedContent] = useState<any>(null); // Adicionado estado para gerenciar o conteúdo gerado

  const generateActivity = useCallback(async (activityData: any) => {
    try {
      setIsGenerating(true);
      setError(null);

      console.log('Gerando atividade:', activityData);

      // Para plano de aula, usar o serviço especializado
      if (activityData.type === 'plano-aula') {
        const { default: PlanoAulaService } = await import('../../activities/plano-aula/planoAulaService');
        const planoContent = await PlanoAulaService.generatePlanoContent(activityData.data || {});

        // Validar e melhorar o conteúdo gerado
        const enhancedContent = await PlanoAulaService.validateAndEnhancePlano(planoContent);

        setGeneratedContent(enhancedContent);
        return enhancedContent;
      }

      // Para outros tipos de atividade, usar o sistema existente
      const generatedContent = await generateActivityContent(activityData);
      setGeneratedContent(generatedContent);

      return generatedContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar atividade';
      console.error('Erro na geração:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []); // A dependência 'activityId' e 'activityType' foram removidas pois a lógica interna agora verifica 'activityData.type'

  return {
    generateActivity,
    isGenerating,
    error,
    generatedContent // Retornando o conteúdo gerado
  };
}