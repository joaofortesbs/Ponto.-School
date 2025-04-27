import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AprofundarNoTema from "./AprofundarNoTema";
import SimuladorQuestoes from "./SimuladorQuestoes";
import EscreverNoCaderno from "./EscreverNoCaderno";
import SimularApresentacao from "./SimularApresentacao";
import { X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { NotebookModal } from "@/components/epictus-ia/notebook-simulation";
import { transformContentWithAI } from "@/services/notebookService";

interface FerramentasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAprofundarClick: () => void;
  content?: string;
}

const FerramentasModal: React.FC<FerramentasModalProps> = ({
  open,
  onOpenChange,
  onAprofundarClick,
  content = ""
}) => {
  const [notebookModalOpen, setNotebookModalOpen] = useState(false);
  const [notebookContent, setNotebookContent] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOnOpenChange = (value: boolean) => {
    onOpenChange(value);
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleEscreverNoCaderno = async () => {
    if (isProcessing || !content) return;

    setIsProcessing(true);
    onOpenChange(false);

    toast({
      title: "Caderno de Anotações",
      description: "Convertendo conteúdo para formato de caderno...",
      duration: 2000,
    });

    try {
      // Transform the content to notebook format
      const transformedContent = await transformContentWithAI(content);
      setNotebookContent(transformedContent);

      // Open the notebook modal
      setNotebookModalOpen(true);
    } catch (error) {
      console.error("Erro ao transformar conteúdo para formato de caderno:", error);
      toast({
        title: "Erro",
        description: "Não foi possível converter o conteúdo para o formato de caderno.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOnOpenChange}>
        <DialogContent 
          className="bg-[#0D1F44] text-white border-[#3A4B5C] w-[500px] shadow-2xl p-0 overflow-hidden" 
          onClick={handleModalClick}
        >
          <DialogHeader className="bg-[#1E3A8A] py-3 px-4 flex flex-row items-center justify-between border-b border-[#3A4B5C]">
            <DialogTitle className="text-white font-medium text-lg flex items-center space-x-2">
              <span>Ferramentas Epictus IA</span>
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="flex flex-col p-3 space-y-2 max-h-[400px] overflow-y-auto">
            <div className="px-1 text-gray-300 text-sm mb-1">
              Transforme este conteúdo com nossas ferramentas inteligentes
            </div>

            <AprofundarNoTema onClick={onAprofundarClick} />

            <SimuladorQuestoes onClick={() => {
              onOpenChange(false);
              toast({
                title: "Simulador de questões",
                description: "Iniciando simulador de questões para este tema...",
                duration: 3000,
              });
            }} />

            <EscreverNoCaderno onClick={handleEscreverNoCaderno} />

            <SimularApresentacao onClick={() => {
              onOpenChange(false);
              toast({
                title: "Modo Apresentação",
                description: "Iniciando simulação de apresentação deste conteúdo...",
                duration: 3000,
              });
            }} />
          </div>

          <div className="p-3 border-t border-[#3A4B5C] flex justify-end">
            <button
              onClick={() => onOpenChange(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
            >
              Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para exibir o conteúdo em formato de caderno */}
      <NotebookModal
        open={notebookModalOpen}
        onOpenChange={setNotebookModalOpen}
        content={notebookContent}
      />
    </>
  );
};

export default FerramentasModal;