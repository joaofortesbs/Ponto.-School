import { useState, useCallback, useMemo } from 'react';

export type StepType = 'intro' | 'quiz' | 'schoolpower';

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
    question: "Você tem dificuldades para criar atividades diversificadas para suas aulas?",
    options: ["Sempre", "Às vezes", "Nunca"]
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

  // Garantir que o estado seja sempre válido
  const safeState = useMemo(() => ({
    ...state,
    currentStep: state.currentStep || 'intro',
    quizStepNumber: Math.max(1, Math.min(state.quizStepNumber || 1, QUIZ_STEPS.length)),
    progressPercentage: Math.max(0, Math.min(state.progressPercentage || 0, 100))
  }), [state]);

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

      console.log(`📝 Resposta registrada - Etapa ${stepId}/${totalSteps}: "${answer}"`);

      // Se respondeu a última pergunta (etapa 4), vai IMEDIATAMENTE para School Power
      if (stepId >= totalSteps) {
        console.log('🎯 ÚLTIMA ETAPA RESPONDIDA! Redirecionando para School Power...');

        // Transição IMEDIATA e SÍNCRONA para School Power
        return {
          ...current,
          answers: newAnswers,
          progressPercentage: 100,
          currentStep: 'schoolpower',
          quizCompleted: true,
          schoolPowerAccessed: true,
          quizStepNumber: stepId
        };
      }

      // Caso contrário, vai para a próxima etapa
      console.log(`➡️ Avançando para etapa ${stepId + 1}`);
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
    state: safeState,
    quizSteps: QUIZ_STEPS,
    goToQuiz,
    goToSchoolPower,
    goToIntro,
    goToFinal,
    answerQuizStep,
    resetQuiz,
  };
}