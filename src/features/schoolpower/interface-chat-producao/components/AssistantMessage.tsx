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
    >
      <div className="flex flex-col max-w-[80%]">
        <div className="flex items-center gap-2 mb-2">
          <JotaAvatarChat size="md" showAnimation={true} />
          <span className="text-white font-semibold text-sm">Jota</span>
        </div>
        
        <div className="ml-1 bg-gray-800 text-white px-4 py-3 rounded-2xl rounded-tl-md shadow-md">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default AssistantMessage;
