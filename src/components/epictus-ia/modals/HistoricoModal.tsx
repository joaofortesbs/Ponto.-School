
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

interface HistoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FallbackComponent = ({ error, resetErrorBoundary }) => {
  console.error("Erro no Modal de Histórico:", error);
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-200">
      <h3 className="text-lg font-medium mb-2">Erro ao carregar histórico</h3>
      <p className="text-sm mb-4">Ocorreu um erro ao carregar seu histórico de conversas.</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-100 dark:bg-red-800/30 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
};

const HistoricoModalContent = () => {
  console.log("Renderizando conteúdo do modal de histórico");
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
      <Clock className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
      <p className="text-lg text-center text-gray-600 dark:text-gray-400">
        Seu histórico irá aparecer aqui
      </p>
    </div>
  );
};

const HistoricoModal: React.FC<HistoricoModalProps> = ({ isOpen, onClose }) => {
  console.log("Renderizando modal de histórico, estado:", isOpen ? "aberto" : "fechado");
  
  // Usando try/catch para garantir que erros de renderização não quebrem a aplicação
  try {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Histórico de Conversas</DialogTitle>
          </DialogHeader>
          
          <ErrorBoundary FallbackComponent={FallbackComponent}>
            <HistoricoModalContent />
          </ErrorBoundary>
        </DialogContent>
      </Dialog>
    );
  } catch (error) {
    console.error("Erro ao renderizar HistoricoModal:", error);
    return null; // Fallback seguro para evitar quebra da interface
  }
};

export default HistoricoModal;
