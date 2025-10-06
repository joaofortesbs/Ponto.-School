
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Loader2 } from "lucide-react";
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
  const [isBlocking, setIsBlocking] = useState(false);
  const { toast } = useToast();

  const handleBlockMember = async () => {
    try {
      setIsBlocking(true);
      console.log(`Iniciando bloqueio do membro ${memberName} (${memberId}) do grupo ${groupId}`);

      // Verificar se o usuário atual tem permissão para bloquear membros
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
        console.error('Usuário não tem permissão para bloquear membros');
        toast({
          title: "Erro",
          description: "Apenas o criador do grupo pode bloquear membros.",
          variant: "destructive"
        });
        return;
      }

      // Verificar se não está tentando bloquear o próprio criador
      if (memberId === groupData.criador_id) {
        console.error('Tentativa de bloquear o criador do grupo');
        toast({
          title: "Erro",
          description: "O criador do grupo não pode ser bloqueado.",
          variant: "destructive"
        });
        return;
      }

      console.log('Permissões verificadas. Bloqueando membro na tabela bloqueios_grupos...');

      // Bloquear o membro do grupo
      const { error: blockError } = await supabase
        .from('bloqueios_grupos')
        .insert({
          grupo_id: groupId,
          user_id: memberId,
          bloqueado_em: new Date().toISOString()
        });

      if (blockError) {
        throw blockError;
      }

      console.log('Membro bloqueado na tabela bloqueios_grupos com sucesso');

      // Sucesso
      console.log(`Membro ${memberName} bloqueado com sucesso do grupo ${groupData.nome}`);
      toast({
        title: "Sucesso",
        description: `${memberName} foi bloqueado do grupo com sucesso.`,
        variant: "default"
      });

      // Chamar callback para atualizar a lista
      onBlock();
      onClose();

    } catch (error) {
      console.error('Erro geral ao bloquear membro:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao bloquear membro.",
        variant: "destructive"
      });
    } finally {
      setIsBlocking(false);
    }
  };

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
              disabled={isBlocking}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button
              onClick={handleBlockMember}
              disabled={isBlocking}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isBlocking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Bloqueando...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Bloquear Membro
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BloquearMembroModal;
