
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import CreateGroupForm from "./CreateGroupForm";
import { supabase } from "@/integrations/supabase/client";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    if (isLoading) {
      console.log('Submissão já em andamento. Ignorando nova tentativa.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Iniciando criação de grupo usando transação atômica. FormData:', formData, 'Stack:', new Error().stack);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Usuário não autenticado');
        return;
      }
      console.log('Usuário autenticado. ID:', user.id);

      // Usar a função RPC para transação atômica
      console.log('Chamando função RPC create_group_with_member...');
      const { data: result, error: rpcError } = await supabase.rpc('create_group_with_member', {
        p_name: formData.nome,
        p_description: formData.descricao,
        p_type: formData.tipo_grupo,
        p_user_id: user.id,
        p_is_visible_to_all: formData.is_visible_to_all,
        p_is_visible_to_partners: formData.is_visible_to_partners,
        p_disciplina_area: formData.disciplina_area,
        p_topico_especifico: formData.topico_especifico,
        p_tags: formData.tags || []
      });

      if (rpcError) {
        console.error('Erro na função RPC create_group_with_member:', rpcError.message, 'Detalhes:', rpcError.details, 'Stack:', new Error().stack);
        alert('Erro ao criar grupo: ' + rpcError.message);
        return;
      }

      if (!result || result.length === 0 || !result[0].success) {
        console.error('Falha na criação do grupo. Resultado:', result);
        alert('Falha ao criar grupo. Verifique o console.');
        return;
      }

      const groupId = result[0].group_id;
      console.log('Grupo criado com sucesso via transação atômica. ID:', groupId);

      // Buscar os dados completos do grupo criado para passar para o callback
      const { data: newGroup, error: fetchError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', groupId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar dados do grupo criado:', fetchError.message);
        // Não bloquear o fluxo, pois o grupo foi criado com sucesso
        console.warn('Grupo criado mas não foi possível buscar os dados completos');
      }

      alert('Grupo criado com sucesso!');
      onSubmit(newGroup || { id: groupId });
      onClose();
    } catch (error) {
      console.error('Erro geral ao criar grupo:', error.message, 'Stack:', error.stack);
      alert('Erro ao criar grupo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#1E293B] rounded-xl overflow-hidden max-w-3xl w-full max-h-[90vh] shadow-xl"
          >
            <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Criar Novo Grupo</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                onClick={onClose}
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <CreateGroupForm 
                onSubmit={handleSubmit} 
                onCancel={onClose}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModal;
