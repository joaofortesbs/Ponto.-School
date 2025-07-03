import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useGroupMembers } from "@/hooks/useGroupMembers";

interface RemoverMembroModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  memberId: string;
  groupId: string;
}

const RemoverMembroModal: React.FC<RemoverMembroModalProps> = ({
  isOpen,
  onClose,
  memberName,
  memberId,
  groupId,
}) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const { removeMember } = useGroupMembers(groupId);

  const handleRemoverMembro = async () => {
    try {
      setIsRemoving(true);
      console.log(`Removendo membro ${memberName} (${memberId}) do grupo ${groupId}`);

      const success = await removeMember(memberId);
      
      if (success) {
        console.log(`Membro ${memberName} removido com sucesso`);
        onClose();
      } else {
        console.error('Falha ao remover membro - função retornou false');
      }

    } catch (error) {
      console.error('Erro geral ao remover membro:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Remover Membro
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-900 dark:text-white">
            Tem certeza que deseja remover <strong>{memberName}</strong> do grupo?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            O membro será removido imediatamente e perderá acesso a todas as discussões e materiais do grupo.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isRemoving}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemoverMembro}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Removendo...
              </>
            ) : (
              'Remover'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RemoverMembroModal;