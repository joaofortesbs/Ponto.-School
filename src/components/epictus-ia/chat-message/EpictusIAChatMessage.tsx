import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { MessageToolsDropdown } from '../message-tools';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface EpictusIAChatMessageProps {
  content: string;
  sender: 'user' | 'ai';
  showTools?: boolean;
  isTyping?: boolean;
  onAprofundar?: () => void;
  onCaderno?: (content: string) => void;
  isPremium?: boolean;
  messageContext?: any; // Novo: contexto adicional para personalização
  enhanceFinalQuestion?: boolean; // Nova propriedade para destacar pergunta final
}

export const EpictusIAChatMessage: React.FC<EpictusIAChatMessageProps> = ({
  content,
  sender,
  showTools = true,
  isTyping = false,
  onAprofundar,
  onCaderno,
  isPremium = false,
  messageContext,
  enhanceFinalQuestion = true
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [renderedContent, setRenderedContent] = useState("");
  const [hasTable, setHasTable] = useState(false);
  const [hasFlowchart, setHasFlowchart] = useState(false);
  const [hasCodeBlock, setHasCodeBlock] = useState(false);
  const [highlightedTerms, setHighlightedTerms] = useState<string[]>([]);
  const [finalQuestion, setFinalQuestion] = useState<string | null>(null);
  const [useMarkdownRenderer, setUseMarkdownRenderer] = useState(false);

  // Detecta elementos especiais no conteúdo
  useEffect(() => {
    if (sender === 'ai') {
      // Detecta se tem tabelas
      const containsTable = content.includes('|') && content.includes('---');
      setHasTable(containsTable);

      // Detecta se tem fluxogramas
      const containsFlowchart = content.includes('```') && 
        (content.includes('[') && content.includes(']') && content.includes('▼'));
      setHasFlowchart(containsFlowchart);
      
      // Detecta se tem blocos de código
      const containsCodeBlock = content.includes('```');
      setHasCodeBlock(containsCodeBlock);

      // Determina se devemos usar o renderizador de Markdown completo
      // ou o processador HTML personalizado
      if (containsTable || containsFlowchart || containsCodeBlock || content.includes('`') || 
          content.includes('> ') || content.includes('- ') || content.includes('* ') || 
          content.includes('1. ')) {
        setUseMarkdownRenderer(true);
      } else {
        setUseMarkdownRenderer(false);
      }

      // Identifica termos destacados
      const boldTerms = content.match(/\*\*(.*?)\*\*/g)?.map(term => term.replace(/\*\*/g, '')) || [];
      setHighlightedTerms(boldTerms);
      
      // Detecta pergunta final engajadora
      const questionPatterns = [
        /\*\*(Gostaria que eu criasse.*?)\*\*$/,
        /\*\*(Deseja que eu resuma.*?)\*\*$/,
        /\*\*(Quer que eu monte.*?)\*\*$/,
        /\*\*(Posso transformar.*?)\*\*$/,
        /\*\*(Quer que eu explore.*?)\*\*$/,
        /\*\*(Gostaria de ver.*?)\*\*$/,
        /\*\*(Posso preparar.*?)\*\*$/
      ];
      
      // Procura pela pergunta final no conteúdo
      for (const pattern of questionPatterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          setFinalQuestion(match[1]);
          // Remove a pergunta do conteúdo principal para exibi-la separadamente
          const contentWithoutQuestion = content.replace(pattern, '').trim();
          setRenderedContent(contentWithoutQuestion);
          return;
        }
      }

      // Processa conteúdo avançado
      setRenderedContent(content);
    } else {
      setRenderedContent(content);
      setUseMarkdownRenderer(false);
    }
  }, [content, sender]);

  // Componentes personalizados para o ReactMarkdown
  const components = {
    // Personaliza os blocos de código
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      return !inline && language ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag="div"
          className="rounded-md my-3 overflow-x-auto"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-gray-100 dark:bg-gray-800 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
    // Personaliza as tabelas
    table({node, ...props}) {
      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-800 rounded-lg" {...props} />
        </div>
      );
    },
    thead({node, ...props}) {
      return <thead className="bg-gray-50 dark:bg-gray-800" {...props} />;
    },
    tbody({node, ...props}) {
      return <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props} />;
    },
    tr({node, ...props}) {
      return <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50" {...props} />;
    },
    th({node, ...props}) {
      return <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" {...props} />;
    },
    td({node, ...props}) {
      return <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100" {...props} />;
    },
    // Personaliza citações (blockquote)
    blockquote({node, ...props}) {
      return (
        <blockquote className="border-l-4 border-orange-400 dark:border-orange-600 italic bg-orange-50 dark:bg-orange-900/20 py-1 px-4 rounded-r my-4 text-gray-700 dark:text-gray-300" {...props} />
      );
    },
    // Personaliza listas
    ul({node, ...props}) {
      return <ul className="list-disc pl-6 my-4 space-y-1" {...props} />;
    },
    ol({node, ...props}) {
      return <ol className="list-decimal pl-6 my-4 space-y-1" {...props} />;
    },
    li({node, ...props}) {
      return <li className="mb-1" {...props} />;
    },
    // Personaliza cabeçalhos
    h1({node, ...props}) {
      return <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 border-b pb-1 border-gray-200 dark:border-gray-700 mt-6 mb-4" {...props} />;
    },
    h2({node, ...props}) {
      return <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-5 mb-3" {...props} />;
    },
    h3({node, ...props}) {
      return <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2" {...props} />;
    },
    // Personaliza parágrafos
    p({node, ...props}) {
      return <p className="mb-4" {...props} />;
    },
    // Personaliza links
    a({node, ...props}) {
      return (
        <a 
          className="text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-0.5"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {props.children}
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5">
            <path d="M7 7h10v10"/>
            <path d="M7 17 17 7"/>
          </svg>
        </a>
      );
    },
    // Personaliza ênfase (negrito/itálico)
    strong({node, ...props}) {
      return (
        <strong className="font-semibold text-[#FF6B00] dark:text-[#FF8C40] bg-gradient-to-r from-[#FF6B00]/10 to-[#FF8C40]/10 dark:from-[#FF6B00]/20 dark:to-[#FF8C40]/20 px-1 py-0.5 rounded-sm" {...props} />
      );
    },
    em({node, ...props}) {
      return <em className="text-gray-700 dark:text-gray-300 italic" {...props} />;
    },
    // Personaliza linha horizontal
    hr({node, ...props}) {
      return <hr className="border-t border-gray-200 dark:border-gray-700 my-6" {...props} />;
    }
  };

  // Renderiza conteúdo de acordo com o remetente
  return (
    <motion.div 
      className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className={`relative max-w-[85%] md:max-w-[75%] p-4 rounded-xl shadow-md 
          ${sender === 'user' 
            ? 'bg-primary/10 text-primary-foreground rounded-tr-none' 
            : 'bg-muted/50 rounded-tl-none'}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Conteúdo da mensagem */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {isTyping ? (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
            </div>
          ) : (
            <>
              {sender === 'ai' && useMarkdownRenderer ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeRaw]}
                  components={components}
                >
                  {renderedContent}
                </ReactMarkdown>
              ) : (
                <p className="whitespace-pre-wrap">
                  {renderedContent}
                </p>
              )}

              {/* Pergunta final engajadora destacada */}
              {sender === 'ai' && finalQuestion && enhanceFinalQuestion && (
                <motion.div 
                  className="mt-4 pt-3 border-t border-primary/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                    <span className="text-primary text-lg">💡</span>
                    <p className="font-medium text-primary">{finalQuestion}</p>
                  </div>
                </motion.div>
              )}

              {/* Termos destacados (como referência rápida) */}
              {sender === 'ai' && highlightedTerms.length > 0 && (
                <div className="mt-4 pt-3 border-t border-muted">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {highlightedTerms.slice(0, 5).map((term, idx) => (
                      <span key={idx} className="px-2 py-1 bg-primary/10 rounded-full text-primary">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ferramentas de mensagem para IA */}
              {sender === 'ai' && showTools && (
                <div className={`relative mt-3 ${isHovering ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                  <MessageToolsDropdown 
                    content={content}
                    onAprofundar={onAprofundar}
                    onCaderno={onCaderno}
                    isPremium={isPremium}
                    hasTable={hasTable}
                    hasFlowchart={hasFlowchart}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};