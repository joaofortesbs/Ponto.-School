
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

      // Gerar código único
      const codigoUnico = await generateUniqueCode();

      // Preparar dados com estrutura correta
      const groupData = {
        nome: formData.nome.trim(),
        descricao: formData.descricao?.trim() || null,
        criador_id: user.id,
        codigo_unico: codigoUnico,
        // CORREÇÃO: usar is_public em vez de is_publico
        is_public: formData.is_public === true || formData.is_public === 'true',
        is_visible_to_all: formData.is_visible_to_all === true || formData.is_visible_to_all === 'true',
        is_visible_to_partners: formData.is_visible_to_partners === true || formData.is_visible_to_partners === 'true',
        tipo_grupo: formData.tipo_grupo,
        disciplina_area: formData.disciplina_area || null,
        topico_especifico: formData.topico_especifico || null,
        tags: Array.isArray(formData.tags) ? formData.tags : []
      };

      console.log('Dados preparados para inserção:', groupData);

      // Inserir grupo no banco de dados
      const { data: newGroup, error: insertError } = await supabase
        .from('grupos_estudo')
        .insert(groupData)
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao inserir grupo:', insertError);
        toast({
          title: "Erro",
          description: `Erro ao criar grupo: ${insertError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Grupo criado com sucesso:', newGroup);

      // Adicionar o criador como membro do grupo
      const { error: memberError } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: newGroup.id,
          user_id: user.id
        });

      if (memberError) {
        console.error('Erro ao adicionar criador como membro:', memberError);
        toast({
          title: "Aviso",
          description: "Grupo criado, mas houve erro ao adicionar você como membro",
          variant: "destructive"
        });
      } else {
        console.log('Criador adicionado como membro com sucesso');
      }

      toast({
        title: "Sucesso",
        description: `Grupo "${newGroup.nome}" criado com sucesso! Código: ${newGroup.codigo_unico}`,
      });
      
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
