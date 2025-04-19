
import React, { useEffect, useState } from "react";

interface TypewriterEffectProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({ 
  text, 
  className, 
  speed = 20, 
  delay = 0,
  onComplete 
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    if (!text) return;
    
    // Reset when text changes
    setDisplayedText("");
    setCurrentIndex(0);
    setIsTyping(true);
    
    // Delay start of typing
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex > text.length) {
            clearInterval(interval);
            setIsTyping(false);
            onComplete && onComplete();
            return prevIndex;
          }
          setDisplayedText(text.substring(0, nextIndex));
          return nextIndex;
        });
      }, speed);
      
      return () => clearInterval(interval);
    }, delay);
    
    return () => clearTimeout(startTimeout);
  }, [text, speed, delay, onComplete]);
  
  return (
    <div className={className}>
      {displayedText}
      {isTyping && (
        <span className="inline-block w-1 h-4 ml-1 bg-blue-500 dark:bg-blue-400 animate-pulse"></span>
      )}
    </div>
  );
};
