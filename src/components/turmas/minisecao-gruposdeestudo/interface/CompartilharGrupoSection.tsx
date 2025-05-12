import React, { useState } from 'react';
import { Copy, Check, MessageSquare, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface CompartilharGrupoSectionProps {
  grupoCodigo: string;
  grupoNome: string;
}

const CompartilharGrupoSection: React.FC<CompartilharGrupoSectionProps> = ({
  grupoCodigo,
  grupoNome
}) => {
  const [copiado, setCopiado] = useState(false);
  const [copiadoLink, setCopiadoLink] = useState(false);

  // Garantir que o código seja exibido mesmo se for null ou undefined
  // Usar o novo formato padrão se o código não existir
  const codigoExibicao = grupoCodigo || "MJ2TG54";

  const mensagemPadrao = `Venha estudar comigo no grupo "${grupoNome}" na Ponto. School!\nUse o código: ${codigoExibicao}`;

  const handleCopiarCodigo = () => {
    navigator.clipboard.writeText(codigoExibicao);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleCopiarLink = () => {
    navigator.clipboard.writeText(`https://ponto.school/entrar-grupo?codigo=${codigoExibicao}`);
    setCopiadoLink(true);
    setTimeout(() => setCopiadoLink(false), 2000);
  };

  const handleCompartilharWhatsApp = () => {
    const text = encodeURIComponent(mensagemPadrao);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleCompartilharEmail = () => {
    const subject = encodeURIComponent(`Convite para o grupo "${grupoNome}"`);
    const body = encodeURIComponent(mensagemPadrao);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  // Formatar código para exibição com espaço no meio para melhor legibilidade
  const codigoFormatado = codigoExibicao.length >= 4 
    ? `${codigoExibicao.substring(0, 4)} ${codigoExibicao.substring(4)}`
    : codigoExibicao;

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-white/70">
          Código Único do Grupo
        </label>
        <div className="relative">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-md p-2 flex items-center justify-between">
            <span className="text-white font-mono text-xl tracking-wider uppercase font-bold">
              {codigoFormatado}
            </span>
            <Button
              size="sm"
              onClick={handleCopiarCodigo}
              className="h-8 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            >
              {copiado ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copiado ? "Copiado" : "Copiar"}
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Compartilhe este código com outras pessoas para que elas possam entrar no seu grupo.
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-white/70 mb-2">
          Opções de Compartilhamento
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline" 
            className="border-[#1E293B] bg-[#1E293B] text-white hover:bg-[#1E293B]/80"
            onClick={handleCopiarLink}
          >
            {copiadoLink ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copiadoLink ? "Link Copiado" : "Copiar Link"}
          </Button>

          <Button
            variant="outline" 
            className="border-[#1E293B] bg-[#1E293B] text-white hover:bg-[#1E293B]/80"
            onClick={handleCompartilharWhatsApp}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>

          <Button
            variant="outline" 
            className="border-[#1E293B] bg-[#1E293B] text-white hover:bg-[#1E293B]/80"
            onClick={handleCompartilharEmail}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Email
          </Button>

          <Button
            variant="outline" 
            className="border-[#1E293B] bg-[#1E293B] text-white hover:bg-[#1E293B]/80"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Mais Opções
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-white/70 mb-2">
          Mensagem para Compartilhar
        </h3>

        <div className="bg-[#1E293B] p-4 rounded-lg">
          <p className="text-white text-sm mb-2">
            Venha estudar comigo no grupo "{grupoNome}" na Ponto. School!
            <br />
            Use o código: <span className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/30 px-2 py-1 rounded-md font-bold ml-1">{codigoExibicao}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompartilharGrupoSection;