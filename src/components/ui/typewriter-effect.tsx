
import React, { useState, useEffect } from 'react';

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  text,
  speed = 30,
  delay = 0,
  className = "",
  onComplete
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Reset when text changes
    setDisplayText('');
    setCurrentIndex(0);
    
    if (delay > 0) {
      timeoutId = setTimeout(startTyping, delay);
    } else {
      startTyping();
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [text]);
  
  const startTyping = () => {
    const intervalId = setInterval(() => {
      setCurrentIndex(prevIndex => {
        if (prevIndex >= text.length) {
          clearInterval(intervalId);
          if (onComplete) onComplete();
          return prevIndex;
        }
        
        setDisplayText(prevText => prevText + text.charAt(prevIndex));
        return prevIndex + 1;
      });
    }, speed);
    
    // Blinking cursor effect
    const cursorIntervalId = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    
    return () => {
      clearInterval(intervalId);
      clearInterval(cursorIntervalId);
    };
  };
  
  return (
    <div className={`typewriter-effect ${className}`}>
      <span>{displayText}</span>
      <span className={`cursor ${showCursor ? 'visible' : 'hidden'}`}>|</span>
    </div>
  );
};

export default TypewriterEffect;
