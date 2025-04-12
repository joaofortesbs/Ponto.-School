
// Script para verificar e configurar o bucket de armazenamento do Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('As variáveis de ambiente do Supabase não estão configuradas corretamente.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

async function setupStorage() {
  console.log('Verificando configuração de armazenamento...');

  try {
    // Verificar se o bucket 'profiles' existe
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('profiles');

    if (bucketError && bucketError.message.includes('not found')) {
      console.log("Bucket 'profiles' não encontrado, tentando criar...");
      
      // Tentar com client normal primeiro
      const { error: createError } = await supabase.storage.createBucket('profiles', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

      if (createError) {
        console.warn("Erro ao criar bucket com client normal:", createError.message);
        
        // Se temos client admin, tentar com ele
        if (adminClient) {
          console.log("Tentando criar bucket com permissões de administrador...");
          const { error: adminCreateError } = await adminClient.storage.createBucket('profiles', {
            public: true,
            fileSizeLimit: 5242880,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
          });

          if (adminCreateError) {
            console.error("Erro ao criar bucket mesmo com permissões de administrador:", adminCreateError.message);
            console.log("Sugestão: Verifique se o bucket pode ser criado manualmente através do console do Supabase.");
          } else {
            console.log("Bucket 'profiles' criado com sucesso usando permissões de administrador!");
          }
        } else {
          console.log("Chave de serviço não disponível para tentar criação com permissões elevadas.");
          console.log("Sugestão: Configure SUPABASE_SERVICE_ROLE_KEY no arquivo .env ou crie o bucket manualmente.");
        }
      } else {
        console.log("Bucket 'profiles' criado com sucesso!");
      }
    } else if (bucketError) {
      console.error("Erro ao verificar bucket:", bucketError.message);
    } else {
      console.log("Bucket 'profiles' já existe!");
      
      // Verificar e atualizar políticas de acesso
      if (adminClient) {
        // Aplicar políticas via SQL direto
        const { error: policyError } = await adminClient.rpc('execute_sql', {
          sql_query: `
          -- Certifica-se de que as políticas estão aplicadas
          CREATE POLICY IF NOT EXISTS "Profiles Images Public Read Access" 
            ON storage.objects FOR SELECT USING (bucket_id = 'profiles');
            
          CREATE POLICY IF NOT EXISTS "Authenticated Users Can Upload Profile Images" 
            ON storage.objects FOR INSERT TO authenticated USING (bucket_id = 'profiles');
            
          CREATE POLICY IF NOT EXISTS "Authenticated Users Can Update Own Profile Images" 
            ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profiles');
            
          CREATE POLICY IF NOT EXISTS "Authenticated Users Can Delete Own Profile Images" 
            ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profiles');
          `
        });
        
        if (policyError) {
          console.warn("Não foi possível atualizar políticas:", policyError.message);
        } else {
          console.log("Políticas do bucket verificadas e atualizadas!");
        }
      }
    }

    // Verificar se podemos listar os objetos (teste de permissão)
    const { data: listData, error: listError } = await supabase.storage
      .from('profiles')
      .list();

    if (listError) {
      console.warn("Erro ao listar objetos do bucket:", listError.message);
    } else {
      console.log(`Bucket 'profiles' acessível, contém ${listData.length} objetos.`);
    }

    // Testar upload de um arquivo de teste
    const testData = Uint8Array.from([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0,
      1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 10, 73, 68,
      65, 84, 120, 156, 99, 0, 1, 0, 0, 5, 0, 1, 13, 10, 45, 180, 0, 0, 0,
      0, 73, 69, 78, 68, 174, 66, 96, 130
    ]); // PNG 1x1 pixel

    const testFile = new Blob([testData], { type: 'image/png' });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profiles')
      .upload('test-upload.png', testFile, {
        upsert: true
      });

    if (uploadError) {
      console.error("Erro ao fazer upload de teste:", uploadError.message);
      console.log("Verifique as permissões e políticas do bucket.");
    } else {
      console.log("Upload de teste bem-sucedido!");
      
      // Limpar arquivo de teste
      const { error: removeError } = await supabase.storage
        .from('profiles')
        .remove(['test-upload.png']);
        
      if (removeError) {
        console.warn("Não foi possível remover arquivo de teste:", removeError.message);
      } else {
        console.log("Arquivo de teste removido com sucesso.");
      }
    }

    console.log("Verificação de armazenamento concluída!");
  } catch (error) {
    console.error("Erro durante a verificação de armazenamento:", error.message);
  }
}

setupStorage()
  .then(() => {
    console.log('Configuração de armazenamento finalizada.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Erro durante a configuração:', err);
    process.exit(1);
  });
