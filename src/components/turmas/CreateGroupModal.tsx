
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

  const generateUniqueCode = async (): Promise<string> => {
    let codigoUnico: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      // Gerar código de 8 caracteres usando substring(2, 10)
      codigoUnico = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      console.log('Código único gerado:', codigoUnico, 'Comprimento:', codigoUnico.length);
      
      // Verificar se o código já existe no banco
      const { data: existingGroup, error } = await supabase
        .from('grupos_estudo')
        .select('id')
        .eq('codigo_unico', codigoUnico)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar unicidade do código:', error);
        attempts++;
        continue;
      }

      if (!existingGroup) {
        isUnique = true;
        console.log('Código único validado:', codigoUnico);
        return codigoUnico;
      }
      
      attempts++;
    }

    // Fallback: se não conseguir gerar código único, usar timestamp
    const fallbackCode = Date.now().toString(36).substring(-8).toUpperCase();
    console.log('Usando código fallback:', fallbackCode, 'Comprimento:', fallbackCode.length);
    return fallbackCode;
  };

  const handleSubmit = async (formData: any) => {
    if (isLoading) {
      console.log('Submissão já em andamento. Ignorando nova tentativa.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Iniciando criação de grupo. FormData:', formData, 'Stack:', new Error().stack);
      
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

      // Gerar código único de 8 caracteres
      const codigoUnico = await generateUniqueCode();

      // Criar o grupo no Supabase
      console.log('Criando grupo no Supabase...');
      const { data: newGroup, error: insertError } = await supabase
        .from('grupos_estudo')
        .insert({
          nome: formData.nome,
          descricao: formData.descricao,
          user_id: user.id,
          codigo_unico: codigoUnico,
          is_publico: formData.is_publico,
          is_visible_to_all: formData.is_visible_to_all,
          is_visible_to_partners: formData.is_visible_to_partners,
          tipo_grupo: formData.tipo_grupo,
          disciplina_area: formData.disciplina_area,
          topico_especifico: formData.topico_especifico,
          tags: formData.tags,
          membros: 1
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao criar grupo:', insertError.message, 'Detalhes:', insertError.details, 'Stack:', new Error().stack);
        alert('Erro ao criar grupo: ' + insertError.message);
        return;
      }

      console.log('Grupo criado com sucesso. ID:', newGroup.id, 'Código:', newGroup.codigo_unico);

      // Verificar se o criador já é membro antes de adicionar
      console.log('Verificando se criador já é membro do grupo...');
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('membros_grupos')
        .select('id')
        .eq('grupo_id', newGroup.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        console.error('Erro ao verificar membresia existente:', memberCheckError.message, 'Stack:', new Error().stack);
      }

      if (!existingMember) {
        // Adicionar o criador como membro do grupo
        console.log('Adicionando criador como membro do grupo...');
        const { error: memberError } = await supabase
          .from('membros_grupos')
          .insert({
            grupo_id: newGroup.id,
            user_id: user.id,
            joined_at: new Date().toISOString()
          });

        if (memberError) {
          console.error('Erro ao adicionar membro:', memberError.message, 'Detalhes:', memberError.details, 'Stack:', new Error().stack);
          // Não bloquear o fluxo, pois o grupo já foi criado
          console.warn('Grupo criado mas criador não foi adicionado como membro automaticamente');
        } else {
          console.log('Criador adicionado como membro com sucesso');
        }
      } else {
        console.log('Criador já é membro do grupo. Pulando inserção.');
      }

      alert('Grupo criado com sucesso!');
      onSubmit(newGroup);
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
