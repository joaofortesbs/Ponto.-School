
import { useState, useCallback } from 'react';

export interface QuizSchoolPowerState {
  currentStep: 'intro' | 'quiz' | 'schoolpower';
  quizCompleted: boolean;
  schoolPowerAccessed: boolean;
}

export interface UseQuizSchoolPowerReturn {
  state: QuizSchoolPowerState;
  goToQuiz: () => void;
  goToSchoolPower: () => void;
  goToIntro: () => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
}

export function useQuizSchoolPower(): UseQuizSchoolPowerReturn {
  const [state, setState] = useState<QuizSchoolPowerState>({
    currentStep: 'intro',
    quizCompleted: false,
    schoolPowerAccessed: false,
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

  const resetQuiz = useCallback(() => {
    setState({
      currentStep: 'intro',
      quizCompleted: false,
      schoolPowerAccessed: false,
    });
  }, []);

  return {
    state,
    goToQuiz,
    goToSchoolPower,
    goToIntro,
    completeQuiz,
    resetQuiz,
  };
}
