
import React, { createContext, useContext, useState, useEffect } from "react";

type AccessibilityContextType = {
  fontSize: number;
  setFontSize: (size: number) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  screenReaderAnnounce: (message: string) => void;
  focusMode: boolean;
  setFocusMode: (enabled: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (enabled: boolean) => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem("accessibility-font-size");
    return saved ? parseInt(saved, 10) : 100;
  });
  
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    const saved = localStorage.getItem("accessibility-high-contrast");
    return saved === "true";
  });
  
  const [focusMode, setFocusMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("accessibility-focus-mode");
    return saved === "true";
  });
  
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    // Também verificar a preferência do sistema operacional
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saved = localStorage.getItem("accessibility-reduce-motion");
    return saved ? saved === "true" : prefersReducedMotion;
  });
  
  // Elementos para anúncios do leitor de tela
  const [announcements, setAnnouncements] = useState<string[]>([]);
  
  useEffect(() => {
    localStorage.setItem("accessibility-font-size", fontSize.toString());
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);
  
  useEffect(() => {
    localStorage.setItem("accessibility-high-contrast", highContrast.toString());
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrast]);
  
  useEffect(() => {
    localStorage.setItem("accessibility-focus-mode", focusMode.toString());
    if (focusMode) {
      document.documentElement.classList.add("focus-mode");
    } else {
      document.documentElement.classList.remove("focus-mode");
    }
  }, [focusMode]);
  
  useEffect(() => {
    localStorage.setItem("accessibility-reduce-motion", reduceMotion.toString());
    if (reduceMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  }, [reduceMotion]);
  
  // Função para anunciar mensagens para leitores de tela
  const screenReaderAnnounce = (message: string) => {
    setAnnouncements((prev) => [...prev, message]);
    // Remove o anúncio após 10 segundos para limpar
    setTimeout(() => {
      setAnnouncements((prev) => prev.filter((item) => item !== message));
    }, 10000);
  };
  
  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        screenReaderAnnounce,
        focusMode,
        setFocusMode,
        reduceMotion,
        setReduceMotion,
      }}
    >
      {children}
      
      {/* Área para anúncios do leitor de tela */}
      <div
        role="log"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="screen-reader-announcements"
      >
        {announcements.map((announcement, index) => (
          <div key={`${announcement}-${index}`}>{announcement}</div>
        ))}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
};
