export { QuizInterativoGenerator } from './QuizInterativoGenerator';
export { default as QuizInterativoPreview } from './QuizInterativoPreview';
export type { QuizQuestion, QuizInterativoData } from './QuizInterativoGenerator';

export {
  processQuizWithUnifiedPipeline,
  QuizQuestionNormalizer,
  QuizDataLoader,
  type UnifiedQuizQuestion,
  type UnifiedQuizResponse,
  type QuizLoadResult
} from './unified-quiz-pipeline';
