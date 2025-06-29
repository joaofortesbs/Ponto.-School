
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import CreateGroupForm from "./CreateGroupForm";
import CelebrationModal from "./CelebrationModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [showCelebration, setShowCelebration] = useState(false);
  const [createdGroup, setCreatedGroup] = useState<any>(null);
  const { toast } = useToast();

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      console.log('Iniciando criação de grupo com dados:', formData);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Erro de autenticação:', userError);
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      // Usar a função create_group_safe
      console.log('Chamando função create_group_safe...');
      const { data: result, error: createError } = await supabase
        .rpc('create_group_safe', {
          p_nome: formData.p_nome,
          p_descricao: formData.p_descricao || null,
          p_tipo_grupo: formData.p_tipo_grupo,
          p_disciplina_area: formData.p_disciplina_area || null,
          p_topico_especifico: formData.p_topico_especifico || null,
          p_tags: formData.p_tags || [],
          p_is_public: formData.p_is_public || false,
          p_is_visible_to_all: formData.p_is_visible_to_all || false,
          p_is_visible_to_partners: formData.p_is_visible_to_partners || false,
          p_is_private: formData.p_is_private || false,
          p_criador_id: user.id
        });

      if (createError) {
        console.error('Erro ao criar grupo:', createError);
        toast({
          title: "Erro",
          description: `Erro ao criar grupo: ${createError.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!result || result.length === 0) {
        console.error('Nenhum resultado retornado da função');
        toast({
          title: "Erro",
          description: "Erro inesperado ao criar grupo",
          variant: "destructive"
        });
        return;
      }

      const groupResult = result[0];
      
      if (!groupResult.success) {
        console.error('Falha na criação do grupo:', groupResult.message);
        toast({
          title: "Erro",
          description: groupResult.message || "Erro ao criar grupo",
          variant: "destructive"
        });
        return;
      }

      console.log('Grupo criado com sucesso:', groupResult);

      // Criar objeto do grupo para o modal de comemoração
      const newGroup = {
        id: groupResult.id,
        nome: groupResult.nome,
        tipo_grupo: formData.p_tipo_grupo,
        codigo_unico: groupResult.codigo_unico,
        is_private: formData.p_is_private,
        is_visible_to_all: formData.p_is_visible_to_all,
        descricao: formData.p_descricao,
        disciplina_area: formData.p_disciplina_area,
        topico_especifico: formData.p_topico_especifico,
        tags: formData.p_tags,
        criador_id: user.id,
        created_at: new Date().toISOString()
      };
      
      setCreatedGroup(newGroup);
      setShowCelebration(true);
      
      // Chamar callback para atualizar a lista
      onSubmit(newGroup);
      
    } catch (error) {
      console.error('Erro inesperado ao criar grupo:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar grupo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    setCreatedGroup(null);
    onClose();
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !showCelebration && (
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
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <CreateGroupForm 
                  onSubmit={handleSubmit} 
                  onCancel={handleClose}
                  isLoading={isLoading}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Comemoração */}
      {createdGroup && (
        <CelebrationModal
          isOpen={showCelebration}
          onClose={handleCloseCelebration}
          group={createdGroup}
        />
      )}
    </>
  );
};

export default CreateGroupModal;
