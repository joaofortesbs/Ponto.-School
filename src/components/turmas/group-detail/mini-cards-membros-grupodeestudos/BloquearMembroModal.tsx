
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";

interface BloquearMembroModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  onBlock: () => void;
}

const BloquearMembroModal: React.FC<BloquearMembroModalProps> = ({
  isOpen,
  onClose,
  memberName,
  onBlock
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-white dark:bg-gray-800 border shadow-2xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600 text-lg font-bold">
            <AlertTriangle className="h-6 w-6" />
            Bloquear Membro
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 px-4 text-center space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-gray-900 dark:text-white font-semibold mb-2">
              Tem certeza que deseja bloquear <strong className="text-amber-600">"{memberName}"</strong>?
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Esta ação impedirá que o usuário tenha acesso às informações do grupo.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button
              onClick={onBlock}
              disabled={true}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white opacity-50 cursor-not-allowed"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Bloquear Membro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BloquearMembroModal;
