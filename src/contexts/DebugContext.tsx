
import React, { createContext, useContext, useState } from 'react';

interface DebugContextType {
  isDebugVisible: boolean;
  showDebug: () => void;
  hideDebug: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [isDebugVisible, setIsDebugVisible] = useState(false);

  const showDebug = () => setIsDebugVisible(true);
  const hideDebug = () => setIsDebugVisible(false);

  return (
    <DebugContext.Provider value={{ isDebugVisible, showDebug, hideDebug }}>
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
}
