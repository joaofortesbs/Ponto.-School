import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface HistoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoricoModal: React.FC<HistoricoModalProps> = ({ isOpen, onClose }) => {
  console.log("Renderizando HistoricoModal, isOpen:", isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Histórico de Conversas
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Seu histórico irá aparecer aqui
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoricoModal;