
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BloquearMembroModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  memberId: string;
  groupId: string;
  onBlock: () => void;
}

const BloquearMembroModal: React.FC<BloquearMembroModalProps> = ({
  isOpen,
  onClose,
  memberName,
  memberId,
  groupId,
  onBlock
}) => {
  const [reason, setReason] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);
  const { toast } = useToast();

  const handleBlock = async () => {
    if (!memberId || !groupId) {
      toast({
        title: "Erro",
        description: "Informações do membro ou grupo não encontradas.",
        variant: "destructive",
      });
      return;
    }

    setIsBlocking(true);

    try {
      console.log('Tentando bloquear membro:', {
        group_id: groupId,
        user_to_block_id: memberId,
        reason: reason.trim() || null
      });

      // Chamar a função do Supabase para bloquear o usuário
      const { data, error } = await supabase.rpc('block_user_from_group', {
        p_group_id: groupId,
        user_to_block_id: memberId,
        reason: reason.trim() || null
      });

      if (error) {
        console.error('Erro ao bloquear membro:', error);
        toast({
          title: "Erro ao bloquear membro",
          description: error.message || "Ocorreu um erro inesperado.",
          variant: "destructive",
        });
        return;
      }

      console.log('Membro bloqueado com sucesso:', data);

      toast({
        title: "Membro bloqueado",
        description: `${memberName} foi bloqueado do grupo com sucesso.`,
      });

      // Chamar callback para atualizar a lista
      onBlock();
      onClose();
      setReason('');
    } catch (error: any) {
      console.error('Erro ao bloquear membro:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao bloquear o membro.",
        variant: "destructive",
      });
    } finally {
      setIsBlocking(false);
    }
  };

  const handleClose = () => {
    if (!isBlocking) {
      setReason('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto bg-white dark:bg-gray-800 border shadow-2xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600 text-lg font-bold">
            <AlertTriangle className="h-6 w-6" />
            Bloquear Membro
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 px-4 space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-gray-900 dark:text-white font-semibold mb-2">
              Tem certeza que deseja bloquear <strong className="text-amber-600">"{memberName}"</strong>?
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Esta ação impedirá que o usuário tenha acesso às informações do grupo.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Motivo do bloqueio (opcional)
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo do bloqueio..."
              className="min-h-[80px] resize-none"
              disabled={isBlocking}
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              disabled={isBlocking}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button
              onClick={handleBlock}
              disabled={isBlocking}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {isBlocking ? 'Bloqueando...' : 'Bloquear Membro'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BloquearMembroModal;
