
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RemoverMembroModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  memberId: string;
  groupId: string;
  onRemove: () => void;
}

const RemoverMembroModal: React.FC<RemoverMembroModalProps> = ({
  isOpen,
  onClose,
  memberName,
  memberId,
  groupId,
  onRemove
}) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();

  const handleRemoverMembro = async () => {
    try {
      setIsRemoving(true);
      console.log(`Iniciando bloqueio do membro ${memberName} (${memberId}) do grupo ${groupId}`);

      // Verificar se o usuário atual tem permissão para remover membros
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Erro de autenticação:', userError);
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }

      // Verificar se o usuário atual é o criador do grupo
      const { data: groupData, error: groupError } = await supabase
        .from('grupos_estudo')
        .select('criador_id, nome')
        .eq('id', groupId)
        .single();

      if (groupError) {
        console.error('Erro ao verificar criador do grupo:', groupError);
        toast({
          title: "Erro",
          description: "Erro ao verificar permissões do grupo.",
          variant: "destructive"
        });
        return;
      }

      // Verificar se o usuário atual é o criador do grupo
      if (groupData.criador_id !== user.id) {
        console.error('Usuário não tem permissão para remover membros');
        toast({
          title: "Erro",
          description: "Apenas o criador do grupo pode remover membros.",
          variant: "destructive"
        });
        return;
      }

      // Verificar se não está tentando remover o próprio criador
      if (memberId === groupData.criador_id) {
        console.error('Tentativa de remover o criador do grupo');
        toast({
          title: "Erro",
          description: "O criador do grupo não pode ser removido.",
          variant: "destructive"
        });
        return;
      }

      console.log('Permissões verificadas. Bloqueando membro na tabela membros_grupos...');

      // Bloquear o membro do grupo
      const { error: blockError } = await supabase
        .from('membros_grupos')
        .update({ is_blocked: true })
        .eq('grupo_id', groupId)
        .eq('user_id', memberId);

      if (blockError) {
        throw blockError;
      }

      console.log('Membro bloqueado na tabela membros_grupos com sucesso');

      // Sucesso
      console.log(`Membro ${memberName} removido (bloqueado) com sucesso do grupo ${groupData.nome}`);
      toast({
        title: "Sucesso",
        description: `${memberName} foi removido do grupo com sucesso.`,
        variant: "default"
      });

      // Chamar callback para atualizar a lista
      onRemove();
      onClose();

    } catch (error) {
      console.error('Erro geral ao remover membro:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao remover membro.",
        variant: "destructive"
      });
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
            Esta ação bloqueará o acesso do membro ao grupo.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-900 dark:text-white">
            Tem certeza que deseja remover <strong>{memberName}</strong> do grupo?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            O membro será bloqueado e perderá acesso a todas as discussões e materiais do grupo. Ele precisará sair manualmente do grupo.
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
