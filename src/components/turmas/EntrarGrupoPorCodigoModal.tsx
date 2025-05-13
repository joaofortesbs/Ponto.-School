
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  X, Key, LogIn, AlertTriangle, Check, Lock, Info
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buscarGrupoPorCodigo, entrarEmGrupoPorCodigo } from "@/lib/grupoCodigoUtils";

interface EntrarGrupoPorCodigoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EntrarGrupoPorCodigoModal: React.FC<EntrarGrupoPorCodigoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grupoInfo, setGrupoInfo] = useState<any | null>(null);
  const [requiresSenha, setRequiresSenha] = useState(false);
  const navigate = useNavigate();

  const handleVerificarCodigo = async () => {
    if (!codigo.trim()) {
      setError("Por favor, digite o código do grupo.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Buscar informações do grupo pelo código
      const grupo = await buscarGrupoPorCodigo(codigo);

      if (!grupo) {
        setError("Código inválido. Nenhum grupo encontrado com este código.");
        setGrupoInfo(null);
        setRequiresSenha(false);
      } else {
        setGrupoInfo(grupo);
        
        // Verificar se o grupo é privado e requer senha
        if (grupo.privado || grupo.visibilidade === "Privado (apenas por convite)") {
          setRequiresSenha(true);
        } else {
          setRequiresSenha(false);
        }
      }
    } catch (err) {
      console.error("Erro ao verificar código:", err);
      setError("Ocorreu um erro ao verificar o código. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEntrarGrupo = async () => {
    if (!codigo.trim()) {
      setError("Por favor, digite o código do grupo.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Entrar no grupo usando o código (e senha se necessário)
      const resultado = await entrarEmGrupoPorCodigo(codigo, requiresSenha ? senha : undefined);

      if (resultado.sucesso) {
        toast({
          title: "Sucesso!",
          description: resultado.mensagem,
        });
        
        // Fechar o modal e navegar para a página do grupo
        onClose();
        
        if (resultado.grupo && resultado.grupo.id) {
          navigate(`/turmas/grupos/${resultado.grupo.id}`);
        } else {
          navigate(`/turmas/grupos`);
        }
      } else {
        setError(resultado.mensagem);
      }
    } catch (err) {
      console.error("Erro ao entrar no grupo:", err);
      setError("Ocorreu um erro ao tentar entrar no grupo. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetar = () => {
    setCodigo("");
    setSenha("");
    setError(null);
    setGrupoInfo(null);
    setRequiresSenha(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-[#0F172A] text-white overflow-hidden">
        <div className="relative">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0F172A] to-[#0F172A] border-b border-[#1E293B] p-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Key className="h-6 w-6 mr-3 text-[#FF6B00]" />
                Entrar em Grupo por Código
              </h2>
              <p className="text-white/70 text-sm mt-1">
                Digite o código único do grupo que deseja participar
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-9 w-9 rounded-full text-white/80 hover:text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6">
            <div className="bg-[#1E293B]/50 rounded-lg p-6 border border-[#1E293B] mb-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="grupoCodigo" className="block text-sm font-medium text-white/70 mb-2">
                    Código do Grupo <span className="text-[#FF6B00]">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="grupoCodigo"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                      placeholder="Ex: ABC1234"
                      className="flex-1 border-[#1E293B] bg-[#0F172A] text-white placeholder:text-gray-500 focus:border-[#FF6B00] tracking-wider uppercase"
                      maxLength={7}
                      disabled={isLoading || (grupoInfo !== null)}
                    />
                    {!grupoInfo ? (
                      <Button
                        type="button"
                        onClick={handleVerificarCodigo}
                        className="bg-[#1E293B] hover:bg-[#1E293B]/80 text-white"
                        disabled={isLoading || !codigo.trim()}
                      >
                        {isLoading ? (
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <LogIn className="h-4 w-4" />
                        )}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleResetar}
                        className="border-[#1E293B] text-white hover:bg-[#1E293B]"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    O código do grupo é um identificador único de 7 caracteres fornecido pelo criador do grupo.
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-900/20 text-red-400 border-red-900">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {grupoInfo && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-[#0F172A] border border-[#1E293B] rounded-lg p-4">
                      <h3 className="font-medium text-lg text-white">{grupoInfo.nome}</h3>
                      <div className="flex items-center text-sm text-gray-400 mt-1">
                        <Info className="h-3.5 w-3.5 mr-1" />
                        <span>
                          {grupoInfo.privado || grupoInfo.visibilidade === "Privado (apenas por convite)" 
                            ? "Grupo Privado" 
                            : "Grupo Público"}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{grupoInfo.membros || 1} membros</span>
                      </div>
                      
                      {grupoInfo.descricao && (
                        <p className="text-sm text-white/80 mt-3 line-clamp-2">
                          {grupoInfo.descricao}
                        </p>
                      )}
                    </div>

                    {requiresSenha && (
                      <div>
                        <label htmlFor="grupoSenha" className="block text-sm font-medium text-white/70 mb-2 flex items-center">
                          <Lock className="h-4 w-4 mr-1.5 text-[#FF6B00]" />
                          Senha do Grupo <span className="text-[#FF6B00] ml-1">*</span>
                        </label>
                        <Input
                          id="grupoSenha"
                          type="password"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          placeholder="Digite a senha do grupo"
                          className="w-full border-[#1E293B] bg-[#0F172A] text-white placeholder:text-gray-500 focus:border-[#FF6B00]"
                          disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Este grupo é privado e requer senha para acesso.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-[#1E293B] text-white hover:bg-[#1E293B] hover:text-white"
              >
                Cancelar
              </Button>
              {grupoInfo && (
                <Button
                  type="button"
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                  onClick={handleEntrarGrupo}
                  disabled={isLoading || (requiresSenha && !senha)}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Entrar no Grupo
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EntrarGrupoPorCodigoModal;
