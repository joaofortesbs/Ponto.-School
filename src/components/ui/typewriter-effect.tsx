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
      return this.props.fallback || <div>Something went wrong rendering Markdown.</div>;
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
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [renderError, setRenderError] = useState(false); // Added error state
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset when the text changes
  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
    setIsComplete(false);
    setRenderError(false); // Reset error state
  }, [text]);

  useEffect(() => {
    //Checks if it's the initial/loading text
    if (text.includes("Preparando conteúdo") || text === '') {
      setDisplayText(text);
      return;
    }

    if (currentIndex < text.length && !isPaused) {
      const timeout = setTimeout(() => {
        // Adds characters by chunks instead of one by one for better performance
        const chunkSize = Math.max(1, Math.floor(text.length / 100));
        const nextIndex = Math.min(currentIndex + chunkSize, text.length);
        const chunk = text.substring(currentIndex, nextIndex);

        setDisplayText(prevText => prevText + chunk);
        setCurrentIndex(nextIndex);

        // Checks if it reached the end of the text
        if (nextIndex >= text.length) {
          setIsComplete(true);
        }

        // Scrolls to the end of the content to follow the typing
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }, typingSpeed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, typingSpeed, isPaused]);

  const handleClick = () => {
    // If it's already complete, it does nothing when clicked
    if (isComplete) return;

    // If it's paused, it continues typing
    if (isPaused) {
      setIsPaused(false);
      return;
    }

    // If the text is being typed and the user clicks, it completes immediately
    if (currentIndex < text.length) {
      setDisplayText(text);
      setCurrentIndex(text.length);
      setIsComplete(true);
    }
  };

  // Detects if the text seems to be markdown
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
        <ErrorBoundary fallback={<div style={{ whiteSpace: 'pre-wrap' }}>{renderError ? "Error rendering Markdown" : displayText}</div>}> {/*Improved fallback*/}
          <ReactMarkdown children={displayText} onError={e => setRenderError(true)}/> {/*Improved error handling*/}
        </ErrorBoundary>
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