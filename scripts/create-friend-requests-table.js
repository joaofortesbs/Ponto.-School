
// Script para criar a tabela friend_requests
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Credenciais do Supabase não definidas!');
  console.error('Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Iniciando criação da tabela friend_requests...');

  try {
    // Verificar se a função execute_sql existe
    const { error: pingError } = await supabase.rpc('rpc_ping').catch(() => {
      return { error: { message: 'Função de ping não existe' } };
    });

    if (pingError) {
      console.log('Criando função execute_sql diretamente...');
      
      const { error: sqlFunctionError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
          RETURNS VOID AS $$
          BEGIN
            EXECUTE sql_query;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      }).catch(() => {
        // Tenta executar SQL diretamente
        return { error: null };
      });
      
      if (sqlFunctionError) {
        console.error('Erro ao criar função execute_sql:', sqlFunctionError);
      }
    }

    // Criar tabela friend_requests
    const { error: tableError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS friend_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          sender_id UUID REFERENCES auth.users(id),
          receiver_id UUID REFERENCES auth.users(id),
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
        
        -- Habilitar RLS na tabela
        ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
        
        -- Criar política para inserção (só pode enviar solicitações próprias)
        DROP POLICY IF EXISTS "Usuários podem enviar solicitações de amizade" ON friend_requests;
        CREATE POLICY "Usuários podem enviar solicitações de amizade"
          ON friend_requests FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = sender_id);
          
        -- Criar política para visualização
        DROP POLICY IF EXISTS "Usuários podem ver solicitações relacionadas a eles" ON friend_requests;
        CREATE POLICY "Usuários podem ver solicitações relacionadas a eles"
          ON friend_requests FOR SELECT
          TO authenticated
          USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
          
        -- Criar política para atualização (ambos podem atualizar)
        DROP POLICY IF EXISTS "Usuários podem atualizar solicitações relacionadas a eles" ON friend_requests;
        CREATE POLICY "Usuários podem atualizar solicitações relacionadas a eles"
          ON friend_requests FOR UPDATE
          TO authenticated
          USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
      `
    });

    if (tableError) {
      console.error('Erro ao criar tabela friend_requests:', tableError);
    } else {
      console.log('Tabela friend_requests criada ou atualizada com sucesso!');
    }

  } catch (error) {
    console.error('Erro durante a criação da tabela friend_requests:', error);
  }
}

main();
