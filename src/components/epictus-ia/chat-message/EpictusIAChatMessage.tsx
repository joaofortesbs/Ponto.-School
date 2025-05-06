
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Copy, Check, MessageCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EpictusIAChatMessageProps {
  message: {
    id: string;
    sender: 'user' | 'ai' | 'system';
    content: string;
    timestamp?: Date;
  };
  isLatestMessage?: boolean;
}

export default function EpictusIAChatMessage({ message, isLatestMessage = false }: EpictusIAChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const { sender, content } = message;
  
  // Determina se a mensagem da IA deve ter seções colapsáveis
  const isLongMessage = sender === 'ai' && content.length > 500;
  const hasMultipleSections = sender === 'ai' && (content.match(/###/g) || []).length >= 2;
  
  // Animação para destacar a última mensagem
  useEffect(() => {
    if (isLatestMessage) {
      setIsHighlighted(true);
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLatestMessage]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const messageStyle = sender === 'user' ? {
    background: 'bg-blue-50 dark:bg-blue-950',
    text: 'text-blue-900 dark:text-blue-100',
    border: 'border-blue-200 dark:border-blue-800'
  } : {
    background: 'bg-orange-50 dark:bg-orange-950',
    text: 'text-orange-900 dark:text-orange-100',
    border: 'border-orange-200 dark:border-orange-800'
  };

  // Processar conteúdo para melhorar a apresentação visual
  const processContent = (content: string) => {
    // Se for mensagem de IA e for longa/com seções, mostrar versão colapsada se não estiver expandida
    if (sender === 'ai' && (isLongMessage || hasMultipleSections) && !expanded) {
      // Extrair primeira seção ou primeiros parágrafos
      const sections = content.split(/(?=###)/);
      if (sections.length > 1) {
        // Se tem seções com ###, mostrar apenas a primeira
        return sections[0] + '\n\n...';
      } else {
        // Caso contrário, mostrar apenas os primeiros parágrafos
        const paragraphs = content.split('\n\n');
        return paragraphs.slice(0, 2).join('\n\n') + '\n\n...';
      }
    }
    return content;
  };

  const displayContent = processContent(content);

  return (
    <motion.div
      className={cn(
        `p-4 my-2 rounded-lg border ${messageStyle.background} ${messageStyle.border}`,
        isHighlighted && 'ring-2 ring-blue-400 dark:ring-blue-500'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          {sender === 'user' ? (
            <>
              <AvatarImage src="/images/tempo-image-20250329T033126386Z.png" />
              <AvatarFallback>US</AvatarFallback>
            </>
          ) : (
            <>
              <AvatarImage src="/images/tempo-image-20250329T020810290Z.png" />
              <AvatarFallback>AI</AvatarFallback>
            </>
          )}
        </Avatar>
        
        <div className={`flex-1 ${messageStyle.text}`}>
          <div className="font-medium text-sm mb-1">
            {sender === 'user' ? 'Você' : 'Epictus IA'}
            {message.timestamp && (
              <span className="text-xs opacity-70 ml-2">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]} 
              className="break-words"
            >
              {displayContent}
            </ReactMarkdown>
          </div>
          
          {(isLongMessage || hasMultipleSections) && (
            <button 
              onClick={toggleExpand} 
              className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center hover:underline"
            >
              <Info size={12} className="mr-1" /> 
              {expanded ? 'Mostrar menos' : 'Mostrar mais'}
            </button>
          )}
        </div>
        
        {sender === 'ai' && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="opacity-50 hover:opacity-100 transition-opacity" 
            onClick={copyToClipboard}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
