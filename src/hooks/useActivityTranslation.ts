import { useState, useEffect, useMemo } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

// Cache global de traduções indexado por activity ID + language
const translationCache = new Map<string, any>();

interface TranslationOptions {
  activityId?: string;
}

export const useActivityTranslation = (content: any, options: TranslationOptions = {}) => {
  const { language, translateText } = useAccessibility();
  const [translatedContent, setTranslatedContent] = useState(content);
  const [isTranslating, setIsTranslating] = useState(false);

  // Gerar ID estável para o conteúdo
  const contentId = useMemo(() => {
    return options.activityId || JSON.stringify(content).substring(0, 100);
  }, [content, options.activityId]);

  useEffect(() => {
    const translateContent = async () => {
      if (!content || language === 'pt') {
        setTranslatedContent(content);
        return;
      }

      // Criar chave de cache baseada em ID do conteúdo + idioma
      const cacheKey = `${contentId}_${language}`;

      // Verificar cache primeiro
      if (translationCache.has(cacheKey)) {
        console.log(`🎯 [TRADUÇÃO] Usando cache para ${language.toUpperCase()}`);
        setTranslatedContent(translationCache.get(cacheKey));
        return;
      }

      setIsTranslating(true);
      console.log(`🌐 [TRADUÇÃO] Iniciando tradução para ${language.toUpperCase()}...`);

      try {
        const translated = await translateObjectRecursively(content, translateText);
        
        // Salvar no cache
        translationCache.set(cacheKey, translated);
        setTranslatedContent(translated);
        
        console.log(`✅ [TRADUÇÃO] Conteúdo traduzido para ${language.toUpperCase()}`);
      } catch (error) {
        console.error('❌ [TRADUÇÃO] Erro ao traduzir:', error);
        setTranslatedContent(content);
      } finally {
        setIsTranslating(false);
      }
    };

    translateContent();
  }, [content, language, translateText, contentId]);

  return { translatedContent, isTranslating };
};

const translateObjectRecursively = async (
  obj: any,
  translateFn: (text: string) => Promise<string>
): Promise<any> => {
  if (!obj) return obj;

  if (typeof obj === 'string') {
    // Pular strings vazias ou muito curtas (provavelmente não são texto para exibir)
    if (obj.trim().length < 3) return obj;
    
    // Traduzir string
    return await translateFn(obj);
  }

  if (Array.isArray(obj)) {
    return Promise.all(
      obj.map(item => translateObjectRecursively(item, translateFn))
    );
  }

  if (typeof obj === 'object') {
    const translatedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Não traduzir IDs, códigos, URLs, campos técnicos
      const skipKeys = ['id', 'code', 'url', 'link', 'href', 'src', 'type', 'key', 'prompt', 'config'];
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
