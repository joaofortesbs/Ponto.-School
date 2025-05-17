
// Script para verificar se a tabela friend_requests existe
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Credenciais do Supabase não definidas!');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable() {
  console.log('Verificando se a tabela friend_requests existe...');
  
  try {
    // Consulta para verificar se a tabela existe
    const { data, error } = await supabase
      .from('friend_requests')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.error('A tabela friend_requests não existe!');
      } else {
        console.error('Erro ao verificar tabela:', error);
      }
      return false;
    }
    
    console.log('A tabela friend_requests existe e está acessível.');
    return true;
  } catch (error) {
    console.error('Erro ao verificar tabela friend_requests:', error);
    return false;
  }
}

checkTable();
