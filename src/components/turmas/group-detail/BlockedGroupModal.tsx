
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Acesso Bloqueado
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 text-center">
          <p className="text-gray-900 dark:text-white mb-4">
            Você foi removido do grupo <strong>{groupName}</strong>.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Você não tem mais acesso às informações deste grupo. Clique em "Voltar" para sair manualmente e retornar à grade "Meus Grupos".
          </p>
          
          <Button
            onClick={onBack}
            className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
          >
            Voltar aos Meus Grupos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlockedGroupModal;
