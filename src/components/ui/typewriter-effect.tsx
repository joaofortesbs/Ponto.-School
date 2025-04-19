import React, { useState, useEffect, useRef } from "react";

interface TypewriterEffectProps {
  text: string;
  speed?: number; // milissegundos por caractere
  onComplete?: () => void;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({ 
  text, 
  speed = 10,
  onComplete
}) => {
  const [displayText, setDisplayText] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const isRunningRef = useRef<boolean>(true);
  const textRef = useRef<string>(text);

  // Atualizar a referência quando o texto mudar
  useEffect(() => {
    textRef.current = text;
    isRunningRef.current = true;
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (!textRef.current) {
      setDisplayText('');
      setCurrentIndex(0);
      if (onComplete) onComplete();
      return;
    }

    if (currentIndex < textRef.current.length && isRunningRef.current) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + textRef.current[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex >= textRef.current.length && onComplete) {
      // Garantir que onComplete seja chamado apenas uma vez
      if (isRunningRef.current) {
        isRunningRef.current = false;
        console.log("Typewriter effect completed");
        onComplete();
      }
    }
  }, [currentIndex, speed, onComplete]);

  // Forçar exibição completa se o componente for desmontado
  useEffect(() => {
    return () => {
      if (onComplete && isRunningRef.current) {
        isRunningRef.current = false;
        onComplete();
      }
    };
  }, [onComplete]);

  return <div className="typewriter-text">{displayText || (isRunningRef.current ? '' : textRef.current)}</div>;
};

export default TypewriterEffect;