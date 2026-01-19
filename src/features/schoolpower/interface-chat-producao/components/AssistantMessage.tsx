import React from 'react';
import { motion } from 'framer-motion';
import { JotaAvatarChat } from './JotaAvatarChat';

interface AssistantMessageProps {
  content: string;
  isThinking?: boolean;
}

export function AssistantMessage({ content, isThinking = false }: AssistantMessageProps) {
  return (
    <motion.div 
      className="flex justify-start"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-2 max-w-[85%]">
        <div className="flex items-center gap-3">
          <JotaAvatarChat size="md" showAnimation={true} />
          <span className="text-white font-bold text-sm">Jota</span>
        </div>
        
        <motion.div 
          className="ml-[52px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {isThinking ? (
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-white/70 text-sm italic">Pensando...</span>
              <motion.div 
                className="flex gap-1"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
              >
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </motion.div>
            </motion.div>
          ) : (
            <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default AssistantMessage;
