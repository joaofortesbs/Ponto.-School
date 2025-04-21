
import React, { createContext, useState, useContext, ReactNode } from "react";

interface TurboModeContextType {
  isTurboMode: boolean;
  activateTurboMode: () => void;
  deactivateTurboMode: () => void;
}

const TurboModeContext = createContext<TurboModeContextType | undefined>(undefined);

export const TurboModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTurboMode, setIsTurboMode] = useState(false);

  const activateTurboMode = () => {
    setIsTurboMode(true);
  };

  const deactivateTurboMode = () => {
    setIsTurboMode(false);
  };

  return (
    <TurboModeContext.Provider value={{ isTurboMode, activateTurboMode, deactivateTurboMode }}>
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
