
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TurboModeContextType {
  isTurboModeActive: boolean;
  activateTurboMode: () => void;
  deactivateTurboMode: () => void;
}

const TurboModeContext = createContext<TurboModeContextType>({
  isTurboModeActive: false,
  activateTurboMode: () => {},
  deactivateTurboMode: () => {},
});

export const useTurboModeContext = () => useContext(TurboModeContext);

interface TurboModeProviderProps {
  children: ReactNode;
}

export const TurboModeProvider: React.FC<TurboModeProviderProps> = ({ children }) => {
  const [isTurboModeActive, setIsTurboModeActive] = useState(false);

  const activateTurboMode = () => {
    setIsTurboModeActive(true);
  };

  const deactivateTurboMode = () => {
    setIsTurboModeActive(false);
  };

  return (
    <TurboModeContext.Provider
      value={{ isTurboModeActive, activateTurboMode, deactivateTurboMode }}
    >
      {children}
    </TurboModeContext.Provider>
  );
};
