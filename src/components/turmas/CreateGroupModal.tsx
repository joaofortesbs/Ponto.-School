
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

  // Enhanced lock management for preventing concurrent submissions
  const SUBMISSION_KEY = 'group_submission_lock';
  const LOCK_TIMEOUT = 10000; // 10 seconds
  
  const acquireLock = () => {
    const timestamp = Date.now();
    const lockValue = `${timestamp}:${Math.random()}`; // Avoid collisions
    localStorage.setItem(SUBMISSION_KEY, lockValue);
    console.log('Lock adquirido:', lockValue);
    return lockValue;
  };

  const releaseLock = (lockValue: string) => {
    if (localStorage.getItem(SUBMISSION_KEY) === lockValue) {
      localStorage.removeItem(SUBMISSION_KEY);
      console.log('Lock liberado:', lockValue);
    }
  };

  const isLocked = () => {
    const lockValue = localStorage.getItem(SUBMISSION_KEY);
    if (!lockValue) return false;
    
    const [timestamp] = lockValue.split(':');
    const lockAge = Date.now() - parseInt(timestamp, 10);
    if (lockAge > LOCK_TIMEOUT) {
      console.log('Lock expirado. Liberando...');
      localStorage.removeItem(SUBMISSION_KEY);
      return false;
    }
    return true;
  };

  const handleSubmit = async (formData: any) => {
    if (isLoading || isLocked()) {
      console.log('Submissão bloqueada. isLoading:', isLoading, 'isLocked:', isLocked());
      alert('Uma submissão já está em andamento. Aguarde ou recarregue a página.');
      return;
    }

    const lockValue = acquireLock();
    setIsLoading(true);
    try {
      console.log('Iniciando criação de grupo com nova RPC. FormData:', formData, 'Lock:', lockValue, 'Stack:', new Error().stack);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Usuário não autenticado');
        return;
      }
      console.log('Usuário autenticado. ID:', user.id);

      // Verificar se já existe um grupo com o mesmo nome criado pelo usuário
      console.log('Verificando se grupo já existe para o usuário...');
      const { data: existingGroup, error: checkError } = await supabase
        .from('grupos_estudo')
        .select('id')
        .eq('nome', formData.nome)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erro ao verificar grupo existente:', checkError.message);
        alert('Erro ao verificar grupo existente');
        return;
      }

      if (existingGroup) {
        console.log('Grupo já existe:', existingGroup);
        alert('Você já criou um grupo com esse nome. Escolha outro nome.');
        return;
      }

      // Criar o grupo
      console.log('Criando grupo com nome:', formData.nome);
      const { data: group, error: groupError } = await supabase
        .from('grupos_estudo')
        .insert({
          nome: formData.nome,
          descricao: formData.descricao,
          tipo_grupo: formData.tipo_grupo,
          disciplina_area: formData.disciplina_area || '',
          topico_especifico: formData.topico_especifico || '',
          tags: formData.tags || [],
          user_id: user.id,
          is_publico: formData.is_publico,
          is_visible_to_all: formData.is_visible_to_all,
          is_visible_to_partners: formData.is_visible_to_partners,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (groupError) {
        console.error('Erro ao criar grupo:', groupError.message, 'Detalhes:', groupError.details);
        alert('Erro ao criar grupo: ' + groupError.message);
        return;
      }
      console.log('Grupo criado com sucesso. ID:', group.id);

      // Adicionar o membro usando a nova função RPC
      console.log('Adicionando userId:', user.id, 'ao grupo ID:', group.id, 'via RPC');
      const { data: addMemberResult, error: addMemberError } = await supabase
        .rpc('add_group_member', {
          p_grupo_id: group.id,
          p_user_id: user.id
        });

      if (addMemberError) {
        console.error('Erro na RPC add_group_member:', addMemberError.message);
        alert('Grupo criado, mas erro ao adicionar você como membro. Tente acessar o grupo manualmente.');
        return;
      }

      if (!addMemberResult || addMemberResult.length === 0) {
        console.error('RPC retornou resultado vazio');
        alert('Grupo criado, mas erro ao adicionar você como membro. Tente acessar o grupo manualmente.');
        return;
      }

      const result = addMemberResult[0];
      console.log('Resultado da RPC add_group_member:', result);

      if (!result.member_added) {
        console.error('Falha ao adicionar membro:', result.message);
        alert('Grupo criado, mas erro ao adicionar você como membro: ' + result.message);
        return;
      }

      console.log('Membro adicionado com sucesso:', result.message);

      // Construir objeto de grupo para compatibilidade
      const grupoData = {
        id: group.id,
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
        created_at: group.created_at
      };

      console.log('Grupo criado e membro adicionado com sucesso via RPC!');
      alert('Grupo criado com sucesso!');
      onSubmit(grupoData);
      onClose();
    } catch (error: any) {
      console.error('Erro geral ao criar grupo:', error.message, 'Stack:', error.stack);
      alert('Erro ao criar grupo: ' + error.message);
    } finally {
      setIsLoading(false);
      releaseLock(lockValue);
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
