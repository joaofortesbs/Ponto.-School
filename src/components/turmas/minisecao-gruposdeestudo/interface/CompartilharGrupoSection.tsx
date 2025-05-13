import React, { useState, useEffect } from 'react';
import { Share, Check, Copy, Key } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast"
import { gerarCodigoUnicoGrupo, obterGruposLocal } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { GrupoEstudo } from '@/types';

interface CompartilharGrupoSectionProps {
  grupo: GrupoEstudo;
  onUpdateGrupo?: (grupo: GrupoEstudo) => void;
}

export function CompartilharGrupoSection({ grupo, onUpdateGrupo }: { grupo: GrupoEstudo, onUpdateGrupo?: (grupo: GrupoEstudo) => void }) {
  const [codigoGrupo, setCodigoGrupo] = useState<string | null>(grupo?.codigo || null);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const { toast } = useToast();

  // Atualizar código quando o grupo mudar
  useEffect(() => {
    if (grupo?.codigo) {
      setCodigoGrupo(grupo.codigo);
    }
  }, [grupo?.codigo]);

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    try {
      const codigoUnico = await gerarCodigoUnicoGrupo();

      // Primeiro salvar no localStorage para garantir persistência imediata
      const gruposLocal = obterGruposLocal();
      const indexGrupo = gruposLocal.findIndex(g => g.id === grupo.id);
      if (indexGrupo >= 0) {
        gruposLocal[indexGrupo].codigo = codigoUnico;
        localStorage.setItem('epictus_grupos_estudo', JSON.stringify(gruposLocal));
        console.log('Código salvo localmente primeiro:', codigoUnico);
      }

      // Atualizar o estado local
      setCodigoGrupo(codigoUnico);

      // Atualizar grupo no estado global
      const grupoAtualizado = { ...grupo, codigo: codigoUnico };
      if (typeof onUpdateGrupo === 'function') {
        onUpdateGrupo(grupoAtualizado);
      }

      // Tentar salvar no Supabase
      const { error } = await supabase
        .from('grupos_estudo')
        .update({ codigo: codigoUnico })
        .eq('id', grupo.id);

      if (error) {
        console.error('Erro ao salvar código no servidor:', error);
        toast({
          title: "Aviso",
          description: "O código foi gerado e salvo localmente. Sincronizará com o servidor mais tarde.",
          variant: "default"
        });
      } else {
        toast({
          title: "Código gerado com sucesso!",
          description: "Compartilhe este código para convidar pessoas para o grupo.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      toast({
        title: "Erro ao gerar código",
        description: "Não foi possível gerar um código único. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCopiarCodigo = () => {
    // Garantir que copiamos o código sem formatação (sem espaços)
    if (codigoGrupo) {
      navigator.clipboard.writeText(codigoGrupo)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.error('Erro ao copiar código:', err);
        });
    }
  };

  const handleCompartilhar = async () => {
    try {
      if (codigoGrupo && navigator.share) {
        await navigator.share({
          title: `Grupo de Estudos: ${grupo.nome}`,
          text: `Entre no meu grupo de estudos "${grupo.nome}" usando o código: ${codigoGrupo}`,
          url: window.location.href,
        });
      } else {
        handleCopiarCodigo();
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const formattedCodigo = codigoGrupo && codigoGrupo.length > 4
    ? `${codigoGrupo.substring(0, 4)} ${codigoGrupo.substring(4)}`
    : codigoGrupo || "SEM CÓDIGO";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Compartilhar grupo
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Compartilhe o código do grupo para que outras pessoas possam encontrá-lo e solicitar participação.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
              Código do grupo
              <span className="ml-2 px-1.5 py-0.5 bg-green-500/20 text-green-500 rounded-md text-xs font-medium">Permanente</span>
            </label>
            <div className="flex items-center">
              <span className="bg-white dark:bg-gray-900 py-2 px-3 text-sm font-mono rounded-l-md border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 flex-1 font-bold tracking-wider">
                {formattedCodigo}
              </span>
              <Button
                onClick={handleCopiarCodigo}
                variant="ghost"
                className="h-9 rounded-l-none rounded-r-md border border-l-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={!codigoGrupo}
              >
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {codigoGrupo ? "Este código permanente é usado para convidar pessoas para o seu grupo. O código é único, inalterável e insensível a maiúsculas e minúsculas." : "Um código único e permanente será gerado para este grupo quando você clicar no botão 'Gerar código do grupo'."}
            </p>
          </div>

          {!codigoGrupo && (
            <div className="pt-2">
              <Button
                onClick={handleGenerateCode}
                variant="secondary"
                className="w-full justify-center"
                disabled={isGeneratingCode}
              >
                {isGeneratingCode ? "Gerando código..." : "Gerar código do grupo"}
              </Button>
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={handleCompartilhar}
              variant="outline"
              className="w-full justify-center border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
              disabled={!codigoGrupo}
            >
              <Share className="h-4 w-4 mr-2" />
              Compartilhar grupo
            </Button>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
        <p>
          <span className="font-medium">Nota:</span> Apenas pessoas com o código podem solicitar entrada no grupo.
        </p>
        <p>
          <span className="font-medium">Dica:</span> Configure as opções de privacidade do grupo na aba "Privacidade".
        </p>
      </div>
    </div>
  );
};