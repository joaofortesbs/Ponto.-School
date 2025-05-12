
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, KeyRound, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { verificarSeCodigoExiste } from "@/lib/gruposEstudoStorage";

interface AdicionarGrupoPorCodigoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (grupoId: string) => void;
}

const AdicionarGrupoPorCodigoModal: React.FC<AdicionarGrupoPorCodigoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [codigo, setCodigo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigo.trim()) {
      setStatus("error");
      setErrorMessage("Por favor, digite o código do grupo.");
      return;
    }
    
    setIsLoading(true);
    setStatus("loading");
    
    try {
      // Verificar se o código existe
      const codigoFormatado = codigo.toUpperCase().trim();
      const codigoExiste = await verificarSeCodigoExiste(codigoFormatado);
      
      if (!codigoExiste) {
        setStatus("error");
        setErrorMessage("O código informado não corresponde a nenhum grupo.");
        setIsLoading(false);
        return;
      }
      
      // Buscar informações do grupo
      const { data: grupo, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('codigo', codigoFormatado)
        .single();
      
      if (error) {
        console.error("Erro ao buscar grupo:", error);
        setStatus("error");
        setErrorMessage("Não foi possível encontrar o grupo. Tente novamente.");
        setIsLoading(false);
        return;
      }
      
      // Verificar privacidade do grupo
      if (grupo.privacidade === "Privado (apenas por convite)") {
        // Verificar se o usuário está na lista de convidados
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setStatus("error");
          setErrorMessage("Você precisa estar logado para entrar em um grupo.");
          setIsLoading(false);
          return;
        }
        
        const convidados = grupo.convidados || [];
        if (!convidados.includes(user.id)) {
          setStatus("error");
          setErrorMessage("Este grupo é privado e requer convite do administrador.");
          setIsLoading(false);
          return;
        }
      }
      
      // Se chegou até aqui, o grupo foi encontrado e o usuário tem permissão
      setStatus("success");
      setTimeout(() => {
        // Notificar sobre o sucesso
        toast({
          title: "Grupo adicionado com sucesso!",
          description: `Você adicionou o grupo "${grupo.nome}" à sua lista`,
        });
        
        // Chamar o callback de sucesso com o ID do grupo
        onSuccess(grupo.id);
        
        // Fechar o modal após um breve atraso
        setTimeout(() => {
          onClose();
          setStatus("idle");
          setCodigo("");
        }, 500);
      }, 1500);
      
    } catch (error) {
      console.error("Erro ao processar entrada no grupo:", error);
      setStatus("error");
      setErrorMessage("Ocorreu um erro ao tentar adicionar o grupo. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

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
                <KeyRound className="h-6 w-6 mr-3 text-[#FF6B00]" />
                Adicionar Grupo por Código
              </h2>
              <p className="text-white/70 text-sm mt-1">
                Digite o código do grupo que você deseja adicionar.
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

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Grupo Encontrado!</h3>
                  <p className="text-white/70 text-center">
                    O grupo foi adicionado com sucesso à sua lista de grupos.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <label htmlFor="codigo" className="block text-sm font-medium text-white/70">
                      Código do Grupo
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <KeyRound className="h-5 w-5" />
                      </div>
                      <Input
                        id="codigo"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        placeholder="Ex: ABC1234"
                        className="pl-10 bg-[#1E293B] border-[#1E293B] text-white focus:border-[#FF6B00] font-mono text-lg tracking-wider"
                        maxLength={10}
                        autoComplete="off"
                        disabled={isLoading || status === "success"}
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      O código é formado por letras e números, como exibido ao criar um grupo.
                    </p>
                  </div>

                  {status === "error" && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-sm text-red-500">{errorMessage}</p>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end gap-3 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-[#1E293B] text-white hover:bg-[#1E293B] hover:text-white"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                {status !== "success" && (
                  <Button
                    type="submit"
                    className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white min-w-[120px]"
                    disabled={isLoading || !codigo.trim()}
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Adicionar Grupo"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdicionarGrupoPorCodigoModal;
