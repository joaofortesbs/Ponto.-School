import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <motion.div 
      className="flex justify-end"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-start gap-3 max-w-[80%]">
        <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-br-md shadow-md">
          <p className="text-sm leading-relaxed">{content}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-blue-600" />
        </div>
      </div>
    </motion.div>
  );
}

export default UserMessage;
