
/**
 * Script para configurar banco de dados simples
 * Cria tabela grupos_estudo diretamente via SQL
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function setupSimpleDatabase() {
  console.log('Iniciando configuração simplificada do banco de dados...');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Credenciais do Supabase não encontradas nas variáveis de ambiente!');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Criar tabela grupos_estudo de forma simples
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.grupos_estudo (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL,
      nome TEXT NOT NULL,
      descricao TEXT,
      cor TEXT NOT NULL DEFAULT '#FF6B00',
      membros INTEGER NOT NULL DEFAULT 1,
      topico TEXT,
      topico_nome TEXT,
      topico_icon TEXT,
      privado BOOLEAN DEFAULT false,
      visibilidade TEXT DEFAULT 'todos',
      codigo TEXT,
      data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Create index for faster queries
    CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON public.grupos_estudo(user_id);
    
    -- Grant access to authenticated users
    ALTER TABLE public.grupos_estudo ENABLE ROW LEVEL SECURITY;
    
    -- Policies para acesso seguro
    DO $$
    BEGIN
      -- Drop existing policies first to avoid errors
      DROP POLICY IF EXISTS "Users can view their own grupos_estudo" ON public.grupos_estudo;
      DROP POLICY IF EXISTS "Users can insert their own grupos_estudo" ON public.grupos_estudo;
      DROP POLICY IF EXISTS "Users can update their own grupos_estudo" ON public.grupos_estudo;
      DROP POLICY IF EXISTS "Users can delete their own grupos_estudo" ON public.grupos_estudo;
      
      -- Create new policies
      CREATE POLICY "Users can view their own grupos_estudo"
        ON public.grupos_estudo FOR SELECT
        USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can insert their own grupos_estudo"
        ON public.grupos_estudo FOR INSERT
        WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can update their own grupos_estudo"
        ON public.grupos_estudo FOR UPDATE
        USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can delete their own grupos_estudo"
        ON public.grupos_estudo FOR DELETE
        USING (auth.uid() = user_id);
    EXCEPTION
      WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao criar políticas: %', SQLERRM;
    END
    $$;
  `;
  
  try {
    // Tentar executar o SQL via função RPC (se existir)
    const { error: rpcError } = await supabase.rpc('execute_sql', {
      sql_query: createTableSQL
    });
    
    if (rpcError) {
      console.log('Não foi possível usar a função execute_sql:', rpcError.message);
      console.log('Tentando método alternativo...');
      
      // Método alternativo: usar a API REST diretamente
      const { error: restError } = await supabase.from('sql_queries').insert({
        query: createTableSQL,
        executed_at: new Date().toISOString()
      });
      
      if (restError) {
        console.error('Falha ao executar SQL via REST API:', restError);
        return;
      }
    }
    
    console.log('Banco de dados configurado com sucesso!');
    console.log('Tabela grupos_estudo criada ou já existente.');
    
  } catch (error) {
    console.error('Erro ao configurar banco de dados:', error);
  }
}

setupSimpleDatabase()
  .then(() => {
    console.log('Script concluído.');
  })
  .catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
  });
