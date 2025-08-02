import { useState } from 'react';
import { generateActivityContent } from '../api/generateActivity';

export function useGenerateActivity() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateActivity = async (activityType: string, formData: any) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Preparar dados de contexto COMPLETOS para enviar para a IA
      const contextData = {
        // Dados em português para o prompt (IDENTICO ao modal e autoBuildService)
        titulo: formData.title || 'Atividade',
        descricao: formData.description || '',
        disciplina: formData.subject || 'Português',
        tema: formData.theme || 'Conteúdo Geral',
        anoEscolaridade: formData.schoolYear || '6º ano',
        numeroQuestoes: parseInt(formData.numberOfQuestions || '10'),
        nivelDificuldade: formData.difficultyLevel || 'Médio',
        modeloQuestoes: formData.questionModel || 'Múltipla escolha',
        fontes: formData.sources || '',
        objetivos: formData.objectives || '',
        materiais: formData.materials || '',
        instrucoes: formData.instructions || '',
        tempoLimite: formData.timeLimit || '',
        contextoAplicacao: formData.context || '',

        // Campos específicos adicionais para todos os tipos
        tipoTexto: formData.textType || '',
        generoTextual: formData.textGenre || '',
        extensaoTexto: formData.textLength || '',
        questoesAssociadas: formData.associatedQuestions || '',
        competencias: formData.competencies || '',
        estrategiasLeitura: formData.readingStrategies || '',
        recursosVisuais: formData.visualResources || '',
        atividadesPraticas: formData.practicalActivities || '',
        palavrasIncluidas: formData.wordsIncluded || '',
        formatoGrade: formData.gridFormat || '',
        dicasFornecidas: formData.providedHints || '',
        contextoVocabulario: formData.vocabularyContext || '',
        idioma: formData.language || '',
        exerciciosAssociados: formData.associatedExercises || '',
        areaConhecimento: formData.knowledgeArea || '',
        nivelComplexidade: formData.complexityLevel || '',

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
        context: formData.context,
        textType: formData.textType,
        textGenre: formData.textGenre,
        textLength: formData.textLength,
        associatedQuestions: formData.associatedQuestions,
        competencies: formData.competencies,
        readingStrategies: formData.readingStrategies,
        visualResources: formData.visualResources,
        practicalActivities: formData.practicalActivities,
        wordsIncluded: formData.wordsIncluded,
        gridFormat: formData.gridFormat,
        providedHints: formData.providedHints,
        vocabularyContext: formData.vocabularyContext,
        language: formData.language,
        associatedExercises: formData.associatedExercises,
        knowledgeArea: formData.knowledgeArea,
        complexityLevel: formData.complexityLevel
      };

      console.log('📊 Dados de contexto COMPLETOS para IA:', contextData);

      const result = await generateActivityContent(activityType, contextData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido na geração';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateActivity,
    isGenerating,
    error
  };
}