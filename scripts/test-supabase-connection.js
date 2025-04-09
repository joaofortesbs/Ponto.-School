import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Configurar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  console.log('Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔄 Testando conexão com o Supabase...');

  try {
    // Testando autenticação anônima
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Erro ao verificar sessão:', error.message);
      return false;
    }

    // Testando acesso à tabela profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (profilesError) {
      console.error('❌ Erro ao acessar tabela profiles:', profilesError.message);
      if (profilesError.code === 'PGRST301') {
        console.log('⚠️ A tabela "profiles" parece não existir. Verifique se as migrações foram executadas.');
      }
      return false;
    }

    console.log('✅ Conexão com o Supabase estabelecida com sucesso!');
    console.log('📊 Tabela profiles acessível.');

    // Verifique se há registros na tabela profiles
    if (profilesData && profilesData.length > 0) {
      console.log(`ℹ️ Encontrado ${profilesData.length} registro(s) na tabela profiles.`);
    } else {
      console.log('ℹ️ Nenhum registro encontrado na tabela profiles.');
    }

    return true;
  } catch (err) {
    console.error('❌ Erro ao testar conexão com o Supabase:', err);
    return false;
  }
}

// Executar teste
testConnection()
  .then(success => {
    if (success) {
      console.log('🎉 Testes de conexão com o Supabase completados com sucesso!');
    } else {
      console.error('❌ Falha nos testes de conexão com o Supabase.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ Erro inesperado durante o teste:', err);
    process.exit(1);
  });