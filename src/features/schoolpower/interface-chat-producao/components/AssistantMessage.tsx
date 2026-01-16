import React from 'react';
import { motion } from 'framer-motion';
import { JotaAvatarChat } from './JotaAvatarChat';

interface AssistantMessageProps {
  content: string;
}

export function AssistantMessage({ content }: AssistantMessageProps) {
  return (
    <motion.div 
      className="flex justify-start"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3 max-w-[85%]">
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <JotaAvatarChat size="md" showAnimation={true} />
          <span className="text-white/80 font-medium text-xs">Jota</span>
        </div>
        
        <motion.p 
          className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {content}
        </motion.p>
      </div>
    </motion.div>
  );
}

export default AssistantMessage;
