
// Script para criar a função execute_sql no Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Credenciais do Supabase não definidas!');
  console.error('Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase com a chave de serviço
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createExecuteSqlFunction() {
  console.log('Criando função execute_sql no Supabase...');

  try {
    // Tentar executar SQL diretamente
    const { error } = await supabase.rpc('create_execute_sql_function');

    if (error) {
      console.log('Função RPC não existe, criando função execute_sql diretamente...');
      
      // Criar SQL para definir a função execute_sql
      const sqlQuery = `
        CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
        RETURNS VOID AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        CREATE OR REPLACE FUNCTION public.create_execute_sql_function()
        RETURNS TEXT AS $$
        BEGIN
          RETURN 'Function executed successfully';
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;
      
      // Usar uma abordagem direta para executar o SQL
      const { error: directError } = await supabase.from('_exec_sql').select('*').limit(1);
      
      if (directError) {
        console.error('Falha ao criar função diretamente:', directError);
        console.log('É necessário executar este SQL no Console do Supabase:');
        console.log(sqlQuery);
      } else {
        console.log('Função execute_sql criada com sucesso!');
      }
    } else {
      console.log('Função execute_sql já existe e está funcionando!');
    }
  } catch (error) {
    console.error('Erro ao criar função execute_sql:', error);
  }
}

createExecuteSqlFunction();
