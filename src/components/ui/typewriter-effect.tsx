
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

// Simple error boundary component for markdown rendering failures
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

interface TypewriterEffectProps {
  text: string;
  typingSpeed?: number;
  className?: string;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({ 
  text, 
  typingSpeed = 10, // Aumentar a velocidade para maior rapidez
  className = ''
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);

  // Reset quando o texto muda completamente
  useEffect(() => {
    // Se for um texto carregando, mostra imediatamente
    if (text.includes("Preparando conteúdo") || text === '') {
      setDisplayText(text);
      return;
    }

    // Se o texto mudou completamente, reinicie o efeito
    if (displayText === '' || !text.startsWith(displayText.substring(0, Math.min(20, displayText.length)))) {
      setDisplayText('');
      setCurrentIndex(0);
      setIsComplete(false);
      hasStartedRef.current = false;
      hasCompletedRef.current = false;
    }
  }, [text]);

  useEffect(() => {
    // Verifica se é o texto inicial/carregando
    if (text.includes("Preparando conteúdo") || text === '') {
      setDisplayText(text);
      return;
    }

    // Apenas inicia o efeito se ainda não tiver sido iniciado
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      
      // Inicia o efeito de typewriter
      if (currentIndex < text.length && !hasCompletedRef.current) {
        const timeout = setTimeout(() => {
          // Adiciona caracteres por chunks em vez de um por um para melhor performance
          const chunkSize = Math.max(1, Math.floor(text.length / 100));
          const nextIndex = Math.min(currentIndex + chunkSize, text.length);
          const chunk = text.substring(currentIndex, nextIndex);

          setDisplayText(prevText => prevText + chunk);
          setCurrentIndex(nextIndex);

          // Verifica se chegou ao final do texto
          if (nextIndex >= text.length) {
            setIsComplete(true);
            hasCompletedRef.current = true;
          }

          // Scroll para o final do conteúdo para acompanhar a digitação
          if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
          }
        }, typingSpeed);

        return () => clearTimeout(timeout);
      }
    } else if (!isComplete && !hasCompletedRef.current) {
      // Continua o efeito se já começou mas não terminou
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          const chunkSize = Math.max(1, Math.floor(text.length / 100));
          const nextIndex = Math.min(currentIndex + chunkSize, text.length);
          const chunk = text.substring(currentIndex, nextIndex);

          setDisplayText(prevText => prevText + chunk);
          setCurrentIndex(nextIndex);

          if (nextIndex >= text.length) {
            setIsComplete(true);
            hasCompletedRef.current = true;
          }

          if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
          }
        }, typingSpeed);

        return () => clearTimeout(timeout);
      }
    }
  }, [currentIndex, text, typingSpeed, isComplete]);

  // Função para mostrar todo o texto de uma vez
  const showFullText = () => {
    // Apenas mostra o texto completo se ainda não estiver completo
    if (!isComplete && !hasCompletedRef.current) {
      setDisplayText(text);
      setCurrentIndex(text.length);
      setIsComplete(true);
      hasCompletedRef.current = true;
    }
  };

  // Detecta se o texto parece ser markdown
  const containsMarkdown = text.includes('#') || 
                           text.includes('**') || 
                           text.includes('*') || 
                           text.includes('- ') || 
                           text.includes('1. ') ||
                           text.includes('`') ||
                           text.includes('[') ||
                           text.includes('###');

  return (
    <div 
      ref={contentRef}
      onClick={!isComplete && !hasCompletedRef.current ? showFullText : undefined} 
      className={`prose prose-sm dark:prose-invert max-w-none ${!isComplete && !hasCompletedRef.current ? 'cursor-pointer' : ''} ${className}`}
    >
      {containsMarkdown ? (
        <React.Suspense fallback={<div style={{ whiteSpace: 'pre-wrap' }}>{displayText}</div>}>
          <ErrorBoundary fallback={<div style={{ whiteSpace: 'pre-wrap' }}>{displayText}</div>}>
            <ReactMarkdown>
              {displayText}
            </ReactMarkdown>
          </ErrorBoundary>
        </React.Suspense>
      ) : (
        <div style={{ whiteSpace: 'pre-wrap' }}>{displayText}</div>
      )}

      {currentIndex < text.length && !isComplete && !hasCompletedRef.current && (
        <span className="animate-pulse inline-block h-4 w-1 ml-0.5 bg-blue-500 dark:bg-blue-400"></span>
      )}

      {!isComplete && !hasCompletedRef.current && currentIndex > 10 && (
        <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 rounded inline-block">
          Clique para mostrar todo o conteúdo imediatamente
        </div>
      )}
    </div>
  );
};

export default TypewriterEffect;
