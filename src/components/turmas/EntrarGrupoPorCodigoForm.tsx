
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EntrarGrupoPorCodigoFormProps {
  onGroupJoined: () => void;
}

export default function EntrarGrupoPorCodigoForm({ onGroupJoined }: EntrarGrupoPorCodigoFormProps) {
  const [codigo, setCodigo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleJoinGroup = async () => {
    if (!codigo.trim()) {
      setError('Por favor, digite o código do grupo');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      // Buscar o grupo pelo código
      const { data: group, error: groupError } = await supabase
        .from('grupos_estudo')
        .select('id, nome, user_id')
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
          user_id: user.id
        });

      if (memberError) {
        console.error('Erro ao ingressar no grupo:', memberError);
        setError('Erro ao ingressar no grupo. Tente novamente.');
        return;
      }

      // Sucesso
      setSuccess(`Você ingressou no grupo "${group.nome}" com sucesso!`);
      setCodigo('');
      setTimeout(() => {
        setSuccess('');
        onGroupJoined();
      }, 2000);
      
    } catch (error) {
      console.error('Erro inesperado:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Search className="h-4 w-4 text-[#FF6B00]" />
        <h4 className="font-medium text-[#29335C] dark:text-white">
          Entrar com Código
        </h4>
      </div>
      
      <div className="flex gap-2">
        <Input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="Digite o código do grupo"
          className="flex-1"
          maxLength={8}
        />
        <Button
          onClick={handleJoinGroup}
          disabled={isLoading || !codigo.trim()}
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Users className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded text-sm text-green-700 dark:text-green-300">
          {success}
        </div>
      )}

      <p className="text-xs text-[#64748B] dark:text-white/60 mt-2">
        O código é fornecido pelo criador do grupo
      </p>
    </div>
  );
}
