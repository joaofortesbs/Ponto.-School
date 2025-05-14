
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { KeyRound, ArrowRight, Send, AlertCircle, Check, X, Info, Shield } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { 
  obterGrupoPorCodigo, 
  adicionarUsuarioAoGrupo, 
  salvarGrupoLocal,
  verificarSeCodigoExiste
} from "@/lib/gruposEstudoStorage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EntrarGrupoPorCodigoForm: React.FC = () => {
  const [codigo, setCodigo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [grupoVerificado, setGrupoVerificado] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "notFound" | "alreadyMember" | "private" | "success">("idle");
  const [mensagemSolicitacao, setMensagemSolicitacao] = useState("");

  // Verificar status do código
  const verificarCodigo = async () => {
    if (!codigo.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, digite o código do grupo.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setStatus("loading");
    
    try {
      // Normalizar o código (remover espaços e converter para maiúsculas)
      const codigoNormalizado = codigo.trim().toUpperCase();
      
      console.log("Verificando código:", codigoNormalizado);
      
      // Obter a sessão atual do usuário para todas as operações
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Autenticação necessária",
          description: "Você precisa estar logado para entrar em um grupo.",
          variant: "destructive",
        });
        setIsLoading(false);
        setStatus("idle");
        return;
      }
      
      // 1. Verificar se o código existe
      const codigoExiste = await verificarSeCodigoExiste(codigoNormalizado);
      
      if (!codigoExiste) {
        console.log("Código não encontrado");
        setStatus("notFound");
        setIsLoading(false);
        return;
      }
      
      // 2. Obter detalhes do grupo
      const grupoEncontrado = await obterGrupoPorCodigo(codigoNormalizado);
      
      if (!grupoEncontrado) {
        console.log("Grupo não encontrado com o código fornecido");
        setStatus("notFound");
        setIsLoading(false);
        return;
      }
      
      setGrupoVerificado(grupoEncontrado);
      console.log("Grupo encontrado:", grupoEncontrado);
      
      // 3. Verificar se o usuário já é membro
      const membrosIds = grupoEncontrado.membros_ids || [];
      
      if (membrosIds.includes(user.id) || grupoEncontrado.user_id === user.id) {
        console.log("Usuário já é membro do grupo");
        setStatus("alreadyMember");
        setIsLoading(false);
        return;
      }
      
      // 4. Verificar se o grupo é privado
      if (grupoEncontrado.privado || grupoEncontrado.visibilidade === "Privado (apenas por convite)") {
        console.log("Grupo é privado");
        
        // Verificar se o usuário está na lista de convidados
        const convidados = grupoEncontrado.convidados || [];
        
        if (!convidados.includes(user.id) && grupoEncontrado.user_id !== user.id) {
          console.log("Usuário não está na lista de convidados");
          setStatus("private");
          setIsLoading(false);
          return;
        }
      }
      
      // Se chegou aqui, o usuário pode entrar no grupo
      setStatus("success");
      setIsLoading(false);
      
    } catch (error) {
      console.error("Erro ao verificar código:", error);
      toast({
        title: "Erro ao verificar código",
        description: "Ocorreu um erro ao verificar o código do grupo. Tente novamente.",
        variant: "destructive",
      });
      setStatus("idle");
      setIsLoading(false);
    }
  };

  // Realizar entrada no grupo
  const entrarNoGrupo = async () => {
    if (!grupoVerificado) return;
    
    setIsLoading(true);
    
    try {
      console.log("Adicionando usuário ao grupo:", grupoVerificado.id);
      const sucesso = await adicionarUsuarioAoGrupo(grupoVerificado.id, codigo.trim().toUpperCase());
      
      if (!sucesso) {
        throw new Error("Falha ao adicionar usuário ao grupo");
      }
      
      // Disparar evento de atualização
      const grupoAdicionadoEvent = new CustomEvent('grupoAdicionado', { 
        detail: { 
          grupo: grupoVerificado 
        }
      });
      window.dispatchEvent(grupoAdicionadoEvent);
      
      // Salvar o grupo localmente
      salvarGrupoLocal(grupoVerificado);
      
      toast({
        title: "Sucesso!",
        description: `Você entrou no grupo "${grupoVerificado.nome}"`,
      });
      
      // Resetar estado
      setCodigo("");
      setGrupoVerificado(null);
      setStatus("idle");
      
    } catch (error) {
      console.error("Erro ao entrar no grupo:", error);
      toast({
        title: "Erro ao entrar no grupo",
        description: "Ocorreu um erro ao tentar entrar no grupo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar solicitação para grupo privado
  const enviarSolicitacao = async () => {
    if (!grupoVerificado) return;
    
    setIsLoading(true);
    
    try {
      // Obter a sessão atual do usuário
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Adicionar usuário à lista de solicitações pendentes do grupo
      const { error } = await supabase
        .from('grupos_solicitacoes')
        .insert({
          grupo_id: grupoVerificado.id,
          user_id: user.id,
          mensagem: mensagemSolicitacao,
          status: 'pendente',
          data_solicitacao: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Solicitação enviada",
        description: `Sua solicitação para entrar no grupo "${grupoVerificado.nome}" foi enviada. Aguarde a aprovação do administrador.`,
      });
      
      // Resetar estado
      setCodigo("");
      setGrupoVerificado(null);
      setStatus("idle");
      setMensagemSolicitacao("");
      
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      
      // Em caso de erro, salvar solicitação localmente para tentar sincronizar depois
      try {
        const solicitacoesPendentes = JSON.parse(localStorage.getItem('epictus_solicitacoes_pendentes') || '[]');
        solicitacoesPendentes.push({
          grupo_id: grupoVerificado.id,
          grupo_nome: grupoVerificado.nome,
          mensagem: mensagemSolicitacao,
          data_solicitacao: new Date().toISOString()
        });
        localStorage.setItem('epictus_solicitacoes_pendentes', JSON.stringify(solicitacoesPendentes));
        
        toast({
          title: "Solicitação salva localmente",
          description: "Sua solicitação foi salva e será enviada quando a conexão for restabelecida.",
        });
      } catch (e) {
        console.error("Erro ao salvar solicitação localmente:", e);
        toast({
          title: "Erro ao enviar solicitação",
          description: "Ocorreu um erro ao tentar enviar sua solicitação. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar componentes de status
  const renderStatusMessage = () => {
    switch (status) {
      case "notFound":
        return (
          <Alert variant="destructive" className="mt-3 animate-in fade-in-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Grupo não encontrado</AlertTitle>
            <AlertDescription>
              O código "{codigo.toUpperCase()}" não corresponde a nenhum grupo existente.
            </AlertDescription>
          </Alert>
        );
        
      case "alreadyMember":
        return (
          <Alert className="mt-3 animate-in fade-in-50 border-amber-500 text-amber-500">
            <Info className="h-4 w-4" />
            <AlertTitle>Você já faz parte deste grupo</AlertTitle>
            <AlertDescription>
              Você já é membro do grupo "{grupoVerificado?.nome}".
            </AlertDescription>
          </Alert>
        );
        
      case "private":
        return (
          <div className="mt-3 space-y-3 animate-in fade-in-50">
            <Alert variant="default" className="border-[#FF6B00]">
              <Shield className="h-4 w-4" />
              <AlertTitle>Grupo privado</AlertTitle>
              <AlertDescription>
                O grupo "{grupoVerificado?.nome}" é privado e requer autorização do administrador.
              </AlertDescription>
            </Alert>
            
            <div className="p-3 border border-[#1E293B] rounded-lg bg-[#0F172A]">
              <h4 className="text-sm font-medium text-white mb-2">Enviar solicitação de acesso</h4>
              <textarea
                value={mensagemSolicitacao}
                onChange={(e) => setMensagemSolicitacao(e.target.value)}
                placeholder="Deixe uma mensagem para o administrador do grupo (opcional)"
                className="w-full h-20 p-2 text-sm bg-[#1E293B] border-[#1E293B] rounded-md text-white focus:border-[#FF6B00] resize-none mb-2"
              />
              <Button
                type="button"
                className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90"
                onClick={enviarSolicitacao}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" /> Enviar solicitação
                  </>
                )}
              </Button>
            </div>
          </div>
        );
        
      case "success":
        return (
          <div className="mt-3 space-y-3 animate-in fade-in-50">
            <Alert className="border-green-500">
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-500">Grupo encontrado!</AlertTitle>
              <AlertDescription>
                <div className="text-gray-300 mb-2">
                  Você pode entrar no grupo "{grupoVerificado?.nome}".
                </div>
                <Button
                  type="button"
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  onClick={entrarNoGrupo}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Confirmar entrada
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        );
        
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verificarCodigo();
  };

  const resetForm = () => {
    setCodigo("");
    setGrupoVerificado(null);
    setStatus("idle");
    setMensagemSolicitacao("");
  };

  return (
    <div className="flex flex-col">
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
              disabled={status !== "idle" && status !== "notFound"}
            />
          </div>
          {status === "idle" || status === "notFound" ? (
            <Button 
              type="submit" 
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
              disabled={isLoading || !codigo.trim()}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-1" /> Verificar
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="border-[#1E293B] text-white hover:bg-[#1E293B]"
              onClick={resetForm}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" /> Cancelar
            </Button>
          )}
        </div>
        
        {status === "idle" && (
          <p className="text-xs text-gray-400">
            Digite o código de convite do grupo para encontrá-lo automaticamente.
          </p>
        )}
      </form>
      
      {renderStatusMessage()}
    </div>
  );
};

export default EntrarGrupoPorCodigoForm;
