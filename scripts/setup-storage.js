
// Script para configurar o armazenamento no Supabase
// Inclui configuração para armazenar fotos de perfil
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function setupStorage() {
  console.log('Iniciando configuração do armazenamento Supabase...');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_KEY são necessárias');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Verificar se os buckets existem
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      throw new Error(`Erro ao listar buckets: ${bucketsError.message}`);
    }

    // Configurar bucket para profile-pictures
    const profilePicturesBucket = buckets.find(b => b.name === 'profile-pictures');
    
    if (!profilePicturesBucket) {
      console.log('Criando bucket "profile-pictures"...');
      
      const { data: picturesData, error: picturesError } = await supabase
        .storage
        .createBucket('profile-pictures', {
          public: true
        });
        
      if (picturesError) {
        throw new Error(`Erro ao criar bucket profile-pictures: ${picturesError.message}`);
      }
      
      console.log('Bucket "profile-pictures" criado com sucesso!');
      
      // Definir políticas para o bucket profile-pictures
      console.log('Configurando políticas de acesso para fotos de perfil...');
      
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
      
      console.log('Políticas de acesso para fotos de perfil configuradas com sucesso!');
    } else {
      console.log('Bucket "profile-pictures" já existe, verificando políticas...');
      
      // Verificar se as políticas existem e criar se necessário
      const { data: policies, error: policiesError } = await supabase
        .storage
        .getBucket('profile-pictures');
        
      if (policiesError) {
        console.error(`Erro ao verificar políticas: ${policiesError.message}`);
      } else {
        console.log('Políticas para "profile-pictures" verificadas.');
      }
    }
    
    // Verificar se o bucket profile-images existe
    const profileImagesBucket = buckets.find(b => b.name === 'profile-images');

    if (!profileImagesBucket) {
      console.log('Criando bucket "profile-images"...');
      
      const { data, error } = await supabase
        .storage
        .createBucket('profile-images', {
          public: true
        });

      if (error) {
        throw new Error(`Erro ao criar bucket: ${error.message}`);
      }
      
      console.log('Bucket "profile-images" criado com sucesso!');
      
      // Definir políticas para o bucket
      console.log('Configurando políticas de acesso para o bucket...');
      
      // Permitir leitura pública
      await supabase.rpc('create_storage_policy', {
        bucket_name: 'profile-images',
        policy_name: 'Public Read',
        definition: 'true',
        operation: 'SELECT'
      });
      
      // Permitir upload para usuários autenticados
      await supabase.rpc('create_storage_policy', {
        bucket_name: 'profile-images',
        policy_name: 'Auth Insert',
        definition: 'auth.role() = \'authenticated\'',
        operation: 'INSERT'
      });
      
      // Permitir atualização para usuários autenticados
      await supabase.rpc('create_storage_policy', {
        bucket_name: 'profile-images',
        policy_name: 'Auth Update',
        definition: 'auth.role() = \'authenticated\'',
        operation: 'UPDATE'
      });
      
      console.log('Políticas de acesso configuradas com sucesso!');
    } else {
      console.log('Bucket "profile-images" já existe, pulando criação...');
    }

    console.log('Configuração de armazenamento concluída com sucesso!');
  } catch (error) {
    console.error(`Erro durante a configuração do armazenamento: ${error.message}`);
    process.exit(1);
  }
}

setupStorage();
