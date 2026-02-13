import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import type { PredictiveSuggestion } from '../types/message-types';

interface PredictiveSuggestionsCardProps {
  suggestions: PredictiveSuggestion[];
  onSuggestionClick?: (suggestion: PredictiveSuggestion) => void;
}

export function PredictiveSuggestionsCard({ suggestions, onSuggestionClick }: PredictiveSuggestionsCardProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="mt-4 rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.12)',
        maxWidth: '460px',
      }}
    >
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{
          borderBottom: '1px solid rgba(99, 102, 241, 0.08)',
          background: 'rgba(99, 102, 241, 0.04)',
        }}
      >
        <Sparkles className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
        <span
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '11.5px',
            fontWeight: 600,
            color: 'rgba(167, 139, 250, 0.85)',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          O que você precisa agora
        </span>
      </div>

      <div>
        {suggestions.map((suggestion, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + idx * 0.08, duration: 0.3 }}
            onClick={() => onSuggestionClick?.(suggestion)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 group cursor-pointer"
            style={{
              borderBottom: idx < suggestions.length - 1 ? '1px solid rgba(255, 255, 255, 0.03)' : 'none',
              background: 'transparent',
              border: 'none',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(99, 102, 241, 0.10)',
                border: '1px solid rgba(99, 102, 241, 0.12)',
              }}
            >
              <span style={{ fontSize: '14px', lineHeight: 1 }}>{suggestion.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="leading-tight"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.88)',
                  letterSpacing: '-0.005em',
                }}
              >
                {suggestion.title}
              </p>
              {suggestion.description && (
                <p
                  className="mt-0.5 leading-snug"
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: '11.5px',
                    fontWeight: 400,
                    color: 'rgba(255, 255, 255, 0.42)',
                  }}
                >
                  {suggestion.description}
                </p>
              )}
            </div>
            <ChevronRight
              className="w-3.5 h-3.5 flex-shrink-0 transition-all duration-200"
              style={{ color: 'rgba(255, 255, 255, 0.15)' }}
            />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export default PredictiveSuggestionsCard;
