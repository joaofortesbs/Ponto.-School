
import { supabase } from "@/lib/supabase";

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * Executa uma função assíncrona com retry automático em caso de falha
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 300,
    maxDelay = 3000,
    shouldRetry = (error) => {
      // Por padrão, tentamos novamente em erros de rede ou timeout
      const message = error?.message?.toLowerCase() || '';
      return message.includes('network') || 
             message.includes('timeout') || 
             message.includes('connection') ||
             message.includes('socket');
    }
  } = options;

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Se não devemos tentar novamente ou é a última tentativa, lançar o erro
      if (!shouldRetry(error) || attempt === maxRetries) {
        throw lastError;
      }
      
      // Aumentar o delay para a próxima tentativa (backoff exponencial)
      console.warn(`Tentativa ${attempt + 1}/${maxRetries} falhou, tentando novamente em ${delay}ms`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 1.5, maxDelay);
    }
  }

  // Nunca deve chegar aqui, mas TypeScript precisa do retorno
  throw lastError;
}

/**
 * Wrapper para operações Supabase com retry automático
 */
export async function supabaseWithRetry<T>(
  operation: (client: typeof supabase) => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  return withRetry(() => operation(supabase), options);
}
