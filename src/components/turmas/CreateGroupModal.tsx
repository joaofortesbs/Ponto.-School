
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
      console.log('Iniciando criação de grupo. FormData:', formData);
      
      // Validar dados obrigatórios
      if (!formData.nome || !formData.nome.trim()) {
        alert('Nome do grupo é obrigatório.');
        return;
      }

      if (!formData.descricao || !formData.descricao.trim()) {
        alert('Descrição do grupo é obrigatória.');
        return;
      }

      if (!formData.tipo_grupo) {
        alert('Tipo do grupo é obrigatório.');
        return;
      }

      if (!formData.disciplina_area || !formData.disciplina_area.trim()) {
        alert('Disciplina/Área é obrigatória.');
        return;
      }

      if (!formData.topico_especifico || !formData.topico_especifico.trim()) {
        alert('Tópico específico é obrigatório.');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Usuário não autenticado');
        return;
      }
      console.log('Usuário autenticado. ID:', user.id);

      // Verificar se grupo já existe
      console.log('Verificando se grupo já existe...');
      const { data: existingGroup, error: existingError } = await supabase
        .from('grupos_estudo')
        .select('id')
        .eq('nome', formData.nome.trim())
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingError) {
        console.error('Erro ao verificar grupo existente:', existingError);
      }

      if (existingGroup) {
        alert('Você já criou um grupo com esse nome. Escolha outro nome.');
        return;
      }

      // Usar a função RPC para transação atômica
      console.log('Chamando função RPC create_group_with_member...');
      const { data: result, error: rpcError } = await supabase.rpc('create_group_with_member', {
        p_name: formData.nome.trim(),
        p_description: formData.descricao.trim(),
        p_type: formData.tipo_grupo,
        p_user_id: user.id,
        p_is_visible_to_all: formData.is_visible_to_all || false,
        p_is_visible_to_partners: formData.is_visible_to_partners || false,
        p_disciplina_area: formData.disciplina_area.trim(),
        p_topico_especifico: formData.topico_especifico.trim(),
        p_tags: formData.tags || []
      });

      if (rpcError) {
        console.error('Erro na função RPC create_group_with_member:', rpcError);
        alert(`Erro ao criar grupo: ${rpcError.message}`);
        return;
      }

      if (!result || result.length === 0 || !result[0].success) {
        console.error('Falha na criação do grupo. Resultado:', result);
        alert('Falha ao criar grupo. Tente novamente.');
        return;
      }

      const groupId = result[0].group_id;
      console.log('Grupo criado com sucesso. ID:', groupId);

      // Buscar os dados completos do grupo criado
      const { data: newGroup, error: fetchError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', groupId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar dados do grupo criado:', fetchError);
        // Não bloquear o fluxo, pois o grupo foi criado com sucesso
      }

      alert('Grupo criado com sucesso!');
      onSubmit(newGroup || { id: groupId });
      onClose();
    } catch (error) {
      console.error('Erro geral ao criar grupo:', error);
      alert(`Erro inesperado ao criar grupo: ${error.message}`);
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
