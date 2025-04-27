
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NotebookSimulation } from '@/components/chat/NotebookSimulation';
import { Button } from '@/components/ui/button';
import { Copy, Download, Share2, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface NotebookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
}

const NotebookModal: React.FC<NotebookModalProps> = ({ open, onOpenChange, content }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content)
      .then(() => {
        toast({
          title: "Conteúdo copiado!",
          description: "O texto das anotações foi copiado para a área de transferência.",
          duration: 3000,
        });
      })
      .catch(err => {
        console.error('Erro ao copiar texto:', err);
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o conteúdo.",
          variant: "destructive",
          duration: 3000,
        });
      });
  };

  const handleDownload = () => {
    // Create a blob from the content
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anotacoes-caderno.txt';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Download iniciado!",
      description: "Suas anotações foram baixadas como arquivo de texto.",
      duration: 3000,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Minhas anotações',
        text: content
      })
      .then(() => {
        toast({
          title: "Compartilhado com sucesso!",
          description: "Suas anotações foram compartilhadas.",
          duration: 3000,
        });
      })
      .catch(err => {
        console.error('Erro ao compartilhar:', err);
        toast({
          title: "Erro ao compartilhar",
          description: "Não foi possível compartilhar o conteúdo.",
          variant: "destructive",
          duration: 3000,
        });
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopy();
      toast({
        title: "Conteúdo copiado para compartilhar",
        description: "O recurso de compartilhamento não está disponível no seu navegador, mas o conteúdo foi copiado para a área de transferência.",
        duration: 3000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 bg-white dark:bg-[#121826] overflow-hidden flex flex-col">
        <DialogHeader className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-medium text-gray-900 dark:text-white">
            Anotações em Caderno
          </DialogTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4 mr-1" /> Copiar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" /> Baixar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-1" /> Compartilhar
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-6 bg-[#f9f9f7] dark:bg-[#1a1f2c]">
          <div className="max-w-3xl mx-auto bg-[#fffef8] dark:bg-[#121826] shadow-md rounded-md p-4">
            <NotebookSimulation content={content} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotebookModal;
