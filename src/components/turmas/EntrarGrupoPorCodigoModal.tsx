import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Key, AlertCircle, Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { verificarCodigoExiste } from "@/lib/grupoCodigoUtils";

interface EntrarGrupoPorCodigoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (grupoId: string) => void;
}

interface BuscarGruposPorCodigoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGrupo: (codigo: string) => void;
}

const BuscarGruposPorCodigoModal: React.FC<BuscarGruposPorCodigoModalProps> = ({
  isOpen,
  onClose,
  onSelectGrupo
}) => {
  if (!isOpen) return null;

  // Placeholder implementation
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-[#0F172A] dark:bg-[#0F172A] rounded-xl overflow-hidden w-[450px] max-w-full shadow-xl relative"
      >
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0F172A] to-[#0F172A] border-b border-[#1E293B] p-6">
          <h2 className="text-2xl font-bold text-white">Buscar Grupos (Placeholder)</h2>
        </div>
        <div className="p-6">
          <p className="text-white">Funcionalidade de busca de grupos em desenvolvimento...</p>
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </motion.div>
    </div>
  );
};

const EntrarGrupoPorCodigoModal: React.FC<EntrarGrupoPorCodigoModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [groupCode, setGroupCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showBuscarModal, setShowBuscarModal] = useState(false); // State for the search modal

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Converter para maiúsculas e remover espaços
    const code = e.target.value.toUpperCase().replace(/\s/g, '');
    setGroupCode(code);

    // Limpar mensagens de erro quando o usuário digita
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleJoinGroupByCode = async () => {
    if (!groupCode.trim()) {
      setError("Por favor, insira o código do grupo");
      return;
    }

    // Verificar formato do código (7 caracteres alfanuméricos)
    if (!/^[A-Z0-9]{7}$/.test(groupCode.trim())) {
      setError("Código inválido. O código deve ter 7 caracteres (letras e números).");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Verificar se o usuário está logado
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError("Você precisa estar logado para entrar em um grupo de estudo.");
        setIsProcessing(false);
        return;
      }

      // Verificar primeiro localmente se o código existe
      const codigoExisteLocal = verificarCodigoExiste(groupCode);

      if (codigoExisteLocal) {
        console.log("Código encontrado localmente:", groupCode);
      }

      // Buscar o grupo pelo código no Supabase
      const { data: grupoExistente, error: errorBusca } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('codigo', groupCode.toUpperCase())
        .single();

      if (errorBusca) {
        console.error("Erro ao verificar código no Supabase:", errorBusca);

        // Se não encontrou no Supabase mas existe localmente, tentar usar o local
        if (codigoExisteLocal) {
          // Buscar nos grupos locais
          const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
          const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');
          const grupoLocal = grupos.find((g: any) => 
            g.codigo && g.codigo.toUpperCase() === groupCode.toUpperCase());

          if (grupoLocal) {
            setSuccess(`Você entrou no grupo: ${grupoLocal.nome}`);

            // Chamar o callback de sucesso
            if (onSuccess) {
              onSuccess(grupoLocal.id);
            }

            // Fechar o modal após um breve delay
            setTimeout(() => {
              onClose();
              setGroupCode("");
              setSuccess(null);
            }, 1500);

            return;
          }
        }

        setError("Código de grupo inválido ou grupo não encontrado.");
        setIsProcessing(false);
        return;
      }

      // Verificar se o usuário já é membro do grupo
      const membrosIds = grupoExistente.membros_ids || [];

      if (membrosIds.includes(session.user.id) || grupoExistente.user_id === session.user.id) {
        setError("Você já é membro deste grupo.");
        setIsProcessing(false);
        return;
      }

      // Adicionar o usuário ao grupo
      const novosMembrosIds = [...membrosIds, session.user.id];

      // Atualizar o grupo no Supabase
      await supabase
        .from('grupos_estudo')
        .update({ 
          membros_ids: novosMembrosIds,
          membros: (grupoExistente.membros || 1) + 1
        })
        .eq('id', grupoExistente.id);

      // Atualizar no armazenamento local
      try {
        const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
        const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');

        // Verificar se o grupo já está no storage local
        const grupoIndex = grupos.findIndex((g: any) => g.id === grupoExistente.id);

        if (grupoIndex >= 0) {
          // Atualizar o grupo existente
          grupos[grupoIndex].membros_ids = novosMembrosIds;
          grupos[grupoIndex].membros = (grupoExistente.membros || 1) + 1;
        } else {
          // Adicionar o grupo ao storage local
          grupos.push({
            ...grupoExistente,
            membros_ids: novosMembrosIds,
            membros: (grupoExistente.membros || 1) + 1
          });
        }

        localStorage.setItem(GRUPOS_STORAGE_KEY, JSON.stringify(grupos));
      } catch (storageError) {
        console.error("Erro ao atualizar grupos no localStorage:", storageError);
      }

      // Exibir mensagem de sucesso
      setSuccess(`Você entrou no grupo: ${grupoExistente.nome}`);

      // Chamar o callback de sucesso
      if (onSuccess) {
        onSuccess(grupoExistente.id);
      }

      // Fechar o modal após um breve delay
      setTimeout(() => {
        onClose();
        setGroupCode("");
        setSuccess(null);
      }, 1500);

    } catch (error) {
      console.error("Erro ao entrar no grupo:", error);
      setError("Ocorreu um erro ao tentar entrar no grupo. Tente novamente mais tarde.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setGroupCode("");
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#0F172A] dark:bg-[#0F172A] rounded-xl overflow-hidden w-[450px] max-w-full shadow-xl relative"
        >
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0F172A] to-[#0F172A] border-b border-[#1E293B] p-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Key className="h-6 w-6 mr-3 text-[#FF6B00]" />
                Entrar em Grupo de Estudo
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
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#FF6B00]/20 p-3 rounded-full">
                  <Key className="h-6 w-6 text-[#FF6B00]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Adicionar Grupo por Código</h3>
                  <p className="text-sm text-gray-400">
                    Digite o código único do grupo que você deseja participar
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                <div className="flex justify-between items-center mb-2">
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
                  value={groupCode}
                  onChange={handleCodeChange}
                  placeholder="Ex: ABC1234"
                  className="w-full border-[#1E293B] bg-[#0F172A] text-white placeholder:text-gray-500 focus:border-[#FF6B00] uppercase tracking-wider text-center text-lg font-mono"
                  maxLength={7}
                />
                <p className="text-xs text-gray-500 mt-2">
                  O código do grupo é um identificador único de 7 caracteres fornecido pelo criador do grupo.
                </p>
              </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
                <AlertCircle className="text-red-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-green-500">{success}</p>
              </div>
            )}

            <div className="flex justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-[#1E293B] text-white hover:bg-[#1E293B] hover:text-white"
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#1E293B] text-white hover:bg-[#1E293B]/50 flex items-center"
                  onClick={() => setShowBuscarModal(true)}
                  disabled={true} {/* Inativo por enquanto, conforme solicitado */}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Grupos
                </Button>
                <Button
                  type="button"
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                  onClick={handleJoinGroupByCode}
                  disabled={isProcessing || !groupCode.trim()}
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Entrar no Grupo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de Busca de Grupos */}
      <BuscarGruposPorCodigoModal
        isOpen={showBuscarModal}
        onClose={() => setShowBuscarModal(false)}
        onSelectGrupo={(codigo) => {
          setGroupCode(codigo);
          setShowBuscarModal(false);
        }}
      />
    </AnimatePresence>
  );
};

export default EntrarGrupoPorCodigoModal;