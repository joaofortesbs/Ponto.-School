import React, { useState, useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';

export interface NarrativeReflectionProps {
  id: string;
  objectiveTitle: string;
  narrative: string;
  tone: 'celebratory' | 'cautious' | 'explanatory' | 'reassuring';
  highlights?: string[];
  isLoading?: boolean;
  onComplete?: () => void;
}

const INITIAL_DELAY = 150;

function calculateTypewriterInterval(textLength: number): number {
  if (textLength < 50) return 35;
  if (textLength < 100) return 25;
  if (textLength < 200) return 18;
  if (textLength < 400) return 12;
  return 8;
}

const toneColors = {
  celebratory: 'text-emerald-300',
  cautious: 'text-amber-300',
  explanatory: 'text-blue-300',
  reassuring: 'text-purple-300',
};

function useStableTypewriter(narrative: string, isLoading: boolean, onComplete?: () => void) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const isTypingRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const currentNarrativeRef = useRef(narrative);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (isLoading) {
      setDisplayedText('');
      setIsTyping(false);
      isTypingRef.current = false;
      hasCompletedRef.current = false;
      return;
    }

    if (narrative === currentNarrativeRef.current && isTypingRef.current) {
      return;
    }

    if (narrative === currentNarrativeRef.current && hasCompletedRef.current) {
      return;
    }

    currentNarrativeRef.current = narrative;
    hasCompletedRef.current = false;

    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const intervalMs = calculateTypewriterInterval(narrative.length);

    timerRef.current = setTimeout(() => {
      isTypingRef.current = true;
      setIsTyping(true);
      let currentIndex = 0;

      intervalRef.current = setInterval(() => {
        if (currentIndex < narrative.length) {
          currentIndex += 1;
          setDisplayedText(narrative.slice(0, currentIndex));
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          isTypingRef.current = false;
          hasCompletedRef.current = true;
          setIsTyping(false);
          onCompleteRef.current?.();
        }
      }, intervalMs);
    }, INITIAL_DELAY);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [narrative, isLoading]);

  return { displayedText, isTyping };
}

const NarrativeReflectionCardInner: React.FC<NarrativeReflectionProps> = ({
  id,
  narrative,
  tone,
  isLoading = false,
  onComplete,
}) => {
  const { displayedText, isTyping } = useStableTypewriter(
    narrative,
    isLoading,
    onComplete
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const textColor = toneColors[tone];
  const shouldTruncate = !isTyping && displayedText.length > 150;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full my-3 pl-1"
      data-reflection-id={id}
    >
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-gray-400"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full"
          />
          <span className="text-sm italic">Refletindo...</span>
        </motion.div>
      ) : (
        <div>
          <p 
            className={`${textColor} text-sm leading-relaxed ${
              shouldTruncate && !isExpanded ? 'line-clamp-3' : ''
            }`}
          >
            {displayedText}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-4 ml-0.5 bg-current"
              />
            )}
          </p>
          {shouldTruncate && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className={`mt-1 text-xs font-medium ${textColor} opacity-70 hover:opacity-100 hover:underline transition-all`}
            >
              Ver mais...
            </button>
          )}
          {shouldTruncate && isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className={`mt-1 text-xs font-medium ${textColor} opacity-70 hover:opacity-100 hover:underline transition-all`}
            >
              Ver menos
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export const NarrativeReflectionCard = memo(NarrativeReflectionCardInner, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id &&
    prevProps.narrative === nextProps.narrative &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.tone === nextProps.tone;
});

export function LoadingReflection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full my-3 pl-1"
    >
      <div className="flex items-center gap-2 text-gray-400">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full"
        />
        <span className="text-sm italic text-gray-500">Refletindo...</span>
      </div>
    </motion.div>
  );
}

export default NarrativeReflectionCard;
