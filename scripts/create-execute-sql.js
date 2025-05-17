
// Script para criar a função execute_sql no Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Tenta usar a chave de serviço, mas cai para a chave anônima se necessário
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Credenciais do Supabase não definidas!');
  console.error('Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY ou VITE_SUPABASE_ANON_KEY no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase com a chave disponível
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createExecuteSqlFunction() {
  console.log('Criando função execute_sql no Supabase...');

  try {
    // Verificar se a função já existe
    const { data, error } = await supabase
      .rpc('execute_sql', { sql_query: 'SELECT 1 as test' })
      .single();

    if (error) {
      console.log('Função execute_sql não existe ou não está acessível, tentando criar...');
      
      // Criar SQL para definir a função execute_sql
      const sqlDefinition = `
        CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
        RETURNS VOID AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;
      
      // Tentando usar a API REST para criar a função
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ 
          sql_query: sqlDefinition 
        })
      });
      
      if (!response.ok) {
        console.log('Não foi possível criar a função através da API REST.');
        console.log('Execute manualmente este SQL no Console do Supabase:');
        console.log(sqlDefinition);
        console.log('\nAlternativamente, verifique se você está usando a chave de serviço correta.');
      } else {
        console.log('Função execute_sql criada com sucesso!');
      }
    } else {
      console.log('Função execute_sql já existe e está funcionando!');
    }
  } catch (error) {
    console.error('Erro ao verificar ou criar função execute_sql:', error);
    console.log('Execute manualmente este SQL no Console do Supabase:');
    console.log(`
      CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
      RETURNS VOID AS $$
      BEGIN
        EXECUTE sql_query;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
  }
}

createExecuteSqlFunction();
