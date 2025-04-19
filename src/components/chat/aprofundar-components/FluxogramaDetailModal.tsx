import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, FileText, BookOpen, Lightbulb, Copy, Download } from 'lucide-react';
import { Node } from 'reactflow';
import { cn } from '@/lib/utils';

interface FluxogramaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: Node;
}

const FluxogramaDetailModal: React.FC<FluxogramaDetailModalProps> = ({
  isOpen,
  onClose,
  node,
}) => {
  // Função para copiar o conteúdo para a área de transferência
  const copyToClipboard = () => {
    if (!node.data?.description) return;

    const textToCopy = `${node.data.label}\n\n${node.data.description}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // Feedback visual poderia ser adicionado aqui (toast notification)
        console.log('Conteúdo copiado para a área de transferência');
      })
      .catch(err => {
        console.error('Erro ao copiar para a área de transferência:', err);
      });
  };

  // Determinar a cor e o estilo baseado no tipo do nó
  const getNodeTypeStyles = () => {
    switch(node.type) {
      case 'start':
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/30',
          borderColor: 'border-blue-200 dark:border-blue-700',
          iconBg: 'bg-blue-100 dark:bg-blue-800/50',
          iconColor: 'text-blue-600 dark:text-blue-400',
          title: 'Início do Fluxo'
        };
      case 'end':
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-700',
          iconBg: 'bg-green-100 dark:bg-green-800/50',
          iconColor: 'text-green-600 dark:text-green-400',
          title: 'Conclusão'
        };
      case 'process':
        return {
          bgColor: 'bg-purple-50 dark:bg-purple-900/30',
          borderColor: 'border-purple-200 dark:border-purple-700',
          iconBg: 'bg-purple-100 dark:bg-purple-800/50',
          iconColor: 'text-purple-600 dark:text-purple-400',
          title: 'Processo'
        };
      case 'decision':
        return {
          bgColor: 'bg-amber-50 dark:bg-amber-900/30',
          borderColor: 'border-amber-200 dark:border-amber-700',
          iconBg: 'bg-amber-100 dark:bg-amber-800/50',
          iconColor: 'text-amber-600 dark:text-amber-400',
          title: 'Decisão'
        };
      default:
        return {
          bgColor: 'bg-gray-50 dark:bg-gray-800/50',
          borderColor: 'border-gray-200 dark:border-gray-700',
          iconBg: 'bg-gray-100 dark:bg-gray-800/80',
          iconColor: 'text-gray-600 dark:text-gray-400',
          title: 'Conceito'
        };
    }
  };

  const styles = getNodeTypeStyles();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className={cn("p-6 pb-2", styles.bgColor, 'border-b', styles.borderColor)}>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className={cn("h-5 w-5", styles.iconColor)} />
            {styles.title}: {node.data?.label || 'Sem título'}
          </DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre este elemento do fluxograma.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-4">
          <div className={cn("mb-4 rounded-lg p-4 border", styles.bgColor, styles.borderColor)}>
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {node.data?.label || 'Sem título'}
              </h3>

              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={copyToClipboard}
                  title="Copiar conteúdo"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap">
              {node.data?.description || 'Nenhuma descrição disponível.'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className={cn("p-2 rounded-full mr-3 mt-1", styles.iconBg)}>
                <ArrowRight className={cn("h-4 w-4", styles.iconColor)} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Função no Fluxograma
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {node.type === 'start' && 'Este é o ponto de partida do fluxograma, estabelecendo o contexto inicial para o tema abordado.'}
                  {node.type === 'end' && 'Este é o ponto final do fluxograma, representando a conclusão ou resultado do processo.'}
                  {node.type === 'process' && 'Este é um passo intermediário do processo, representando uma etapa importante na sequência.'}
                  {node.type === 'decision' && 'Este é um ponto de decisão no fluxograma, onde diferentes caminhos podem ser seguidos.'}
                  {(node.type === 'default' || !node.type) && 'Este elemento faz parte da estrutura principal do tema, contribuindo para o entendimento global.'}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className={cn("p-2 rounded-full mr-3 mt-1", styles.iconBg)}>
                <BookOpen className={cn("h-4 w-4", styles.iconColor)} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Importância Didática
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Compreender este conceito é essencial para o domínio do assunto. Ele se relaciona diretamente com outros elementos do fluxograma e contribui para o entendimento sistêmico do tema.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className={cn("p-2 rounded-full mr-3 mt-1", styles.iconBg)}>
                <Lightbulb className={cn("h-4 w-4", styles.iconColor)} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Aplicação Prática
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Este conceito pode ser aplicado na resolução de problemas relacionados ao tema, servindo como base para análises e estudos mais aprofundados na área.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={copyToClipboard}
              className="flex items-center"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Adicionar ao caderno
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FluxogramaDetailModal;