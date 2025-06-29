
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EntrarGrupoPorCodigoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupJoined: () => void;
}

export default function EntrarGrupoPorCodigoModal({
  isOpen,
  onClose,
  onGroupJoined
}: EntrarGrupoPorCodigoModalProps) {
  const [codigo, setCodigo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleJoinGroup = async () => {
    if (!codigo.trim()) {
      setError('Por favor, digite o código do grupo');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      // Buscar o grupo pelo código
      const { data: group, error: groupError } = await supabase
        .from('grupos_estudo')
        .select('id, nome, criador_id')
        .eq('codigo_unico', codigo.toUpperCase())
        .single();

      if (groupError || !group) {
        setError('Grupo não encontrado. Verifique o código e tente novamente.');
        return;
      }

      // Verificar se já é membro
      const { data: existingMember } = await supabase
        .from('membros_grupos')
        .select('id')
        .eq('grupo_id', group.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        setError('Você já faz parte deste grupo');
        return;
      }

      // Adicionar como membro
      const { error: memberError } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: group.id,
          user_id: user.id,
          joined_at: new Date().toISOString()
        });

      if (memberError) {
        console.error('Erro ao ingressar no grupo:', memberError);
        setError('Erro ao ingressar no grupo. Tente novamente.');
        return;
      }

      // Sucesso
      toast({
        title: "Sucesso",
        description: `Você entrou no grupo "${group.nome}" com sucesso!`,
      });
      
      setCodigo('');
      setError('');
      onGroupJoined();
      onClose();
      
    } catch (error) {
      console.error('Erro inesperado:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCodigo('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#29335C] dark:text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-[#FF6B00]" />
            Entrar em Grupo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#29335C] dark:text-white">
              Código do Grupo
            </label>
            <Input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Digite o código único do grupo"
              className="mt-1"
              maxLength={8}
            />
            <p className="text-xs text-[#64748B] dark:text-white/60 mt-1">
              O código é fornecido pelo criador do grupo
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleJoinGroup}
              disabled={isLoading || !codigo.trim()}
              className="flex-1 bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Entrar
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
