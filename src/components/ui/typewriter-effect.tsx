import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

// Componentes personalizados para o ReactMarkdown
const markdownComponents = {
  p: ({node, ...props}) => <p className="my-1" {...props} />,
  h1: ({node, ...props}) => <h1 className="my-2" {...props} />,
  h2: ({node, ...props}) => <h2 className="my-2" {...props} />,
  h3: ({node, ...props}) => <h3 className="my-2" {...props} />,
  h4: ({node, ...props}) => <h4 className="my-2" {...props} />,
  h5: ({node, ...props}) => <h5 className="my-2" {...props} />,
  h6: ({node, ...props}) => <h6 className="my-2" {...props} />,
  ul: ({node, ...props}) => <ul className="my-1 ml-4 list-disc" {...props} />,
  ol: ({node, ...props}) => <ol className="my-1 ml-4 list-decimal" {...props} />,
  li: ({node, ...props}) => <li className="my-0.5" {...props} />,
  code: ({node, inline, ...props}) => 
    inline 
      ? <code className="bg-gray-700/50 px-1 py-0.5 rounded text-sm" {...props} />
      : <code className="block bg-gray-800/50 p-2 rounded text-sm my-2 overflow-x-auto" {...props} />
};

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
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset quando o texto muda
  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    // Verifica se é o texto inicial/carregando
    if (text.includes("Preparando conteúdo") || text === '') {
      setDisplayText(text);
      return;
    }

    if (currentIndex < text.length && !isPaused) {
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
        }

        // Scroll para o final do conteúdo para acompanhar a digitação
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }, typingSpeed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, typingSpeed, isPaused]);

  const handleClick = () => {
    // Se já completou, não faz nada ao clicar
    if (isComplete) return;

    // Se estiver pausado, continua a digitação
    if (isPaused) {
      setIsPaused(false);
      return;
    }

    // Se o texto estiver sendo digitado e o usuário clicar, completa imediatamente
    if (currentIndex < text.length) {
      setDisplayText(text);
      setCurrentIndex(text.length);
      setIsComplete(true);
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
      onClick={handleClick} 
      className={`prose prose-sm dark:prose-invert max-w-none cursor-pointer ${className}`}
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

      {currentIndex < text.length && !isPaused && (
        <span className="animate-pulse inline-block h-4 w-1 ml-0.5 bg-blue-500 dark:bg-blue-400"></span>
      )}

      {isPaused && (
        <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 rounded inline-block">
          Clique para continuar a digitação
        </div>
      )}

      {!isComplete && !isPaused && currentIndex > 10 && (
        <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 rounded inline-block">
          Clique para mostrar todo o conteúdo imediatamente
        </div>
      )}
    </div>
  );
};

export default TypewriterEffect;