/**
 * ContentExtractModal - Interface de Extrato de Conteúdo
 * 
 * Modal especializado para exibir conteúdo em formato texto das atividades.
 * Usado para atividades que possuem "versão em texto" enquanto a versão interativa
 * está em desenvolvimento.
 * 
 * Funcionalidades:
 * - Exibir texto formatado da atividade
 * - Interface tipo Word com edição de texto
 * - Toolbar com formatação e opções
 * - Estilo consistente com o design da plataforma
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  FileText, 
  Copy, 
  Check, 
  Download,
  Printer,
  BookOpen,
  Calendar,
  PenTool,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Undo,
  Redo,
  Type,
  Save,
  Sparkles,
  Plus,
  Image,
  Table
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { isTextVersionActivity, getActivityInfo } from '../config/activityVersionConfig';

interface ContentExtractModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityType: string;
  activityTitle: string;
  textContent: string;
  activityData?: any;
}

const getActivityIcon = (activityType: string) => {
  switch (activityType) {
    case 'plano-aula':
      return FileText;
    case 'sequencia-didatica':
      return Calendar;
    case 'tese-redacao':
      return PenTool;
    default:
      return BookOpen;
  }
};

const getActivityLabel = (activityType: string): string => {
  const info = getActivityInfo(activityType);
  return info?.name || 'Atividade';
};

const getActivityColor = (activityType: string): string => {
  switch (activityType) {
    case 'plano-aula':
      return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
    case 'sequencia-didatica':
      return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    case 'tese-redacao':
      return 'text-purple-500 bg-purple-500/10 border-purple-500/30';
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
  }
};

export const ContentExtractModal: React.FC<ContentExtractModalProps> = ({
  isOpen,
  onClose,
  activityType,
  activityTitle,
  textContent,
  activityData
}) => {
  const [copied, setCopied] = useState(false);
  const [editableContent, setEditableContent] = useState(textContent);
  const [isSaved, setIsSaved] = useState(false);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  const ActivityIcon = getActivityIcon(activityType);
  const activityLabel = getActivityLabel(activityType);
  const activityColorClass = getActivityColor(activityType);

  useEffect(() => {
    setEditableContent(textContent);
  }, [textContent]);

  const handleCopyContent = async () => {
    try {
      const content = contentEditableRef.current?.innerText || editableContent;
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar conteúdo:', error);
    }
  };

  const handlePrint = () => {
    const content = contentEditableRef.current?.innerHTML || editableContent;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${activityTitle}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 40px;
              line-height: 1.8;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              color: #1a1a2e;
              border-bottom: 3px solid #f97316;
              padding-bottom: 15px;
              margin-bottom: 30px;
              font-size: 28px;
            }
            .badge {
              background: linear-gradient(135deg, #f97316, #fb923c);
              color: white;
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 600;
              margin-bottom: 20px;
              display: inline-block;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .content {
              font-size: 15px;
              line-height: 1.8;
            }
            .content h2, .content h3, .content h4 {
              color: #1a1a2e;
              margin-top: 25px;
              margin-bottom: 15px;
            }
            .content h2 { font-size: 22px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
            .content h3 { font-size: 18px; }
            .content h4 { font-size: 16px; }
            .content p { margin-bottom: 12px; }
            .content ul, .content ol { margin-left: 25px; margin-bottom: 15px; }
            .content li { margin-bottom: 8px; }
            .content strong { color: #1a1a2e; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="badge">${activityLabel}</div>
          <h1>${activityTitle}</h1>
          <div class="content">${content}</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSave = () => {
    const content = contentEditableRef.current?.innerText || editableContent;
    const htmlContent = contentEditableRef.current?.innerHTML || editableContent;
    const storageKey = `text_content_${activityType}_${activityData?.id || 'default'}`;
    localStorage.setItem(storageKey, JSON.stringify({
      textContent: content,
      htmlContent: htmlContent,
      savedAt: new Date().toISOString()
    }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentEditableRef.current?.focus();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[99999] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-7xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Personalizado por Atividade */}
          <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${activityColorClass}`}>
                  <ActivityIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${activityColorClass} border`}>
                      {activityLabel}
                    </Badge>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Versão em Texto
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {activityTitle}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  className="text-gray-600 dark:text-gray-300 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                  title="Salvar"
                >
                  {isSaved ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyContent}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="Copiar conteúdo"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrint}
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  title="Imprimir"
                >
                  <Printer className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Toolbar tipo Word */}
          <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
            <div className="flex items-center gap-1 flex-wrap">
              {/* Undo/Redo */}
              <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300 dark:border-gray-600">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('undo')}
                  className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Desfazer"
                >
                  <Undo className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('redo')}
                  className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Refazer"
                >
                  <Redo className="w-4 h-4" />
                </Button>
              </div>

              {/* Font Size Select */}
              <div className="flex items-center gap-1 px-2 border-r border-gray-300 dark:border-gray-600">
                <select 
                  className="h-8 px-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300"
                  onChange={(e) => execCommand('fontSize', e.target.value)}
                  defaultValue="3"
                >
                  <option value="1">8</option>
                  <option value="2">10</option>
                  <option value="3">12</option>
                  <option value="4">14</option>
                  <option value="5">18</option>
                  <option value="6">24</option>
                  <option value="7">36</option>
                </select>
              </div>

              {/* Text Formatting */}
              <div className="flex items-center gap-0.5 px-2 border-r border-gray-300 dark:border-gray-600">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('bold')}
                  className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold"
                  title="Negrito (Ctrl+B)"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('italic')}
                  className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 italic"
                  title="Itálico (Ctrl+I)"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('underline')}
                  className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 underline"
                  title="Sublinhado (Ctrl+U)"
                >
                  <Underline className="w-4 h-4" />
                </Button>
              </div>

              {/* Text Alignment */}
              <div className="flex items-center gap-0.5 px-2 border-r border-gray-300 dark:border-gray-600">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('justifyLeft')}
                  className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Alinhar à esquerda"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('justifyCenter')}
                  className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Centralizar"
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('justifyRight')}
                  className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Alinhar à direita"
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Lists */}
              <div className="flex items-center gap-0.5 px-2 border-r border-gray-300 dark:border-gray-600">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('insertUnorderedList')}
                  className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Lista com marcadores"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('insertOrderedList')}
                  className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Lista numerada"
                >
                  <ListOrdered className="w-4 h-4" />
                </Button>
              </div>

              {/* AI Tools */}
              <div className="flex items-center gap-0.5 px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 gap-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="Ferramentas IA"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs">Personalizar</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area - Editável */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-8 min-h-full bg-white dark:bg-gray-900">
                {textContent ? (
                  <div 
                    ref={contentEditableRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="prose prose-lg dark:prose-invert max-w-none min-h-[500px] p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm"
                    style={{ 
                      lineHeight: '1.8',
                      fontSize: '15px'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: textContent
                        .replace(/\n/g, '<br>')
                        .replace(/#{4}\s*(.+)/g, '<h4 class="text-lg font-semibold mt-4 mb-2">$1</h4>')
                        .replace(/#{3}\s*(.+)/g, '<h3 class="text-xl font-semibold mt-5 mb-3">$1</h3>')
                        .replace(/#{2}\s*(.+)/g, '<h2 class="text-2xl font-bold mt-6 mb-4">$1</h2>')
                        .replace(/#{1}\s*(.+)/g, '<h1 class="text-3xl font-bold mt-8 mb-5">$1</h1>')
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.+?)\*/g, '<em>$1</em>')
                        .replace(/^[-•]\s*(.+)/gm, '<li class="ml-4">$1</li>')
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className={`p-6 rounded-2xl mb-6 ${activityColorClass}`}>
                      <FileText className="w-16 h-16" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                      Conteúdo não disponível
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                      O conteúdo em texto desta atividade ainda não foi gerado.
                      Construa a atividade no modal de edição para gerar o conteúdo.
                    </p>
                    <Button
                      onClick={onClose}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Voltar e Gerar Conteúdo
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default ContentExtractModal;
