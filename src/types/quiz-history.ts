
export interface QuizAttempt {
  id: string;
  type: 'Quiz' | 'Prova';
  theme: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  settings: {
    studyMode: boolean;
    smartDifficulty: boolean;
  };
  bnccCompetence?: string;
}

export interface QuizProgress {
  attempts: QuizAttempt[];
  evolution?: {
    trend: 'up' | 'down' | 'stable';
    percentage?: number;
  };
}
