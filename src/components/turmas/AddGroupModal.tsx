
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupAdded: () => void;
}

const AddGroupModal: React.FC<AddGroupModalProps> = ({
  isOpen,
  onClose,
  onGroupAdded,
}) => {
  const [codigo, setCodigo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigo.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um código de grupo",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Tentando entrar no grupo com código:', codigo);
      
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

      // Usar a função RPC join_group_by_code
      const { data: result, error: joinError } = await supabase
        .rpc('join_group_by_code', {
          p_codigo_unico: codigo.trim().toUpperCase(),
          p_user_id: user.id
        });

      if (joinError) {
        console.error('Erro ao entrar no grupo:', joinError);
        toast({
          title: "Erro",
          description: `Erro ao entrar no grupo: ${joinError.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!result || result.length === 0) {
        console.error('Nenhum resultado retornado da função');
        toast({
          title: "Erro",
          description: "Erro inesperado ao processar código",
          variant: "destructive"
        });
        return;
      }

      const joinResult = result[0];
      
      if (!joinResult.success) {
        console.error('Falha ao entrar no grupo:', joinResult.message);
        toast({
          title: "Erro",
          description: joinResult.message || "Erro ao entrar no grupo",
          variant: "destructive"
        });
        return;
      }

      console.log('Entrada no grupo bem-sucedida:', joinResult);
      
      toast({
        title: "Sucesso",
        description: `Você entrou no grupo "${joinResult.group_name}" com sucesso!`,
      });
      
      setCodigo("");
      onGroupAdded();
      
    } catch (error) {
      console.error('Erro inesperado ao entrar no grupo:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao processar código",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setCodigo("");
      onClose();
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
            className="bg-[#1E293B] rounded-xl overflow-hidden max-w-md w-full shadow-xl"
          >
            <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Entrar em Grupo</h2>
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

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo" className="text-white">
                    Código do Grupo
                  </Label>
                  <Input
                    id="codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="Digite o código do grupo"
                    className="bg-[#2a4066] border-gray-600 text-white placeholder-gray-400"
                    disabled={isLoading}
                    maxLength={6}
                  />
                  <p className="text-sm text-gray-400">
                    Digite o código único de 6 caracteres do grupo que você deseja entrar
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                  >
                    {isLoading ? "Entrando..." : "Entrar no Grupo"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddGroupModal;
