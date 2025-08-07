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

      // Lógica específica para Plano de Aula
      if (activityType === 'plano-aula') {
        console.log('📚 Processando dados específicos do Plano de Aula');

        // Garantir que todos os campos necessários estão presentes e mapeados corretamente
        const planoAulaData = {
          ...customFields, // Mantém todos os campos originais
          activityType: 'plano-aula',
          contextData: {
            tema: customFields.theme || customFields.contextData?.tema || '',
            anoSerie: customFields.schoolYear || customFields.contextData?.anoSerie || '',
            componenteCurricular: customFields.subject || customFields.contextData?.componenteCurricular || '',
            cargaHoraria: customFields.timeLimit || customFields.contextData?.cargaHoraria || '',
            habilidadesBNCC: customFields.competencies || customFields.contextData?.habilidadesBNCC || '',
            objetivoGeral: customFields.objectives || customFields.contextData?.objetivoGeral || '',
            materiaisRecursos: customFields.materials || customFields.contextData?.materiaisRecursos || '',
            perfilTurma: customFields.context || customFields.contextData?.perfilTurma || '',
            tipoAula: customFields.difficultyLevel || customFields.contextData?.tipoAula || '',
            observacoesProfessor: customFields.evaluation || customFields.contextData?.observacoesProfessor || '' // Assumindo que 'evaluation' pode ser usado para observações
          }
        };

        console.log('📋 Dados específicos do Plano de Aula preparados:', planoAulaData);
        // Substitui os customFields originais pelos dados específicos do plano de aula formatados
        Object.assign(contextData, planoAulaData.contextData);
        // Certifica que o tipo de atividade está correto nos dados passados para a API
        contextData.activityType = 'plano-aula';
      }

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