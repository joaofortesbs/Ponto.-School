
import { useState, useCallback } from 'react';

export interface QuizStep {
  id: number;
  question: string;
  options: Array<{
    text: string;
    value: string;
  }>;
}

export interface QuizSchoolPowerState {
  currentStep: 'intro' | 'quiz' | 'schoolpower';
  quizStepNumber: number;
  quizAnswers: Record<number, string>;
  quizCompleted: boolean;
  schoolPowerAccessed: boolean;
  progressPercentage: number;
}

export interface UseQuizSchoolPowerReturn {
  state: QuizSchoolPowerState;
  quizSteps: QuizStep[];
  goToQuiz: () => void;
  goToSchoolPower: () => void;
  goToIntro: () => void;
  answerQuizStep: (stepId: number, answer: string) => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
}

const QUIZ_STEPS: QuizStep[] = [
  {
    id: 1,
    question: "Você gasta mais de 5 horas por semana planejando aulas?",
    options: [
      { text: "Sim", value: "sim" },
      { text: "Muito mais", value: "muito_mais" },
      { text: "Não", value: "nao" }
    ]
  },
  {
    id: 2,
    question: "Você acredita que ter alunos engajados na sua aula é fundamental?",
    options: [
      { text: "Claro!", value: "claro" },
      { text: "Um pouco", value: "um_pouco" },
      { text: "Não", value: "nao" }
    ]
  }
];

export function useQuizSchoolPower(): UseQuizSchoolPowerReturn {
  const [state, setState] = useState<QuizSchoolPowerState>({
    currentStep: 'intro',
    quizStepNumber: 1,
    quizAnswers: {},
    quizCompleted: false,
    schoolPowerAccessed: false,
    progressPercentage: 0,
  });

  const goToQuiz = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'quiz',
      quizStepNumber: 1,
      progressPercentage: 0
    }));
  }, []);

  const goToSchoolPower = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'schoolpower',
      schoolPowerAccessed: true,
      progressPercentage: 100
    }));
  }, []);

  const goToIntro = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'intro',
      quizStepNumber: 1,
      progressPercentage: 0
    }));
  }, []);

  const answerQuizStep = useCallback((stepId: number, answer: string) => {
    setState(prev => {
      const newAnswers = { ...prev.quizAnswers, [stepId]: answer };
      const nextStepNumber = stepId + 1;
      const totalSteps = QUIZ_STEPS.length;
      const progressPercentage = (stepId / totalSteps) * 100;
      
      // Se respondeu a última pergunta, marca como completo e vai para School Power
      if (stepId >= totalSteps) {
        setTimeout(() => {
          setState(current => ({
            ...current,
            currentStep: 'schoolpower',
            schoolPowerAccessed: true,
            quizCompleted: true,
            progressPercentage: 100
          }));
        }, 500); // Pequeno delay para mostrar o progresso completo
        
        return {
          ...prev,
          quizAnswers: newAnswers,
          quizCompleted: true,
          progressPercentage: 100
        };
      }
      
      // Senão, vai para a próxima etapa
      return {
        ...prev,
        quizAnswers: newAnswers,
        quizStepNumber: nextStepNumber,
        progressPercentage
      };
    });
  }, []);

  const completeQuiz = useCallback(() => {
    setState(prev => ({
      ...prev,
      quizCompleted: true,
      progressPercentage: 100
    }));
  }, []);

  const resetQuiz = useCallback(() => {
    setState({
      currentStep: 'intro',
      quizStepNumber: 1,
      quizAnswers: {},
      quizCompleted: false,
      schoolPowerAccessed: false,
      progressPercentage: 0,
    });
  }, []);

  return {
    state,
    quizSteps: QUIZ_STEPS,
    goToQuiz,
    goToSchoolPower,
    goToIntro,
    answerQuizStep,
    completeQuiz,
    resetQuiz,
  };
}
