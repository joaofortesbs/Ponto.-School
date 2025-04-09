
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verifique se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Variáveis de ambiente do Supabase não configuradas corretamente. Verifique o arquivo .env");
  process.exit(1);
}

console.log("Usando as seguintes credenciais:");
console.log("URL:", supabaseUrl);
console.log("Anon Key:", supabaseAnonKey ? "Configurada" : "Não configurada");
console.log("Service Role Key:", supabaseServiceKey ? "Configurada" : "Não configurada");

// Cliente com chave anônima
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente com chave de serviço (se disponível)
const adminClient = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

async function testConnection() {
  try {
    console.log("\n=== Testando conexão com Supabase (chave anônima) ===");
    const { error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.error("Erro ao conectar com Supabase:", error);
    } else {
      console.log("✅ Conexão com Supabase estabelecida com sucesso!");
    }

    // Teste função RPC
    try {
      console.log("\n=== Testando função RPC de ping ===");
      const { data, error: rpcError } = await supabase.rpc('rpc_ping');
      
      if (rpcError) {
        console.error("Erro ao executar função RPC de ping:", rpcError);
        
        if (adminClient) {
          console.log("\n=== Tentando criar função RPC de ping ===");
          const { error: createError } = await adminClient.rpc('execute_sql', {
            sql_query: `
              CREATE OR REPLACE FUNCTION public.rpc_ping()
              RETURNS TEXT AS $$
              BEGIN
                RETURN 'pong';
              END;
              $$ LANGUAGE plpgsql;
            `
          });
          
          if (createError) {
            console.error("Erro ao criar função de ping:", createError);
          } else {
            console.log("✅ Função de ping criada com sucesso!");
            
            // Teste novamente
            const { data: pingData, error: pingError } = await supabase.rpc('rpc_ping');
            if (pingError) {
              console.error("Erro ao executar função RPC de ping após criação:", pingError);
            } else {
              console.log("✅ Função de ping executada com sucesso. Resposta:", pingData);
            }
          }
        } else {
          console.log("❌ Chave de serviço não configurada. Não é possível criar a função de ping.");
        }
      } else {
        console.log("✅ Função RPC de ping executada com sucesso! Resposta:", data);
      }
    } catch (e) {
      console.error("Erro ao testar função RPC:", e);
    }

    // Teste execute_sql
    if (adminClient) {
      try {
        console.log("\n=== Testando função execute_sql ===");
        const { error: sqlError } = await adminClient.rpc('execute_sql', {
          sql_query: `SELECT 1 as test;`
        });
        
        if (sqlError) {
          console.error("Erro ao executar função execute_sql:", sqlError);
          
          console.log("\n=== Tentando criar função execute_sql ===");
          const { error: createError } = await adminClient.sql(`
            CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
            RETURNS void AS $$
            BEGIN
              EXECUTE sql_query;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
          `);
          
          if (createError) {
            console.error("Erro ao criar função execute_sql:", createError);
          } else {
            console.log("✅ Função execute_sql criada com sucesso!");
            
            // Teste novamente
            const { error: testError } = await adminClient.rpc('execute_sql', {
              sql_query: `SELECT 1 as test;`
            });
            if (testError) {
              console.error("Erro ao executar função execute_sql após criação:", testError);
            } else {
              console.log("✅ Função execute_sql executada com sucesso.");
            }
          }
        } else {
          console.log("✅ Função execute_sql executada com sucesso!");
        }
      } catch (e) {
        console.error("Erro ao testar função execute_sql:", e);
      }
    } else {
      console.log("❌ Chave de serviço não configurada. Não é possível testar execute_sql.");
    }

  } catch (error) {
    console.error("Erro ao testar conexão:", error);
  }
}

testConnection();
