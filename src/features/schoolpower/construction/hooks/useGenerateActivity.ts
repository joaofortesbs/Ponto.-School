import { useState, useCallback } from 'react';
import { validateAndNormalizeQuestions, isValidExerciseList } from '../../services/questionValidator';

interface UseGenerateActivityProps {
  activityId: string;
  activityType: string;
}

interface ActivityFormData {
  title?: string;
  description?: string;
  subject?: string;
  theme?: string;
  schoolYear?: string;
  numberOfQuestions?: string;
  difficultyLevel?: string;
  questionModel?: string;
  sources?: string;
  objectives?: string;
  materials?: string;
  instructions?: string;
  timeLimit?: string;
  context?: string;
}

export const useGenerateActivity = ({ activityId, activityType }: UseGenerateActivityProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateActivity = useCallback(async (formData: ActivityFormData) => {
    if (!activityId || !activityType) {
      throw new Error('Activity ID and type are required');
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('🚀 useGenerateActivity: Iniciando geração para:', activityType);
      console.log('📋 Dados do formulário:', formData);

      // Preparar dados de contexto para a IA
      const contextData = {
        // Dados em português para o prompt
        titulo: formData.title || 'Atividade',
        descricao: formData.description || '',
        disciplina: formData.subject || 'Português',
        tema: formData.theme || 'Conteúdo Geral',
        anoEscolaridade: formData.schoolYear || '6º ano',
        numeroQuestoes: parseInt(formData.numberOfQuestions || '10'),
        nivelDificuldade: formData.difficultyLevel || 'Médio',
        modeloQuestoes: formData.questionModel || 'Múltipla escolha e complete as frases',
        fontes: formData.sources || 'Gramática básica para concursos e exercícios online Brasil Escola',
        objetivos: formData.objectives || '',
        materiais: formData.materials || '',
        instrucoes: formData.instructions || '',
        tempoLimite: formData.timeLimit || '',
        contextoAplicacao: formData.context || '',

        // Dados alternativos em inglês para compatibilidade
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        theme: formData.theme,
        schoolYear: formData.schoolYear,
        numberOfQuestions: formData.numberOfQuestions,
        difficultyLevel: formData.difficultyLevel,
        questionModel: formData.questionModel,
        sources: formData.sources,
        objectives: formData.objectives,
        materials: formData.materials,
        instructions: formData.instructions,
        timeLimit: formData.timeLimit,
        context: formData.context
      };

      console.log('📊 Context data preparado para IA:', contextData);

      // Usar a função generateActivityContent diretamente
      const { generateActivityContent } = await import('../api/generateActivity');
      const result = await generateActivityContent(activityType, contextData);

      console.log('✅ Atividade gerada pela IA:', result);

      // Salvar no localStorage
      const saveKey = `activity_${activityId}`;
      localStorage.setItem(saveKey, JSON.stringify({
        ...result,
        generatedAt: new Date().toISOString(),
        activityId,
        activityType
      }));

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro na geração da atividade:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [activityId, activityType]);

  return {
    generateActivity,
    isGenerating,
    generatedContent,
    error
  };
};