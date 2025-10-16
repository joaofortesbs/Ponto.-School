import { useEffect, useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface TranslatedTextProps {
  children: string;
  className?: string;
  tag?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div' | 'li';
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({ 
  children, 
  className = '', 
  tag: Tag = 'span' 
}) => {
  const { language, fontSize, translateText } = useAccessibility();
  const [translatedContent, setTranslatedContent] = useState<string>(children);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translate = async () => {
      if (!children || language === 'pt') {
        setTranslatedContent(children);
        return;
      }

      setIsTranslating(true);
      try {
        const translated = await translateText(children);
        setTranslatedContent(translated);
      } catch (error) {
        console.error('❌ [TranslatedText] Erro ao traduzir:', error);
        setTranslatedContent(children);
      } finally {
        setIsTranslating(false);
      }
    };

    translate();
  }, [children, language, translateText]);

  return (
    <Tag 
      className={className} 
      style={{ fontSize: `${fontSize}px` }}
    >
      {isTranslating ? children : translatedContent}
    </Tag>
  );
};
