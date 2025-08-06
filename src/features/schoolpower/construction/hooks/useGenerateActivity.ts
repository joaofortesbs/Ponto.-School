import { useState, useCallback } from 'react';
import { generateActivityContent } from '../api/generateActivity';

export function useGenerateActivity() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateActivity = useCallback(async (
    activityType: string,
    customFields: Record<string, any>
  ) => {
    // Environment check for browser compatibility
    const isBrowser = typeof window !== 'undefined';
    const isNode = typeof process !== 'undefined' && process?.versions?.node;

    console.log('🎬 Iniciando geração de atividade:', { activityType, customFields });

    if (isGenerating) {
      console.log('⏳ Geração já em andamento, ignorando nova solicitação');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('🎯 useGenerateActivity: Preparando dados para IA');
      console.log('📝 FormData recebido:', customFields);
      console.log('🎪 Tipo de atividade:', activityType);

      // Verificar se a API key está disponível
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
                     process.env.VITE_GEMINI_API_KEY || 
                     import.meta.env.VITE_GEMINI_API_KEY ||
                     'AIzaSyBvQScT7BVFJAJmGVQHHI5BXgApSMjY_iM';
      
      if (!apiKey) {
        console.warn('⚠️ Chave da API não encontrada, usando configuração de fallback');
      }

      // Preparar dados de contexto COMPLETOS e CONSISTENTES
      const contextData = {
        // Dados em português para o prompt (PADRÃO PRINCIPAL)
        titulo: customFields.title || 'Atividade',
        descricao: customFields.description || '',
        disciplina: customFields.subject || 'Português',
        tema: customFields.theme || 'Conteúdo Geral',
        anoEscolaridade: customFields.schoolYear || '6º ano',
        numeroQuestoes: parseInt(customFields.numberOfQuestions || '10'),
        nivelDificuldade: customFields.difficultyLevel || 'Médio',
        modeloQuestoes: customFields.questionModel || 'Múltipla escolha',
        fontes: customFields.sources || '',
        objetivos: customFields.objectives || '',
        materiais: customFields.materials || '',
        instrucoes: customFields.instructions || '',
        tempoLimite: customFields.timeLimit || '',
        contextoAplicacao: customFields.context || '',

        // Campos específicos adicionais para todos os tipos
        tipoTexto: customFields.textType || '',
        generoTextual: customFields.textGenre || '',
        extensaoTexto: customFields.textLength || '',
        questoesAssociadas: customFields.associatedQuestions || '',
        competencias: customFields.competencies || '',
        estrategiasLeitura: customFields.readingStrategies || '',
        recursosVisuais: customFields.visualResources || '',
        atividadesPraticas: customFields.practicalActivities || '',
        palavrasIncluidas: customFields.wordsIncluded || '',
        formatoGrade: customFields.gridFormat || '',
        dicasFornecidas: customFields.providedHints || '',
        contextoVocabulario: customFields.vocabularyContext || '',
        idioma: customFields.language || 'Português',
        exerciciosAssociados: customFields.associatedExercises || '',
        areaConhecimento: customFields.knowledgeArea || '',
        nivelComplexidade: customFields.complexityLevel || '',

        // Dados alternativos em inglês para compatibilidade total
        title: customFields.title,
        description: customFields.description,
        subject: customFields.subject,
        theme: customFields.theme,
        schoolYear: customFields.schoolYear,
        numberOfQuestions: customFields.numberOfQuestions,
        difficultyLevel: customFields.difficultyLevel,
        questionModel: customFields.questionModel,
        sources: customFields.sources,
        objectives: customFields.objectives,
        materials: customFields.materials,
        instructions: customFields.instructions,
        timeLimit: customFields.timeLimit,
        context: customFields.context,
        textType: customFields.textType,
        textGenre: customFields.textGenre,
        textLength: customFields.textLength,
        associatedQuestions: customFields.associatedQuestions,
        competencies: customFields.competencies,
        readingStrategies: customFields.readingStrategies,
        visualResources: customFields.visualResources,
        practicalActivities: customFields.practicalActivities,
        wordsIncluded: customFields.wordsIncluded,
        gridFormat: customFields.gridFormat,
        providedHints: customFields.providedHints,
        vocabularyContext: customFields.vocabularyContext,
        language: customFields.language,
        associatedExercises: customFields.associatedExercises,
        knowledgeArea: customFields.knowledgeArea,
        complexityLevel: customFields.complexityLevel
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
  }, [isGenerating, error]); // Adicionado isGenerating e error como dependências do useCallback

  return {
    generateActivity,
    isGenerating,
    error
  };
}