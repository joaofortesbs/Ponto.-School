
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
      codigoUnico = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      console.log('Código único gerado:', codigoUnico, 'Comprimento:', codigoUnico.length);
      
      // Verificação simplificada sem usar políticas RLS problemáticas
      const { data: existingGroup, error } = await supabase
        .from('grupos_estudo')
        .select('id')
        .eq('codigo_unico', codigoUnico)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Usuário não autenticado');
        return;
      }

      console.log('Iniciando criação de grupo com transação. Dados:', formData);

      const codigoUnico = await generateUniqueCode();

      // Usar função de transação para evitar problemas de RLS
      const { data: result, error: transactionError } = await supabase.rpc('create_group_with_member', {
        p_name: formData.nome,
        p_description: formData.descricao,
        p_type: formData.tipo_grupo,
        p_is_visible_to_all: formData.is_visible_to_all,
        p_is_visible_to_partners: formData.is_visible_to_partners,
        p_user_id: user.id,
        p_codigo_unico: codigoUnico,
        p_disciplina_area: formData.disciplina_area,
        p_topico_especifico: formData.topico_especifico,
        p_tags: formData.tags
      });

      if (transactionError) {
        console.error('Erro na transação:', transactionError);
        
        // Fallback para método direto se a função RPC não existir
        if (transactionError.code === 'PGRST301') {
          console.log('Função RPC não encontrada, usando método direto...');
          
          // Primeiro, criar o grupo
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
            console.error('Erro ao criar grupo:', insertError);
            alert('Erro ao criar grupo: ' + insertError.message);
            return;
          }

          console.log('Grupo criado com sucesso:', newGroup);

          // Então, adicionar o criador como membro
          const { error: memberError } = await supabase
            .from('membros_grupos')
            .insert({
              grupo_id: newGroup.id,
              user_id: user.id,
              joined_at: new Date().toISOString()
            });

          if (memberError && memberError.code !== '23505') { // Ignorar erro de duplicata
            console.error('Erro ao adicionar membro:', memberError);
            alert('Grupo criado, mas erro ao adicionar como membro: ' + memberError.message);
          } else {
            console.log('Criador adicionado como membro com sucesso.');
          }

          onSubmit(newGroup);
        } else {
          alert('Erro ao criar grupo: ' + transactionError.message);
          return;
        }
      } else {
        console.log('Grupo criado com sucesso via transação:', result);
        onSubmit(result);
      }

      alert('Grupo criado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro geral ao criar grupo:', error);
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
