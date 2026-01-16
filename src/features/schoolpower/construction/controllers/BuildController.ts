/**
 * BUILD CONTROLLER
 * 
 * Controlador que gerencia a construção programática de atividades.
 * Escuta eventos de construction:build_activity e executa a construção real
 * usando buildActivityFromFormData.
 */

import { buildActivityFromFormData } from '../services/buildActivityHelper';
import { ActivityFormData } from '../types/ActivityTypes';
import {
  BuildActivityRequest,
  emitBuildProgress,
  emitBuildResult,
  onBuildActivityRequest
} from '../events/constructionEventBus';

export interface BuildControllerCallbacks {
  onBuildStart?: (activityId: string, requestId: string) => void;
  onBuildProgress?: (activityId: string, progress: number, message: string) => void;
  onBuildComplete?: (activityId: string, result: any) => void;
  onBuildError?: (activityId: string, error: string) => void;
}

export function createBuildController(callbacks?: BuildControllerCallbacks): () => void {
  console.log('🎮 [BuildController] Inicializando controlador de construção');

  const handleBuildRequest = async (request: BuildActivityRequest) => {
    const { activityId, activityType, fields, requestId } = request;
    
    console.log(`\n🔨 ════════════════════════════════════════════════════════`);
    console.log(`🔨 [BuildController] CONSTRUÇÃO REAL INICIADA`);
    console.log(`🔨 ════════════════════════════════════════════════════════`);
    console.log(`🔨 [BuildController] Atividade: ${activityId}`);
    console.log(`🔨 [BuildController] Tipo: ${activityType}`);
    console.log(`🔨 [BuildController] Request ID: ${requestId}`);
    console.log(`🔨 [BuildController] Campos recebidos:`, Object.keys(fields));

    callbacks?.onBuildStart?.(activityId, requestId);

    try {
      emitBuildProgress({
        activityId,
        requestId,
        phase: 'modal_opening',
        progress: 25,
        message: 'Abrindo modal para atividade...'
      });
      callbacks?.onBuildProgress?.(activityId, 25, 'Abrindo modal...');

      await sleep(100);

      emitBuildProgress({
        activityId,
        requestId,
        phase: 'fields_injecting',
        progress: 50,
        message: 'Campos injetados no formulário'
      });
      callbacks?.onBuildProgress?.(activityId, 50, 'Campos injetados...');

      console.log(`📋 [BuildController] Preparando formData para construção...`);
      const formData: ActivityFormData = mapFieldsToFormData(fields, activityType);
      console.log(`📋 [BuildController] FormData preparado:`, formData);

      emitBuildProgress({
        activityId,
        requestId,
        phase: 'build_started',
        progress: 75,
        message: 'Botão "Gerar Atividades" acionado - construindo...'
      });
      callbacks?.onBuildProgress?.(activityId, 75, 'Construindo atividade...');

      console.log(`🚀 [BuildController] Chamando buildActivityFromFormData (MESMA LÓGICA DO MODAL)`);
      const result = await buildActivityFromFormData(activityId, activityType, formData);

      console.log(`✅ [BuildController] Construção concluída com sucesso!`);
      console.log(`✅ [BuildController] Resultado:`, result ? 'Conteúdo gerado' : 'Sem conteúdo');

      const storageKeys = collectStorageKeys(activityId, activityType);
      console.log(`💾 [BuildController] Chaves localStorage criadas:`, storageKeys);

      emitBuildProgress({
        activityId,
        requestId,
        phase: 'build_complete',
        progress: 100,
        message: `Construção confirmada! Chaves: ${storageKeys.join(', ')}`
      });

      emitBuildResult({
        activityId,
        requestId,
        success: true,
        result,
        storageKeys,
        timestamp: new Date().toISOString()
      });

      callbacks?.onBuildComplete?.(activityId, result);
      callbacks?.onBuildProgress?.(activityId, 100, 'Concluído!');

      console.log(`🎉 [BuildController] ════════════════════════════════════════════════════════`);
      console.log(`🎉 [BuildController] CONSTRUÇÃO REAL CONCLUÍDA: ${activityId}`);
      console.log(`🎉 [BuildController] ════════════════════════════════════════════════════════\n`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`❌ [BuildController] Erro na construção de ${activityId}:`, error);

      emitBuildResult({
        activityId,
        requestId,
        success: false,
        error: errorMessage,
        storageKeys: [],
        timestamp: new Date().toISOString()
      });

      callbacks?.onBuildError?.(activityId, errorMessage);
    }
  };

  const unsubscribe = onBuildActivityRequest(handleBuildRequest);

  console.log('🎮 [BuildController] Controlador inicializado e escutando eventos');

  return unsubscribe;
}

