
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { entrarGrupoPorCodigo } from "@/lib/grupoCodigoUtils";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface EntrarGrupoPorCodigoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (grupo: any) => void;
}

const EntrarGrupoPorCodigoModal: React.FC<EntrarGrupoPorCodigoModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [codigo, setCodigo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErro(null);

    if (!codigo.trim()) {
      setErro("Por favor, insira o código do grupo");
      setIsLoading(false);
      return;
    }

    try {
      const resultado = await entrarGrupoPorCodigo(codigo.trim());
      
      if (resultado.sucesso) {
        toast({
          title: "Sucesso!",
          description: resultado.mensagem,
          action: <CheckCircle2 className="h-4 w-4 text-green-500" />
        });
        
        if (onSuccess && resultado.grupo) {
          onSuccess(resultado.grupo);
        }
        
        onClose();
      } else {
        setErro(resultado.mensagem);
      }
    } catch (error) {
      console.error("Erro ao entrar no grupo:", error);
      setErro("Ocorreu um erro ao tentar entrar no grupo. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Entrar em Grupo por Código
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="codigo" className="text-sm font-medium">
              Código do Grupo
            </label>
            <Input
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Digite o código de 8 caracteres"
              maxLength={8}
              className="uppercase"
              autoComplete="off"
              autoFocus
            />
            {erro && (
              <div className="flex items-center text-red-500 text-sm mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>{erro}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#FF6B00] hover:bg-orange-700"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar no Grupo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EntrarGrupoPorCodigoModal;
