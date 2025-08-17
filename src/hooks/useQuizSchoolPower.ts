
import { useState, useCallback } from 'react';

export interface QuizStep {
  id: number;
  question: string;
  options: string[];
}

export interface QuizSchoolPowerState {
  currentStep: 'intro' | 'quiz' | 'schoolpower';
  quizCompleted: boolean;
  schoolPowerAccessed: boolean;
  quizStepNumber: number;
  progressPercentage: number;
  answers: Record<number, string>;
}

export interface UseQuizSchoolPowerReturn {
  state: QuizSchoolPowerState;
  quizSteps: QuizStep[];
  goToQuiz: () => void;
  goToSchoolPower: () => void;
  goToIntro: () => void;
  goToFinal: () => void;
  answerQuizStep: (stepId: number, answer: string) => void;
  resetQuiz: () => void;
}

const QUIZ_STEPS: QuizStep[] = [
  {
    id: 1,
    question: "Você gasta mais de 5 horas por semana planejando aulas?",
    options: ["Sim", "Muito mais", "Não"]
  },
  {
    id: 2,
    question: "Você acredita que ter alunos engajados na sua aula é fundamental?",
    options: ["Claro!", "Um pouco", "Não"]
  },
  {
    id: 3,
    question: "Você acredita que ter alunos engajados na sua aula é fundamental?",
    options: ["Claro!", "Um pouco", "Não"]
  },
  {
    id: 4,
    question: "Se você pudesse acessar uma plataforma que cria todas as atividades/materiais interativos do semestre em 2 minutos, você acessaria?",
    options: ["Com certeza!", "Talvez", "Não"]
  }
];

export function useQuizSchoolPower(): UseQuizSchoolPowerReturn {
  const [state, setState] = useState<QuizSchoolPowerState>({
    currentStep: 'intro',
    quizCompleted: false,
    schoolPowerAccessed: false,
    quizStepNumber: 1,
    progressPercentage: 0,
    answers: {}
  });

  const goToQuiz = useCallback(() => {
    setState(current => ({
      ...current,
      currentStep: 'quiz',
      quizStepNumber: 1,
      progressPercentage: 0
    }));
  }, []);

  const goToSchoolPower = useCallback(() => {
    setState(current => ({
      ...current,
      currentStep: 'schoolpower',
      schoolPowerAccessed: true
    }));
  }, []);

  const goToIntro = useCallback(() => {
    setState(current => ({
      ...current,
      currentStep: 'intro'
    }));
  }, []);

  const goToFinal = useCallback(() => {
    setState(current => ({
      ...current,
      quizCompleted: true
    }));
  }, []);

  const answerQuizStep = useCallback((stepId: number, answer: string) => {
    setState(current => {
      const newAnswers = { ...current.answers, [stepId]: answer };
      const totalSteps = QUIZ_STEPS.length;
      const progressPercentage = (stepId / totalSteps) * 100;
      
      // Se respondeu a última pergunta (etapa 4), vai diretamente para School Power
      if (stepId >= totalSteps) {
        setTimeout(() => {
          setState(current => ({
            ...current,
            currentStep: 'schoolpower',
            quizCompleted: true,
            schoolPowerAccessed: true,
            progressPercentage: 100
          }));
        }, 500); // Pequeno delay para mostrar o progresso completo
        
        return {
          ...current,
          answers: newAnswers,
          progressPercentage: 100
        };
      }
      
      // Caso contrário, vai para a próxima etapa
      return {
        ...current,
        answers: newAnswers,
        quizStepNumber: stepId + 1,
        progressPercentage
      };
    });
  }, []);

  const resetQuiz = useCallback(() => {
    setState({
      currentStep: 'intro',
      quizCompleted: false,
      schoolPowerAccessed: false,
      quizStepNumber: 1,
      progressPercentage: 0,
      answers: {}
    });
  }, []);

  return {
    state,
    quizSteps: QUIZ_STEPS,
    goToQuiz,
    goToSchoolPower,
    goToIntro,
    goToFinal,
    answerQuizStep,
    resetQuiz,
  };
}
