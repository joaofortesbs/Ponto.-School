
// Script para criar a tabela friend_requests usando o arquivo de migração existente
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Tenta usar a chave de serviço, mas cai para a chave anônima se necessário
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Credenciais do Supabase não definidas!');
  console.error('Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY ou VITE_SUPABASE_ANON_KEY no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Iniciando criação da tabela friend_requests...');

  try {
    // Primeiro, verificar se a função execute_sql existe
    const { data: testData, error: testError } = await supabase
      .rpc('execute_sql', { sql_query: 'SELECT 1 as test_function' })
      .catch(() => ({ error: { message: 'Função não existe' } }));

    if (testError) {
      console.log('Função execute_sql não existe. Execute primeiro o script create-execute-sql.js');
      console.log('Tentando criar a função execute_sql agora...');
      
      // Tenta criar a função diretamente usando a API REST
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
        console.error('Não foi possível criar a função execute_sql automaticamente.');
        console.error('Execute primeiro o script create-execute-sql.js antes de continuar.');
        process.exit(1);
      }
    }

    // Ler o conteúdo do arquivo de migração existente
    const migrationFilePath = path.join(__dirname, '../supabase/migrations/20240510000000_create_friend_requests_table.sql');
    const sqlMigration = fs.readFileSync(migrationFilePath, 'utf8');
    
    console.log('Aplicando migração da tabela friend_requests do arquivo original...');

    // Executar o SQL da migração
    const { error: migrationError } = await supabase.rpc('execute_sql', {
      sql_query: sqlMigration
    });

    if (migrationError) {
      console.error('Erro ao aplicar migração da tabela friend_requests:', migrationError);
      
      // Tentativa alternativa: aplicar o SQL em partes
      console.log('Tentando aplicar a migração em partes...');
      
      // Criar tabela básica
      const { error: tableError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS friend_requests (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT unique_friend_request UNIQUE (sender_id, receiver_id)
          );
        `
      });
      
      if (tableError) {
        console.error('Erro ao criar tabela básica:', tableError);
        console.error('Verifique se você tem permissões adequadas no banco de dados.');
      } else {
        console.log('Tabela friend_requests criada com sucesso!');
        
        // Aplicar RLS e políticas
        const { error: rlsError } = await supabase.rpc('execute_sql', {
          sql_query: `
            -- Add Row Level Security
            ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

            -- Allow users to create their own friend requests
            DROP POLICY IF EXISTS "Allow user to send request" ON friend_requests;
            CREATE POLICY "Allow user to send request"
              ON friend_requests
              FOR INSERT
              WITH CHECK (auth.uid() = sender_id);

            -- Allow users to see requests they've sent or received
            DROP POLICY IF EXISTS "Allow users to view their own requests" ON friend_requests;
            CREATE POLICY "Allow users to view their own requests"
              ON friend_requests
              FOR SELECT
              USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

            -- Allow users to update requests they're involved with
            DROP POLICY IF EXISTS "Allow users to update request status" ON friend_requests;
            CREATE POLICY "Allow users to update request status"
              ON friend_requests
              FOR UPDATE
              USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
          `
        });
        
        if (rlsError) {
          console.error('Erro ao aplicar políticas de segurança:', rlsError);
        } else {
          console.log('Políticas de segurança aplicadas com sucesso!');
        }
      }
    } else {
      console.log('Migração da tabela friend_requests aplicada com sucesso!');
    }

  } catch (error) {
    console.error('Erro durante a criação da tabela friend_requests:', error);
  }
}

main();
