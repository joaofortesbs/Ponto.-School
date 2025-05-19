
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface StudyGoalContextType {
  goalHours: number;
  completedHours: number;
  setGoalHours: (hours: number) => void;
  setCompletedHours: (hours: number) => void;
  progress: number;
}

const defaultContext: StudyGoalContextType = {
  goalHours: 40,
  completedHours: 0,
  setGoalHours: () => {},
  setCompletedHours: () => {},
  progress: 0,
};

const StudyGoalContext = createContext<StudyGoalContextType>(defaultContext);

export const useStudyGoal = () => useContext(StudyGoalContext);

interface StudyGoalProviderProps {
  children: ReactNode;
}

export const StudyGoalProvider: React.FC<StudyGoalProviderProps> = ({ children }) => {
  const [goalHours, setGoalHours] = useState<number>(40);
  const [completedHours, setCompletedHours] = useState<number>(0);

  const progress = goalHours > 0 ? Math.min(Math.round((completedHours / goalHours) * 100), 100) : 0;

  return (
    <StudyGoalContext.Provider
      value={{
        goalHours,
        completedHours,
        setGoalHours,
        setCompletedHours,
        progress,
      }}
    >
      {children}
    </StudyGoalContext.Provider>
  );
};
