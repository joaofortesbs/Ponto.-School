import React, { useState, useEffect, useRef } from 'react';
import { Share, Check, Copy, Key } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CompartilharGrupoSectionProps {
  grupoCodigo: string;
  grupoNome: string;
  grupoId?: string; // Adicionado para recuperação direta
  onGerarCodigo?: () => Promise<void>;
}

const CompartilharGrupoSection: React.FC<CompartilharGrupoSectionProps> = ({ 
  grupoCodigo, 
  grupoNome,
  grupoId,
  onGerarCodigo
}) => {
  const [copiado, setCopiado] = useState(false);
  const [codigoGerado, setCodigoGerado] = useState(!!grupoCodigo);
  const [codigoLocal, setCodigoLocal] = useState(grupoCodigo);
  const gerouCodigoRef = useRef(false);

  // Tentar recuperar código do armazenamento dedicado
  useEffect(() => {
    const recuperarCodigoArmazenado = async () => {
      // Não fazer nada se já temos um código válido
      if (codigoLocal && codigoLocal.trim() !== "" && codigoLocal !== "SEM CÓDIGO") {
        return;
      }

      if (grupoId) {
        try {
          // Verificar primeiro no armazenamento dedicado
          const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
          const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
          
          if (codigosGrupos[grupoId]) {
            console.log("Recuperado código do armazenamento dedicado:", codigosGrupos[grupoId]);
            setCodigoLocal(codigosGrupos[grupoId]);
            setCodigoGerado(true);
            return;
          }
        } catch (e) {
          console.error("Erro ao verificar armazenamento dedicado:", e);
        }
        
        // Tentar recuperar do localStorage via módulo gruposEstudoStorage
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
            } catch (storageError) {
              console.error("Erro ao salvar no armazenamento dedicado:", storageError);
            }
            
            return;
          }
        } catch (e) {
          console.error("Erro ao recuperar grupos do localStorage:", e);
        }
      }
    };
    
    recuperarCodigoArmazenado();
  }, [grupoId]);

  // Verificar se já temos código ao inicializar o componente
  useEffect(() => {
    // Atualizar o estado de código gerado apenas se temos um código válido
    const temCodigo = !!grupoCodigo && grupoCodigo.trim() !== "" && grupoCodigo !== "SEM CÓDIGO";
    
    if (temCodigo) {
      setCodigoLocal(grupoCodigo);
      setCodigoGerado(true);
    } else if (codigoLocal && codigoLocal.trim() !== "" && codigoLocal !== "SEM CÓDIGO") {
      // Se já recuperamos um código localmente, manter esse
      setCodigoGerado(true);
    } else if (!gerouCodigoRef.current && onGerarCodigo && !codigoGerado) {
      // Se não temos código mas temos a função para gerar, gerar automaticamente
      // apenas uma vez para evitar loops de geração
      console.log("Inicializando geração automática de código do grupo");
      gerouCodigoRef.current = true;
      
      // Usar setTimeout para garantir que a geração ocorra após a renderização completa
      const timer = setTimeout(() => {
        handleGerarCodigo();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [grupoCodigo, codigoLocal]); // Dependências ajustadas

  const formattedCodigo = codigoLocal && codigoLocal.length > 4 
    ? `${codigoLocal.substring(0, 4)} ${codigoLocal.substring(4)}`
    : codigoLocal || "SEM CÓDIGO";

  const handleCopiarCodigo = () => {
    // Garantir que copiamos o código sem formatação (sem espaços)
    navigator.clipboard.writeText(codigoLocal || grupoCodigo)
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
          text: `Entre no meu grupo de estudos "${grupoNome}" usando o código: ${codigoLocal || grupoCodigo}`,
          url: window.location.href,
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
      await onGerarCodigo();
      setCodigoGerado(true);
      
      // Atualizar código local após geração
      if (grupoId) {
        try {
          // Verificar no armazenamento dedicado após a geração
          const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
          const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
          
          if (codigosGrupos[grupoId]) {
            console.log("Recuperado código recém-gerado do armazenamento dedicado:", codigosGrupos[grupoId]);
            setCodigoLocal(codigosGrupos[grupoId]);
          } else if (grupoCodigo && grupoCodigo !== "SEM CÓDIGO") {
            // Se o código foi atualizado mas não está no armazenamento dedicado
            setCodigoLocal(grupoCodigo);
            
            // Salvar no armazenamento dedicado
            try {
              codigosGrupos[grupoId] = grupoCodigo;
              localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));
              console.log("Código recém-gerado salvo no armazenamento dedicado:", grupoCodigo);
            } catch (e) {
              console.error("Erro ao salvar código recém-gerado no armazenamento dedicado:", e);
            }
          }
        } catch (e) {
          console.error("Erro ao atualizar código após geração:", e);
          setCodigoLocal(grupoCodigo); // Fallback para o código recebido por props
        }
      } else {
        // Se não temos grupoId, usar o código recebido por props
        setCodigoLocal(grupoCodigo);
      }
      
      console.log("Código gerado automaticamente:", codigoLocal || grupoCodigo);
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
                disabled={!codigoLocal && !grupoCodigo}
              >
                {copiado ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {(codigoLocal || grupoCodigo) ? "Este código permanente é usado para convidar pessoas para o seu grupo. O código é único, inalterável e insensível a maiúsculas e minúsculas." : "Um código único e permanente será gerado para este grupo quando você clicar no botão 'Gerar código do grupo'."}
            </p>
          </div>

          {!codigoLocal && !grupoCodigo && (
            <div className="pt-2">
              <Button
                onClick={handleGerarCodigo}
                variant="secondary"
                className="w-full justify-center"
              >
                Gerar código do grupo
              </Button>
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={handleCompartilhar}
              variant="outline"
              className="w-full justify-center border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
              disabled={!codigoLocal && !grupoCodigo}
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

export default CompartilharGrupoSection;