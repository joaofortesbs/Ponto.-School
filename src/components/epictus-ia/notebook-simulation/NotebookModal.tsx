
import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Copy, Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import NotebookSimulation from '@/components/chat/NotebookSimulation';
import { toast } from '@/components/ui/use-toast';

interface NotebookModalProps {
  open: boolean;
  onClose: () => void;
  content: string;
}

const NotebookModal: React.FC<NotebookModalProps> = ({ 
  open, 
  onClose, 
  content 
}) => {
  const [copied, setCopied] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Verificar se o conteúdo existe e não está vazio
    setHasContent(!!content && content.trim().length > 0);
    
    // Reset copied state when modal opens/closes
    setCopied(false);
  }, [content, open]);

  // Impedir fechamento acidental enquanto o modal estiver carregando ou sem conteúdo
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && hasContent) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose, hasContent]);

  // Impedir clique fora que fecharia o modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && hasContent) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose, hasContent]);

  const handleCopyContent = () => {
    if (content) {
      navigator.clipboard.writeText(content)
        .then(() => {
          setCopied(true);
          toast({
            title: "Conteúdo copiado!",
            description: "O texto do caderno foi copiado para a área de transferência.",
            duration: 3000,
          });
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error('Erro ao copiar conteúdo:', err);
          toast({
            title: "Erro ao copiar",
            description: "Não foi possível copiar o conteúdo. Tente novamente.",
            variant: "destructive",
            duration: 3000,
          });
        });
    }
  };

  const handleDownload = () => {
    if (content) {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'anotacoes-caderno.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Anotações salvas!",
        description: "O caderno foi baixado como arquivo de texto.",
        duration: 3000,
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center overflow-y-auto">
      <div 
        ref={modalRef}
        className="relative bg-[#ffffe0] dark:bg-[#252525] w-[95%] max-w-3xl max-h-[80vh] rounded-lg border border-gray-400 dark:border-gray-600 shadow-2xl overflow-hidden"
      >
        {/* Cabeçalho do caderno */}
        <div className="flex justify-between items-center px-4 py-2 bg-amber-100 dark:bg-gray-800 border-b border-gray-400 dark:border-gray-600">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#FF6B00]" />
            Caderno de Anotações
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Conteúdo do caderno com linhas */}
        {!hasContent ? (
          <div className="flex flex-col items-center justify-center h-[40vh] p-8 text-center">
            <div className="animate-spin mb-4">
              <svg className="h-8 w-8 text-[#FF6B00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300">Transformando conteúdo em formato de caderno...</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Isso pode levar alguns segundos.</p>
          </div>
        ) : (
          <ScrollArea className="h-[50vh] bg-[#fffdf0] dark:bg-[#1e1e18] p-4 notebook-lines">
            <NotebookSimulation content={content} />
          </ScrollArea>
        )}
        
        {/* Rodapé com ações */}
        <div className="p-3 border-t border-gray-400 dark:border-gray-600 bg-amber-100 dark:bg-gray-800 flex justify-between">
          <Button 
            variant="outline"
            className="text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-600 hover:bg-amber-200 dark:hover:bg-gray-700"
            onClick={handleDownload}
            disabled={!hasContent}
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar anotações
          </Button>
          <Button 
            variant="outline"
            className="text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-600 hover:bg-amber-200 dark:hover:bg-gray-700"
            onClick={handleCopyContent}
            disabled={!hasContent || copied}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copiar texto
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotebookModal;
