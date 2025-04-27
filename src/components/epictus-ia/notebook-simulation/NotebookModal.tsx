import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Copy, Share, Download } from 'lucide-react';
import { convertToNotebookFormat } from '@/services/notebookService';

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

const NotebookModal: React.FC<NotebookModalProps> = ({ isOpen, onClose, content }) => {
  const [notebookContent, setNotebookContent] = useState<string>("");

  useEffect(() => {
    if (content) {
      const formatted = convertToNotebookFormat(content);
      setNotebookContent(formatted);
    }
  }, [content]);

  const copyToClipboard = () => {
    const textContent = document.querySelector(".notebook-content")?.textContent || "";
    navigator.clipboard.writeText(textContent)
      .then(() => {
        alert("Conteúdo copiado para a área de transferência!");
      })
      .catch(err => {
        console.error("Erro ao copiar conteúdo:", err);
      });
  };

  const downloadAsPDF = () => {
    alert("Funcionalidade de download ainda não implementada.");
  };

  const shareNotes = () => {
    alert("Funcionalidade de compartilhamento ainda não implementada.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden bg-white dark:bg-gray-900 rounded-lg">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <DialogTitle className="text-xl font-bold">Caderno de Anotações</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="notebook-simulation">
            <div className="notebook-lines">
              <div className="notebook-content">
                <div dangerouslySetInnerHTML={{ __html: notebookContent }} />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex gap-3">
            <Button variant="outline" onClick={copyToClipboard} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
            <Button variant="outline" onClick={shareNotes} className="flex items-center gap-2">
              <Share className="h-4 w-4" />
              Compartilhar
            </Button>
            <Button variant="outline" onClick={downloadAsPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Baixar PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotebookModal;