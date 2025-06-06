
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import CreateGroupForm from "./CreateGroupForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

  const handleSubmit = async (formData: any) => {
    if (isLoading) {
      console.log('Submissão já em andamento. Ignorando nova tentativa.');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      console.log('Iniciando criação de grupo com sistema redesenhado. Dados:', formData);
      console.log('User ID:', user.id);

      // Usar a nova função redesenhada
      const { data: result, error: rpcError } = await supabase.rpc('create_group_with_member', {
        p_name: formData.nome,
        p_description: formData.descricao || '',
        p_type: formData.is_publico ? 'public' : 'private',
        p_is_visible_to_all: formData.is_visible_to_all || false,
        p_is_visible_to_partners: formData.is_visible_to_partners || false,
        p_user_id: user.id,
        p_disciplina_area: formData.disciplina_area || null,
        p_topico_especifico: formData.topico_especifico || null,
        p_tags: formData.tags || null
      });

      if (rpcError) {
        console.error('Erro na função RPC:', rpcError);
        throw new Error(`Erro na função RPC: ${rpcError.message}`);
      }

      if (!result || result.length === 0 || !result[0].success) {
        const errorMessage = result?.[0]?.error_message || 'Erro desconhecido ao criar grupo';
        console.error('Erro retornado pela função:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Grupo criado com sucesso:', result);

      toast({
        title: "Sucesso",
        description: "Grupo criado com sucesso!",
      });

      // Retornar o grupo criado com a nova estrutura
      const groupData = {
        id: result[0].group_id,
        nome: formData.nome,
        descricao: formData.descricao,
        tipo_grupo: formData.is_publico ? 'public' : 'private',
        criador_id: user.id,
        disciplina_area: formData.disciplina_area,
        topico_especifico: formData.topico_especifico,
        tags: formData.tags,
        is_public: formData.is_publico,
        is_visible_to_all: formData.is_visible_to_all,
        is_visible_to_partners: formData.is_visible_to_partners
      };

      onSubmit(groupData);
      onClose();
        
    } catch (error) {
      console.error('Erro geral ao criar grupo:', error);
      
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar grupo. Tente novamente.",
        variant: "destructive",
      });
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
