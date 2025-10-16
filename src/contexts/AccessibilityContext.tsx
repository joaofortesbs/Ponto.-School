import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'pt' | 'en' | 'es' | 'fr' | 'it' | 'de';

interface AccessibilityContextType {
  language: Language;
  fontSize: number;
  voiceReading: boolean;
  setLanguage: (lang: Language) => void;
  setFontSize: (size: number) => void;
  setVoiceReading: (enabled: boolean) => void;
  translateText: (text: string) => Promise<string>;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');
  const [fontSize, setFontSize] = useState<number>(16);
  const [voiceReading, setVoiceReading] = useState<boolean>(false);

  const translateText = async (text: string): Promise<string> => {
    if (!text || language === 'pt') return text;

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLanguage: language })
      });

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      return data.translatedText || text;
    } catch (error) {
      console.error('❌ [TRADUÇÃO] Erro:', error);
      return text;
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        language,
        fontSize,
        voiceReading,
        setLanguage,
        setFontSize,
        setVoiceReading,
        translateText
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};
