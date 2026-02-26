/**
 * content-handlers-a.ts
 * Handlers especializados: lista-exercicios e quiz-interativo.
 * Cada função retorna GeneratedFieldsResult ou null (para fallback ao loop genérico).
 */

import type { ChosenActivity } from '../../../../interface-chat-producao/stores/ChosenActivitiesStore';
import { createDebugEntry } from '../../../../interface-chat-producao/debug-system/DebugStore';
import { ListaExerciciosGenerator } from '../../../../activities/lista-exercicios/ListaExerciciosGenerator';
import { QuizInterativoGenerator } from '../../../../activities/quiz-interativo/QuizInterativoGenerator';
import type { GeneratedFieldsResult, HandlerContext, ProgressUpdate } from './content-types';
import {
  inferSubjectFromObjective,
  generateThemeFromObjective,
  generateDefaultObjectives,
} from './content-helpers';

// ============================================================
// HANDLER: LISTA DE EXERCÍCIOS
// ============================================================
export async function handleListaExercicios(
  activity: ChosenActivity,
  ctx: HandlerContext
): Promise<GeneratedFieldsResult> {
  const { correlationId, activityStartTime, capabilityId, capabilityName, userObjective, temaLimpo, disciplinaExtraida, onProgress } = ctx;

  console.log(`📝 [GerarConteudo] ====== HANDLER ESPECIALIZADO: LISTA DE EXERCÍCIOS ======`);
  console.log(`📝 [GerarConteudo] Atividade: ${activity.titulo} (${activity.id})`);

  createDebugEntry(capabilityId, capabilityName, 'action',
    `[LISTA-EXERCICIOS] Usando gerador especializado para "${activity.titulo}"`,
    'high',
    { correlation_id: correlationId, activity_id: activity.id, activity_type: activity.tipo }
  );

  try {
    const generator = new ListaExerciciosGenerator();

    const inferredSubject = activity.campos_preenchidos?.subject ||
      activity.campos_preenchidos?.disciplina ||
      activity.materia || disciplinaExtraida ||
      inferSubjectFromObjective(userObjective) || 'Matemática';

    const inferredTheme = activity.campos_preenchidos?.theme ||
      activity.campos_preenchidos?.tema ||
      temaLimpo ||
      generateThemeFromObjective(userObjective, inferredSubject);

    if (temaLimpo) console.log(`🎯 [GerarConteudo] LISTA-EXERCICIOS usando tema limpo do plano: "${temaLimpo}"`);

    const inferredSchoolYear = activity.campos_preenchidos?.schoolYear ||
      activity.campos_preenchidos?.anoEscolaridade || '7º Ano - Ensino Fundamental';

    const rawDifficulty = activity.campos_preenchidos?.difficultyLevel ||
      activity.campos_preenchidos?.nivelDificuldade || 'Médio';
    const validDifficulties = ['Fácil', 'Médio', 'Difícil'];
    const inferredDifficultyLevel = validDifficulties.includes(rawDifficulty) ? rawDifficulty : 'Médio';

    const rawQuestionModel = activity.campos_preenchidos?.questionModel ||
      activity.campos_preenchidos?.modeloQuestoes || 'Múltipla Escolha';
    const validQuestionModels = ['Múltipla Escolha', 'Dissertativa', 'Misto'];
    const inferredQuestionModel = validQuestionModels.includes(rawQuestionModel) ? rawQuestionModel : 'Múltipla Escolha';

    const inferredNumberOfQuestions = String(
      activity.campos_preenchidos?.numberOfQuestions ||
      activity.campos_preenchidos?.numeroQuestoes || 10
    );

    const inferredObjectives = activity.campos_preenchidos?.objectives ||
      activity.campos_preenchidos?.objetivos ||
      generateDefaultObjectives(inferredTheme, inferredSubject);

    const inferredContext = activity.campos_preenchidos?.context ||
      `Turma de ${inferredSchoolYear} com conhecimentos básicos em ${inferredSubject}`;

    const listaData = {
      titulo: activity.titulo || 'Lista de Exercícios',
      title: activity.titulo || 'Lista de Exercícios',
      tema: inferredTheme, theme: inferredTheme,
      disciplina: inferredSubject, subject: inferredSubject,
      anoEscolaridade: inferredSchoolYear, schoolYear: inferredSchoolYear,
      nivelDificuldade: inferredDifficultyLevel, difficultyLevel: inferredDifficultyLevel,
      numeroQuestoes: inferredNumberOfQuestions, numberOfQuestions: inferredNumberOfQuestions,
      modeloQuestoes: inferredQuestionModel, questionModel: inferredQuestionModel,
      objetivos: inferredObjectives, objectives: inferredObjectives
    };

    const generatedContent = await generator.generateListaExerciciosContent(listaData);
    console.log(`✅ [GerarConteudo] Lista gerada: ${generatedContent.questoes?.length || 0} questões`);

    const schemaFields = {
      numberOfQuestions: Number(inferredNumberOfQuestions),
      theme: inferredTheme, subject: inferredSubject, schoolYear: inferredSchoolYear,
      difficultyLevel: inferredDifficultyLevel, questionModel: inferredQuestionModel,
      objectives: inferredObjectives, context: inferredContext
    };

    const generatedFields = {
      ...schemaFields,
      titulo: generatedContent.titulo,
      questoes: generatedContent.questoes,
      isGeneratedByAI: true, generatedAt: new Date().toISOString()
    };

    createDebugEntry(capabilityId, capabilityName, 'info',
      `[LISTA-EXERCICIOS] Geração concluída: ${generatedContent.questoes?.length || 0} questões geradas`,
      'high',
      { correlation_id: correlationId, activity_id: activity.id, questions_count: generatedContent.questoes?.length || 0 }
    );

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const listaFlatData = {
          title: generatedContent.titulo || activity.titulo || 'Lista de Exercícios',
          titulo: generatedContent.titulo || activity.titulo || 'Lista de Exercícios',
          questoes: generatedContent.questoes || [],
          numberOfQuestions: generatedContent.questoes?.length || 0,
          tema: inferredTheme, theme: inferredTheme,
          disciplina: inferredSubject, subject: inferredSubject,
          schoolYear: inferredSchoolYear, difficultyLevel: inferredDifficultyLevel,
          questionModel: inferredQuestionModel, objectives: inferredObjectives,
          isGeneratedByAI: true, generatedAt: new Date().toISOString()
        };
        const { writeActivityContent } = await import('../../../../services/activity-storage-contract');
        writeActivityContent(activity.id, 'lista-exercicios', listaFlatData, true);
        try {
          const { ContentSyncService } = await import('../../../../services/content-sync-service');
          ContentSyncService.setContent(activity.id, 'lista-exercicios', listaFlatData);
        } catch { }
      } catch (storageError) {
        console.error(`❌ [LISTA-EXERCICIOS] Erro ao salvar no localStorage:`, storageError);
      }
    }

    onProgress?.({ type: 'activity_completed', activity_id: activity.id, activity_title: activity.titulo,
      message: `Lista de exercícios gerada com ${generatedContent.questoes?.length || 0} questões` });

    return { activity_id: activity.id, activity_type: activity.tipo, generated_fields: generatedFields, schema_fields: schemaFields, success: true };

  } catch (error) {
    console.error(`❌ [GerarConteudo] Erro ao gerar lista de exercícios:`, error);
    createDebugEntry(capabilityId, capabilityName, 'error',
      `[LISTA-EXERCICIOS] Erro na geração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      'critical', { correlation_id: correlationId, activity_id: activity.id, error: String(error) }
    );
    return { activity_id: activity.id, activity_type: activity.tipo, generated_fields: {}, success: false,
      error: `Erro ao gerar lista de exercícios: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
  }
}

