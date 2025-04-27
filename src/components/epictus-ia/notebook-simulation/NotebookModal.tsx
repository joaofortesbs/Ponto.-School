
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, X, Download, Copy, CheckCircle } from 'lucide-react';
import NotebookSimulation from './NotebookSimulation';
import { toast } from "@/components/ui/use-toast";

interface NotebookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
}

const NotebookModal: React.FC<NotebookModalProps> = ({ 
  open, 
  onOpenChange, 
  content 
}) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    toast({
      title: "Conteúdo copiado",
      description: "O conteúdo do caderno foi copiado para a área de transferência",
      duration: 2000,
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'caderno_de_anotacoes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download concluído",
      description: "O arquivo do caderno foi baixado com sucesso",
      duration: 2000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 gap-0 bg-[#fffdf0] dark:bg-[#1e1e18]">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center px-4 py-2 bg-amber-100 dark:bg-gray-800 border-b border-gray-400 dark:border-gray-600">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#FF6B00]" />
            Caderno de Anotações
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Conteúdo do caderno */}
        <ScrollArea className="h-[60vh] bg-[#fffdf0] dark:bg-[#1e1e18] p-4 notebook-lines">
          <NotebookSimulation content={content} />
        </ScrollArea>
        
        {/* Rodapé com ações */}
        <div className="p-3 border-t border-gray-400 dark:border-gray-600 bg-amber-100 dark:bg-gray-800 flex justify-between">
          <Button 
            variant="outline"
            className="text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-600 hover:bg-amber-200 dark:hover:bg-gray-700"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar
          </Button>
          
          <Button 
            variant="outline"
            className="text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-600 hover:bg-amber-200 dark:hover:bg-gray-700"
            onClick={handleCopy}
          >
            {isCopied ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotebookModal;
