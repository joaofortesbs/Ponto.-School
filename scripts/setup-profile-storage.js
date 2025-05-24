
// Script para configurar o storage de perfil no Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Verificar configurações
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Credenciais do Supabase não definidas!');
  console.error('Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase com chave de serviço para operações administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Iniciando configuração do Supabase Storage...');

  try {
    // 1. Criar bucket para imagens de perfil se não existir
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    const profileBucketName = 'profile-pictures';
    let profileBucketExists = false;
    
    if (bucketsError) {
      console.error('Erro ao listar buckets:', bucketsError);
    } else {
      profileBucketExists = buckets.some(bucket => bucket.name === profileBucketName);
      console.log(profileBucketExists 
        ? 'Bucket de imagens de perfil já existe' 
        : 'Bucket de imagens de perfil não encontrado, criando...');
    }

    // Criar bucket se não existir
    if (!profileBucketExists) {
      const { error: createBucketError } = await supabase.storage.createBucket(profileBucketName, {
        public: true, // Permitir URLs públicas para as imagens
        fileSizeLimit: 1024 * 1024 * 2, // Limite de 2MB por arquivo
      });

      if (createBucketError) {
        console.error('Erro ao criar bucket de imagens de perfil:', createBucketError);
        return;
      }
      
      console.log('Bucket de imagens de perfil criado com sucesso');
    }

    // 2. Configurar políticas de acesso para o bucket
    console.log('Configurando políticas de acesso para imagens de perfil...');

    // Política para SELECT (visualização pública das imagens)
    const { error: selectPolicyError } = await supabase.rpc('execute_sql', {
      sql_query: `
        BEGIN;
        -- Remover políticas existentes para evitar conflitos
        DROP POLICY IF EXISTS "Imagens de perfil são públicas" ON storage.objects;
        
        -- Criar política para visualização pública
        CREATE POLICY "Imagens de perfil são públicas"
        ON storage.objects FOR SELECT
        USING (bucket_id = '${profileBucketName}');
        
        COMMIT;
      `
    });

    if (selectPolicyError) {
      console.error('Erro ao criar política de visualização:', selectPolicyError);
    } else {
      console.log('Política de visualização pública configurada com sucesso');
    }

    // Política para INSERT (upload)
    const { error: insertPolicyError } = await supabase.rpc('execute_sql', {
      sql_query: `
        BEGIN;
        -- Remover políticas existentes para evitar conflitos
        DROP POLICY IF EXISTS "Usuários podem fazer upload de suas próprias fotos" ON storage.objects;
        
        -- Criar política para upload
        CREATE POLICY "Usuários podem fazer upload de suas próprias fotos"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
          bucket_id = '${profileBucketName}' AND
          (storage.foldername(name))[1] = auth.uid()::text
        );
        
        COMMIT;
      `
    });

    if (insertPolicyError) {
      console.error('Erro ao criar política de upload:', insertPolicyError);
    } else {
      console.log('Política de upload configurada com sucesso');
    }

    // Política para UPDATE
    const { error: updatePolicyError } = await supabase.rpc('execute_sql', {
      sql_query: `
        BEGIN;
        -- Remover políticas existentes para evitar conflitos
        DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias fotos" ON storage.objects;
        
        -- Criar política para atualização
        CREATE POLICY "Usuários podem atualizar suas próprias fotos"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (
          bucket_id = '${profileBucketName}' AND
          (storage.foldername(name))[1] = auth.uid()::text
        );
        
        COMMIT;
      `
    });

    if (updatePolicyError) {
      console.error('Erro ao criar política de atualização:', updatePolicyError);
    } else {
      console.log('Política de atualização configurada com sucesso');
    }

    // Política para DELETE
    const { error: deletePolicyError } = await supabase.rpc('execute_sql', {
      sql_query: `
        BEGIN;
        -- Remover políticas existentes para evitar conflitos
        DROP POLICY IF EXISTS "Usuários podem excluir suas próprias fotos" ON storage.objects;
        
        -- Criar política para exclusão
        CREATE POLICY "Usuários podem excluir suas próprias fotos"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
          bucket_id = '${profileBucketName}' AND
          (storage.foldername(name))[1] = auth.uid()::text
        );
        
        COMMIT;
      `
    });

    if (deletePolicyError) {
      console.error('Erro ao criar política de exclusão:', deletePolicyError);
    } else {
      console.log('Política de exclusão configurada com sucesso');
    }

    // 3. Criar índice para otimizar buscas por username na tabela profiles
    console.log('Criando índice para busca por username...');
    
    const { error: indexError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_username ON profiles (username);
      `
    });

    if (indexError) {
      console.error('Erro ao criar índice de username:', indexError);
    } else {
      console.log('Índice de username criado com sucesso');
    }

    console.log('Configuração do Storage e índices concluída com sucesso!');
    
  } catch (error) {
    console.error('Erro durante a configuração do Storage:', error);
  }
}

// Executar a função principal
main();
