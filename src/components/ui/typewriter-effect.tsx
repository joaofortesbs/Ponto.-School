
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
  typingSpeed = 10,
  className = ''
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationCompleted = useRef<boolean>(false);

  // Iniciar a digitação apenas uma vez quando o componente for montado
  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      setDisplayText('');
      setCurrentIndex(0);
      setIsComplete(false);
      animationCompleted.current = false;
    }
  }, [hasStarted]);

  useEffect(() => {
    // Verificar se é o texto inicial/carregando
    if (text.includes("Preparando conteúdo") || text === '') {
      setDisplayText(text);
      setIsComplete(true);
      return;
    }

    // Se o efeito já foi concluído, não execute novamente
    if (animationCompleted.current) {
      return;
    }

    if (currentIndex < text.length) {
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
          animationCompleted.current = true;
        }

        // Scroll para o final do conteúdo para acompanhar a digitação
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }, typingSpeed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, typingSpeed]);

  // Mostrar texto completo imediatamente ao clicar, mas apenas se o efeito estiver em andamento
  const handleClick = () => {
    if (isComplete) return;
    
    setDisplayText(text);
    setCurrentIndex(text.length);
    setIsComplete(true);
    animationCompleted.current = true;
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
      onClick={isComplete ? undefined : handleClick} 
      className={`prose prose-sm dark:prose-invert max-w-none ${!isComplete ? 'cursor-pointer' : ''} ${className}`}
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

      {currentIndex < text.length && (
        <span className="animate-pulse inline-block h-4 w-1 ml-0.5 bg-blue-500 dark:bg-blue-400"></span>
      )}
    </div>
  );
};

export default TypewriterEffect;
