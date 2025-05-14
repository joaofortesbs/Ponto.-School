
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { verificarSeCodigoExiste, buscarCodigoGrupo } from "@/lib/codigosGruposService";
import { gruposEstudoStorage } from "@/lib/gruposEstudoStorage";
import BuscarGruposPorCodigoModal from "./minisecao-gruposdeestudo/interface/BuscarGruposPorCodigoModal";

interface EntrarGrupoPorCodigoModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCode?: string;
}

export const EntrarGrupoPorCodigoModal: React.FC<EntrarGrupoPorCodigoModalProps> = ({
  isOpen,
  onClose,
  preselectedCode = "",
}) => {
  const [codigo, setCodigo] = useState(preselectedCode);
  const [verificando, setVerificando] = useState(false);
  const [codigoExiste, setCodigoExiste] = useState<boolean | null>(null);
  const [mensagemErro, setMensagemErro] = useState("");
  const [showBuscarModal, setShowBuscarModal] = useState(false);
  const [acessoConcedido, setAcessoConcedido] = useState(false);
  
  // Efeito para verificar o código quando ele é preenchido automaticamente
  useEffect(() => {
    if (preselectedCode) {
      verificarCodigo(preselectedCode);
    }
  }, [preselectedCode]);
  
  const verificarCodigo = async (codigoParam: string = codigo) => {
    if (!codigoParam || codigoParam.length < 6) {
      setCodigoExiste(null);
      setMensagemErro("");
      return;
    }
    
    setVerificando(true);
    setCodigoExiste(null);
    setMensagemErro("");
    
    try {
      const existe = await verificarSeCodigoExiste(codigoParam);
      setCodigoExiste(existe);
      
      if (!existe) {
        setMensagemErro("Código inválido ou grupo não encontrado");
      }
    } catch (error) {
      console.error("Erro ao verificar código:", error);
      setCodigoExiste(false);
      setMensagemErro("Erro ao verificar código. Tente novamente.");
    } finally {
      setVerificando(false);
    }
  };

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 7);
    setCodigo(valor);
    
    if (valor.length === 7) {
      verificarCodigo(valor);
    } else if (codigoExiste !== null) {
      setCodigoExiste(null);
      setMensagemErro("");
    }
  };

  const entrarNoGrupo = async () => {
    if (!codigo || !codigoExiste) return;
    
    setVerificando(true);
    
    try {
      const grupoInfo = await buscarCodigoGrupo(codigo);
      
      if (!grupoInfo) {
        setMensagemErro("Erro ao obter informações do grupo");
        setCodigoExiste(false);
        return;
      }
      
      // Adicionar o grupo na lista de grupos do usuário
      const novoGrupo = {
        id: grupoInfo.grupo_id,
        nome: grupoInfo.nome_grupo,
        descricao: grupoInfo.descricao,
        codigo: grupoInfo.codigo,
        dataCriacao: new Date().toISOString(),
        criadorId: grupoInfo.criado_por,
        membros: [],
        topicos: [],
        materiais: []
      };
      
      await gruposEstudoStorage.adicionarGrupo(novoGrupo);
      
      // Mostrar mensagem de sucesso e fechar o modal
      setAcessoConcedido(true);
      setTimeout(() => {
        onClose();
        window.location.href = `/turmas/grupos/${grupoInfo.grupo_id}`;
      }, 1500);
      
    } catch (error) {
      console.error("Erro ao entrar no grupo:", error);
      setMensagemErro("Erro ao entrar no grupo. Tente novamente.");
      setCodigoExiste(false);
    } finally {
      setVerificando(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-[#0F172A] text-white border-[#1E293B]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Entrar em um Grupo por Código
            </DialogTitle>
          </DialogHeader>

          {acessoConcedido ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Acesso Concedido!</h3>
              <p className="text-gray-400 text-center">
                Você entrou no grupo com sucesso. Redirecionando...
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="grupoCodigo" className="block text-sm font-medium text-white/70">
                      Código do Grupo <span className="text-[#FF6B00]">*</span>
                    </label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      className="text-[#FF6B00] hover:text-[#FF7A1A] hover:bg-[#FF6B00]/10 text-xs h-7"
                      onClick={() => setShowBuscarModal(true)}
                    >
                      <Search className="h-3 w-3 mr-1" />
                      Buscar grupos
                    </Button>
                  </div>
                  <Input
                    id="grupoCodigo"
                    placeholder="Exemplo: AB1C2D3"
                    value={codigo}
                    onChange={handleCodigoChange}
                    className="w-full border-[#1E293B] bg-[#0F172A] text-white placeholder:text-gray-500 focus:border-[#FF6B00] uppercase tracking-wider text-center text-lg font-mono"
                    maxLength={7}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    O código do grupo é um identificador único de 7 caracteres fornecido pelo criador do grupo.
                  </p>
                </div>

                {verificando && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-[#FF6B00]" />
                  </div>
                )}

                {codigoExiste === false && !verificando && (
                  <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-3 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-400">{mensagemErro || "Código inválido ou grupo não encontrado"}</p>
                  </div>
                )}

                {codigoExiste === true && !verificando && (
                  <div className="bg-green-900/20 border border-green-900/50 rounded-lg p-3 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <p className="text-sm text-green-400">Código válido! Clique em Entrar para acessar o grupo.</p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-between sm:justify-between">
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-[#1E293B]"
                >
                  Cancelar
                </Button>
                <Button 
                  type="button"
                  onClick={entrarNoGrupo}
                  disabled={!codigoExiste || verificando}
                  className={`${
                    codigoExiste
                      ? "bg-[#FF6B00] hover:bg-[#FF8C40]"
                      : "bg-gray-700 cursor-not-allowed"
                  } text-white ml-auto`}
                >
                  {verificando ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {showBuscarModal && (
        <BuscarGruposPorCodigoModal
          isOpen={showBuscarModal}
          onClose={() => setShowBuscarModal(false)}
          onSelectCodigo={(codigo) => {
            setCodigo(codigo);
            setShowBuscarModal(false);
            verificarCodigo(codigo);
          }}
        />
      )}
    </>
  );
};
