
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import NotebookSimulation from '@/components/chat/NotebookSimulation';
import { X, Download, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

const NotebookModal: React.FC<NotebookModalProps> = ({ isOpen, onClose, content }) => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência",
    });
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `caderno-anotacoes-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] md:max-w-[900px] bg-amber-50 dark:bg-slate-900 p-0 overflow-hidden">
        <DialogHeader className="bg-amber-100 dark:bg-slate-800 p-4 flex flex-row items-center justify-between rounded-t-lg">
          <div>
            <DialogTitle className="text-xl font-bold text-amber-900 dark:text-amber-200">
              Caderno de Anotações
            </DialogTitle>
            <DialogDescription className="text-amber-700 dark:text-amber-300">
              Suas anotações de estudo em formato de caderno
            </DialogDescription>
          </div>
          <button 
            onClick={onClose}
            className="text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
          >
            <X size={20} />
          </button>
        </DialogHeader>
        
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <NotebookSimulation content={content} />
        </div>
        
        <div className="bg-amber-100 dark:bg-slate-800 p-4 flex justify-end gap-2">
          <Button 
            variant="outline" 
            className="bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-200 dark:bg-slate-700 dark:border-slate-600"
            onClick={handleCopy}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiar
          </Button>
          <Button 
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotebookModal;
