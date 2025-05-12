
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, KeyRound, ArrowRight, Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface AdicionarGrupoPorCodigoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdicionarGrupoPorCodigoModal: React.FC<AdicionarGrupoPorCodigoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [codigo, setCodigo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigo.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, digite o código do grupo que deseja entrar.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    console.log("Processando código de grupo:", codigo);
    
    // Simulação de processamento
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A função de adicionar grupo por código será implementada em breve.",
      });
      
      // Fechar o modal após exibir a mensagem
      console.log("Fechando modal de código após processamento");
      onClose();
    }, 1500);
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
          className="bg-[#0F172A] dark:bg-[#0F172A] rounded-xl overflow-hidden w-[500px] max-w-full shadow-xl relative"
        >
          <div className="bg-gradient-to-r from-[#0F172A] to-[#0F172A] border-b border-[#1E293B] p-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <KeyRound className="h-6 w-6 mr-3 text-[#FF6B00]" />
                Entrar em um Grupo de Estudo
              </h2>
              <p className="text-white/70 text-sm mt-1">
                Digite o código de convite para entrar em um grupo de estudo existente.
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

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="codigo" className="block text-sm font-medium text-white/70 mb-2 flex items-center">
                  Código do Grupo <span className="text-[#FF6B00] ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <Input
                    id="codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Digite o código do grupo (ex: ABC1234)"
                    className="pl-9 bg-[#1E293B] border-[#1E293B] text-white focus:border-[#FF6B00] font-mono uppercase"
                    maxLength={10}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  O código é fornecido pelo administrador do grupo ou mostrado na página de compartilhamento.
                </p>
              </div>

              <div className="bg-[#1E293B]/50 p-4 rounded-lg border border-[#1E293B]">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-4 w-4 text-[#FF6B00]" />
                  <h3 className="text-sm font-medium text-white">
                    Como encontrar um código de grupo?
                  </h3>
                </div>
                <ul className="text-xs text-gray-400 space-y-1 pl-6 list-disc">
                  <li>Peça ao administrador do grupo para compartilhar o código</li>
                  <li>Verifique a seção "Compartilhar" na página do grupo</li>
                  <li>Procure por convites no seu e-mail ou mensagens</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-[#1E293B] text-white hover:bg-[#1E293B] hover:text-white"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" /> Entrar no Grupo
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdicionarGrupoPorCodigoModal;
