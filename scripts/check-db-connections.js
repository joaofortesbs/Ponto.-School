
// Script para verificar conexões com bancos de dados
require('dotenv').config();

async function checkDatabaseConnections() {
  console.log('Verificando conexões com bancos de dados...');
  
  // Verificar Supabase
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('Status Supabase:');
  if (supabaseUrl && supabaseKey) {
    console.log('✓ Credenciais Supabase configuradas');
    
    try {
      // Importar dinamicamente para evitar problemas com ESM/CommonJS
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error && error.code !== 'PGRST204') {
        console.log('✗ Erro na conexão Supabase:', error.message);
      } else {
        console.log('✓ Conexão Supabase OK');
      }
    } catch (err) {
      console.log('✗ Erro ao testar Supabase:', err.message);
    }
  } else {
    console.log('✗ Credenciais Supabase não configuradas');
  }
  
  // Verificar Neon
  const neonConnStr = process.env.NEON_CONNECTION_STRING;
  
  console.log('\nStatus Neon PostgreSQL:');
  if (neonConnStr && !neonConnStr.includes('[user]')) {
    console.log('✓ String de conexão Neon configurada');
    
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: neonConnStr,
        ssl: {
          rejectUnauthorized: false
        }
      });
      
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      console.log('✓ Conexão Neon OK -', result.rows[0].now);
      client.release();
      await pool.end();
    } catch (err) {
      console.log('✗ Erro na conexão Neon:', err.message);
    }
  } else {
    console.log('✗ String de conexão Neon não configurada ou inválida');
    console.log('  Por favor, edite o arquivo .env e configure NEON_CONNECTION_STRING');
  }
}

// Executar verificação
checkDatabaseConnections()
  .then(() => {
    console.log('\nVerificação de banco de dados concluída.');
  })
  .catch((error) => {
    console.error('Erro durante verificação:', error);
  });
