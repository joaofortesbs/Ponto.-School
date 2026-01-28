export { default as ExerciseListPreview } from './ExerciseListPreview';
export { 
  ListaExerciciosGenerator, 
  listaExerciciosGenerator, 
  generateListaExerciciosContent,
  type ListaExerciciosData,
  type ListaExerciciosQuestion
} from './ListaExerciciosGenerator';

export {
  processExerciseListWithUnifiedPipeline,
  ExerciseListSanitizer,
  IntelligentExtractor,
  QuestionValidator,
  UnifiedNormalizer,
  ProgressiveFallback,
  type ExerciseListContract,
  type UnifiedQuestion,
  type UnifiedExerciseListResponse,
  type ExtractionResult
} from './unified-exercise-pipeline';

export { useExerciseListSync, useProcessedQuestions } from './useExerciseListSync';

export {
  ExerciseListInputSanitizer,
  LISTA_EXERCICIOS_CONFIG,
  generateExerciseListCacheKey,
  isExerciseListKey,
  type QuestionContract,
  type ExerciseListResponseContract,
  type DifficultyLevel,
  type QuestionType
} from './contracts';
