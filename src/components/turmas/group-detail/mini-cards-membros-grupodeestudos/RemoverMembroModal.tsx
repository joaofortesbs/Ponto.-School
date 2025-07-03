import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserMinus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

      // Verificar se o usuário atual tem permissão para remover membros
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
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
        .select('criador_id')
        .eq('id', groupId)
        .single();

      if (groupError) {
        console.error('Erro ao verificar criador do grupo:', groupError);
        toast({
          title: "Erro",
          description: "Erro ao verificar permissões.",
          variant: "destructive"
        });
        return;
      }

      // Verificar se o usuário atual é o criador do grupo
      if (groupData.criador_id !== user.id) {
        toast({
          title: "Erro",
          description: "Apenas o criador do grupo pode remover membros.",
          variant: "destructive"
        });
        return;
      }

      // Verificar se não está tentando remover o próprio criador
      if (memberId === groupData.criador_id) {
        toast({
          title: "Erro",
          description: "O criador do grupo não pode ser removido.",
          variant: "destructive"
        });
        return;
      }

      // Remover o membro do grupo
      const { error: removeError } = await supabase
        .from('membros_grupos')
        .delete()
        .eq('grupo_id', groupId)
        .eq('user_id', memberId);

      if (removeError) {
        console.error('Erro ao remover membro:', removeError);
        toast({
          title: "Erro",
          description: "Erro ao remover membro do grupo.",
          variant: "destructive"
        });
        return;
      }

      // Sucesso
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={!isRemoving ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-[#0f1525] rounded-xl p-6 mx-4 max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-[#FF6B00]/10 rounded-full">
                <UserMinus className="h-6 w-6 text-[#FF6B00]" />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Remover Membro
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              Tem certeza que deseja remover <span className="font-medium text-gray-900 dark:text-white">{memberName}</span> do grupo?
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isRemoving}
              >
                Cancelar
              </Button>

              <Button
                onClick={handleRemoverMembro}
                className="flex-1 bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RemoverMembroModal;