// ============================================================
// HANDLER: QUIZ INTERATIVO
// ============================================================
export async function handleQuizInterativo(
  activity: ChosenActivity,
  ctx: HandlerContext
): Promise<GeneratedFieldsResult> {
  const { correlationId, capabilityId, capabilityName, userObjective, temaLimpo, disciplinaExtraida, onProgress } = ctx;

  console.log(`🎯 [GerarConteudo] ====== HANDLER ESPECIALIZADO: QUIZ INTERATIVO ======`);
  console.log(`🎯 [GerarConteudo] Atividade: ${activity.titulo} (${activity.id})`);

  createDebugEntry(capabilityId, capabilityName, 'action',
    `[QUIZ-INTERATIVO] Usando gerador especializado para "${activity.titulo}"`,
    'high', { correlation_id: correlationId, activity_id: activity.id, activity_type: activity.tipo }
  );

  try {
    const generator = new QuizInterativoGenerator();

    const inferredSubject = activity.campos_preenchidos?.subject ||
      activity.campos_preenchidos?.disciplina ||
      activity.materia || disciplinaExtraida ||
      inferSubjectFromObjective(userObjective) || 'Matemática';

    const inferredTheme = activity.campos_preenchidos?.theme ||
      activity.campos_preenchidos?.tema ||
      temaLimpo ||
      generateThemeFromObjective(userObjective, inferredSubject);

    if (temaLimpo) console.log(`🎯 [GerarConteudo] QUIZ usando tema limpo do plano: "${temaLimpo}"`);

    const inferredSchoolYear = activity.campos_preenchidos?.schoolYear ||
      activity.campos_preenchidos?.anoEscolaridade || '7º Ano - Ensino Fundamental';

    const inferredObjectives = activity.campos_preenchidos?.objectives ||
      activity.campos_preenchidos?.objetivos ||
      generateDefaultObjectives(inferredTheme, inferredSubject);

    const rawDifficulty = activity.campos_preenchidos?.difficultyLevel ||
      activity.campos_preenchidos?.nivelDificuldade || 'Médio';
    const inferredDifficultyLevel = ['Fácil', 'Médio', 'Difícil'].includes(rawDifficulty) ? rawDifficulty : 'Médio';

    const rawQuestionModel = activity.campos_preenchidos?.questionModel ||
      activity.campos_preenchidos?.formato || activity.campos_preenchidos?.format || 'Múltipla Escolha';
    const inferredQuestionModel = ['Múltipla Escolha', 'Verdadeiro ou Falso', 'Misto'].includes(rawQuestionModel)
      ? rawQuestionModel : 'Múltipla Escolha';

    const inferredNumberOfQuestions = String(
      activity.campos_preenchidos?.numberOfQuestions ||
      activity.campos_preenchidos?.numeroQuestoes || 10
    );

    const quizData = {
      subject: inferredSubject, schoolYear: inferredSchoolYear,
      theme: inferredTheme, objectives: inferredObjectives,
      difficultyLevel: inferredDifficultyLevel,
      format: inferredQuestionModel,
      numberOfQuestions: inferredNumberOfQuestions,
      timePerQuestion: activity.campos_preenchidos?.timePerQuestion || '60',
      instructions: activity.campos_preenchidos?.instructions || 'Leia cada questão atentamente e selecione a resposta correta.',
      evaluation: activity.campos_preenchidos?.evaluation || 'Pontuação baseada no número de acertos.'
    };

    const generatedContent = await generator.generateQuizContent(quizData);
    console.log(`✅ [GerarConteudo] Quiz gerado: ${generatedContent.questions?.length || 0} questões`);

    const schemaFields = {
      numberOfQuestions: Number(inferredNumberOfQuestions),
      theme: inferredTheme, subject: inferredSubject, schoolYear: inferredSchoolYear,
      difficultyLevel: inferredDifficultyLevel, questionModel: inferredQuestionModel
    };

    const generatedFields = {
      ...schemaFields,
      titulo: generatedContent.title,
      questions: generatedContent.questions,
      totalQuestions: generatedContent.totalQuestions,
      timePerQuestion: generatedContent.timePerQuestion,
      description: generatedContent.description,
      isGeneratedByAI: true, generatedAt: new Date().toISOString()
    };

    createDebugEntry(capabilityId, capabilityName, 'info',
      `[QUIZ-INTERATIVO] Geração concluída: ${generatedContent.questions?.length || 0} questões reais geradas`,
      'high', { correlation_id: correlationId, activity_id: activity.id,
        questions_count: generatedContent.questions?.length || 0,
        schema_fields_count: Object.keys(schemaFields).length, schema_fields_keys: Object.keys(schemaFields) }
    );

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const quizFlatData = {
          title: generatedContent.title || activity.titulo || 'Quiz Interativo',
          description: generatedContent.description || `Quiz sobre ${inferredTheme}`,
          questions: generatedContent.questions || [],
          totalQuestions: generatedContent.totalQuestions || generatedContent.questions?.length || 0,
          timePerQuestion: generatedContent.timePerQuestion || 60,
          isGeneratedByAI: true, isFallback: false,
          generatedAt: new Date().toISOString(),
          theme: inferredTheme, subject: inferredSubject, schoolYear: inferredSchoolYear
        };
        const { writeActivityContent } = await import('../../../../services/activity-storage-contract');
        writeActivityContent(activity.id, 'quiz-interativo', quizFlatData, true);
        console.log(`✅ [QUIZ-INTERATIVO] Persistido via StorageContract com ${generatedContent.questions?.length || 0} questões`);
        try {
          const { ContentSyncService } = await import('../../../../services/content-sync-service');
          ContentSyncService.setContent(activity.id, 'quiz-interativo', quizFlatData);
        } catch { }
        const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
        constructedActivities[activity.id] = { isBuilt: true, builtAt: new Date().toISOString(),
          formData: schemaFields, generatedContent: quizFlatData };
        localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
      } catch (storageError) {
        console.error(`❌ [QUIZ-INTERATIVO] Erro ao salvar no localStorage:`, storageError);
      }
    }

    onProgress?.({ type: 'activity_completed', activity_id: activity.id, activity_title: activity.titulo,
      message: `Quiz interativo gerado com ${generatedContent.questions?.length || 0} questões` });

    return { activity_id: activity.id, activity_type: activity.tipo, generated_fields: generatedFields, schema_fields: schemaFields, success: true };

  } catch (error) {
    console.error(`❌ [GerarConteudo] Erro ao gerar quiz interativo:`, error);
    createDebugEntry(capabilityId, capabilityName, 'error',
      `[QUIZ-INTERATIVO] Erro na geração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      'critical', { correlation_id: correlationId, activity_id: activity.id, error: String(error) }
    );
    return { activity_id: activity.id, activity_type: activity.tipo, generated_fields: {}, success: false,
      error: `Erro ao gerar quiz interativo: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
  }
}
