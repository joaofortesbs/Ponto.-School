
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Download, Copy, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  isLoading?: boolean;
}

const NotebookModal: React.FC<NotebookModalProps> = ({
  isOpen,
  onClose,
  content,
  isLoading = false
}) => {
  // Função para copiar o conteúdo do caderno
  const handleCopyContent = () => {
    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: "Conteúdo copiado",
        description: "O texto do caderno foi copiado para a área de transferência.",
      });
    }).catch(err => {
      console.error('Erro ao copiar texto: ', err);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o conteúdo. Tente novamente.",
        variant: "destructive",
      });
    });
  };

  // Função para baixar o conteúdo como um arquivo de texto
  const handleDownloadContent = () => {
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    
    // Gerar nome de arquivo baseado na data atual
    const date = new Date();
    const fileName = `caderno_${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}.txt`;
    
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download iniciado",
      description: `Salvando ${fileName}`,
    });
  };

  // Função para compartilhar o conteúdo (básica)
  const handleShareContent = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Meu Caderno de Anotações',
        text: content,
      }).then(() => {
        toast({
          title: "Compartilhamento",
          description: "Conteúdo compartilhado com sucesso!",
        });
      }).catch(error => {
        console.error('Erro ao compartilhar:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao compartilhar o conteúdo.",
          variant: "destructive",
        });
      });
    } else {
      // Fallback se Web Share API não for suportada
      handleCopyContent();
      toast({
        title: "Compartilhamento",
        description: "Conteúdo copiado para área de transferência. Você pode colá-lo onde desejar para compartilhar.",
      });
    }
  };

  // Importante: só permitir que o usuário feche o modal diretamente
  // O modal não será fechado automaticamente
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Garantir que só o usuário pode fechar manualmente
      onClose();
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={handleOpenChange}
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-[700px] bg-[#f5f5dc] border-[#d3be98] shadow-lg max-h-[80vh] overflow-hidden flex flex-col"
        onEscapeKeyDown={(e) => e.preventDefault()} // Impedir fechamento com ESC
        onInteractOutside={(e) => e.preventDefault()} // Impedir fechamento ao clicar fora
      >
        <DialogHeader className="border-b border-[#d3be98] pb-4 mb-4">
          <DialogTitle className="text-[#5d4037] text-xl font-serif relative">
            Meu Caderno de Anotações
            <div className="absolute right-0 top-0 flex gap-2">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7 text-[#8d6e63] hover:text-[#5d4037] hover:bg-[#e6ddc4]"
                onClick={handleCopyContent}
                title="Copiar conteúdo"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7 text-[#8d6e63] hover:text-[#5d4037] hover:bg-[#e6ddc4]"
                onClick={handleDownloadContent}
                title="Baixar como arquivo de texto"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7 text-[#8d6e63] hover:text-[#5d4037] hover:bg-[#e6ddc4]"
                onClick={handleShareContent}
                title="Compartilhar conteúdo"
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 min-h-[400px]">
            <Loader2 className="h-10 w-10 text-[#8d6e63] animate-spin mb-4" />
            <p className="text-[#5d4037] text-lg font-medium">Preparando seu caderno...</p>
            <p className="text-[#8d6e63] text-sm mt-2">Isso pode levar alguns segundos</p>
          </div>
        ) : (
          <div className="overflow-y-auto notebook-lines pr-3 py-2 flex-1">
            {content ? (
              <div 
                className="text-[#5d4037] font-serif text-base leading-7 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: content
                    // Formatar conteúdo para destacar pontos
                    .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-[#ad4e3a]">$1</span>')
                    .replace(/^• (.*)$/gm, '<div class="flex mb-1"><span class="mr-2">•</span><span>$1</span></div>')
                    .replace(/\n\n/g, '<div class="h-4"></div>')
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 min-h-[300px]">
                <p className="text-[#5d4037] text-lg font-medium">Não foi possível gerar o conteúdo.</p>
                <p className="text-[#8d6e63] text-sm mt-2">Por favor, tente novamente ou feche manualmente.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Botão para fechar explicitamente */}
        <div className="mt-4 border-t border-[#d3be98] pt-4 flex justify-end">
          <Button 
            onClick={onClose}
            variant="outline"
            className="bg-transparent border-[#8d6e63] text-[#5d4037] hover:bg-[#e6ddc4]"
          >
            Fechar caderno
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotebookModal;
