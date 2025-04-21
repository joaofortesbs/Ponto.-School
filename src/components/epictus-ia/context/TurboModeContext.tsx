
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface TurboModeContextType {
  isTurboMode: boolean;
  activateTurboMode: () => void;
  deactivateTurboMode: () => void;
}

const TurboModeContext = createContext<TurboModeContextType | undefined>(undefined);

export const TurboModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTurboMode, setIsTurboMode] = useState(false);

  const activateTurboMode = () => {
    console.log("🔥 TURBO: Ativando TurboMode no contexto global");
    setIsTurboMode(true);
  };

  const deactivateTurboMode = () => {
    console.log("❄️ TURBO: Desativando TurboMode no contexto global");
    setIsTurboMode(false);
  };

  // Log quando o estado do contexto muda
  useEffect(() => {
    console.log("🔄 TURBO: Estado do TurboMode mudou para:", isTurboMode ? "ATIVADO ✅" : "DESATIVADO ❌");
  }, [isTurboMode]);

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
