import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageToolsDropdown } from '../message-tools';
import { motion } from 'framer-motion';

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
  const [renderedContent, setRenderedContent] = useState(content);
  const [hasTable, setHasTable] = useState(false);
  const [hasFlowchart, setHasFlowchart] = useState(false);
  const [highlightedTerms, setHighlightedTerms] = useState<string[]>([]);
  const [finalQuestion, setFinalQuestion] = useState<string | null>(null);

  // Detecta elementos especiais no conteúdo
  useEffect(() => {
    if (sender === 'ai') {
      // Detecta se tem tabelas
      setHasTable(content.includes('|') && content.includes('---'));

      // Detecta se tem fluxogramas
      setHasFlowchart(content.includes('```') && 
        (content.includes('[') && content.includes(']') && content.includes('▼')));

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
          setRenderedContent(enhanceContent(contentWithoutQuestion));
          return;
        }
      }

      // Processa conteúdo avançado
      setRenderedContent(enhanceContent(content));
    } else {
      setRenderedContent(content);
    }
  }, [content, sender]);

  // Função para aprimorar o conteúdo com elementos visuais adicionais
  const enhanceContent = (text: string): string => {
    let enhanced = text;

    // Melhora tabelas com classes CSS para estilo
    if (hasTable) {
      enhanced = enhanced.replace(/(\|[^\n]+\|)/g, 
        '<div class="table-container">$1</div>');
    }

    // Melhora fluxogramas
    if (hasFlowchart) {
      enhanced = enhanced.replace(/```([\s\S]*?)```/g, 
        '<div class="flowchart-container">```$1```</div>');
    }

    return enhanced;
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
        <div className={`prose prose-sm dark:prose-invert max-w-none 
          ${hasTable ? 'prose-table:border-collapse prose-table:w-full prose-td:border prose-td:p-2 prose-th:bg-muted/30' : ''}
          ${hasFlowchart ? 'prose-code:text-primary prose-code:bg-primary/10 prose-code:p-4 prose-code:rounded' : ''}
        `}>
          {isTyping ? (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
            </div>
          ) : (
            <>
              <ReactMarkdown>{renderedContent}</ReactMarkdown>

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