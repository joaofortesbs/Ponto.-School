
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface BlockedGroupModalProps {
  isOpen: boolean;
  groupName: string;
  onBack: () => void;
}

const BlockedGroupModal: React.FC<BlockedGroupModalProps> = ({
  isOpen,
  groupName,
  onBack
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-auto my-auto fixed inset-0 z-[99999] bg-white dark:bg-gray-800 border shadow-2xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 text-lg font-bold">
            <AlertCircle className="h-6 w-6" />
            Acesso Bloqueado
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 px-4 text-center space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-gray-900 dark:text-white font-semibold mb-2">
              Você foi removido do grupo <strong className="text-red-600">"{groupName}"</strong>.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Você não tem mais acesso às informações deste grupo. Para retornar à lista de grupos, clique no botão abaixo.
            </p>
          </div>
          
          <Button
            onClick={onBack}
            className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white w-full py-3 font-medium transition-colors"
            size="lg"
          >
            Voltar aos Meus Grupos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlockedGroupModal;
