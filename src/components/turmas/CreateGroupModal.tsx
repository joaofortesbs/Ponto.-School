
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import CreateGroupForm from "./CreateGroupForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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
    console.log('🔑 Gerando código único para o grupo...');
    let codigoUnico: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      // Gerar código de 8 caracteres usando substring(2, 10)
      codigoUnico = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      console.log('🎲 Código único gerado:', codigoUnico, 'Comprimento:', codigoUnico.length);
      
      // Verificar se o código já existe no banco
      const { data: existingGroup, error } = await supabase
        .from('grupos_estudo')
        .select('id')
        .eq('codigo_unico', codigoUnico)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao verificar unicidade do código:', error);
        attempts++;
        continue;
      }

      if (!existingGroup) {
        isUnique = true;
        console.log('✅ Código único validado:', codigoUnico);
        return codigoUnico;
      }
      
      attempts++;
      console.log('🔄 Código já existe, tentativa:', attempts);
    }

    // Fallback: se não conseguir gerar código único, usar timestamp
    const fallbackCode = Date.now().toString(36).substring(-8).toUpperCase();
    console.log('⚠️ Usando código fallback:', fallbackCode, 'Comprimento:', fallbackCode.length);
    return fallbackCode;
  };

  const handleSubmit = async (formData: any) => {
    console.log("📋 Form data recebido no modal:", formData);
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ Usuário não autenticado');
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      console.log('👤 Usuário autenticado:', user.id);

      // Gerar código único de 8 caracteres
      const codigoUnico = await generateUniqueCode();

      // Criar o grupo no Supabase
      console.log('💾 Criando grupo no Supabase...');
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
        console.error('❌ Erro ao criar grupo:', insertError);
        toast({
          title: "Erro",
          description: `Erro ao criar grupo: ${insertError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Grupo criado com sucesso:', newGroup);
      console.log('🔑 Código único do grupo:', newGroup.codigo_unico, 'Comprimento:', newGroup.codigo_unico.length);

      // Adicionar o criador como membro do grupo
      console.log('👥 Adicionando criador como membro...');
      const { error: memberError } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: newGroup.id,
          user_id: user.id,
          joined_at: new Date().toISOString()
        });

      if (memberError) {
        console.error('❌ Erro ao adicionar membro:', memberError);
      } else {
        console.log('✅ Criador adicionado como membro');
      }

      // Processar os convites para os parceiros selecionados
      if (formData.invitedPartners && formData.invitedPartners.length > 0) {
        console.log('📨 Enviando convites para', formData.invitedPartners.length, 'parceiros');
        console.log('👥 Lista de parceiros convidados:', formData.invitedPartners);
        
        const convites = formData.invitedPartners.map((parceiro_id: string) => ({
          grupo_id: newGroup.id,
          convidado_id: parceiro_id,
          criador_id: user.id,
          status: 'pendente'
        }));

        console.log('📋 Convites a serem inseridos:', convites);

        const { error: convitesError } = await supabase
          .from('convites_grupos')
          .insert(convites);

        if (convitesError) {
          console.error('❌ Erro ao enviar convites:', convitesError);
          toast({
            title: "Aviso",
            description: "Grupo criado, mas houve um erro ao enviar alguns convites.",
            variant: "destructive"
          });
        } else {
          console.log('✅ Convites enviados com sucesso:', convites.length);
          toast({
            title: "Sucesso",
            description: `Grupo criado e ${convites.length} convites enviados.`,
            variant: "default"
          });
        }
      } else {
        console.log('ℹ️ Nenhum parceiro foi convidado');
        toast({
          title: "Sucesso",
          description: "Grupo criado com sucesso!",
          variant: "default"
        });
      }

      onSubmit(newGroup);
      onClose();
    } catch (error) {
      console.error('❌ Erro geral ao criar grupo:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar grupo",
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
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModal;
