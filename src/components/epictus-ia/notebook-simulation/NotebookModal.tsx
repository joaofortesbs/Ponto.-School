
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NotebookSimulation } from '@/components/chat/NotebookSimulation';
import { Button } from '@/components/ui/button';
import { Copy, Download, Lightbulb, PenTool, Share2, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface NotebookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
}

const NotebookModal: React.FC<NotebookModalProps> = ({ open, onOpenChange, content }) => {
  const [viewMode, setViewMode] = useState<'caderno' | 'dicas'>('caderno');
  
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

  // Dicas de estudo baseadas no conteúdo
  const renderDicas = () => {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">Dicas para aproveitar melhor suas anotações</h3>
        
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Método de revisão espaçada</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Revise suas anotações em intervalos crescentes: 1 dia, 3 dias, 1 semana e 2 semanas.
              Isso fortalece a memória de longo prazo e reduz o esquecimento.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">Conexões com outros temas</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Tente relacionar este conteúdo com outros tópicos que você já conhece. 
              Criar conexões entre diferentes áreas do conhecimento facilita o aprendizado.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Faça perguntas ao conteúdo</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Elabore perguntas baseadas nas suas anotações e tente respondê-las sem consultar o material.
              Esse é um ótimo método para verificar seu nível de compreensão.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 bg-[#f9f9f7] dark:bg-[#121826] overflow-hidden flex flex-col border-none shadow-xl">
        <DialogHeader className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 flex flex-row items-center justify-between rounded-t-lg">
          <div className="flex items-center">
            <PenTool className="h-5 w-5 mr-2 text-white" />
            <DialogTitle className="text-lg font-medium text-white">
              Caderno de Anotações
            </DialogTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className={`text-xs px-3 py-1 h-8 ${viewMode === 'caderno' ? 'bg-white text-blue-700' : 'bg-blue-700/30 text-white hover:bg-white/80 hover:text-blue-700'}`}
              onClick={() => setViewMode('caderno')}
            >
              <PenTool className="h-3.5 w-3.5 mr-1" /> Caderno
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className={`text-xs px-3 py-1 h-8 ${viewMode === 'dicas' ? 'bg-white text-blue-700' : 'bg-blue-700/30 text-white hover:bg-white/80 hover:text-blue-700'}`}
              onClick={() => setViewMode('dicas')}
            >
              <Lightbulb className="h-3.5 w-3.5 mr-1" /> Dicas de Estudo
            </Button>
          </div>
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
              onClick={handleCopy}
              title="Copiar conteúdo"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
              onClick={handleDownload}
              title="Baixar anotações"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
              onClick={handleShare}
              title="Compartilhar"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
              onClick={() => onOpenChange(false)}
              title="Fechar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-6 bg-[#f5f5f0] dark:bg-[#1a1f2c] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {viewMode === 'caderno' ? (
            <div className="max-w-3xl mx-auto bg-[#fffef8] dark:bg-[#121826] shadow-lg rounded-md overflow-hidden transform transition-all duration-200 hover:shadow-xl">
              <NotebookSimulation content={content} />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {renderDicas()}
            </div>
          )}
        </div>
        
        <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center rounded-b-lg">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Anotações criadas pela Epictus IA • {new Date().toLocaleDateString()}
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotebookModal;
