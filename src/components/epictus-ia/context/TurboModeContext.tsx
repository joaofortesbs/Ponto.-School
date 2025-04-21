
import React, { createContext, useContext, useState, ReactNode } from "react";

interface TurboModeContextType {
  isTurboMode: boolean;
  setTurboMode: (isActive: boolean) => void;
}

const TurboModeContext = createContext<TurboModeContextType | undefined>(undefined);

export const TurboModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTurboMode, setIsTurboMode] = useState(false);

  const setTurboMode = (isActive: boolean) => {
    setIsTurboMode(isActive);
  };

  return (
    <TurboModeContext.Provider value={{ isTurboMode, setTurboMode }}>
      {children}
    </TurboModeContext.Provider>
  );
};

export const useTurboMode = (): TurboModeContextType => {
  const context = useContext(TurboModeContext);
  if (context === undefined) {
    throw new Error("useTurboMode must be used within a TurboModeProvider");
  }
  return context;
};
