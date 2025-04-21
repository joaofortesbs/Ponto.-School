import React, { createContext, useContext, useState, ReactNode } from "react";

type TurboModeContextType = {
  isTurboModeActive: boolean;
  setTurboModeActive: (value: boolean) => void;
  activateTurboMode: () => void;
};

const TurboModeContext = createContext<TurboModeContextType | undefined>(undefined);

export const useTurboModeContext = () => {
  const context = useContext(TurboModeContext);
  if (!context) {
    throw new Error("useTurboModeContext must be used within a TurboModeProvider");
  }
  return context;
};

export const TurboModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTurboModeActive, setTurboModeActive] = useState(false);

  const activateTurboMode = () => {
    console.log("Ativando modo Turbo");
    setTurboModeActive(true);
  };

  return (
    <TurboModeContext.Provider value={{ 
      isTurboModeActive, 
      setTurboModeActive,
      activateTurboMode 
    }}>
      {children}
    </TurboModeContext.Provider>
  );
};