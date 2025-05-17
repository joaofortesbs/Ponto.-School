
// Script simplificado para configurar a tabela friend_requests
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('=== Script de configuração da tabela friend_requests ===');

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Credenciais do Supabase não definidas!');
  console.error('   Certifique-se de que VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou VITE_SUPABASE_ANON_KEY) estão definidos no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL(sql) {
  try {
    const { error } = await supabase.rpc('execute_sql', { sql_query: sql });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Erro ao executar SQL:', error.message);
    return false;
  }
}

async function checkTableExists() {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      return false; // Tabela não existe
    }
    
    return true; // Tabela existe
  } catch (error) {
    console.error('❌ Erro ao verificar existência da tabela:', error.message);
    return false;
  }
}

async function createTableDirectly() {
  // SQL para criar a tabela diretamente
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS friend_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
      CONSTRAINT unique_friend_request UNIQUE (sender_id, receiver_id)
    );
    
    -- Habilitar RLS na tabela
    ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
    
    -- Criar políticas para a tabela
    DROP POLICY IF EXISTS "Allow user to send request" ON friend_requests;
    CREATE POLICY "Allow user to send request"
      ON friend_requests
      FOR INSERT
      WITH CHECK (auth.uid() = sender_id);
      
    DROP POLICY IF EXISTS "Allow users to view their own requests" ON friend_requests;
    CREATE POLICY "Allow users to view their own requests"
      ON friend_requests
      FOR SELECT
      USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
      
    DROP POLICY IF EXISTS "Allow users to update request status" ON friend_requests;
    CREATE POLICY "Allow users to update request status"
      ON friend_requests
      FOR UPDATE
      USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
  `;
  
  console.log('Criando tabela friend_requests diretamente...');
  return await executeSQL(createTableSQL);
}

async function applyMigrationFile() {
  try {
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, '../supabase/migrations/20240510000000_create_friend_requests_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Aplicando arquivo de migração SQL...');
    return await executeSQL(migrationSQL);
  } catch (error) {
    console.error('❌ Erro ao aplicar arquivo de migração:', error.message);
    return false;
  }
}

async function main() {
  console.log('Iniciando configuração da tabela friend_requests...');
  
  // Passo 1: Verificar se a função execute_sql existe
  try {
    const { data: testResult, error: testError } = await supabase
      .rpc('execute_sql', { sql_query: 'SELECT 1 as test' })
      .catch(() => ({ error: { message: 'Função não existe' } }));
      
    if (testError) {
      console.log('⚠️ A função execute_sql não existe. Executando script para criá-la...');
      
      // Executar o script create-execute-sql.js
      const { execSync } = require('child_process');
      try {
        execSync('node scripts/create-execute-sql.js', { stdio: 'inherit' });
        console.log('✅ Função execute_sql criada com sucesso!');
      } catch (error) {
        console.error('❌ Falha ao criar função execute_sql:', error.message);
        console.error('   Execute manualmente: node scripts/create-execute-sql.js');
        process.exit(1);
      }
    } else {
      console.log('✅ Função execute_sql já existe!');
    }
    
    // Passo 2: Verificar se a tabela friend_requests já existe
    const tableExists = await checkTableExists();
    
    if (tableExists) {
      console.log('✅ Tabela friend_requests já existe!');
    } else {
      console.log('⚠️ Tabela friend_requests não encontrada. Criando...');
      
      // Tentar aplicar o arquivo de migração primeiro
      let success = await applyMigrationFile();
      
      // Se falhar, tentar criar a tabela diretamente
      if (!success) {
        console.log('⚠️ Falha ao aplicar arquivo de migração. Tentando criar tabela diretamente...');
        success = await createTableDirectly();
      }
      
      if (success) {
        console.log('✅ Tabela friend_requests criada com sucesso!');
      } else {
        console.error('❌ Falha ao criar tabela friend_requests. Verifique suas permissões no banco de dados.');
        process.exit(1);
      }
    }
    
    // Passo 3: Verificar novamente se a tabela existe
    const finalCheck = await checkTableExists();
    
    if (finalCheck) {
      console.log('✅ Verificação final: tabela friend_requests está corretamente configurada!');
      console.log('\n🎉 Configuração da tabela friend_requests concluída com sucesso!');
      console.log('   A funcionalidade de solicitações de amizade agora deve estar operacional.');
    } else {
      console.error('❌ Verificação final: tabela friend_requests não foi encontrada.');
      console.error('   Pode haver um problema com as permissões ou configuração do banco de dados.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Erro durante o processo de configuração:', error.message);
    process.exit(1);
  }
}

// Executar o script
main();
