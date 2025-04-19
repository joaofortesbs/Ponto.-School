
import React from 'react';
import { X } from 'lucide-react';
import { Node } from 'react-flow-renderer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  
  // Mapeamento de ícones baseado no tipo do nó
  const getIconClassByType = (type: string | undefined) => {
    switch(type) {
      case 'start': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'process': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'decision': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'end': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <div className={`w-8 h-8 rounded-full mr-2 flex items-center justify-center ${getIconClassByType(node.type)}`}>
              {node.type === 'start' && <span className="text-sm">I</span>}
              {node.type === 'process' && <span className="text-sm">P</span>}
              {node.type === 'decision' && <span className="text-sm">?</span>}
              {node.type === 'end' && <span className="text-sm">F</span>}
            </div>
            <span>{node.data.label}</span>
          </DialogTitle>
          <Button
            variant="ghost"
            className="absolute right-4 top-4 p-0 w-6 h-6 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Explicação Detalhada</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {node.data.description || 'Não há explicação detalhada disponível para este passo.'}
            </p>
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
