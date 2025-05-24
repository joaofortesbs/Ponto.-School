
#!/usr/bin/env node
// Script para configurar o armazenamento de imagens de perfil

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function setupProfileStorage() {
  console.log('Iniciando configuração do armazenamento para perfis...');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_KEY são necessárias');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Aplicar migração para criar índice
    console.log('Aplicando migração para criar índice em profiles...');
    const { error: indexError } = await supabase.rpc('execute_sql', {
      sql_query: `
        -- Criar índice para otimizar buscas por username
        CREATE INDEX IF NOT EXISTS idx_username ON profiles (username);
      `
    });

    if (indexError) {
      console.error('Erro ao criar índice:', indexError);
    } else {
      console.log('Índice criado com sucesso');
    }

    // 2. Verificar se o bucket profile-pictures existe
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      throw new Error(`Erro ao listar buckets: ${bucketsError.message}`);
    }

    const profilePicturesBucket = buckets.find(b => b.name === 'profile-pictures');
    
    if (!profilePicturesBucket) {
      console.log('Criando bucket "profile-pictures"...');
      
      const { error: createBucketError } = await supabase.storage
        .createBucket('profile-pictures', {
          public: true
        });
        
      if (createBucketError) {
        throw new Error(`Erro ao criar bucket: ${createBucketError.message}`);
      }
      
      console.log('Bucket "profile-pictures" criado com sucesso!');
    } else {
      console.log('Bucket "profile-pictures" já existe');
    }

    // 3. Configurar políticas para o bucket
    console.log('Configurando políticas de acesso...');
    
    // Permitir leitura pública
    await supabase.rpc('create_storage_policy', {
      bucket_name: 'profile-pictures',
      policy_name: 'Public Read',
      definition: 'true',
      operation: 'SELECT'
    });
    
    // Permitir upload apenas para usuários em sua própria pasta
    await supabase.rpc('create_storage_policy', {
      bucket_name: 'profile-pictures',
      policy_name: 'Auth Insert Own Folder',
      definition: 'auth.role() = \'authenticated\' AND (storage.foldername(name))[1] = auth.uid()::text',
      operation: 'INSERT'
    });
    
    // Permitir atualização apenas para usuários em sua própria pasta
    await supabase.rpc('create_storage_policy', {
      bucket_name: 'profile-pictures',
      policy_name: 'Auth Update Own Folder',
      definition: 'auth.role() = \'authenticated\' AND (storage.foldername(name))[1] = auth.uid()::text',
      operation: 'UPDATE'
    });
    
    // Permitir exclusão apenas para usuários em sua própria pasta
    await supabase.rpc('create_storage_policy', {
      bucket_name: 'profile-pictures',
      policy_name: 'Auth Delete Own Folder',
      definition: 'auth.role() = \'authenticated\' AND (storage.foldername(name))[1] = auth.uid()::text',
      operation: 'DELETE'
    });
    
    console.log('Configuração concluída com sucesso!');

    // 4. Testar a política com usuário não autenticado
    console.log('Testando política com usuário não autenticado...');
    
    // Anon client sem autenticação
    const anonClient = createClient(supabaseUrl, supabaseKey);
    
    const testFilePath = 'teste/arquivo.txt';
    const { error: unauthorizedError } = await anonClient.storage
      .from('profile-pictures')
      .upload(testFilePath, new Blob(['teste']), {
        cacheControl: '0'
      });
    
    if (unauthorizedError && unauthorizedError.message.includes('not authorized')) {
      console.log('Teste de segurança passado: usuário não autenticado não pode fazer upload');
    } else if (unauthorizedError) {
      console.log('Erro diferente do esperado:', unauthorizedError);
    } else {
      console.error('ATENÇÃO: Teste de segurança falhou - usuário não autenticado conseguiu fazer upload!');
      
      // Limpar o arquivo de teste caso tenha sido criado
      await supabase.storage
        .from('profile-pictures')
        .remove([testFilePath]);
    }

  } catch (error) {
    console.error(`Erro durante a configuração: ${error.message}`);
    process.exit(1);
  }
}

setupProfileStorage()
  .then(() => console.log('Script finalizado'))
  .catch(err => {
    console.error('Erro não tratado:', err);
    process.exit(1);
  });
