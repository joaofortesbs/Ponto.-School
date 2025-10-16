import { useState, useEffect, useMemo } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

// Cache global de traduções indexado por activity ID + language
const translationCache = new Map<string, any>();

interface TranslationOptions {
  activityId?: string;
}

export const useActivityTranslation = (content: any, options: TranslationOptions = {}) => {
  const { language } = useAccessibility();
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
      console.log(`🌐 [TRADUÇÃO] Iniciando tradução em lote para ${language.toUpperCase()}...`);

      try {
        // Coletar todas as strings do objeto
        const textsToTranslate: string[] = [];
        const textMap = new Map<string, number>();
        
        collectStrings(content, textsToTranslate, textMap);
        
        console.log(`📦 [TRADUÇÃO] ${textsToTranslate.length} textos únicos para traduzir`);

        // Traduzir tudo em um único request (batch)
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: JSON.stringify(textsToTranslate), 
            targetLanguage: language,
            isBatch: true
          })
        });

        if (!response.ok) throw new Error('Translation failed');

        const data = await response.json();
        const translatedTexts = JSON.parse(data.translatedText);

        // Criar mapa de traduções
        const translationsMap = new Map<string, string>();
        textsToTranslate.forEach((original, index) => {
          translationsMap.set(original, translatedTexts[index] || original);
        });

        // Reconstruir objeto com traduções
        const translated = reconstructWithTranslations(content, translationsMap);
        
        // Salvar no cache
        translationCache.set(cacheKey, translated);
        setTranslatedContent(translated);
        
        console.log(`✅ [TRADUÇÃO] Conteúdo traduzido em lote para ${language.toUpperCase()}`);
      } catch (error) {
        console.error('❌ [TRADUÇÃO] Erro ao traduzir:', error);
        setTranslatedContent(content);
      } finally {
        setIsTranslating(false);
      }
    };

    translateContent();
  }, [content, language, contentId]);

  return { translatedContent, isTranslating };
};

// Coletar todas as strings do objeto (sem duplicatas)
function collectStrings(obj: any, texts: string[], textMap: Map<string, number>) {
  if (!obj) return;

  if (typeof obj === 'string') {
    // Pular strings vazias ou muito curtas
    if (obj.trim().length < 3) return;
    
    // Adicionar apenas se não estiver duplicado
    if (!textMap.has(obj)) {
      textMap.set(obj, texts.length);
      texts.push(obj);
    }
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach(item => collectStrings(item, texts, textMap));
    return;
  }

  if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      // Pular campos técnicos
      const skipKeys = ['id', 'code', 'url', 'link', 'href', 'src', 'type', 'key', 'prompt', 'config'];
      if (!skipKeys.some(skip => key.toLowerCase().includes(skip))) {
        collectStrings(value, texts, textMap);
      }
    }
  }
}

// Reconstruir objeto com traduções aplicadas
function reconstructWithTranslations(obj: any, translationsMap: Map<string, string>): any {
  if (!obj) return obj;

  if (typeof obj === 'string') {
    // Retornar tradução se existir, senão retornar original
    return translationsMap.get(obj) || obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => reconstructWithTranslations(item, translationsMap));
  }

  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const skipKeys = ['id', 'code', 'url', 'link', 'href', 'src', 'type', 'key', 'prompt', 'config'];
      if (skipKeys.some(skip => key.toLowerCase().includes(skip))) {
        result[key] = value;
      } else {
        result[key] = reconstructWithTranslations(value, translationsMap);
      }
    }
    return result;
  }

  return obj;
}
