
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
      
      console.log("Iniciando busca de grupo com código:", codigoNormalizado);
      
      // Obter a sessão atual do usuário para todas as operações
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
      
      // 1. VERIFICAR COM O SERVIDOR DE CÓDIGOS
      let grupoEncontrado = null;
      let grupoId = null;
      
      try {
        console.log("Tentando verificar código com o servidor dedicado...");
        const resposta = await fetch(`/api/codigos-grupo/verificar/${codigoNormalizado}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!resposta.ok) {
          console.error(`Erro na resposta do servidor: ${resposta.status} - ${resposta.statusText}`);
          throw new Error(`Erro na resposta do servidor: ${resposta.status}`);
        }
        
        const resultado = await resposta.json();
        console.log("Resposta do servidor de códigos:", resultado);
        
        if (!resultado.sucesso || !resultado.existe) {
          console.log("Código não encontrado no servidor dedicado");
          throw new Error("Código não encontrado no servidor");
        }
        
        // Salvar o ID do grupo para uso posterior
        grupoId = resultado.grupoId;
        
        // Verificar se o grupo é privado
        if (resultado.privado) {
          console.log("Grupo é privado, validando acesso...");
          
          // Validar acesso ao grupo privado
          const validacaoResposta = await fetch('/api/codigos-grupo/validar-acesso', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
              codigo: codigoNormalizado,
              userId: user.id
            })
          });
          
          const validacaoDados = await validacaoResposta.json();
          console.log("Resposta de validação de acesso:", validacaoDados);
          
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
        
        console.log("Acesso verificado com sucesso, buscando detalhes do grupo...");
      } catch (serverError) {
        console.error("Erro ao comunicar com servidor de códigos:", serverError);
        // Continuamos para o fallback
      }
      
      // 2. OBTER DADOS COMPLETOS DO GRUPO
      try {
        // Se temos o ID do grupo, tentar buscar diretamente no Supabase
        if (grupoId) {
          console.log("Buscando grupo por ID no Supabase:", grupoId);
          
          try {
            const { data, error } = await supabase
              .from('grupos_estudo')
              .select('*')
              .eq('id', grupoId)
              .single();
              
            if (error) {
              console.error("Erro ao buscar grupo no Supabase:", error);
            } else if (data) {
              console.log("Grupo encontrado no Supabase:", data);
              grupoEncontrado = data;
            }
          } catch (supabaseError) {
            console.error("Erro ao acessar Supabase:", supabaseError);
          }
        }
        
        // Se ainda não encontramos, tentar pelo código
        if (!grupoEncontrado) {
          console.log("Buscando grupo por código usando a função auxiliar...");
          
          // Usar a função obterGrupoPorCodigo que tenta várias fontes
          grupoEncontrado = await obterGrupoPorCodigo(codigoNormalizado);
          
          if (grupoEncontrado) {
            console.log("Grupo encontrado via obterGrupoPorCodigo:", grupoEncontrado);
          } else {
            console.error("Grupo não encontrado em nenhuma fonte");
            
            // Última tentativa: buscar diretamente no Supabase pelo código
            try {
              console.log("Última tentativa: buscar diretamente no Supabase pelo código");
              const { data, error } = await supabase
                .from('grupos_estudo')
                .select('*')
                .eq('codigo', codigoNormalizado)
                .single();
                
              if (!error && data) {
                grupoEncontrado = data;
                console.log("Grupo encontrado diretamente no Supabase:", data);
              } else {
                console.error("Erro ou nenhum resultado do Supabase:", error);
              }
            } catch (finalError) {
              console.error("Erro na tentativa final:", finalError);
            }
          }
        }
        
        // Se ainda não encontramos o grupo, mostrar erro
        if (!grupoEncontrado) {
          toast({
            title: "Código inválido",
            description: "O código informado não corresponde a nenhum grupo.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // 3. VERIFICAR PRIVACIDADE DO GRUPO
        if (grupoEncontrado.privado || grupoEncontrado.visibilidade === "Privado (apenas por convite)") {
          console.log("Verificando acesso ao grupo privado no modo fallback...");
          
          // Verificar se o usuário já é membro ou está na lista de convidados
          const convidados = grupoEncontrado.convidados || [];
          const membrosIds = grupoEncontrado.membros_ids || [];
          
          if (!convidados.includes(user.id) && !membrosIds.includes(user.id) && grupoEncontrado.user_id !== user.id) {
            toast({
              title: "Acesso restrito",
              description: "Este grupo é privado e requer convite do administrador.",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
        }
        
        // 4. ADICIONAR USUÁRIO AO GRUPO
        console.log("Adicionando usuário ao grupo:", grupoEncontrado.id);
        const sucesso = await adicionarUsuarioAoGrupo(grupoEncontrado.id, codigoNormalizado);
        
        if (!sucesso) {
          console.error("Falha ao adicionar usuário ao grupo");
          toast({
            title: "Erro ao entrar no grupo",
            description: "Não foi possível adicionar você ao grupo. Tente novamente.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        console.log("Usuário adicionado com sucesso ao grupo");
        
        // 5. SUCESSO! MOSTRAR NOTIFICAÇÃO E ATUALIZAR LOCALMENTE
        toast({
          title: "Grupo encontrado!",
          description: `Você entrou no grupo "${grupoEncontrado.nome}"`,
        });
        
        // Adicionar o grupo à lista local sem redirecionar
        try {
          // Disparar um evento personalizado para atualizar a grade de grupos
          const grupoAdicionadoEvent = new CustomEvent('grupoAdicionado', { 
            detail: { 
              grupo: grupoEncontrado 
            }
          });
          window.dispatchEvent(grupoAdicionadoEvent);
          
          // Salvar o grupo localmente para garantir persistência
          if (grupoEncontrado) {
            salvarGrupoLocal(grupoEncontrado);
          }
          
          // Indicar que a operação foi concluída
          setIsLoading(false);
        } catch (err) {
          console.error("Erro ao atualizar lista de grupos:", err);
        }
      } catch (error) {
        console.error("Erro ao processar detalhes do grupo:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro ao processar os detalhes do grupo. Tente novamente.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro ao processar entrada no grupo:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar entrar no grupo. Tente novamente.",
        variant: "destructive",
      });
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
