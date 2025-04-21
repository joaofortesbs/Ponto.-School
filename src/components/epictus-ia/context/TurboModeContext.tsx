
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TurboModeContextType {
  isTurboMode: boolean;
  toggleTurboMode: () => void;
  enableTurboMode: () => void;
  disableTurboMode: () => void;
}

const TurboModeContext = createContext<TurboModeContextType | undefined>(undefined);

export function TurboModeProvider({ children }: { children: ReactNode }) {
  const [isTurboMode, setIsTurboMode] = useState(false);

  const toggleTurboMode = () => {
    setIsTurboMode(prev => !prev);
  };

  const enableTurboMode = () => {
    setIsTurboMode(true);
  };

  const disableTurboMode = () => {
    setIsTurboMode(false);
  };

  return (
    <TurboModeContext.Provider value={{ 
      isTurboMode, 
      toggleTurboMode,
      enableTurboMode,
      disableTurboMode
    }}>
      {children}
    </TurboModeContext.Provider>
  );
}

export function useTurboMode() {
  const context = useContext(TurboModeContext);
  if (context === undefined) {
    throw new Error('useTurboMode must be used within a TurboModeProvider');
  }
  return context;
}
