
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
  const [conversionError, setConversionError] = useState(false);

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
      // Iniciar estado de carregamento
      setIsLoading(true);
      setConversionError(false);
      
      // Fechar o modal de ferramentas
      closeModal();
      
      // Abrir modal do caderno ANTES de começar a converter
      // Isso garante que o modal esteja visível durante o carregamento
      setNotebookModalOpen(true);
      
      console.log("Iniciando conversão para formato de caderno...");
      
      // Converter mensagem para formato de caderno
      try {
        // Usar um timeout para garantir que o modal esteja realmente aberto
        setTimeout(async () => {
          try {
            // Obter o conteúdo convertido
            const formattedContent = await convertToNotebookFormat(messageContent);
            
            // Verificar se o conteúdo foi gerado corretamente
            if (formattedContent && formattedContent.trim() !== "") {
              console.log("Conteúdo do caderno gerado com sucesso");
              setNotebookContent(formattedContent);
            } else {
              console.error("Conteúdo do caderno retornou vazio");
              setConversionError(true);
              setNotebookContent("Não foi possível gerar o conteúdo do caderno. Por favor, tente novamente.");
            }
          } catch (error) {
            console.error("Erro durante a conversão do conteúdo:", error);
            setConversionError(true);
            setNotebookContent("Ocorreu um erro ao gerar o caderno. Por favor, tente novamente.");
          } finally {
            // Finalizar carregamento, mas manter o modal aberto
            setIsLoading(false);
          }
        }, 300);
      } catch (error) {
        console.error("Erro ao processar conversão:", error);
        setConversionError(true);
        setNotebookContent("Ocorreu um erro ao gerar o caderno. Por favor, tente novamente.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro geral ao iniciar a conversão:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar o caderno. Por favor, tente novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Função para fechar o modal de caderno
  const handleCloseNotebookModal = () => {
    console.log("Fechando modal do caderno a pedido do usuário");
    setNotebookModalOpen(false);
    // Limpar o conteúdo apenas após o modal estar fechado
    setTimeout(() => {
      setNotebookContent("");
      setConversionError(false);
    }, 300);
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

      {/* Modal do caderno - sempre sob controle do usuário */}
      <NotebookModal
        isOpen={notebookModalOpen}
        onClose={handleCloseNotebookModal}
        content={notebookContent}
        isLoading={isLoading}
      />
    </>
  );
};

export default EscreverNoCaderno;
