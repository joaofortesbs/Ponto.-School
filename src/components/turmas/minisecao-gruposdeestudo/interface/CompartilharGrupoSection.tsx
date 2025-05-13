
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CompartilharGrupoSectionProps {
  grupo: any;
  onGerarCodigo: (grupoId: string) => Promise<string | null>;
}

const CompartilharGrupoSection: React.FC<CompartilharGrupoSectionProps> = ({ grupo, onGerarCodigo }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCopiarCodigo = () => {
    if (!grupo.codigo) {
      toast({
        title: "Erro ao copiar código",
        description: "Gere um código primeiro antes de copiar.",
        variant: "destructive",
      });
      return;
    }

    navigator.clipboard.writeText(grupo.codigo)
      .then(() => {
        toast({
          title: "Código copiado!",
          description: "O código do grupo foi copiado para a área de transferência.",
        });
      })
      .catch((error) => {
        console.error('Erro ao copiar código:', error);
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o código. Tente novamente.",
          variant: "destructive",
        });
      });
  };

  const handleCompartilhar = async () => {
    if (!grupo.codigo) {
      toast({
        title: "Erro ao compartilhar",
        description: "Gere um código primeiro antes de compartilhar.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Grupo de Estudos: ${grupo.nome}`,
          text: `Entre no meu grupo de estudos "${grupo.nome}" usando o código: ${grupo.codigo}`,
          url: window.location.href,
        });
        toast({
          title: "Compartilhado com sucesso!",
          description: "O convite para o grupo foi compartilhado.",
        });
      } else {
        handleCopiarCodigo();
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleGerarCodigo = async () => {
    if (onGerarCodigo) {
      setIsLoading(true);
      try {
        const codigo = await onGerarCodigo(grupo.id);
        if (codigo) {
          toast({
            title: "Código gerado com sucesso!",
            description: "Agora você pode compartilhar este código com outras pessoas.",
          });
        } else {
          toast({
            title: "Erro ao gerar código",
            description: "Não foi possível gerar o código. Tente novamente.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Compartilhar grupo</h3>
      <p className="text-sm text-muted-foreground">
        Compartilhe o código do grupo para que outras pessoas possam encontrá-lo e solicitar participação.
      </p>

      <div className="space-y-6 mt-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Código do grupo</span>
            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded">Permanente</span>
          </div>

          <div className="flex space-x-2">
            <Input
              value={grupo.codigo || "SEM CÓDIGO"}
              readOnly
              className="font-mono uppercase"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleCopiarCodigo} disabled={!grupo.codigo}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copiar código</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Um código único e permanente será gerado para este grupo quando você clicar no botão 'Gerar código do grupo'.
          </p>
        </div>

        <Button 
          onClick={handleGerarCodigo} 
          className="w-full" 
          variant="default"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Gerando código...
            </>
          ) : (
            'Gerar código do grupo'
          )}
        </Button>

        <div className="pt-4 border-t">
          <Button 
            onClick={handleCompartilhar} 
            className="w-full flex items-center justify-center" 
            variant="outline"
            disabled={!grupo.codigo}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Compartilhar grupo
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-xs text-muted-foreground">
          <strong>Nota:</strong> Apenas pessoas com o código podem solicitar entrada no grupo.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          <strong>Dica:</strong> Configure as opções de privacidade do grupo na aba "Privacidade".
        </p>
      </div>
    </div>
  );
};

export default CompartilharGrupoSection;
