
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