function mapFieldsToFormData(fields: Record<string, any>, activityType: string): ActivityFormData {
  const baseFormData: ActivityFormData = {
    title: fields.title || fields.titulo || '',
    description: fields.description || fields.descricao || fields.objectives || fields.objetivo || '',
    subject: fields.subject || fields.disciplina || fields.materia || '',
    theme: fields.theme || fields.tema || fields.temaRedacao || '',
    schoolYear: fields.schoolYear || fields.anoSerie || fields.anoEscolaridade || '',
    numberOfQuestions: fields.numberOfQuestions || fields.quantidadeQuestoes || '10',
    difficultyLevel: fields.difficultyLevel || fields.nivelDificuldade || 'Médio',
    questionModel: fields.questionModel || fields.formato || 'Múltipla Escolha',
    sources: fields.sources || fields.fontes || '',
    objectives: fields.objectives || fields.objetivo || fields.objetivosAprendizagem || '',
    materials: fields.materials || fields.materiais || '',
    instructions: fields.instructions || fields.instrucoes || '',
    evaluation: fields.evaluation || fields.avaliacao || '',
    timeLimit: fields.timeLimit || fields.tempoLimite || '',
    context: fields.context || fields.contexto || '',
    textType: fields.textType || '',
    textGenre: fields.textGenre || '',
    textLength: fields.textLength || '',
    associatedQuestions: fields.associatedQuestions || '',
    competencies: fields.competencies || fields.competencias || fields.bnccCompetencias || '',
    readingStrategies: fields.readingStrategies || '',
    visualResources: fields.visualResources || '',
    practicalActivities: fields.practicalActivities || '',
    wordsIncluded: fields.wordsIncluded || '',
    gridFormat: fields.gridFormat || '',
    providedHints: fields.providedHints || '',
    vocabularyContext: fields.vocabularyContext || '',
    language: fields.language || '',
    associatedExercises: fields.associatedExercises || '',
    knowledgeArea: fields.knowledgeArea || '',
    complexityLevel: fields.complexityLevel || '',
    tituloTemaAssunto: fields.tituloTemaAssunto || fields.theme || '',
    anoSerie: fields.anoSerie || fields.schoolYear || '',
    disciplina: fields.disciplina || fields.subject || '',
    bnccCompetencias: fields.bnccCompetencias || fields.competencies || '',
    publicoAlvo: fields.publicoAlvo || '',
    objetivosAprendizagem: fields.objetivosAprendizagem || fields.objectives || '',
    quantidadeAulas: fields.quantidadeAulas || '5',
    quantidadeDiagnosticos: fields.quantidadeDiagnosticos || '1',
    quantidadeAvaliacoes: fields.quantidadeAvaliacoes || '1',
    cronograma: fields.cronograma || '',
    quadroInterativoCampoEspecifico: fields.quadroInterativoCampoEspecifico || fields.atividadeMostrada || '',
    format: fields.format || fields.formato || '',
    timePerQuestion: fields.timePerQuestion || '60',
    centralTheme: fields.centralTheme || fields.theme || '',
    mainCategories: fields.mainCategories || '',
    generalObjective: fields.generalObjective || fields.objectives || '',
    evaluationCriteria: fields.evaluationCriteria || '',
    topicos: fields.topicos || '',
    numberOfFlashcards: fields.numberOfFlashcards || '10',
    temaRedacao: fields.temaRedacao || fields.theme || '',
    objetivo: fields.objetivo || fields.objectives || '',
    nivelDificuldade: fields.nivelDificuldade || fields.difficultyLevel || 'Médio',
    competenciasENEM: fields.competenciasENEM || '',
    contextoAdicional: fields.contextoAdicional || fields.context || ''
  };

  return baseFormData;
}

function collectStorageKeys(activityId: string, activityType: string): string[] {
  const keys: string[] = [];
  const keysToCheck = [
    `constructed_${activityType}_${activityId}`,
    `activity_${activityId}`,
    `constructedActivities`,
    `quadro_interativo_data_${activityId}`
  ];

  keysToCheck.forEach(key => {
    if (key === 'constructedActivities') {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (parsed[activityId]) {
            keys.push(`constructedActivities[${activityId}]`);
          }
        } catch {}
      }
    } else if (localStorage.getItem(key)) {
      keys.push(key);
    }
  });

  return keys;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
