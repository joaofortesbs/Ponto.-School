
// Este script pode ser usado para verificar a conexão com Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function main() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não estão definidas');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('Verificando conexão com Supabase...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    console.log('A aplicação está configurada para usar apenas o Supabase como banco de dados.');
    
    // Verificar tabelas
    console.log('\nVerificando tabelas existentes...');
    const { data: tables, error: tablesError } = await supabase.rpc('execute_sql', { 
      sql_query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';" 
    });
    
    if (tablesError) {
      console.error('Erro ao verificar tabelas:', tablesError);
    } else {
      console.log('Tabelas encontradas:');
      tables.forEach(table => console.log(`- ${table.table_name}`));
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error);
    console.log('\nPor favor, verifique suas credenciais do Supabase no arquivo .env:');
    console.log('- VITE_SUPABASE_URL');
    console.log('- VITE_SUPABASE_ANON_KEY');
  }
}

main();
