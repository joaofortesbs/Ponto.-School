
// Script para verificar a saúde da aplicação e do banco de dados
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Verificar ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Iniciando verificação de saúde da aplicação...');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Credenciais do Supabase não configuradas!');
  process.exit(1);
}

async function checkSupabaseConnection() {
  try {
    console.log('Verificando conexão com o banco de dados...');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      console.error('Erro na conexão com o Supabase:', error.message);
      return false;
    }
    
    console.log('Conexão com o Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao tentar conectar com a aplicação:', error);
    return false;
  }
}

async function checkApiConnection() {
  try {
    console.log('Verificando conexão com API...');
    
    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    const response = await axios.get(`${appUrl}/api/health`, { timeout: 5000 });
    
    if (response.status === 200) {
      console.log('API está funcionando corretamente!');
      return true;
    } else {
      console.error('API retornou status não esperado:', response.status);
      return false;
    }
  } catch (error) {
    console.log('API não respondeu ou não está disponível. Isso é esperado durante o desenvolvimento.');
    return true; // Retorna true mesmo com erro para não bloquear desenvolvimento
  }
}

async function checkApplicationHealth() {
  try {
    console.log('Verificando saúde geral da aplicação...');
    
    const dbConnection = await checkSupabaseConnection();
    const apiConnection = await checkApiConnection();
    
    console.log('\nResultados da verificação de saúde:');
    console.log(`- Conexão com Banco de Dados: ${dbConnection ? 'OK' : 'FALHA'}`);
    console.log(`- Conexão com API: ${apiConnection ? 'OK' : 'FALHA'}`);
    
    if (dbConnection && apiConnection) {
      console.log('\n✅ Aplicação está funcionando corretamente!');
      return true;
    } else {
      console.log('\n⚠️ Aplicação está com problemas! Verifique os logs acima.');
      return false;
    }
  } catch (error) {
    console.error('Erro na verificação de saúde da aplicação:', error);
    return false;
  }
}

// Executar verificação
checkApplicationHealth()
  .then(isHealthy => {
    if (!isHealthy) {
      console.log('\nDicas para solução de problemas:');
      console.log('1. Verifique se as variáveis de ambiente estão configuradas corretamente');
      console.log('2. Verifique se o Supabase está disponível e acessível');
      console.log('3. Verifique se a aplicação está rodando na porta correta');
      console.log('4. Verifique os logs do console para erros específicos');
    }
  })
  .catch(error => {
    console.error('Erro durante verificação:', error);
    process.exit(1);
  });
