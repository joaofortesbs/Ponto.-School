import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Share2 } from 'lucide-react';

interface CompartilharGrupoSectionProps {
  grupoCodigo: string;
  grupoNome: string;
}

const CompartilharGrupoSection: React.FC<CompartilharGrupoSectionProps> = ({ 
  grupoCodigo, 
  grupoNome 
}) => {
  const [copiado, setCopiado] = useState(false);

  const formattedCodigo = grupoCodigo && grupoCodigo.length > 4 
    ? `${grupoCodigo.substring(0, 4)} ${grupoCodigo.substring(4)}`
    : grupoCodigo || "SEM CÓDIGO";

  const handleCopiarCodigo = () => {
    // Garantir que copiamos o código sem formatação (sem espaços)
    navigator.clipboard.writeText(grupoCodigo)
      .then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      })
      .catch(err => {
        console.error('Erro ao copiar código:', err);
      });
  };

  const handleCompartilhar = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Grupo de Estudos: ${grupoNome}`,
          text: `Entre no meu grupo de estudos "${grupoNome}" usando o código: ${grupoCodigo}`,
          url: window.location.href,
        });
      } else {
        handleCopiarCodigo();
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

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
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Código do grupo
            </label>
            <div className="flex items-center">
              <span className="bg-white dark:bg-gray-900 py-2 px-3 text-sm font-mono rounded-l-md border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 flex-1 font-bold tracking-wider">
                {formattedCodigo}
              </span>
              <Button
                onClick={handleCopiarCodigo}
                variant="ghost"
                className="h-9 rounded-l-none rounded-r-md border border-l-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={!grupoCodigo}
              >
                {copiado ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {grupoCodigo ? "O código é insensível a maiúsculas e minúsculas." : "Um código será gerado quando você salvar."}
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleCompartilhar}
              variant="outline"
              className="w-full justify-center border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
              disabled={!grupoCodigo}
            >
              <Share2 className="h-4 w-4 mr-2" />
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

export default CompartilharGrupoSection;