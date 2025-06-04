
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
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Usuário não autenticado');
        return;
      }

      // Gerar código único para o grupo
      const codigoUnico = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Criar o grupo no Supabase
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

      // Adicionar o criador como membro do grupo
      const { error: memberError } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: newGroup.id,
          user_id: user.id,
          joined_at: new Date().toISOString()
        });

      if (memberError) {
        console.error('Erro ao adicionar membro:', memberError);
      }

      alert('Grupo criado com sucesso!');
      onSubmit(newGroup);
      onClose();
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
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
