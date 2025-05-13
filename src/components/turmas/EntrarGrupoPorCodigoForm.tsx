
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { KeyRound, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { verificarSeCodigoExiste, salvarGrupoLocal } from "@/lib/gruposEstudoStorage";

const EntrarGrupoPorCodigoForm: React.FC = () => {
  const [codigo, setCodigo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigo.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, digite o código do grupo.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Normalizar o código (remover espaços e converter para maiúsculas)
      const codigoNormalizado = codigo.trim().toUpperCase();
      
      // Verificar se o código existe
      const codigoExiste = await verificarSeCodigoExiste(codigoNormalizado);
      
      if (!codigoExiste) {
        toast({
          title: "Código inválido",
          description: "O código informado não corresponde a nenhum grupo.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Obter a sessão atual do usuário
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Autenticação necessária",
          description: "Você precisa estar logado para entrar em um grupo.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Buscar informações completas do grupo
      const { data: grupo, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('codigo', codigoNormalizado)
        .single();
      
      if (error) {
        console.error("Erro ao buscar grupo:", error);
        
        // Tentar buscar no armazenamento local como fallback
        const gruposLocais = obterGruposLocal();
        const grupoLocal = gruposLocais.find(g => 
          g.codigo && g.codigo.toUpperCase() === codigoNormalizado
        );
        
        if (!grupoLocal) {
          toast({
            title: "Erro ao entrar no grupo",
            description: "Não foi possível encontrar o grupo. Tente novamente.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Se encontrado localmente, usar este grupo
        const grupo = grupoLocal;
        
        // Verificar privacidade do grupo
        if (grupo.privado || grupo.visibilidade === "Privado (apenas por convite)") {
          // Verificar se o usuário já é membro ou está na lista de convidados
          const convidados = grupo.convidados || [];
          const membrosIds = grupo.membros_ids || [];
          
          if (!convidados.includes(user.id) && !membrosIds.includes(user.id) && grupo.user_id !== user.id) {
            toast({
              title: "Acesso restrito",
              description: "Este grupo é privado e requer convite do administrador.",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
        }
        
        // Adicionar usuário à lista de membros se ainda não estiver
        const membrosIds = grupo.membros_ids || [];
        if (!membrosIds.includes(user.id) && grupo.user_id !== user.id) {
          // Adicionar à lista local
          membrosIds.push(user.id);
          grupo.membros_ids = membrosIds;
          grupo.membros = (grupo.membros || 1) + 1;
          
          // Salvar no armazenamento local
          await salvarGrupoLocal(grupo);
          
          toast({
            title: "Grupo encontrado!",
            description: `Você entrou no grupo "${grupo.nome}"`,
          });
          
          navigate(`/turmas/grupos/${grupo.id}`);
          setIsLoading(false);
          return;
        }
      }
      
      // Verificar privacidade do grupo
      if (grupo.privado || grupo.visibilidade === "Privado (apenas por convite)") {
        // Verificar se o usuário já é membro ou está na lista de convidados
        const convidados = grupo.convidados || [];
        const membrosIds = grupo.membros_ids || [];
        
        if (!convidados.includes(user.id) && !membrosIds.includes(user.id) && grupo.user_id !== user.id) {
          toast({
            title: "Acesso restrito",
            description: "Este grupo é privado e requer convite do administrador.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }
      
      // Adicionar usuário à lista de membros se ainda não estiver
      const membrosIds = grupo.membros_ids || [];
      if (!membrosIds.includes(user.id) && grupo.user_id !== user.id) {
        // Adicionar o usuário à lista de membros
        const novosMembrosIds = [...membrosIds, user.id];
        
        // Atualizar o grupo no Supabase
        const { error: updateError } = await supabase
          .from('grupos_estudo')
          .update({ 
            membros_ids: novosMembrosIds,
            membros: (grupo.membros || 1) + 1 // Incrementar contador de membros
          })
          .eq('id', grupo.id);
        
        if (updateError) {
          console.error("Erro ao atualizar membros do grupo:", updateError);
        }
        
        // Também atualizar localmente para garantir visualização imediata
        grupo.membros_ids = novosMembrosIds;
        grupo.membros = (grupo.membros || 1) + 1;
      }
      
      // Salvar o grupo no armazenamento local para acesso offline
      salvarGrupoLocal(grupo);
      
      // Navegar para a página do grupo
      toast({
        title: "Grupo encontrado!",
        description: `Você entrou no grupo "${grupo.nome}"`,
      });
      
      navigate(`/turmas/grupos/${grupo.id}`);
    } catch (error) {
      console.error("Erro ao processar entrada no grupo:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar entrar no grupo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <KeyRound className="h-4 w-4" />
          </div>
          <Input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Digite o código do grupo"
            className="pl-9 bg-[#1E293B] border-[#1E293B] text-white focus:border-[#FF6B00] font-mono"
            maxLength={10}
          />
        </div>
        <Button 
          type="submit" 
          className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ArrowRight className="h-4 w-4 mr-1" /> Entrar
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-gray-400">
        Digite o código de convite do grupo para encontrá-lo automaticamente.
      </p>
    </form>
  );
};

export default EntrarGrupoPorCodigoForm;
