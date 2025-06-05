
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
      console.log('Submissão já em andamento. Ignorando nova tentativa às', new Date().toISOString());
      return;
    }

    setIsLoading(true);
    try {
      console.log('Iniciando criação de grupo às', new Date().toISOString(), 'FormData:', formData);
      
      // Validar dados obrigatórios com logs detalhados
      if (!formData.nome || !formData.nome.trim()) {
        console.error('Validação falhou: Nome do grupo é obrigatório');
        alert('Nome do grupo é obrigatório.');
        return;
      }

      if (!formData.descricao || !formData.descricao.trim()) {
        console.error('Validação falhou: Descrição do grupo é obrigatória');
        alert('Descrição do grupo é obrigatória.');
        return;
      }

      if (!formData.tipo_grupo) {
        console.error('Validação falhou: Tipo do grupo é obrigatório');
        alert('Tipo do grupo é obrigatório.');
        return;
      }

      if (!formData.disciplina_area || !formData.disciplina_area.trim()) {
        console.error('Validação falhou: Disciplina/Área é obrigatória');
        alert('Disciplina/Área é obrigatória.');
        return;
      }

      if (!formData.topico_especifico || !formData.topico_especifico.trim()) {
        console.error('Validação falhou: Tópico específico é obrigatório');
        alert('Tópico específico é obrigatório.');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Erro de autenticação: Usuário não encontrado');
        alert('Usuário não autenticado');
        return;
      }
      
      // Validar UUID do usuário
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(user.id)) {
        console.error('Erro de autenticação: ID do usuário inválido', user.id);
        alert('ID do usuário inválido');
        return;
      }
      console.log('Usuário autenticado validado. ID:', user.id);

      // Verificar se grupo já existe com nome exato
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
        console.log('Grupo duplicado encontrado:', existingGroup);
        alert('Você já criou um grupo com esse nome. Escolha outro nome.');
        return;
      }

      // Preparar parâmetros para a RPC com validação
      const rpcParams = {
        p_name: formData.nome.trim(),
        p_description: formData.descricao.trim(),
        p_type: formData.tipo_grupo,
        p_user_id: user.id,
        p_is_visible_to_all: formData.is_visible_to_all || false,
        p_is_visible_to_partners: formData.is_visible_to_partners || false,
        p_disciplina_area: formData.disciplina_area.trim(),
        p_topico_especifico: formData.topico_especifico.trim(),
        p_tags: formData.tags || []
      };

      console.log('Chamando função RPC create_group_with_member com parâmetros:', rpcParams);
      const { data: result, error: rpcError } = await supabase.rpc('create_group_with_member', rpcParams);

      if (rpcError) {
        console.error('Erro na função RPC create_group_with_member:', {
          message: rpcError.message,
          details: rpcError.details,
          hint: rpcError.hint,
          code: rpcError.code
        });
        alert(`Erro ao criar grupo: ${rpcError.message}`);
        return;
      }

      // Validar retorno da RPC - ajustado para formato correto
      if (!result || result.length === 0 || !result[0].success) {
        console.error('Falha na criação do grupo. Resultado da RPC:', result);
        alert('Falha ao criar grupo. Tente novamente.');
        return;
      }

      const groupId = result[0].group_id;
      console.log('Grupo criado com sucesso às', new Date().toISOString(), 'ID:', groupId);

      // Buscar os dados completos do grupo criado para confirmação
      const { data: newGroup, error: fetchError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', groupId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar dados do grupo criado:', fetchError);
        // Não bloquear o fluxo, pois o grupo foi criado com sucesso
      }

      console.log('Dados do grupo criado:', newGroup);
      alert('Grupo criado com sucesso!');
      onSubmit(newGroup || { id: groupId });
      onClose();
    } catch (error) {
      console.error('Erro geral ao criar grupo às', new Date().toISOString(), ':', {
        message: error.message,
        stack: error.stack
      });
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
