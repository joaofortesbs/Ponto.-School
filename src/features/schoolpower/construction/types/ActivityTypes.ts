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
  timeLimit: string;
  context: string;
  textType: string;
  textGenre: string;
  textLength: string;
  associatedQuestions: string;
  competencies: string;
  readingStrategies: string;
  visualResources: string;
  practicalActivities: string;
  wordsIncluded: string;
  gridFormat: string;
  providedHints: string;
  vocabularyContext: string;
  language: string;
  associatedExercises: string;
  knowledgeArea: string;
  complexityLevel: string;
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
  anoSerie?: string;
  disciplina?: string;
  bnccCompetencias?: string;
  publicoAlvo?: string;
  objetivosAprendizagem?: string;
  quantidadeAulas?: string;
  quantidadeDiagnosticos?: string;
  quantidadeAvaliacoes?: string;
  cronograma?: string;
  // Campos específicos para quadro-interativo
  quadroInterativoCampoEspecifico?: string;
  // Campos específicos para quiz-interativo
  format?: string;
  timePerQuestion?: string;
  // Campos específicos para mapa-mental
  centralTheme?: string;
  mainCategories?: string;
  generalObjective?: string;
  evaluationCriteria?: string;
  // Campos específicos para flash-cards
  topicos?: string;
  numberOfFlashcards?: string;
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