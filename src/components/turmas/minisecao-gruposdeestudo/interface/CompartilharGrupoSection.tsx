
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Share2, Link, Mail, MessageSquare } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CompartilharGrupoSectionProps {
  grupo: {
    id: string;
    nome: string;
    codigo?: string;
  };
}

const CompartilharGrupoSection: React.FC<CompartilharGrupoSectionProps> = ({ grupo }) => {
  const [copiado, setCopiado] = useState(false);
  const grupoCodigo = grupo.codigo || "CODIGO";
  
  // URL para compartilhar (pode mudar conforme sua estrutura de rotas)
  const shareUrl = `${window.location.origin}/turmas/grupos/${grupo.id}?codigo=${grupoCodigo}`;
  
  const handleCopiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(grupoCodigo);
      setCopiado(true);
      toast({
        title: "Código copiado!",
        description: "O código do grupo foi copiado para a área de transferência.",
        duration: 3000,
      });
      
      setTimeout(() => {
        setCopiado(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao copiar o código:", error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código. Por favor, tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  const handleCopiarLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copiado!",
        description: "O link do grupo foi copiado para a área de transferência.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Erro ao copiar o link:", error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Por favor, tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  const handleCompartilharWhatsApp = () => {
    const mensagem = `Venha estudar comigo no grupo "${grupo.nome}" na Ponto. School! Use o código: ${grupoCodigo}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, "_blank");
  };
  
  const handleCompartilharEmail = () => {
    const assunto = `Convite para o grupo de estudos: ${grupo.nome}`;
    const corpo = `Olá!\n\nGostaria de te convidar para participar do grupo de estudos "${grupo.nome}" na Ponto. School.\n\nPara entrar, use o código: ${grupoCodigo}\n\nAté mais!`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    window.open(mailtoUrl, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-white/70">
          Código Único do Grupo
        </label>
        <div className="relative">
          <Input
            value={grupoCodigo}
            readOnly
            className="pr-20 bg-[#1E293B] border-[#1E293B] text-white font-mono text-lg tracking-wider"
          />
          <Button
            size="sm"
            onClick={handleCopiarCodigo}
            className="absolute right-1 top-1 h-8 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            {copiado ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copiado ? "Copiado" : "Copiar"}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Compartilhe este código com outras pessoas para que elas possam entrar no seu grupo.
        </p>
      </div>

      <div className="pt-2">
        <h4 className="text-sm font-medium text-white/70 mb-3">
          Opções de Compartilhamento
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="bg-[#1E293B] border-[#1E293B] text-white hover:bg-[#FF6B00]/10 hover:text-[#FF6B00] hover:border-[#FF6B00]"
            onClick={handleCopiarLink}
          >
            <Link className="h-4 w-4 mr-2" />
            Copiar Link
          </Button>
          <Button
            variant="outline"
            className="bg-[#1E293B] border-[#1E293B] text-white hover:bg-[#FF6B00]/10 hover:text-[#FF6B00] hover:border-[#FF6B00]"
            onClick={handleCompartilharWhatsApp}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            className="bg-[#1E293B] border-[#1E293B] text-white hover:bg-[#FF6B00]/10 hover:text-[#FF6B00] hover:border-[#FF6B00]"
            onClick={handleCompartilharEmail}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    variant="outline"
                    className="w-full bg-[#1E293B] border-[#1E293B] text-white hover:bg-[#FF6B00]/10 hover:text-[#FF6B00] hover:border-[#FF6B00]"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `Convite para o grupo: ${grupo.nome}`,
                          text: `Venha estudar comigo no grupo "${grupo.nome}" na Ponto. School! Use o código: ${grupoCodigo}`,
                          url: shareUrl
                        }).catch((error) => console.log('Erro ao compartilhar', error));
                      } else {
                        toast({
                          title: "Compartilhamento não suportado",
                          description: "Seu navegador não suporta esta função. Use uma das outras opções.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Mais Opções
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Abre o menu de compartilhamento nativo (se disponível)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="pt-2">
        <h4 className="text-sm font-medium text-white/70 mb-2">
          Mensagem para Compartilhar
        </h4>
        <div className="bg-[#1E293B] rounded-lg p-3 border border-[#1E293B]">
          <p className="text-sm text-white/90">
            Venha estudar comigo no grupo "{grupo.nome}" na Ponto. School! 
            <br />Use o código: <Badge className="ml-1 bg-[#FF6B00]/20 text-[#FF6B00] border-0 font-mono">{grupoCodigo}</Badge>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompartilharGrupoSection;
