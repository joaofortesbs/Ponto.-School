
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

  const generateUniqueCode = async (): Promise<string> => {
    let codigoUnico: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      codigoUnico = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      console.log('Código único gerado:', codigoUnico, 'Comprimento:', codigoUnico.length);
      
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
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      console.log('Iniciando criação de grupo com nova função RPC. Dados:', formData);

      const codigoUnico = await generateUniqueCode();

      // Usar a nova função RPC que corrige a recursão infinita
      const { data: result, error: rpcError } = await supabase.rpc('create_group_with_member_bypass', {
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

      if (rpcError) {
        console.error('Erro na função RPC:', rpcError);
        throw new Error(`Erro na função RPC: ${rpcError.message}`);
      }

      console.log('Grupo criado com sucesso via RPC:', result);

      // Registrar na auditoria
      try {
        await supabase.from('group_creation_audit').insert({
          group_id: result[0].group_id,
          user_id: user.id,
          action: 'create_group_success',
          details: { 
            group_name: formData.nome,
            group_type: formData.tipo_grupo,
            codigo_unico: codigoUnico
          }
        });
      } catch (auditError) {
        console.warn('Erro ao registrar auditoria:', auditError);
        // Não falhar a criação do grupo por erro de auditoria
      }

      toast({
        title: "Sucesso",
        description: "Grupo criado com sucesso!",
      });

      onSubmit(result[0]);
      onClose();
        
    } catch (error) {
      console.error('Erro geral ao criar grupo:', error);
      
      // Registrar erro na auditoria
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('group_creation_audit').insert({
            user_id: user.id,
            action: 'create_group_error',
            details: { 
              error: error.message,
              stack: error.stack
            }
          });
        }
      } catch (auditError) {
        console.warn('Erro ao registrar auditoria de erro:', auditError);
      }

      toast({
        title: "Erro",
        description: "Erro ao criar grupo. Tente novamente.",
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
