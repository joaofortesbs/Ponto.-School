
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Key, KeyRound, ArrowRight, Search, Users } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { verificarSeCodigoExiste } from "@/lib/gruposEstudoStorage";
import { Badge } from "@/components/ui/badge";

const EntrarGrupoPorCodigoForm: React.FC = () => {
  const [codigo, setCodigo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [grupoInfo, setGrupoInfo] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();

  const handleVerificarCodigo = async () => {
    if (!codigo.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, digite o código do grupo.",
        variant: "destructive",
      });
      return;
    }
    
    setIsChecking(true);
    setGrupoInfo(null);
    
    try {
      // Verificar se o código existe
      const codigoExiste = await verificarSeCodigoExiste(codigo.toUpperCase());
      
      if (!codigoExiste) {
        toast({
          title: "Código inválido",
          description: "O código informado não corresponde a nenhum grupo.",
          variant: "destructive",
        });
        setIsChecking(false);
        return;
      }
      
      // Buscar informações do grupo
      const { data: grupo, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('codigo', codigo.toUpperCase())
        .single();
      
      if (error) {
        console.error("Erro ao buscar grupo:", error);
        toast({
          title: "Erro ao verificar grupo",
          description: "Não foi possível verificar o grupo. Tente novamente.",
          variant: "destructive",
        });
        setIsChecking(false);
        return;
      }
      
      // Mostrar informações do grupo
      setGrupoInfo(grupo);
      
    } catch (error) {
      console.error("Erro ao processar verificação do grupo:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao verificar o código. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

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
      // Se já temos as informações do grupo, usamos elas
      const grupo = grupoInfo || await verificarEBuscarGrupo();
      
      if (!grupo) {
        setIsLoading(false);
        return; // O erro já foi tratado em verificarEBuscarGrupo
      }
      
      // Verificar privacidade do grupo
      if (grupo.privacidade === "Privado (apenas por convite)") {
        // Verificar se o usuário está na lista de convidados
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
        
        const convidados = grupo.convidados || [];
        if (!convidados.includes(user.id)) {
          toast({
            title: "Acesso restrito",
            description: "Este grupo é privado e requer convite do administrador.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }
      
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

  const verificarEBuscarGrupo = async () => {
    // Verificar se o código existe
    const codigoExiste = await verificarSeCodigoExiste(codigo.toUpperCase());
    
    if (!codigoExiste) {
      toast({
        title: "Código inválido",
        description: "O código informado não corresponde a nenhum grupo.",
        variant: "destructive",
      });
      return null;
    }
    
    // Buscar informações do grupo
    const { data: grupo, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('codigo', codigo.toUpperCase())
      .single();
    
    if (error) {
      console.error("Erro ao buscar grupo:", error);
      toast({
        title: "Erro ao entrar no grupo",
        description: "Não foi possível entrar no grupo. Tente novamente.",
        variant: "destructive",
      });
      return null;
    }
    
    return grupo;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
      <h3 className="text-lg font-medium text-white mb-2 flex items-center">
        <Key className="h-5 w-5 mr-2 text-[#FF6B00]" /> Entrar com código
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        Digite o código de convite para entrar em um grupo de estudos existente.
      </p>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <KeyRound className="h-4 w-4" />
          </div>
          <Input
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value.toUpperCase());
              if (grupoInfo) setGrupoInfo(null);
            }}
            placeholder="Digite o código do grupo (ex: ABC1234)"
            className="pl-9 bg-[#1E293B] border-[#1E293B] text-white focus:border-[#FF6B00] font-mono uppercase"
            maxLength={7}
          />
        </div>
        <Button 
          type="button" 
          className="bg-[#1E293B] hover:bg-[#2D3748] text-white border border-[#1E293B]"
          onClick={handleVerificarCodigo}
          disabled={isChecking || !codigo.trim()}
        >
          {isChecking ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="h-4 w-4 mr-1" /> Verificar
            </>
          )}
        </Button>
      </div>
      
      {grupoInfo && (
        <div className="mt-4 p-4 bg-[#1E293B]/60 rounded-lg border border-[#1E293B] animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-[#FF6B00]" />
              </div>
              <div>
                <h4 className="text-white font-medium">{grupoInfo.nome}</h4>
                <p className="text-sm text-gray-400">{grupoInfo.disciplina} • {grupoInfo.membros || 1} participante(s)</p>
              </div>
            </div>
            <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30">
              {grupoInfo.codigo}
            </Badge>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              type="submit" 
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-1" /> Entrar no Grupo
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      
      {!grupoInfo && codigo.trim() && (
        <p className="text-xs text-gray-500 mt-1">
          Após inserir o código, clique em "Verificar" para validar o código do grupo.
        </p>
      )}
    </form>
  );
};

export default EntrarGrupoPorCodigoForm;
