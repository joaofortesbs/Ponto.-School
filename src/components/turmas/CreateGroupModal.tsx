
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
      console.log('Iniciando criação de grupo com função RPC melhorada. FormData:', formData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Usuário não autenticado');
        return;
      }
      console.log('Usuário autenticado. ID:', user.id);

      if (!formData.nome?.trim()) {
        alert('O nome do grupo é obrigatório.');
        return;
      }

      // Chamar a função RPC atualizada com verificação explícita
      console.log('Executando função RPC create_group_with_member com verificação explícita...');
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('create_group_with_member', {
          p_name: formData.nome.trim(),
          p_description: formData.descricao || '',
          p_type: formData.tipo_grupo || 'public',
          p_is_visible_to_all: formData.is_visible_to_all || false,
          p_is_visible_to_partners: formData.is_visible_to_partners || false,
          p_user_id: user.id
        });

      if (rpcError) {
        console.error('Erro na RPC create_group_with_member:', rpcError.message, 'Detalhes:', rpcError.details);
        alert('Erro ao criar grupo: ' + rpcError.message);
        return;
      }

      if (!rpcResult || rpcResult.length === 0) {
        console.error('RPC não retornou dados válidos:', rpcResult);
        alert('Erro ao criar grupo: transação não retornou dados válidos');
        return;
      }

      const result = rpcResult[0];
      console.log('Resultado da RPC:', result);

      if (!result.group_id) {
        console.error('RPC falhou ao criar grupo:', result.message);
        alert('Erro ao criar grupo: ' + result.message);
        return;
      }

      console.log('Grupo criado com sucesso via RPC com verificação explícita. ID:', result.group_id, 'Membro adicionado:', result.member_added, 'Mensagem:', result.message);

      // Construir objeto de grupo para compatibilidade
      const grupoData = {
        id: result.group_id,
        nome: formData.nome,
        descricao: formData.descricao,
        tipo_grupo: formData.tipo_grupo,
        disciplina_area: formData.disciplina_area,
        topico_especifico: formData.topico_especifico,
        tags: formData.tags,
        is_publico: formData.is_publico,
        is_visible_to_all: formData.is_visible_to_all,
        is_visible_to_partners: formData.is_visible_to_partners,
        user_id: user.id,
        created_at: new Date().toISOString()
      };

      alert('Grupo criado com sucesso!');
      onSubmit(grupoData);
      onClose();
    } catch (error: any) {
      console.error('Erro geral ao criar grupo:', error?.message, 'Stack:', error?.stack);
      alert('Erro ao criar grupo. Verifique o console.');
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
                isLoading={isLoading}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModal;
