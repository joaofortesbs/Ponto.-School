
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { KeyRound, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { obterGrupoPorCodigo, adicionarUsuarioAoGrupo, salvarGrupoLocal } from "@/lib/gruposEstudoStorage";

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
      
      // 1. VERIFICAR COM O SERVIDOR DE CÓDIGOS
      try {
        const resposta = await fetch(`/api/codigos-grupo/verificar/${codigoNormalizado}`);
        const resultado = await resposta.json();
        
        if (!resultado.sucesso || !resultado.existe) {
          toast({
            title: "Código inválido",
            description: "O código informado não corresponde a nenhum grupo.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Verificar se o grupo é privado
        if (resultado.privado) {
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
          
          // Validar acesso ao grupo privado
          const validacaoResposta = await fetch('/api/codigos-grupo/validar-acesso', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              codigo: codigoNormalizado,
              userId: user.id
            })
          });
          
          const validacaoDados = await validacaoResposta.json();
          
          if (!validacaoDados.sucesso || !validacaoDados.acesso) {
            toast({
              title: "Acesso restrito",
              description: "Este grupo é privado e requer convite do administrador.",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
        }
        
        // 2. OBTER DADOS DO GRUPO E ADICIONAR USUÁRIO
        const grupoId = resultado.grupoId;
        
        // Obter informações completas do grupo usando o obterGrupoPorCodigo
        const grupo = await obterGrupoPorCodigo(codigoNormalizado);
        
        if (!grupo) {
          toast({
            title: "Erro ao obter grupo",
            description: "Não foi possível encontrar os detalhes do grupo. Tente novamente.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Adicionar o usuário ao grupo
        const sucesso = await adicionarUsuarioAoGrupo(grupo.id, codigoNormalizado);
        
        if (!sucesso) {
          toast({
            title: "Erro ao entrar no grupo",
            description: "Não foi possível adicionar você ao grupo. Tente novamente.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Sucesso! Navegar para a página do grupo
        toast({
          title: "Grupo encontrado!",
          description: `Você entrou no grupo "${grupo.nome}"`,
        });
        
        navigate(`/turmas/grupos/${grupo.id}`);
      } catch (serverError) {
        console.error("Erro ao comunicar com servidor de códigos:", serverError);
        
        // 3. FALLBACK: Usar a lógica anterior como backup caso o servidor falhe
        // Obter grupo diretamente por código usando a função que faz fallback para fontes locais
        const grupo = await obterGrupoPorCodigo(codigoNormalizado);
        
        if (!grupo) {
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
        
        // Verificar privacidade do grupo no modo fallback
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
        
        // Adicionar o usuário ao grupo usando a função que gerencia todo o processo
        const sucesso = await adicionarUsuarioAoGrupo(grupo.id, codigoNormalizado);
        
        if (!sucesso) {
          toast({
            title: "Erro ao entrar no grupo",
            description: "Não foi possível adicionar você ao grupo. Tente novamente.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Navigar para a página do grupo
        toast({
          title: "Grupo encontrado!",
          description: `Você entrou no grupo "${grupo.nome}"`,
        });
        
        navigate(`/turmas/grupos/${grupo.id}`);
      }
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
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="Digite o código do grupo"
            className="pl-9 bg-[#1E293B] border-[#1E293B] text-white focus:border-[#FF6B00] font-mono uppercase"
            maxLength={7}
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
