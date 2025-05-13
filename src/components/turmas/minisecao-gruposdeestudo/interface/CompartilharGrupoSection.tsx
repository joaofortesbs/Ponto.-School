import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Link2, Hash } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CompartilharGrupoSectionProps {
  grupo: any;
}

const CompartilharGrupoSection: React.FC<CompartilharGrupoSectionProps> = ({ grupo }) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/grupo/${grupo.id}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "O link do grupo foi copiado para a área de transferência."
    });
  };

  const handleCopyCode = () => {
    if (grupo.codigo) {
      navigator.clipboard.writeText(grupo.codigo);
      toast({
        title: "Código copiado!",
        description: "O código do grupo foi copiado para a área de transferência."
      });
    } else {
      toast({
        title: "Sem código",
        description: "Este grupo não possui um código de convite.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="mb-4">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-[#FF6B00] border-[#FF6B00] hover:bg-orange-50"
        onClick={() => setShowOptions(!showOptions)}
      >
        <Share2 className="h-4 w-4" />
        Compartilhar Grupo
      </Button>

      {showOptions && (
        <div className="mt-3 p-3 border rounded-lg shadow-sm">
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="w-full mb-3">
              <TabsTrigger value="link" className="flex-1">
                <Link2 className="h-3 w-3 mr-1" /> Link
              </TabsTrigger>
              <TabsTrigger value="codigo" className="flex-1">
                <Hash className="h-3 w-3 mr-1" /> Código
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link">
              <p className="text-sm text-gray-600 mb-2">
                Compartilhe este link direto para o grupo:
              </p>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/grupo/${grupo.id}`}
                  readOnly
                  className="text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={handleCopyLink}
                  title="Copiar link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="codigo">
              <p className="text-sm text-gray-600 mb-2">
                Compartilhe este código para convidar pessoas:
              </p>
              <div className="flex gap-2">
                <Input
                  value={grupo.codigo || "Sem código"}
                  readOnly
                  className="text-xs uppercase font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={handleCopyCode}
                  disabled={!grupo.codigo}
                  title="Copiar código"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {!grupo.codigo && (
                <p className="text-xs text-amber-600 mt-2">
                  Este grupo ainda não possui um código de convite. Acesse as configurações para gerar um.
                </p>
              )}
              {grupo.privado && grupo.codigo && (
                <p className="text-xs text-gray-600 mt-2">
                  Este é um grupo privado. Apenas pessoas com o código poderão entrar.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default CompartilharGrupoSection;