import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { PlanoAulaGenerator } from '../../activities/plano-aula/PlanoAulaGenerator';
import { generateActivityContent as generateActivityContentOld } from '../api/generateActivity'; // Para fallback apenas
import { generateActivityContent } from '../api/generateActivityContent'; // CORRETO - Tem todos os geradores implementados!

// Assumindo a existência destas funções, conforme o snippet de alteração
// e que elas serão utilizadas para outros tipos de atividades.
// Se não existirem, a integração do Plano de Aula ainda funcionará.
async function generateExerciseList(formData: any) {
  console.log('📚 [useGenerateActivity] Gerando lista de exercícios...');
  return await generateActivityContent('lista-exercicios', formData);
}

async function generateGenericActivity(formData: any, activityType: string) {
  console.log('🎯 [useGenerateActivity] Gerando atividade genérica:', activityType);
  return await generateActivityContent(activityType, formData);
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
      console.log('=====================================');
      console.log('🚀 [useGenerateActivity] INICIANDO GERAÇÃO');
      console.log('=====================================');
      console.log('📊 Activity ID:', activityId);
      console.log('📊 Activity Type:', activityType);
      console.log('📋 FormData:', JSON.stringify(formData, null, 2).substring(0, 500) + '...');
      console.log('=====================================');

      // Lógica específica para plano de aula
      if (activityId === 'plano-aula') {
        console.log('📚 [useGenerateActivity] Gerando Plano de Aula...');
        return await PlanoAulaGenerator.generatePlanoAula(formData);
      }

      // Lógica específica para Tese de Redação
      if (activityId === 'tese-redacao') {
        console.log('📝 [useGenerateActivity] Gerando Tese de Redação...');
        const result = await generateActivityContent('tese-redacao', formData);
        console.log('✅ [useGenerateActivity] Tese de Redação gerada:', result);
        return result;
      }

      // Lógica específica para lista de exercícios
      if (activityId === 'lista-exercicios') {
        console.log('%c📚 [useGenerateActivity] GERANDO LISTA DE EXERCÍCIOS COM IA!', 'background: #4CAF50; color: white; font-size: 16px; padding: 5px;');
        console.log('📚 [useGenerateActivity] Dados do formulário:', formData);
        try {
          const result = await generateExerciseList(formData);
          console.log('%c✅ [useGenerateActivity] LISTA GERADA COM SUCESSO!', 'background: green; color: white; font-size: 16px; padding: 5px;');
          console.log('📚 [useGenerateActivity] Resultado:', {
            titulo: result?.titulo,
            questoesCount: result?.questoes?.length || 0,
            isGeneratedByAI: result?.isGeneratedByAI
          });
          return result;
        } catch (listError) {
          console.error('%c❌ [useGenerateActivity] ERRO NA GERAÇÃO DA LISTA!', 'background: red; color: white; font-size: 16px; padding: 5px;');
          console.error('📚 [useGenerateActivity] Erro:', listError);
          throw listError;
        }
      }

      // Lógica genérica para outras atividades
      console.log('🎯 [useGenerateActivity] Usando gerador genérico...');
      return await generateGenericActivity(formData, activityId);

    } catch (error: any) {
      console.error('=====================================');
      console.error('❌ [useGenerateActivity] ERRO NA GERAÇÃO!');
      console.error('=====================================');
      console.error('📛 Erro:', error);
      console.error('📛 Mensagem:', error.message);
      console.error('=====================================');
      setError(error.message || 'Erro desconhecido na geração da atividade');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [activityId, activityType]);

  return {
    generateActivity,
    isGenerating,
    error
  };
}