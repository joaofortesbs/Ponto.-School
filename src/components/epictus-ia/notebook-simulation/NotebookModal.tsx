
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NotebookSimulation } from '@/components/chat/NotebookSimulation';
import { Button } from '@/components/ui/button';
import { BookOpen, Copy, Download, Pencil, Share2, X } from 'lucide-react';
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
      <DialogContent className="max-w-5xl h-[85vh] p-0 bg-white dark:bg-[#121826] overflow-hidden flex flex-col rounded-xl border-0 shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-amber-100 dark:border-amber-900/30 bg-gradient-to-r from-amber-50/80 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 backdrop-blur-sm flex flex-row items-center justify-between">
          <div className="flex items-center">
            <div className="bg-amber-100 dark:bg-amber-700/30 rounded-full p-2 mr-3">
              <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="text-xl font-medium text-amber-800 dark:text-amber-300">
              Anotações em Caderno
            </DialogTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-amber-700 hover:text-green-600 hover:bg-green-50 dark:text-amber-400 dark:hover:text-green-400 dark:hover:bg-green-900/20 transition-all duration-200"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4 mr-1.5" /> Copiar
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-amber-700 hover:text-blue-600 hover:bg-blue-50 dark:text-amber-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-all duration-200"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1.5" /> Baixar
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-amber-700 hover:text-purple-600 hover:bg-purple-50 dark:text-amber-400 dark:hover:text-purple-400 dark:hover:bg-purple-900/20 transition-all duration-200"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-1.5" /> Compartilhar
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-amber-700 hover:text-red-600 hover:bg-red-50 dark:text-amber-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 ml-1 transition-all duration-200"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-8 bg-gradient-to-b from-amber-50/50 to-amber-100/30 dark:from-amber-900/10 dark:to-[#1a1f2c]/95">
          <div className="relative max-w-4xl mx-auto">
            {/* Decorative elements */}
            <div className="absolute -left-6 top-4 w-3 h-[95%] bg-amber-200 dark:bg-amber-700/40 rounded-r-md"></div>
            <div className="absolute -left-3 top-2 bottom-2 w-0.5 h-[98%] bg-red-400/60 dark:bg-red-500/40"></div>
            
            {/* Paper effect with shadow */}
            <div className="bg-[#fffef5] dark:bg-[#161c26] rounded-md p-6 shadow-[0_5px_25px_rgba(0,0,0,0.1)] dark:shadow-[0_5px_25px_rgba(0,0,0,0.3)] relative before:absolute before:inset-0 before:bg-[url('/images/pattern-grid.svg')] before:opacity-[0.03] before:bg-repeat before:z-0">
              <div className="relative z-10">
                <NotebookSimulation content={content} />
              </div>
              
              {/* Decorative pencil icon */}
              <div className="absolute -right-2 -bottom-2 bg-amber-100 dark:bg-amber-700/30 rounded-full p-2 shadow-md transform rotate-12">
                <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotebookModal;
