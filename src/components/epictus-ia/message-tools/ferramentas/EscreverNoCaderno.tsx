import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PenLine, FileText, Loader2 } from 'lucide-react';
import { convertToNotebookFormat } from '@/services/aiChatService';
import NotebookModal from '../../notebook-simulation/NotebookModal';
import { toast } from '@/components/ui/use-toast';

interface EscreverNoCadernoProps {
  closeModal: () => void;
  messageContent?: string;
}

const EscreverNoCaderno: React.FC<EscreverNoCadernoProps> = ({ closeModal, messageContent = "" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [notebookContent, setNotebookContent] = useState("");
  const [notebookModalOpen, setNotebookModalOpen] = useState(false);

  // Função para gerar caderno de anotações
  const handleGerarCaderno = async () => {
    if (!messageContent.trim()) {
      toast({
        title: "Conteúdo vazio",
        description: "Não há conteúdo para converter em formato de caderno.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Primeiro ativa o modal com estado de carregamento
      setNotebookModalOpen(true);
      
      // Fecha o modal de ferramentas
      closeModal();
      
      // Conversão do conteúdo para formato de caderno (com um pequeno atraso para garantir que o modal esteja visível)
      setTimeout(async () => {
        try {
          const formattedContent = await convertToNotebookFormat(messageContent);
          setNotebookContent(formattedContent);
        } catch (error) {
          console.error("Erro ao converter para formato de caderno:", error);
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao gerar o caderno. Por favor, tente novamente.",
            variant: "destructive",
          });
          setNotebookModalOpen(false);
        } finally {
          setIsLoading(false);
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao iniciar geração do caderno:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar o caderno. Por favor, tente novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4 text-white">
        <div className="flex items-start space-x-3">
          <div className="bg-green-600 p-2 rounded-full">
            <PenLine className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Escrever no Caderno</h3>
            <p className="text-indigo-200 text-sm">
              Transforme este conteúdo em um formato de caderno digital com resumos e pontos-chave para seus estudos
            </p>
          </div>
        </div>

        <div className="border border-indigo-800/50 rounded-lg p-4 bg-indigo-950/30">
          <div className="flex items-center mb-3">
            <FileText className="h-4 w-4 mr-2 text-indigo-300" />
            <h4 className="text-sm font-medium text-indigo-300">Como funciona?</h4>
          </div>
          <p className="text-sm text-indigo-200">
            Este assistente transformará o conteúdo em um formato de caderno digital com:
          </p>
          <ul className="text-sm text-indigo-200 mt-2 space-y-1 list-disc list-inside">
            <li>Resumo dos pontos principais</li>
            <li>Tópicos e subtópicos organizados</li>
            <li>Palavras-chave destacadas</li>
            <li>Fórmulas e conceitos importantes</li>
            <li>Layout de fácil leitura no estilo de caderno</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button 
            variant="ghost" 
            onClick={closeModal}
            className="text-indigo-200 hover:text-white hover:bg-indigo-800"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleGerarCaderno}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              "Gerar Caderno"
            )}
          </Button>
        </div>
      </div>

      {/* Modal do caderno */}
      <NotebookModal
        isOpen={notebookModalOpen}
        onClose={() => {
          // Garantir que o modal só seja fechado quando não estiver carregando
          if (!isLoading) {
            setNotebookModalOpen(false);
            setNotebookContent(""); // Limpar conteúdo ao fechar
          }
        }}
        content={notebookContent}
        isLoading={isLoading}
      />
    </>
  );
};

export default EscreverNoCaderno;