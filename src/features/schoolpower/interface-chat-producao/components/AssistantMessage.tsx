import React from 'react';
import { motion } from 'framer-motion';
import { JotaAvatarChat } from './JotaAvatarChat';
import { RichTextMessage } from './RichTextMessage';

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
      <div className="flex gap-3 max-w-[85%]">
        <div className="flex flex-col items-center flex-shrink-0">
          <JotaAvatarChat size="md" showAnimation={true} />
        </div>
        
        <div className="flex flex-col min-h-[48px] py-1">
          <span className="text-white font-bold text-[15px] leading-tight mb-1">Jota</span>
          
          <motion.div 
            className="mt-auto"
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
              <RichTextMessage content={content} />
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default AssistantMessage;
