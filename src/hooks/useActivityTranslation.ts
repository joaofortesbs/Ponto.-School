import { useState, useEffect } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

export const useActivityTranslation = (content: any) => {
  const { language, translateText } = useAccessibility();
  const [translatedContent, setTranslatedContent] = useState(content);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translateContent = async () => {
      if (!content || language === 'pt') {
        setTranslatedContent(content);
        return;
      }

      setIsTranslating(true);
      try {
        const translated = await translateObjectRecursively(content, translateText);
        setTranslatedContent(translated);
      } catch (error) {
        console.error('❌ [useActivityTranslation] Erro ao traduzir:', error);
        setTranslatedContent(content);
      } finally {
        setIsTranslating(false);
      }
    };

    translateContent();
  }, [content, language, translateText]);

  return { translatedContent, isTranslating };
};

const translateObjectRecursively = async (
  obj: any,
  translateFn: (text: string) => Promise<string>
): Promise<any> => {
  if (!obj) return obj;

  if (typeof obj === 'string') {
    // Traduzir strings não vazias
    if (obj.trim().length > 0) {
      return await translateFn(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return Promise.all(
      obj.map(item => translateObjectRecursively(item, translateFn))
    );
  }

  if (typeof obj === 'object') {
    const translatedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Não traduzir IDs, códigos, URLs, etc.
      const skipKeys = ['id', 'code', 'url', 'link', 'href', 'src', 'type', 'key'];
      if (skipKeys.some(skip => key.toLowerCase().includes(skip))) {
        translatedObj[key] = value;
      } else {
        translatedObj[key] = await translateObjectRecursively(value, translateFn);
      }
    }
    return translatedObj;
  }

  return obj;
};
