export interface ActivityFormData {
  title: string;
  description: string;
  subject: string;
  theme: string;
  schoolYear: string;
  numberOfQuestions: string;
  difficultyLevel: string;
  questionModel: string;
  sources: string;
  objectives: string;
  materials: string;
  instructions: string;
  evaluation: string;
  timeLimit?: string;
  context?: string;
  textType?: string;
  textGenre?: string;
  textLength?: string;
  associatedQuestions?: string;
  competencies?: string;
  readingStrategies?: string;
  visualResources?: string;
  practicalActivities?: string;
  wordsIncluded?: string;
  gridFormat?: string;
  providedHints?: string;
  vocabularyContext?: string;
  language?: string;
  associatedExercises?: string;
  knowledgeArea?: string;
  complexityLevel?: string;
  // Campos específicos para Plano de Aula
  tema?: string;
  anoSerie?: string;
  componenteCurricular?: string;
  cargaHoraria?: string;
  habilidadesBNCC?: string;
  objetivoGeral?: string;
  materiaisRecursos?: string;
  perfilTurma?: string;
  tipoAula?: string;
  observacoesProfessor?: string;
  // Campos específicos da Sequência Didática
  tituloTemaAssunto?: string;
  disciplina?: string;
  bnccCompetencias?: string;
  publicoAlvo?: string;
  objetivosAprendizagem?: string;
  quantidadeAulas?: string;
  quantidadeDiagnosticos?: string;
  quantidadeAvaliacoes?: string;
  cronograma?: string;
  // Campos específicos para Flash Cards
  topicos?: string;
  numberOfFlashcards?: string;
  // Campos específicos para Mapa Mental
  centralTheme?: string;
  mainCategories?: string;
  generalObjective?: string;
  evaluationCriteria?: string;
}

export interface GeneratedActivity {
  content: string;
  metadata: {
    estimatedTime: string;
    difficulty: string;
    format: string;
    type: string;
  };
}

export interface ActivityGenerationPayload extends ActivityFormData {
  activityId: string;
  activityType: string;
}

export type ActivityType = 'prova' | 'lista-exercicios' | 'jogo' | 'video' | 'mapa-mental' | 'apresentacao';