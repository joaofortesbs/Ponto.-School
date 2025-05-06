
import React from 'react';
import { User, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EpictusIAChatMessageProps {
  message: {
    id: string;
    sender: 'user' | 'ai' | 'system';
    content: string;
    timestamp?: Date;
  };
  isLatestMessage?: boolean;
}

const EpictusIAChatMessage: React.FC<EpictusIAChatMessageProps> = ({ 
  message, 
  isLatestMessage = false 
}) => {
  const isAI = message.sender === 'ai' || message.sender === 'system';
  
  // Define animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };
  
  return (
    <motion.div
      className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}
      initial="hidden"
      animate="visible"
      variants={messageVariants}
    >
      <div className={`flex max-w-[80%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 ${isAI ? 'mr-3' : 'ml-3'}`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
            isAI ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' : 
                  'bg-blue-500 text-white'
          }`}>
            {isAI ? <Bot size={20} /> : <User size={20} />}
          </div>
        </div>
        
        <div className={`rounded-xl p-3 ${
          isAI ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100' : 
                'bg-blue-500 text-white'
        }`}>
          <div className="markdown-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Customiza componentes markdown para estilização
                h1: ({node, ...props}) => <h1 className="text-xl font-bold my-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-md font-bold my-1" {...props} />,
                p: ({node, ...props}) => <p className="mb-2" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                blockquote: ({node, ...props}) => (
                  <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-3 italic my-2" {...props} />
                ),
                code: ({node, ...props}) => (
                  <code className={`${
                    isAI ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-600'
                  } px-1 rounded`} {...props} />
                ),
                pre: ({node, ...props}) => (
                  <pre className={`${
                    isAI ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-600'
                  } p-2 rounded my-2 overflow-auto`} {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          
          {message.timestamp && (
            <div className={`text-xs mt-1 ${
              isAI ? 'text-gray-500 dark:text-gray-400' : 'text-blue-100'
            }`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EpictusIAChatMessage;
