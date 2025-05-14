import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Share2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { gerarCodigoGrupo, atualizarCodigoGrupo } from "@/lib/grupoCodigoUtils";

interface CompartilharGrupoSectionProps {
  grupoId: string;
  className?: string;
}

const CompartilharGrupoSection: React.FC<CompartilharGrupoSectionProps> = ({ grupoId, className }) => {
  const [codigoLocal, setCodigoLocal] = useState<string>("");
  const [codigoGerado, setCodigoGerado] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para recuperar o código do grupo
  const recuperarCodigo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!grupoId) {
        setError("ID do grupo não encontrado");
        setIsLoading(false);
        return;
      }

      // 1. Verificar primeiro no armazenamento dedicado para códigos
      try {
        const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
        const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');

        if (codigosGrupos[grupoId]) {
          console.log("Recuperado código do storage dedicado:", codigosGrupos[grupoId]);
          setCodigoLocal(codigosGrupos[grupoId]);
          setCodigoGerado(true);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error("Erro ao verificar storage dedicado:", e);
      }

      // 2. Verificar no grupo armazenado localmente
      try {
        const { obterGruposLocal } = await import('@/lib/gruposEstudoStorage');
        const grupos = obterGruposLocal();
        const grupoExistente = grupos.find(g => g.id === grupoId);

        if (grupoExistente?.codigo) {
          console.log("Recuperado código do localStorage:", grupoExistente.codigo);
          setCodigoLocal(grupoExistente.codigo);
          setCodigoGerado(true);

          // Salvar no armazenamento dedicado para futuras recuperações
          try {
            const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
            const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
            codigosGrupos[grupoId] = grupoExistente.codigo;
            localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));
          } catch (e) {
            console.error("Erro ao salvar no armazenamento dedicado:", e);
          }

          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error("Erro ao verificar localStorage:", e);
      }

      // 3. Buscar do Supabase como último recurso
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('codigo')
        .eq('id', grupoId)
        .single();

      if (error) {
        console.error("Erro ao buscar código do grupo:", error);
        setError("Não foi possível recuperar o código do grupo");
      } else if (data && data.codigo) {
        setCodigoLocal(data.codigo);
        setCodigoGerado(true);

        // Salvar para acesso futuro mais rápido
        try {
          const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
          const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
          codigosGrupos[grupoId] = data.codigo;
          localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));
        } catch (e) {
          console.error("Erro ao salvar no armazenamento dedicado:", e);
        }
      }
    } catch (error) {
      console.error("Erro ao recuperar código:", error);
      setError("Ocorreu um erro inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  // Recuperar o código ao carregar o componente
  useEffect(() => {
    recuperarCodigo();
  }, [grupoId]);

  // Função para copiar o código para a área de transferência
  const handleCopyCode = async () => {
    if (codigoLocal) {
      try {
        await navigator.clipboard.writeText(codigoLocal);
        setIsCopied(true);
        toast({
          title: "Código copiado!",
          description: "O código foi copiado para a área de transferência.",
        });

        // Resetar o estado após 2 segundos
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      } catch (err) {
        console.error("Erro ao copiar código:", err);
        toast({
          title: "Erro",
          description: "Não foi possível copiar o código. Tente manualmente.",
          variant: "destructive",
        });
      }
    }
  };

  // Função para compartilhar o código via outras plataformas
  const handleShareCode = async () => {
    if (codigoLocal && navigator.share) {
      try {
        await navigator.share({
          title: "Grupo de Estudos - Código de Convite",
          text: `Use este código para entrar no grupo: ${codigoLocal}`,
        });
      } catch (err) {
        console.error("Erro ao compartilhar:", err);
      }
    } else {
      // Fallback para dispositivos sem suporte à Web Share API
      handleCopyCode();
    }
  };

  // Função para gerar um novo código
  const handleGerarCodigo = async () => {
    try {
      setIsGeneratingCode(true);
      setError(null);

      // Se já tiver um código, não permitir gerar outro
      if (codigoGerado && codigoLocal) {
        toast({
          title: "Código já existe",
          description: "Este grupo já possui um código permanente que não pode ser alterado.",
        });
        setIsGeneratingCode(false);
        return;
      }

      // Gerar novo código
      const novoCodigo = gerarCodigoGrupo();

      // Atualizar no banco de dados
      const { error } = await supabase
        .from('grupos_estudo')
        .update({ codigo: novoCodigo })
        .eq('id', grupoId);

      if (error) {
        console.error("Erro ao salvar código no banco de dados:", error);
        setError("Ocorreu um erro ao gerar o código. Tente novamente.");
      } else {
        // Atualizar estado local
        setCodigoLocal(novoCodigo);
        setCodigoGerado(true);

        // Atualizar armazenamento dedicado
        await atualizarCodigoGrupo(grupoId, novoCodigo);

        toast({
          title: "Código gerado com sucesso!",
          description: "Seu grupo agora tem um código único de convite.",
        });
      }
    } catch (error) {
      console.error("Erro ao gerar código:", error);
      setError("Ocorreu um erro inesperado. Tente novamente mais tarde.");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  return (
    <div className={`bg-[#1E293B]/50 rounded-lg p-4 border border-[#1E293B] ${className || ""}`}>
      <h3 className="text-base font-semibold text-white mb-2 flex items-center">
        <Share2 className="h-4 w-4 mr-2 text-[#FF6B00]" />
        Compartilhar Grupo
      </h3>

      {error && (
        <Alert className="mb-3 bg-red-900/20 text-red-400 border-red-900">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center p-3">
            <div className="h-5 w-5 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {codigoGerado && codigoLocal ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  Compartilhe este código único para que outros possam entrar diretamente no grupo:
                </p>

                <div className="flex items-center gap-2">
                  <div className="bg-[#1E293B] rounded px-3 py-2 font-mono text-white tracking-wider flex-1 text-center uppercase">
                    {codigoLocal.length >= 4 ? 
                      `${codigoLocal.substring(0, 4)} ${codigoLocal.substring(4)}` : 
                      codigoLocal}
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-10 w-10 border-[#1E293B] text-white hover:bg-[#1E293B]"
                    onClick={handleCopyCode}
                  >
                    {isCopied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#1E293B] text-white hover:bg-[#1E293B]"
                    onClick={handleShareCode}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  Gere um código único para compartilhar este grupo com outros estudantes:
                </p>

                <div className="flex justify-center">
                  <Button
                    type="button"
                    className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                    onClick={handleGerarCodigo}
                    disabled={isGeneratingCode}
                  >
                    {isGeneratingCode ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Gerar Código de Convite
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CompartilharGrupoSection;