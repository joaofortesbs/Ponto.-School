
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

    // Tentamos uma operação simples para verificar conexão
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      if (error.code === 'PGRST204') {
        // Esta tabela existe, mas não tem dados - a conexão está ok
        console.log('Conexão com Supabase estabelecida com sucesso!');
        return true;
      }
      }

      // Caso a tabela profiles não exista ainda, tentamos outra operação
      const { error: healthCheckError } = await supabase.rpc('rpc_ping');
      
      if (healthCheckError && healthCheckError.code !== 'PGRST301') {
        console.error('Erro ao conectar com Supabase:', error);
        return false;
      }
    }
    
    console.log('Conexão com Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error);
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

// Função para verificar se o storage está funcionando corretamente
export const checkStorageConnection = async () => {
  try {
    // Verificar se o bucket profiles existe
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('profiles');
    
    if (bucketError) {
      if (bucketError.message.includes('not found')) {
        console.warn('Bucket de perfis não encontrado. Pode ser necessário criá-lo.');
        return false;
      }
      console.error('Erro ao verificar bucket de perfis:', bucketError);
      return false;
    }
    
    console.log('Bucket de perfis verificado:', bucketData);
    
    // Tentar listar arquivos (para verificar permissões)
    const { data: listData, error: listError } = await supabase.storage
      .from('profiles')
      .list();
      
    if (listError) {
      console.error('Erro ao listar arquivos do bucket:', listError);
      return false;
    }
    
    console.log(`Bucket de perfis acessível. Contém ${listData.length} arquivos.`);
    return true;
  } catch (error) {
    console.error('Erro ao verificar conexão com storage:', error);
    return false;
  }
};

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
