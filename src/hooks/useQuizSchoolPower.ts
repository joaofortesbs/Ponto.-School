
import { useState, useCallback } from 'react';

export interface QuizSchoolPowerState {
  currentStep: 'intro' | 'quiz' | 'quiz-step2' | 'quiz-step3' | 'quiz-step4' | 'quiz-final' | 'schoolpower';
  quizCompleted: boolean;
  schoolPowerAccessed: boolean;
  quizAnswers: {
    step2?: string;
    step3?: string;
    step4?: string;
  };
}

export interface UseQuizSchoolPowerReturn {
  state: QuizSchoolPowerState;
  goToQuiz: () => void;
  goToSchoolPower: () => void;
  goToIntro: () => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  goToQuizStep2: () => void;
  goToQuizStep3: () => void;
  goToQuizStep4: () => void;
  goToQuizFinal: () => void;
  saveQuizAnswer: (step: string, answer: string) => void;
}

export function useQuizSchoolPower(): UseQuizSchoolPowerReturn {
  const [state, setState] = useState<QuizSchoolPowerState>({
    currentStep: 'intro',
    quizCompleted: false,
    schoolPowerAccessed: false,
    quizAnswers: {},
  });

  const goToQuiz = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'quiz'
    }));
  }, []);

  const goToSchoolPower = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'schoolpower',
      schoolPowerAccessed: true
    }));
  }, []);

  const goToIntro = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'intro'
    }));
  }, []);

  const completeQuiz = useCallback(() => {
    setState(prev => ({
      ...prev,
      quizCompleted: true
    }));
  }, []);

  const goToQuizStep2 = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'quiz-step2'
    }));
  }, []);

  const goToQuizStep3 = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'quiz-step3'
    }));
  }, []);

  const goToQuizStep4 = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'quiz-step4'
    }));
  }, []);

  const goToQuizFinal = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'quiz-final'
    }));
  }, []);

  const saveQuizAnswer = useCallback((step: string, answer: string) => {
    setState(prev => ({
      ...prev,
      quizAnswers: {
        ...prev.quizAnswers,
        [step]: answer
      }
    }));
  }, []);

  const resetQuiz = useCallback(() => {
    setState({
      currentStep: 'intro',
      quizCompleted: false,
      schoolPowerAccessed: false,
      quizAnswers: {},
    });
  }, []);

  return {
    state,
    goToQuiz,
    goToSchoolPower,
    goToIntro,
    completeQuiz,
    resetQuiz,
    goToQuizStep2,
    goToQuizStep3,
    goToQuizStep4,
    goToQuizFinal,
    saveQuizAnswer,
  };
}
