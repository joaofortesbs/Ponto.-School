
// Script para configurar o armazenamento no Supabase
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
    // Verificar se o bucket profile-images existe
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      throw new Error(`Erro ao listar buckets: ${bucketsError.message}`);
    }

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
