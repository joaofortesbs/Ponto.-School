
export interface Question {
  id: string;
  type: 'multiple_choice' | 'open' | 'true_false';
  statement: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
}

export interface ProvaData {
  title: string;
  description: string;
  subject: string;
  duration: number;
  totalPoints: number;
  instructions: string;
  questions: Question[];
}

export const defaultProvaData: ProvaData = {
  title: 'Prova - Funções do 1° Grau',
  description: 'Prova abrangendo funções do primeiro grau, Teorema de Pitágoras e números racionais.',
  subject: 'Matemática',
  duration: 120,
  totalPoints: 100,
  instructions: 'Leia atentamente todas as questões antes de responder. Use caneta azul ou preta.',
  questions: []
};
