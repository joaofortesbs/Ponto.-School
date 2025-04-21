
import React, { createContext, useContext, useState, ReactNode } from "react";

type TurboModeContextType = {
  isTurboMode: boolean;
  setTurboMode: (value: boolean) => void;
};

const TurboModeContext = createContext<TurboModeContextType | undefined>(undefined);

export const TurboModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTurboMode, setIsTurboMode] = useState(false);

  return (
    <TurboModeContext.Provider value={{ isTurboMode, setTurboMode: setIsTurboMode }}>
      {children}
    </TurboModeContext.Provider>
  );
};

export const useTurboMode = (): TurboModeContextType => {
  const context = useContext(TurboModeContext);
  if (!context) {
    throw new Error("useTurboMode must be used within a TurboModeProvider");
  }
  return context;
};
