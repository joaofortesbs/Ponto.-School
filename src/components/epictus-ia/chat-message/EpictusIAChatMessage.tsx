
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

interface EpictusIAChatMessageProps {
  content: string;
  timestamp?: Date;
  isUser?: boolean;
  isLoading?: boolean;
}

/**
 * Componente para exibir mensagens da Epictus IA no chat
 * Com suporte a formatação rica (markdown, tabelas, listas, etc)
 */
export const EpictusIAChatMessage: React.FC<EpictusIAChatMessageProps> = ({
  content,
  timestamp,
  isUser = false,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Classes base para todos os tipos de mensagem
  const baseMessageClasses = cn(
    'relative px-4 py-3 rounded-xl max-w-[85%] mb-2',
    'shadow-sm border',
    'transition-all duration-200'
  );
  
  // Classes específicas para mensagens do usuário
  const userMessageClasses = cn(
    baseMessageClasses,
    'bg-gradient-to-br from-[#FF6B00]/90 to-[#FF9B50]/90 text-white ml-auto',
    'border-orange-500/30',
    isDark ? 'shadow-orange-500/10' : 'shadow-orange-500/20'
  );
  
  // Classes específicas para mensagens da IA
  const aiMessageClasses = cn(
    baseMessageClasses,
    'mr-auto',
    isDark 
      ? 'bg-[#0A2540]/80 border-blue-500/20 shadow-blue-500/10 text-slate-100' 
      : 'bg-white border-slate-200 shadow-slate-200/50 text-slate-800'
  );
  
  // Classes para mensagens em carregamento da IA
  const loadingClasses = cn(
    baseMessageClasses,
    'mr-auto animate-pulse',
    isDark 
      ? 'bg-[#0A2540]/60 border-blue-500/10 text-slate-300' 
      : 'bg-slate-50 border-slate-200 text-slate-400'
  );
  
  // Formata hora 
  const formattedTime = timestamp ? new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp) : '';
  
  // Classes para os componentes do markdown
  const markdownComponents = {
    // Títulos
    h1: ({ node, ...props }) => (
      <h1 className="text-2xl font-bold mt-6 mb-4 pb-1 border-b border-orange-300/30 text-orange-500 dark:text-orange-400" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-xl font-bold mt-5 mb-3 text-orange-500/90 dark:text-orange-400/90" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-lg font-bold mt-4 mb-2 text-orange-500/80 dark:text-orange-400/80" {...props} />
    ),
    
    // Parágrafos e texto
    p: ({ node, ...props }) => (
      <p className="mb-3 last:mb-1 leading-relaxed" {...props} />
    ),
    strong: ({ node, ...props }) => (
      <strong className="font-bold text-[#FF6B00] dark:text-[#FF8C40] bg-gradient-to-r from-[#FF6B00]/10 to-[#FF8C40]/10 dark:from-[#FF6B00]/20 dark:to-[#FF8C40]/20 px-1 py-0.5 rounded-sm" {...props} />
    ),
    em: ({ node, ...props }) => (
      <em className="italic text-slate-700 dark:text-slate-300" {...props} />
    ),
    
    // Listas
    ul: ({ node, ...props }) => (
      <ul className="mb-4 pl-5 space-y-1" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="mb-4 pl-5 list-decimal space-y-1" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="ml-4" {...props} />
    ),
    
    // Blockquotes para destaques
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l-4 border-orange-500 dark:border-orange-400 pl-4 py-1 my-4 bg-orange-50/50 dark:bg-orange-900/20 rounded-r-md" {...props} />
    ),
    
    // Código
    code: ({ node, inline, ...props }) => (
      inline 
        ? <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-orange-600 dark:text-orange-400 font-mono text-sm" {...props} />
        : <code className="block bg-slate-100 dark:bg-slate-800 p-3 rounded-md overflow-x-auto text-orange-600 dark:text-orange-400 font-mono text-sm my-4" {...props} />
    ),
    pre: ({ node, ...props }) => (
      <pre className="bg-transparent p-0 m-0 overflow-visible" {...props} />
    ),
    
    // Tabelas
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-md" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead className="bg-slate-100 dark:bg-slate-800/80" {...props} />
    ),
    tbody: ({ node, ...props }) => (
      <tbody className="divide-y divide-slate-200 dark:divide-slate-700" {...props} />
    ),
    tr: ({ node, ...props }) => (
      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider" {...props} />
    ),
    td: ({ node, ...props }) => (
      <td className="px-4 py-3 text-sm" {...props} />
    ),
    
    // Horizontal rules
    hr: ({ node, ...props }) => (
      <hr className="my-6 border-slate-200 dark:border-slate-700" {...props} />
    ),
    
    // Links
    a: ({ node, ...props }) => (
      <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />
    ),
  };

  // Se estiver carregando, mostra um placeholder
  if (isLoading) {
    return (
      <div className={loadingClasses}>
        <div className="h-4 w-3/4 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
        <div className="h-4 w-5/6 bg-slate-300 dark:bg-slate-600 rounded"></div>
      </div>
    );
  }

  // Renderiza mensagens com base no tipo (usuário ou IA)
  return (
    <div className={isUser ? userMessageClasses : aiMessageClasses}>
      {/* Conteúdo da mensagem */}
      {isUser ? (
        <div>{content}</div>
      ) : (
        <div className="epictus-ia-message">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
      
      {/* Timestamp */}
      {timestamp && (
        <div className={cn(
          'absolute bottom-1 right-2 text-xs opacity-70',
          isUser ? 'text-white/70' : isDark ? 'text-slate-400' : 'text-slate-500'
        )}>
          {formattedTime}
        </div>
      )}
    </div>
  );
};

export default EpictusIAChatMessage;
