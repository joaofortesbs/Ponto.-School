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
  const [renderedContent, setRenderedContent] = useState("");
  const [hasTable, setHasTable] = useState(false);
  const [hasFlowchart, setHasFlowchart] = useState(false);
  const [highlightedTerms, setHighlightedTerms] = useState<string[]>([]);
  const [finalQuestion, setFinalQuestion] = useState<string | null>(null);
  const [processedHtmlContent, setProcessedHtmlContent] = useState("");

  // Processa conteúdo Markdown para HTML com formatação aprimorada
  const formatToHtml = (text: string): string => {
    if (!text) return "";
    
    // Aplicar formatações avançadas
    return text
      // Headers
      .replace(/^# (.*?)$/gm, '<h1 class="text-xl font-bold text-gray-900 dark:text-gray-100 border-b pb-1 border-gray-200 dark:border-gray-700">$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-3">$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3 class="text-base font-medium text-gray-800 dark:text-gray-200">$1</h3>')

      // Formatação de texto - NEGRITO DESTACADO
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#FF6B00] dark:text-[#FF8C40] bg-gradient-to-r from-[#FF6B00]/10 to-[#FF8C40]/10 dark:from-[#FF6B00]/20 dark:to-[#FF8C40]/20 px-1 py-0.5 rounded-sm">$1</strong>')
      .replace(/\_(.*?)\_/g, '<em class="text-gray-700 dark:text-gray-300 italic">$1</em>')
      .replace(/\~\~(.*?)\~\~/g, '<del class="text-gray-500 dark:text-gray-400">$1</del>')
      .replace(/\`(.*?)\`/g, '<code class="bg-gray-100 dark:bg-gray-800 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')

      // Listas
      .replace(/^\- (.*?)$/gm, '<ul class="list-disc pl-5 my-2"><li>$1</li></ul>').replace(/<\/ul>\s?<ul class="list-disc pl-5 my-2">/g, '')
      .replace(/^[0-9]+\. (.*?)$/gm, '<ol class="list-decimal pl-5 my-2"><li>$1</li></ol>').replace(/<\/ol>\s?<ol class="list-decimal pl-5 my-2">/g, '')

      // Blockquotes
      .replace(/^> (.*?)$/gm, '<blockquote class="border-l-4 border-orange-400 dark:border-orange-600 italic bg-orange-50 dark:bg-orange-900/20 py-1 px-2 rounded-r my-2 text-gray-700 dark:text-gray-300">$1</blockquote>')

      // Separadores
      .replace(/^---$/gm, '<hr class="border-t border-gray-200 dark:border-gray-700 my-3" />')

      // Quebras de linha
      .replace(/\n/g, '<br />')

      // Links
      .replace(/\[(.*?)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-0.5">$1<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-0.5"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg></a>');
  };

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
          setRenderedContent(contentWithoutQuestion);
          setProcessedHtmlContent(formatToHtml(contentWithoutQuestion));
          return;
        }
      }

      // Processa conteúdo avançado
      setRenderedContent(content);
      setProcessedHtmlContent(formatToHtml(content));
    } else {
      setRenderedContent(content);
      setProcessedHtmlContent(""); // Não processa HTML para mensagens do usuário
    }
  }, [content, sender]);

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
              {sender === 'ai' && processedHtmlContent ? (
                <div dangerouslySetInnerHTML={{ __html: processedHtmlContent }} />
              ) : (
                <ReactMarkdown>{renderedContent}</ReactMarkdown>
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