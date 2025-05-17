import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Variáveis de ambiente do Supabase não configuradas corretamente. Verifique o arquivo .env"
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

// Função auxiliar para verificar a conexão - aprimorada com retry
export const checkSupabaseConnection = async (retryCount = 3) => {
  try {
    if (!supabase) {
      console.error('Cliente Supabase não inicializado corretamente');
      return false;
    }

    // Abordagem mais simples e confiável - tentar fazer uma consulta básica
    for (let i = 0; i <= retryCount; i++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (!error) {
          console.log('Conexão com Supabase estabelecida com sucesso!');
          return true;
        } else if (i < retryCount) {
          console.warn(`Tentativa ${i+1} falhou, tentando novamente...`);
          // Aumentar o atraso a cada tentativa (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, i)));
        } else {
          console.warn('Verificação de conexão falhou após tentativas:', error.message);
          return false;
        }
      } catch (innerError) {
        if (i < retryCount) {
          console.warn(`Exceção na tentativa ${i+1}, tentando novamente...`);
          // Aumentar o atraso a cada tentativa (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, i)));
        } else {
          throw innerError;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar conexão com Supabase:', error);
    return false;
  }
};

// Função para criar um ping RPC para verificação de saúde
export const setupSupabaseHealthCheck = async () => {
  try {
    const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.warn('Chave de serviço do Supabase não configurada para criar função de ping');
      return;
    }

    // Usando client com service role key para criar função RPC
    const adminClient = createClient(supabaseUrl || "", serviceRoleKey);

    // Criar função RPC para ping
    const { error } = await adminClient.rpc('execute_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION public.rpc_ping()
        RETURNS TEXT AS $$
        BEGIN
          RETURN 'pong';
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    if (error) {
      console.error('Erro ao criar função de ping:', error);
    } else {
      console.log('Função de ping criada com sucesso');
    }
  } catch (error) {
    console.error('Erro ao configurar verificação de saúde:', error);
  }
};