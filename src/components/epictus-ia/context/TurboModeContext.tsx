
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TurboModeContextType {
  isTurboModeActive: boolean;
  activateTurboMode: () => void;
  deactivateTurboMode: () => void;
}

const TurboModeContext = createContext<TurboModeContextType | undefined>(undefined);

export const useTurboMode = () => {
  const context = useContext(TurboModeContext);
  if (!context) {
    throw new Error("useTurboMode must be used within a TurboModeProvider");
  }
  return context;
};

export const TurboModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTurboModeActive, setIsTurboModeActive] = useState(false);

  const activateTurboMode = () => {
    console.log("Ativando modo Turbo");
    setIsTurboModeActive(true);
  };

  const deactivateTurboMode = () => {
    console.log("Desativando modo Turbo");
    setIsTurboModeActive(false);
  };

  return (
    <TurboModeContext.Provider 
      value={{ 
        isTurboModeActive, 
        activateTurboMode,
        deactivateTurboMode
      }}
    >
      {children}
    </TurboModeContext.Provider>
  );
};
