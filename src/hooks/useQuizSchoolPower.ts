
import { useState, useCallback } from 'react';

export interface QuizSchoolPowerState {
  currentStep: 'intro' | 'quiz-step-2' | 'quiz-step-3' | 'quiz-step-4' | 'quiz-final' | 'schoolpower';
  quizCompleted: boolean;
  schoolPowerAccessed: boolean;
  quizAnswers: {
    step2?: string;
    step3?: string;
    step4?: string;
  };
  progressPercentage: number;
}

export interface UseQuizSchoolPowerReturn {
  state: QuizSchoolPowerState;
  goToQuizStep2: () => void;
  goToQuizStep3: () => void;
  goToQuizStep4: () => void;
  goToQuizFinal: () => void;
  goToSchoolPower: () => void;
  goToIntro: () => void;
  saveQuizAnswer: (step: string, answer: string) => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
}

export function useQuizSchoolPower(): UseQuizSchoolPowerReturn {
  const [state, setState] = useState<QuizSchoolPowerState>({
    currentStep: 'intro',
    quizCompleted: false,
    schoolPowerAccessed: false,
    quizAnswers: {},
    progressPercentage: 0,
  });

  const calculateProgress = (step: string) => {
    switch (step) {
      case 'intro': return 0;
      case 'quiz-step-2': return 25;
      case 'quiz-step-3': return 50;
      case 'quiz-step-4': return 75;
      case 'quiz-final': return 100;
      case 'schoolpower': return 100;
      default: return 0;
    }
  };

  const goToQuizStep2 = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'quiz-step-2',
      progressPercentage: calculateProgress('quiz-step-2')
    }));
  }, []);

  const goToQuizStep3 = useCallback(() => {
    console.log('🚀 Avançando para Quiz Step 3');
    setState(prev => ({
      ...prev,
      currentStep: 'quiz-step-3',
      progressPercentage: calculateProgress('quiz-step-3')
    }));
  }, []);

  const goToQuizStep4 = useCallback(() => {
    console.log('🚀 Avançando para Quiz Step 4');
    setState(prev => ({
      ...prev,
      currentStep: 'quiz-step-4',
      progressPercentage: calculateProgress('quiz-step-4')
    }));
  }, []);

  const goToQuizFinal = useCallback(() => {
    console.log('🚀 Avançando para Quiz Final');
    setState(prev => ({
      ...prev,
      currentStep: 'quiz-final',
      progressPercentage: calculateProgress('quiz-final'),
      quizCompleted: true
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
      currentStep: 'intro',
      progressPercentage: 0
    }));
  }, []);

  const saveQuizAnswer = useCallback((step: string, answer: string) => {
    console.log(`💾 Salvando resposta: ${step} = ${answer}`);
    setState(prev => ({
      ...prev,
      quizAnswers: {
        ...prev.quizAnswers,
        [step]: answer
      }
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
      quizAnswers: {},
      progressPercentage: 0,
    });
  }, []);

  return {
    state,
    goToQuizStep2,
    goToQuizStep3,
    goToQuizStep4,
    goToQuizFinal,
    goToSchoolPower,
    goToIntro,
    saveQuizAnswer,
    completeQuiz,
    resetQuiz,
  };
}
