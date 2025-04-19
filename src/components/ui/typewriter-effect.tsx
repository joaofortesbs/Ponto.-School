import React, { useState, useEffect, useRef } from 'react';

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({ 
  text, 
  speed = 30,
  onComplete
}) => {
  const [displayText, setDisplayText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const textLengthRef = useRef(text.length);
  const completedRef = useRef(false);

  // Resetar quando o texto mudar
  useEffect(() => {
    textLengthRef.current = text.length;
    completedRef.current = false;
    setDisplayText('');

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text]);

  // Iniciar o efeito de digitação
  useEffect(() => {
    let i = 0;
    const chunkSize = Math.max(1, Math.floor(text.length / 100)); // Processar em chunks para textos longos

    intervalRef.current = setInterval(() => {
      if (i < text.length) {
        const end = Math.min(i + chunkSize, text.length);
        setDisplayText(text.substring(0, end));
        i = end;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        if (onComplete && !completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
      }
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, speed, onComplete]);

  // Se o componente for desmontado antes de concluir, garantir que o callback seja chamado
  useEffect(() => {
    return () => {
      if (!completedRef.current && onComplete) {
        onComplete();
      }
    };
  }, [onComplete]);

  return <span>{displayText}</span>;
};

export default TypewriterEffect;