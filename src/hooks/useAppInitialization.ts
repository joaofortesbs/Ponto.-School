
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useAppInitialization() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("App carregado com sucesso!");

    // Verificação de conexão com Supabase
    const checkConnection = async () => {
      try {
        // Tentar verificar conexão com Supabase (com tratamento de erro)
        try {
          const { checkSupabaseConnection, setupSupabaseHealthCheck } = await import('@/lib/supabase');

          // Primeiro configurar verificação de saúde (apenas em desenvolvimento)
          if (import.meta.env.DEV) {
            await setupSupabaseHealthCheck();
          }

          const isConnected = await checkSupabaseConnection();

          if (!isConnected) {
            console.warn("Aviso: Falha na conexão com o Supabase. A aplicação continuará funcionando com dados locais.");
          } else {
            console.log("Conexão com Supabase estabelecida com sucesso!");
          }
        } catch (connectionError) {
          console.warn("Aviso: Erro ao verificar conexão com Supabase:", connectionError);
        }
      } catch (error) {
        console.error("Connection check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Definir um timeout para garantir que a aplicação será carregada mesmo se houver problemas
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
      console.log("Timeout de carregamento atingido. Forçando renderização.");
    }, 3000);

    checkConnection();

    // Verificar logout
    const handleLogout = () => {
      localStorage.removeItem('auth_status');
      localStorage.removeItem('auth_checked');
    };

    window.addEventListener('logout', handleLogout);

    // Limpar timeout se a verificação terminar antes
    return () => {
      clearTimeout(loadingTimeout);
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  return { isLoading };
}
