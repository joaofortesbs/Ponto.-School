
import React, { useState, useEffect } from "react";

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  className?: string;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  text,
  speed = 30,
  delay = 0,
  onComplete,
  className = "",
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Reset when text changes completely
    setDisplayText("");
    setCurrentIndex(0);
    setIsTyping(true);
  }, [text]);

  useEffect(() => {
    if (!text || !isTyping) return;

    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, currentIndex === 0 ? delay : speed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, speed, delay, isTyping, onComplete]);

  if (!text) return null;

  return (
    <div className={className}>
      {displayText}
      {isTyping && (
        <span className="inline-block w-1 h-4 ml-0.5 bg-blue-500 dark:bg-blue-400 animate-blink"></span>
      )}
    </div>
  );
};

export default TypewriterEffect;
