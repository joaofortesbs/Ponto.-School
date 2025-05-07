import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
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
  messageContext?: any; // Contexto adicional para personalização
  enhanceFinalQuestion?: boolean; // Propriedade para destacar pergunta final
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
  const [hasChecklist, setHasChecklist] = useState(false);
  const [contentBlocks, setContentBlocks] = useState<string[]>([]);
  const [highlightedTerms, setHighlightedTerms] = useState<string[]>([]);
  const [finalQuestion, setFinalQuestion] = useState<string | null>(null);
  const [hasChart, setHasChart] = useState(false);
  const [hasColoredText, setHasColoredText] = useState(false);

  // Detecta elementos especiais no conteúdo
  useEffect(() => {
    if (sender === 'ai') {
      // Detecta se tem tabelas
      const hasTableContent = content.includes('|') && content.includes('---');
      setHasTable(hasTableContent);

      // Detecta se tem fluxogramas
      const hasFlowchartContent = content.includes('```') && 
        (content.includes('[') && content.includes(']') && content.includes('▼'));
      setHasFlowchart(hasFlowchartContent);
      
      // Detecta se tem checklists
      const hasChecklistContent = content.includes('- [ ]') || content.includes('- [x]');
      setHasChecklist(hasChecklistContent);
      
      // Detecta se tem gráficos
      const hasChartContent = content.includes('📊') && 
        (content.includes('gráfico') || content.includes('chart') || 
         content.includes('comparação') || content.includes('evolução'));
      setHasChart(hasChartContent);

      // Detecta se tem texto colorido
      const hasColoredTextContent = content.includes('<span style="color:') || 
                                    content.includes('<span class="text-');
      setHasColoredText(hasColoredTextContent);

      // Identifica termos destacados
      const boldTerms = content.match(/\*\*(.*?)\*\*/g)?.map(term => term.replace(/\*\*/g, '')) || [];
      setHighlightedTerms(boldTerms);
      
      // Detecta blocos de conteúdo por cabeçalhos (###)
      const blocks = content.split(/(?=###\s)/);
      if (blocks.length > 1) {
        setContentBlocks(blocks);
      }
      
      // Detecta pergunta final engajadora
      const questionPatterns = [
        /\*\*(Gostaria que eu criasse.*?)\*\*$/,
        /\*\*(Deseja que eu resuma.*?)\*\*$/,
        /\*\*(Quer que eu monte.*?)\*\*$/,
        /\*\*(Posso transformar.*?)\*\*$/,
        /\*\*(Quer que eu explore.*?)\*\*$/,
        /\*\*(Gostaria de ver.*?)\*\*$/,
        /\*\*(Posso preparar.*?)\*\*$/,
        /\*\*(Que tal.*?)\*\*$/,
        /\*\*(Precisa de ajuda.*?)\*\*$/,
        /\*\*(Vamos continuar.*?)\*\*$/
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

    // Adiciona cores a palavras-chave
    const keywordsColors: Record<string, string> = {
      'importante': '#ff6b00',
      'atenção': '#ff3b30',
      'dica': '#34c759',
      'exemplo': '#5856d6',
      'conceito': '#007aff',
      'fórmula': '#af52de',
      'teoria': '#ff9500',
      'prática': '#00c7be'
    };

    // Aplica cores às palavras-chave
    Object.entries(keywordsColors).forEach(([keyword, color]) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      enhanced = enhanced.replace(regex, match => 
        `<span style="color:${color};font-weight:bold;">${match}</span>`);
    });

    // Melhora tabelas com classes CSS para estilo avançado
    if (hasTable) {
      enhanced = enhanced.replace(/(\|[^\n]+\|)/g, 
        '<div class="table-container">$1</div>');
      
      // Melhora cabeçalhos de tabela
      enhanced = enhanced.replace(/(^\|.*\|$)/gm, (match, p1, offset) => {
        if (enhanced.substring(offset).includes('---')) {
          return `<div class="table-header">${p1}</div>`;
        }
        return match;
      });
    }

    // Melhora fluxogramas com design visual
    if (hasFlowchart) {
      enhanced = enhanced.replace(/```([\s\S]*?)```/g, 
        '<div class="flowchart-container bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 my-4 shadow-inner border border-blue-100 dark:border-blue-800 overflow-x-auto">```$1```</div>');
    }
    
    // Melhora checklists com ícones visuais
    if (hasChecklist) {
      enhanced = enhanced.replace(/- \[ \] (.*)/g, 
        '<div class="checklist-item unchecked">⭕ $1</div>');
      enhanced = enhanced.replace(/- \[x\] (.*)/g, 
        '<div class="checklist-item checked">✅ $1</div>');
    }
    
    // Destaca caixas informativas com cores
    enhanced = enhanced.replace(/> 💎 (.*?)(?:\n\n|$)/gs, 
      '<div class="info-box bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border-l-4 border-blue-500 pl-4 py-2 my-3 rounded-r-md">💎 $1</div>');
    
    enhanced = enhanced.replace(/> ⚠️ (.*?)(?:\n\n|$)/gs, 
      '<div class="warning-box bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 border-l-4 border-amber-500 pl-4 py-2 my-3 rounded-r-md">⚠️ $1</div>');
    
    enhanced = enhanced.replace(/> 📌 (.*?)(?:\n\n|$)/gs, 
      '<div class="summary-box bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/20 border-l-4 border-green-500 pl-4 py-2 my-3 rounded-r-md">📌 $1</div>');
    
    // Estiliza notas e avisos adicionais
    enhanced = enhanced.replace(/> 💡 (.*?)(?:\n\n|$)/gs, 
      '<div class="tip-box bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/20 border-l-4 border-purple-500 pl-4 py-2 my-3 rounded-r-md">💡 $1</div>');

    // Destaca títulos com ícones e estilo
    enhanced = enhanced.replace(/### (📚|🎯|⚙️|💡|🔍|📊|🚀|📝|🏆|⭐) (.*?)(?:\n)/g, 
      '<div class="content-block-title"><span class="content-block-icon">$1</span> <span class="content-block-text">$2</span></div>\n');
    
    // Aumenta ícones no texto para facilitar reconhecimento visual
    enhanced = enhanced.replace(/([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF\u1F300-\u1F64F\u1F680-\u1F6FF])/g, 
      '<span class="emoji-highlight">$1</span>');
    
    // Destaca passos numerados
    enhanced = enhanced.replace(/(^|\n)(\d+)\.\s+(.*?)(?=\n|$)/g, 
      '$1<div class="numbered-step"><span class="step-number">$2</span><span class="step-content">$3</span></div>');
    
    // Adiciona cards para exemplos práticos
    enhanced = enhanced.replace(/(^|\n)Exemplo prático:[\s\n]+(.*?)(?=\n\n|$)/gs,
      '$1<div class="example-card"><div class="example-header">✨ Exemplo Prático</div><div class="example-content">$2</div></div>');
    
    // Estiliza definições e conceitos
    enhanced = enhanced.replace(/(^|\n)Definição:[\s\n]+(.*?)(?=\n\n|$)/gs,
      '$1<div class="definition-card"><div class="definition-header">📚 Definição</div><div class="definition-content">$2</div></div>');
    
    return enhanced;
  };

  // Renderiza conteúdo de acordo com o remetente
  return (
    <motion.div 
      className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className={`relative max-w-[90%] md:max-w-[80%] p-5 rounded-xl shadow-md 
          ${sender === 'user' 
            ? 'bg-primary/10 text-primary-foreground rounded-tr-none' 
            : 'bg-gradient-to-br from-muted/40 to-muted/60 dark:from-muted/20 dark:to-muted/30 rounded-tl-none'}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Conteúdo da mensagem */}
        <div className={`prose prose-sm dark:prose-invert max-w-none epictus-message-content
          ${hasTable ? 'prose-table:border-collapse prose-table:w-full prose-td:border prose-td:p-3 prose-td:align-middle prose-th:bg-primary/10 prose-th:p-2 dark:prose-th:bg-primary/20 prose-thead:border-b-2 prose-thead:border-primary/30' : ''}
          ${hasFlowchart ? 'prose-code:text-primary prose-code:bg-transparent prose-code:p-4 prose-code:rounded' : ''}
          prose-headings:font-semibold prose-headings:mb-3 prose-p:mb-3
          prose-blockquote:bg-muted/30 prose-blockquote:border-l-4 prose-blockquote:border-primary/50
          prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r
          prose-strong:text-primary dark:prose-strong:text-primary-foreground prose-strong:font-bold
          prose-a:text-primary dark:prose-a:text-primary-foreground prose-a:font-medium prose-a:underline-offset-2
          prose-hr:border-muted-foreground/30 prose-hr:my-6
        `}>
          {isTyping ? (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
            </div>
          ) : (
            <>
              {contentBlocks.length > 1 ? (
                // Renderiza blocos de conteúdo separadamente para melhor visualização
                <div className="space-y-6">
                  {contentBlocks.map((block, index) => (
                    <motion.div 
                      key={index}
                      className={`content-block ${index > 0 ? 'pt-2 border-t border-muted/30' : ''}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.3 }}
                    >
                      <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                        {block}
                      </ReactMarkdown>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                  {renderedContent}
                </ReactMarkdown>
              )}

              {/* Pergunta final engajadora com destaque visual */}
              {sender === 'ai' && finalQuestion && enhanceFinalQuestion && (
                <motion.div 
                  className="mt-5 pt-4 border-t border-primary/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-primary/15 dark:from-primary/10 dark:to-primary/20 rounded-lg shadow-sm">
                    <span className="text-primary text-xl">💡</span>
                    <p className="font-medium text-primary dark:text-primary-foreground">{finalQuestion}</p>
                  </div>
                </motion.div>
              )}

              {/* Termos destacados (como referência rápida) */}
              {sender === 'ai' && highlightedTerms.length > 0 && (
                <div className="mt-4 pt-3 border-t border-muted">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {highlightedTerms.slice(0, 5).map((term, idx) => (
                      <motion.span 
                        key={idx} 
                        className="px-2 py-1 bg-primary/10 rounded-full text-primary dark:text-primary-foreground"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 * idx, duration: 0.2 }}
                      >
                        {term}
                      </motion.span>
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