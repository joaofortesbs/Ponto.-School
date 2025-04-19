
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Node } from 'reactflow';
import { X } from 'lucide-react';

interface FluxogramaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: Node | null;
}

const FluxogramaDetailModal: React.FC<FluxogramaDetailModalProps> = ({
  isOpen,
  onClose,
  node
}) => {
  if (!node) return null;

  const addToCaderno = () => {
    // Implementar a funcionalidade de adicionar ao caderno
    const conteudo = `## ${node.data.label}\n\n${node.data.description}\n\n${node.data.example || ''}`;
    
    try {
      // Salvar no localStorage como exemplo
      const notebookContent = localStorage.getItem('caderno') || '';
      localStorage.setItem('caderno', notebookContent + '\n\n' + conteudo);
      
      // Feedback visual
      alert('Conteúdo adicionado ao caderno com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar ao caderno:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Detalhes do Elemento
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {node.data.label}
            </h3>
            
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {node.data.description}
            </div>
          </div>
          
          {node.data.example && (
            <div>
              <h4 className="text-sm font-medium mb-1">Exemplo</h4>
              <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                {node.data.example}
              </div>
            </div>
          )}

          {node.data.resource && (
            <div>
              <h4 className="text-sm font-medium mb-1">Recursos Adicionais</h4>
              <a 
                href={node.data.resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {node.data.resource.title || 'Visualizar Recurso'}
              </a>
            </div>
          )}

          <div className="pt-3 flex justify-end">
            <Button
              variant="outline"
              className="mr-2 text-sm"
              onClick={onClose}
            >
              Fechar
            </Button>
            <Button 
              className="text-sm bg-blue-600 hover:bg-blue-700"
              onClick={addToCaderno}
            >
              Adicionar ao Caderno
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FluxogramaDetailModal;
