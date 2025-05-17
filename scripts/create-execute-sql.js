
// Script para criar a função execute_sql no Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Credenciais do Supabase não definidas!');
  console.error('Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY ou VITE_SUPABASE_ANON_KEY no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Criando função execute_sql...');

  try {
    // Criar função execute_sql direto pelo SQL
    const { error: functionError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
        RETURNS VOID AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    }).catch(() => {
      // Se falhar, provavelmente a função ainda não existe
      console.log('Função execute_sql ainda não existe. Criando com método alternativo...');
      return { error: { message: 'Função não existe' } };
    });

    if (functionError) {
      console.log('Tentando criar a função execute_sql usando método alternativo...');
      
      // Tentativa alternativa - fazer uma chamada SQL direta para criar a função
      const { error: createFunctionError } = await supabase
        .from('_temp_function_creator')
        .insert([{ name: 'temp' }])
        .select()
        .eq('name', 'nonexistent')
        .then(() => ({ error: null })) // Isso vai falhar, mas cria um contexto SQL
        .catch(async () => {
          // Agora tentamos com uma chamada REST direta
          try {
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`
              },
              body: JSON.stringify({ 
                sql_query: `
                  CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
                  RETURNS VOID AS $$
                  BEGIN
                    EXECUTE sql_query;
                  END;
                  $$ LANGUAGE plpgsql SECURITY DEFINER;
                ` 
              })
            });
            
            if (!response.ok) {
              return { error: { message: `Falha na chamada REST: ${response.status}` } };
            }
            return { error: null };
          } catch (e) {
            return { error: e };
          }
        });

      if (createFunctionError) {
        // Última tentativa - usando SQL bruto via API do PostgreSQL
        console.log('Tentando método final para criar a função execute_sql...');
        
        const { error: finalAttemptError } = await supabase.rpc('auth.uid')
          .catch(async () => {
            // Executar SQL em uma tabela existente que sabemos que existe
            const { error } = await supabase
              .from('auth')
              .select('*')
              .limit(1)
              .catch(async () => {
                // Se isso também falhar, tentar criar uma tabela temporária
                const sqlQuery = `
                  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
                  
                  DO $$
                  BEGIN
                    CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
                    RETURNS VOID AS $$
                    BEGIN
                      EXECUTE sql_query;
                    END;
                    $$ LANGUAGE plpgsql SECURITY DEFINER;
                  END
                  $$;
                `;
                
                // Tentar executar via extensão pgSQL direta
                try {
                  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'apikey': supabaseServiceKey,
                      'Authorization': `Bearer ${supabaseServiceKey}`,
                      'Prefer': 'params=single-object',
                      'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                      query: sqlQuery
                    })
                  });
                  
                  if (!response.ok) {
                    return { error: { message: 'Falha na execução SQL direta' } };
                  }
                  return { error: null };
                } catch (e) {
                  return { error: e };
                }
              });
              
            return { error };
          });
          
        if (finalAttemptError) {
          console.error('Erro na tentativa final de criar a função:', finalAttemptError.message);
          console.error('Por favor, verifique suas permissões no banco de dados ou crie manualmente a função execute_sql.');
        } else {
          console.log('Função execute_sql possivelmente criada com sucesso!');
        }
      } else {
        console.log('Função execute_sql criada com sucesso usando método alternativo!');
      }
    } else {
      console.log('Função execute_sql criada com sucesso!');
    }
    
    // Verificar se a função foi criada corretamente
    const { data: testData, error: testError } = await supabase
      .rpc('execute_sql', { sql_query: 'SELECT 1 as test_function' })
      .catch(() => ({ error: { message: 'Função não existe ou não funciona corretamente' } }));
      
    if (testError) {
      console.error('A função execute_sql não está funcionando corretamente:', testError.message);
      console.error('Você precisará criar a função manualmente no console SQL do Supabase.');
      process.exit(1);
    } else {
      console.log('✅ Função execute_sql testada e está funcionando corretamente!');
    }

  } catch (error) {
    console.error('Erro durante a criação da função execute_sql:', error);
    process.exit(1);
  }
}

main();
