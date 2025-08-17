
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
  currentStep: 'intro' | 'quiz' | 'final' | 'schoolpower';
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
  goToFinal: () => void;
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
  },
  {
    id: 3,
    question: "Você acredita que ter alunos engajados na sua aula é fundamental?",
    options: [
      { text: "Claro!", value: "claro" },
      { text: "Um pouco", value: "um_pouco" },
      { text: "Não", value: "nao" }
    ]
  },
  {
    id: 4,
    question: "Se você pudesse acessar uma plataforma que cria todas as atividades/materiais interativos do semestre em -2 minutos, você acessaria?",
    options: [
      { text: "Com certeza!", value: "com_certeza" },
      { text: "Talvez", value: "talvez" },
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

  const goToFinal = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'final',
      progressPercentage: 100
    }));
  }, []);

  const answerQuizStep = useCallback((stepId: number, answer: string) => {
    setState(prev => {
      const newAnswers = { ...prev.quizAnswers, [stepId]: answer };
      const nextStepNumber = stepId + 1;
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
    goToFinal,
    answerQuizStep,
    completeQuiz,
    resetQuiz,
  };
}
