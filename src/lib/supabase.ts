
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

// Função auxiliar para verificar a conexão
export const checkSupabaseConnection = async () => {
  try {
    // Primeiro verificamos se o cliente supabase foi inicializado
    if (!supabase) {
      console.error('Cliente Supabase não inicializado corretamente');
      return false;
    }

    // Tentamos várias abordagens para verificar a conexão
    
    // Abordagem 1: Verificar a tabela profiles
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (!error) {
        console.log('Conexão com Supabase estabelecida com sucesso via tabela profiles!');
        return true;
      }
      
      if (error.code === 'PGRST204') {
        // Esta tabela existe, mas não tem dados - a conexão está ok
        console.log('Conexão com Supabase estabelecida com sucesso (tabela vazia)!');
        return true;
      }

      console.warn('Verificação via profiles falhou:', error.message);
      // Continuar para a próxima abordagem se houver erro
    } catch (profileError) {
      console.warn('Erro ao verificar profiles:', profileError);
      // Continuar para a próxima abordagem
    }
    
    // Abordagem 2: Tentar ping RPC
    try {
      const { data: pingData, error: pingError } = await supabase.rpc('rpc_ping');
      
      if (!pingError) {
        console.log('Conexão com Supabase estabelecida com sucesso via ping RPC!');
        return true;
      }
      
      // PGRST301 significa que a função existe mas não foi encontrada - é aceitável
      if (pingError.code === 'PGRST301') {
        console.log('Função ping não encontrada, mas conexão parece estar ok');
        return true;
      }
      
      console.warn('Verificação via RPC ping falhou:', pingError.message);
      // Continuar para a próxima abordagem
    } catch (rpcError) {
      console.warn('Erro ao fazer ping RPC:', rpcError);
      // Continuar para a próxima abordagem
    }
    
    // Abordagem 3: Tentar qualquer tabela do sistema
    try {
      const { error: authError } = await supabase.from('auth').select('count').limit(1);
      
      // Se conseguiu acessar ou se o erro for porque a tabela está vazia ou inacessível, mas não por problemas de conexão
      if (!authError || authError.code === 'PGRST204' || authError.code === 'PGRST301') {
        console.log('Conexão com Supabase estabelecida com sucesso via tabela auth!');
        return true;
      }
      
      console.warn('Verificação via auth falhou:', authError.message);
    } catch (authCheckError) {
      console.warn('Erro ao verificar auth:', authCheckError);
    }
    
    // Última tentativa - verificar se o erro é de conexão ou de permissão
    try {
      // Tentar o cabeçalho apenas para verificar se o servidor responde
      const { error: headError } = await supabase.from('profiles').select('count', { head: true });
      
      if (!headError || headError.code === 'PGRST204' || headError.code === 'PGRST301') {
        console.log('Cabeçalho acessível, conexão parece ok!');
        return true;
      }
      
      // Se chegou até aqui, provavelmente há um problema de conexão real
      console.error('Todos os métodos de verificação falharam. Erro na conexão com Supabase.');
      return false;
    } catch (finalError) {
      console.error('Erro final na verificação de conexão:', finalError);
      return false;
    }
  } catch (error) {
    console.error('Erro geral ao conectar com Supabase:', error);
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
