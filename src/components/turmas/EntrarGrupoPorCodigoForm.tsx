
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { KeyRound, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { verificarSeCodigoExiste } from "@/lib/gruposEstudoStorage";

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
      // Verificar se o código existe
      const codigoExiste = await verificarSeCodigoExiste(codigo.toUpperCase());
      
      if (!codigoExiste) {
        toast({
          title: "Código inválido",
          description: "O código informado não corresponde a nenhum grupo.",
          variant: "destructive",
        });
        setIsLoading(false);
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
          title: "Erro ao entrar no grupo",
          description: "Não foi possível entrar no grupo. Tente novamente.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
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
            placeholder="Digite o código do grupo (ex: ABC1234)"
            className="pl-9 bg-[#1E293B] border-[#1E293B] text-white focus:border-[#FF6B00] font-mono uppercase"
            maxLength={7}
          />
        </div>
        <Button 
          type="submit" 
          className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          disabled={isLoading || !codigo.trim()}
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
        O código consiste em 7 caracteres e pode ser obtido com o administrador do grupo.
      </p>
    </form>
  );
};

export default EntrarGrupoPorCodigoForm;
