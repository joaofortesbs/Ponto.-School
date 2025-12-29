import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Sparkles, CheckCircle2 } from 'lucide-react';

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

const toneConfig = {
  celebratory: {
    icon: Sparkles,
    iconColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-400/30',
    accentColor: 'text-emerald-300',
  },
  cautious: {
    icon: Lightbulb,
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-400/30',
    accentColor: 'text-amber-300',
  },
  explanatory: {
    icon: Lightbulb,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-400/30',
    accentColor: 'text-blue-300',
  },
  reassuring: {
    icon: CheckCircle2,
    iconColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-400/30',
    accentColor: 'text-purple-300',
  },
};

function useStableTypewriter(narrative: string, isLoading: boolean, onComplete?: () => void) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  
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
      setShowHighlights(false);
      isTypingRef.current = false;
      hasCompletedRef.current = false;
      return;
    }

    if (narrative === currentNarrativeRef.current && isTypingRef.current) {
      console.log('🔒 [Typewriter] Já digitando, ignorando re-render');
      return;
    }

    if (narrative === currentNarrativeRef.current && hasCompletedRef.current) {
      console.log('✅ [Typewriter] Já completou, mantendo estado');
      return;
    }

    currentNarrativeRef.current = narrative;
    hasCompletedRef.current = false;

    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const intervalMs = calculateTypewriterInterval(narrative.length);
    console.log(`⌨️ [Typewriter] Iniciando para: "${narrative.substring(0, 30)}..." (${intervalMs}ms/char)`);

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
          setShowHighlights(true);
          console.log('🏁 [Typewriter] Completou!');
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

  return { displayedText, isTyping, showHighlights };
}

const NarrativeReflectionCardInner: React.FC<NarrativeReflectionProps> = ({
  id,
  objectiveTitle,
  narrative,
  tone,
  highlights = [],
  isLoading = false,
  onComplete,
}) => {
  const { displayedText, isTyping, showHighlights } = useStableTypewriter(
    narrative,
    isLoading,
    onComplete
  );

  const config = toneConfig[tone];
  const Icon = config.icon;

  console.log(`🎨 [ReflectionCard] Render id=${id}, isTyping=${isTyping}, chars=${displayedText.length}/${narrative.length}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`
        relative w-full mx-auto my-4
        ${config.bgColor} ${config.borderColor}
        border-l-4 rounded-lg p-4 md:p-5
        backdrop-blur-sm
      `}
      data-reflection-id={id}
    >
      <div className="flex items-start gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
          className={`
            flex-shrink-0 w-8 h-8 rounded-full
            flex items-center justify-center
            ${config.bgColor} ${config.borderColor} border
          `}
        >
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xs text-gray-500 mb-1 uppercase tracking-wider"
          >
            Reflexão
          </motion.p>

          <div className="relative">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-gray-400"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
                />
                <span className="text-sm italic">Refletindo sobre os resultados...</span>
              </motion.div>
            ) : (
              <p className="text-white/90 text-sm md:text-base leading-relaxed">
                {displayedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className={`inline-block w-0.5 h-4 ml-0.5 ${config.iconColor} bg-current`}
                  />
                )}
              </p>
            )}
          </div>

          <AnimatePresence>
            {showHighlights && highlights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="mt-3 pt-3 border-t border-white/10"
              >
                <div className="flex flex-wrap gap-2">
                  {highlights.map((highlight, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-full
                        text-xs ${config.accentColor} ${config.bgColor}
                        border ${config.borderColor}
                      `}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {highlight}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isTyping ? displayedText.length / narrative.length : 1 }}
        className={`
          absolute bottom-0 left-0 right-0 h-0.5 origin-left
          ${isLoading ? 'bg-gray-500/30' : config.iconColor.replace('text-', 'bg-')}/30
        `}
      />
    </motion.div>
  );
};

export const NarrativeReflectionCard = memo(NarrativeReflectionCardInner, (prevProps, nextProps) => {
  const isSame = prevProps.id === nextProps.id &&
    prevProps.narrative === nextProps.narrative &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.tone === nextProps.tone;
  
  if (!isSame) {
    console.log('🔄 [ReflectionCard] Props mudaram, re-render permitido');
  }
  
  return isSame;
});

export function LoadingReflection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto my-4 bg-gray-800/30 border-l-4 border-gray-500/30 rounded-lg p-4"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full border-2 border-gray-500 border-t-transparent"
        />
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Reflexão</p>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-gray-500"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default NarrativeReflectionCard;
