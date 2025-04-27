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
      // 1. Definir estado de carregamento
      setIsLoading(true);
      
      // 2. Fechar o modal de ferramentas
      closeModal();
      
      // 3. Abrir o modal do caderno com indicador de carregamento
      setNotebookModalOpen(true);
      
      // 4. Importante: Deixar o estado ser atualizado antes de continuar
      // Isso garante que o modal seja aberto corretamente
      setTimeout(async () => {
        try {
          console.log("Iniciando conversão para formato de caderno...");
          
          // 5. Converter o conteúdo
          const formattedContent = await convertToNotebookFormat(messageContent);
          
          // 6. Garantir que o modal ainda está aberto antes de atualizar
          if (setNotebookContent) {
            console.log("Conteúdo convertido com sucesso, atualizando caderno...");
            setNotebookContent(formattedContent);
          }
        } catch (error) {
          console.error("Erro ao converter para formato de caderno:", error);
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao gerar o caderno. Por favor, tente novamente.",
            variant: "destructive",
          });
          
          // Não feche automaticamente em caso de erro
          // Permita que o usuário feche manualmente
        } finally {
          // 7. Finalizar o carregamento, mas manter o modal aberto
          setIsLoading(false);
        }
      }, 300); // Aumentando o tempo para garantir que o modal tenha tempo suficiente
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
          // Não permitir fechamento durante carregamento
          if (isLoading) {
            console.log("Modal não pode ser fechado durante carregamento");
            return;
          }
          
          console.log("Fechando modal do caderno");
          setNotebookModalOpen(false);
          
          // Pequeno atraso antes de limpar o conteúdo
          // para garantir transição suave
          setTimeout(() => {
            setNotebookContent("");
          }, 300);
        }}
        content={notebookContent}
        isLoading={isLoading}
      />
    </>
  );
};

export default EscreverNoCaderno;