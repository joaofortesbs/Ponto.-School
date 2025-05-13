import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { atualizarCodigoGrupo } from "@/lib/grupoCodigoUtils";
import { Copy, RefreshCw } from "lucide-react";

interface GrupoConfiguracoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  grupo: any;
  onGrupoUpdated: (grupoAtualizado: any) => void;
}

const GrupoConfiguracoesModal: React.FC<GrupoConfiguracoesModalProps> = ({
  isOpen,
  onClose,
  grupo,
  onGrupoUpdated
}) => {
  const [nome, setNome] = useState(grupo?.nome || "");
  const [descricao, setDescricao] = useState(grupo?.descricao || "");
  const [isPrivado, setIsPrivado] = useState(grupo?.privado || false);
  const [codigo, setCodigo] = useState(grupo?.codigo || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegeneratingCode, setIsRegeneratingCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .update({
          nome,
          descricao,
          privado: isPrivado,
          codigo: codigo || null
        })
        .eq('id', grupo.id)
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Configurações atualizadas",
        description: "As configurações do grupo foram atualizadas com sucesso."
      });

      if (data && data.length > 0) {
        onGrupoUpdated(data[0]);
      }

      onClose();
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateCode = async () => {
    setIsRegeneratingCode(true);
    try {
      const novoCodigo = await atualizarCodigoGrupo(grupo.id);
      if (novoCodigo) {
        setCodigo(novoCodigo);
        toast({
          title: "Código renovado",
          description: "O código de convite do grupo foi renovado com sucesso."
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível gerar um novo código. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao regenerar código:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar gerar um novo código.",
        variant: "destructive"
      });
    } finally {
      setIsRegeneratingCode(false);
    }
  };

  const copyCodeToClipboard = () => {
    if (codigo) {
      navigator.clipboard.writeText(codigo);
      toast({
        title: "Código copiado",
        description: "O código foi copiado para a área de transferência."
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações do Grupo</DialogTitle>
          <DialogDescription>
            Atualize as informações e configurações do seu grupo de estudos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Grupo</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do grupo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o propósito do grupo..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="privado" className="cursor-pointer">
              Grupo Privado
            </Label>
            <Switch
              id="privado"
              checked={isPrivado}
              onCheckedChange={setIsPrivado}
            />
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="codigo">Código de Convite</Label>
            <div className="flex gap-2">
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="Código de convite"
                className="uppercase"
                maxLength={8}
                readOnly
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={copyCodeToClipboard}
                title="Copiar código"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={handleRegenerateCode}
                disabled={isRegeneratingCode}
                title="Gerar novo código"
              >
                <RefreshCw className={`h-4 w-4 ${isRegeneratingCode ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Compartilhe este código para que outros usuários possam entrar no grupo.
              {isPrivado && " Como este é um grupo privado, apenas quem tiver o código poderá entrar."}
            </p>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#FF6B00] hover:bg-orange-700"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GrupoConfiguracoesModal;