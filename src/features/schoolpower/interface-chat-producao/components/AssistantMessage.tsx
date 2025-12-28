import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

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
      <div className="flex items-start gap-3 max-w-[80%]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="bg-gray-800 text-white px-4 py-3 rounded-2xl rounded-bl-md shadow-md">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default AssistantMessage;
