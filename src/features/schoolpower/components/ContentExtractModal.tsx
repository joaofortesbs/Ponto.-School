/**
 * ContentExtractModal - Interface de Extrato de Conteúdo
 * 
 * Modal especializado para exibir conteúdo em formato texto das atividades.
 * Usado para atividades que possuem "versão em texto" enquanto a versão interativa
 * está em desenvolvimento.
 * 
 * Funcionalidades:
 * - Exibir texto formatado da atividade
 * - Suporte a imagens/arquivos (futuro)
 * - Estilo consistente com o design da plataforma
 */

import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronUp
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

export const ContentExtractModal: React.FC<ContentExtractModalProps> = ({
  isOpen,
  onClose,
  activityType,
  activityTitle,
  textContent,
  activityData
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const ActivityIcon = getActivityIcon(activityType);
  const activityLabel = getActivityLabel(activityType);

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar conteúdo:', error);
    }
  };

  const handlePrint = () => {
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
              line-height: 1.6;
              color: #333;
            }
            h1 {
              color: #1a1a2e;
              border-bottom: 2px solid #f97316;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .badge {
              background: #f97316;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              margin-bottom: 20px;
              display: inline-block;
            }
            .content {
              white-space: pre-wrap;
              font-size: 14px;
            }
            h2, h3, h4 {
              color: #1a1a2e;
              margin-top: 20px;
            }
            ul, ol {
              margin-left: 20px;
            }
            li {
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>
          <div class="badge">${activityLabel}</div>
          <h1>${activityTitle}</h1>
          <div class="content">${textContent.replace(/\n/g, '<br>')}</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
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
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] border-b border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Mail className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Interface de Extrato de Conteúdo
                  </h2>
                  <p className="text-sm text-gray-400">
                    Versão em texto da atividade
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyContent}
                  className="text-gray-300 hover:text-white hover:bg-white/10"
                  title="Copiar conteúdo"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrint}
                  className="text-gray-300 hover:text-white hover:bg-white/10"
                  title="Imprimir"
                >
                  <Printer className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Activity Info */}
          <div className="px-6 py-3 bg-gradient-to-r from-orange-500/10 to-transparent border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <ActivityIcon className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <Badge variant="outline" className="text-orange-400 border-orange-400/50 mb-1">
                  {activityLabel}
                </Badge>
                <h3 className="text-white font-medium">{activityTitle}</h3>
              </div>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="h-[calc(90vh-200px)]">
            <div className="p-6">
              {textContent ? (
                <div className="prose prose-invert max-w-none">
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <pre className="whitespace-pre-wrap font-sans text-gray-200 text-sm leading-relaxed">
                      {textContent}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-orange-500/10 rounded-full mb-4">
                    <FileText className="w-12 h-12 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Conteúdo não disponível
                  </h3>
                  <p className="text-gray-400 max-w-md">
                    O conteúdo em texto desta atividade ainda não foi gerado.
                    Construa a atividade para gerar o extrato de conteúdo.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] border-t border-white/10 px-6 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                💡 Esta é a versão em texto da atividade. A versão interativa está em desenvolvimento.
              </p>
              <Button
                onClick={onClose}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Fechar
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default ContentExtractModal;
