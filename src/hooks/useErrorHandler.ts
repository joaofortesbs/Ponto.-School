
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

interface ErrorOptions {
  silent?: boolean;
  retry?: () => Promise<void>;
  fallback?: any;
}

export function useErrorHandler() {
  const { toast } = useToast();
  const [lastError, setLastError] = useState<Error | null>(null);

  // Limpa o último erro após 5 minutos para evitar mensagens obsoletas
  useEffect(() => {
    if (lastError) {
      const timer = setTimeout(() => {
        setLastError(null);
      }, 5 * 60 * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [lastError]);

  const handleError = async (
    error: unknown, 
    message: string = "Ocorreu um erro na operação", 
    options: ErrorOptions = {}
  ) => {
    // Converte o erro para um objeto Error padronizado
    const normalizedError = error instanceof Error
      ? error
      : new Error(typeof error === 'string' ? error : JSON.stringify(error));
    
    // Armazena o último erro para referência
    setLastError(normalizedError);
    
    // Loga o erro no console para debug
    console.error(message, normalizedError);
    
    // Se não for silencioso, mostra um toast para o usuário
    if (!options.silent) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
        action: options.retry ? {
          label: "Tentar novamente",
          onClick: options.retry
        } : undefined,
      });
    }
    
    // Retorna o erro para permitir tratamento adicional
    return normalizedError;
  };
  
  // Para operações assíncronas com tratamento automático de erros
  const safeAsync = async <T>(
    asyncFn: () => Promise<T>, 
    errorMessage: string = "Ocorreu um erro na operação",
    options: ErrorOptions = {}
  ): Promise<{ data: T | null; error: Error | null }> => {
    try {
      const result = await asyncFn();
      return { data: result, error: null };
    } catch (error) {
      const normalizedError = await handleError(error, errorMessage, options);
      return { 
        data: options.fallback || null, 
        error: normalizedError 
      };
    }
  };
  
  return {
    handleError,
    safeAsync,
    lastError
  };
}
