import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

interface StudyGoalContextType {
  studyGoal: number;
  setStudyGoal: (goal: number) => void;
  studyProgress: number;
  setStudyProgress: (progress: number) => void;
  updateStudyGoal: (goal: number) => void;
}

const StudyGoalContext = createContext<StudyGoalContextType | undefined>(
  undefined,
);

export const useStudyGoal = () => {
  const context = useContext(StudyGoalContext);
  if (context === undefined) {
    throw new Error("useStudyGoal must be used within a StudyGoalProvider");
  }
  return context;
};

interface StudyGoalProviderProps {
  children: ReactNode;
}

export const StudyGoalProvider: React.FC<StudyGoalProviderProps> = ({
  children,
}) => {
  const [studyGoal, setStudyGoal] = useState<number>(() => {
    // Try to get the goal from localStorage
    const savedGoal = localStorage.getItem("studyGoal");
    return savedGoal ? parseInt(savedGoal, 10) : 40; // Default to 40 hours if not set
  });

  const [studyProgress, setStudyProgress] = useState<number>(() => {
    // Try to get the progress from localStorage
    const savedProgress = localStorage.getItem("studyProgress");
    return savedProgress ? parseInt(savedProgress, 10) : 0;
  });

  // Save to localStorage whenever the values change
  useEffect(() => {
    localStorage.setItem("studyGoal", studyGoal.toString());
  }, [studyGoal]);

  useEffect(() => {
    localStorage.setItem("studyProgress", studyProgress.toString());
  }, [studyProgress]);

  const updateStudyGoal = (goal: number) => {
    setStudyGoal(goal);
  };

  return (
    <StudyGoalContext.Provider
      value={{
        studyGoal,
        setStudyGoal,
        studyProgress,
        setStudyProgress,
        updateStudyGoal,
      }}
    >
      {children}
    </StudyGoalContext.Provider>
  );
};
