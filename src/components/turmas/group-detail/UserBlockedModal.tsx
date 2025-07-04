

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";

interface UserBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  reason?: string;
  onUnblock: () => void;
}

const UserBlockedModal: React.FC<UserBlockedModalProps> = ({
  isOpen,
  onClose,
  groupName,
  reason,
  onUnblock
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-auto bg-white dark:bg-gray-800 border shadow-2xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 text-lg font-bold">
            <AlertCircle className="h-6 w-6" />
            Acesso Bloqueado
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 px-4 space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-gray-900 dark:text-white font-semibold mb-2">
              Você foi bloqueado do grupo <strong className="text-red-600">"{groupName}"</strong>.
            </p>
            {reason && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Motivo do bloqueio:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  {reason}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              Você não tem mais acesso às informações deste grupo.
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
              onClick={onUnblock}
              disabled={true}
              className="flex-1 bg-gray-400 text-white cursor-not-allowed opacity-50"
            >
              Desbloquear
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserBlockedModal;

