import { useState } from 'react';
import { generateActivityContent } from '../api/generateActivity';

export function useGenerateActivity() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateActivity = async (activityType: string, formData: any) => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('🎯 useGenerateActivity: Preparando dados para IA');
      console.log('📝 FormData recebido:', formData);
      console.log('🎪 Tipo de atividade:', activityType);

      // Preparar dados de contexto COMPLETOS e CONSISTENTES
      const contextData = {
        // Dados em português para o prompt (PADRÃO PRINCIPAL)
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
        idioma: formData.language || 'Português',
        exerciciosAssociados: formData.associatedExercises || '',
        areaConhecimento: formData.knowledgeArea || '',
        nivelComplexidade: formData.complexityLevel || '',

        // Dados alternativos em inglês para compatibilidade total
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

      console.log('📊 ContextData COMPLETO preparado para IA:', contextData);

      // Chamar a função de geração
      const result = await generateActivityContent(activityType, contextData);

      console.log('✅ Resultado recebido da IA:', result);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido na geração';
      console.error('❌ Erro no useGenerateActivity:', err);
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