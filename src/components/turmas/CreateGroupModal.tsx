
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import CreateGroupForm from "./CreateGroupForm";
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

      // Validação dos dados obrigatórios
      const requiredFields = ['nome', 'tipo_grupo'];
      const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
      
      if (missingFields.length > 0) {
        console.error('Campos obrigatórios ausentes:', missingFields);
        toast({
          title: "Erro",
          description: `Campos obrigatórios: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Chamando função create_group_safe...');

      // Usar a nova função segura do banco de dados
      const { data: result, error: createError } = await supabase
        .rpc('create_group_safe', {
          p_nome: formData.nome.trim(),
          p_descricao: formData.descricao?.trim() || null,
          p_tipo_grupo: formData.tipo_grupo,
          p_disciplina_area: formData.disciplina_area || null,
          p_topico_especifico: formData.topico_especifico || null,
          p_tags: Array.isArray(formData.tags) ? formData.tags : [],
          p_is_public: formData.is_public === true || formData.is_public === 'true',
          p_is_visible_to_all: formData.is_visible_to_all === true || formData.is_visible_to_all === 'true',
          p_is_visible_to_partners: formData.is_visible_to_partners === true || formData.is_visible_to_partners === 'true',
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

      toast({
        title: "Sucesso",
        description: `Grupo "${groupResult.nome}" criado com sucesso! Código: ${groupResult.codigo_unico}`,
      });
      
      // Criar objeto do grupo no formato esperado
      const newGroup = {
        id: groupResult.id,
        nome: groupResult.nome,
        codigo_unico: groupResult.codigo_unico,
        criador_id: user.id,
        tipo_grupo: formData.tipo_grupo,
        disciplina_area: formData.disciplina_area,
        topico_especifico: formData.topico_especifico,
        tags: formData.tags,
        is_public: formData.is_public,
        is_visible_to_all: formData.is_visible_to_all,
        is_visible_to_partners: formData.is_visible_to_partners,
        descricao: formData.descricao,
        created_at: new Date().toISOString()
      };
      
      onSubmit(newGroup);
      onClose();
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
