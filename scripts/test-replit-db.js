
/**
 * Script para testar a conexão com o banco de dados PostgreSQL do Replit
 */

require('dotenv').config();
const { Pool } = require('pg');

async function testReplitDatabase() {
  console.log('Testando conexão com banco de dados Replit...');
  
  // Verificando variável de ambiente
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('Erro: Variável de ambiente DATABASE_URL não encontrada!');
    console.error('Por favor, crie um banco de dados no Replit através do painel Database.');
    return;
  }
  
  // Usar o pooler para melhor desempenho
  const connectionPoolUrl = databaseUrl.replace('.us-east-2', '-pooler.us-east-2');
  
  const pool = new Pool({
    connectionString: connectionPoolUrl,
    max: 5,
  });
  
  try {
    // Testar conexão
    console.log('Conectando ao banco de dados...');
    const client = await pool.connect();
    
    try {
      // Consulta de teste
      const result = await client.query('SELECT NOW() as time');
      console.log('Conexão bem-sucedida! Hora do servidor:', result.rows[0].time);
      
      // Contagem de registros nas tabelas principais
      const tables = ['profiles', 'grupos_estudo'];
      
      for (const table of tables) {
        try {
          const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
          console.log(`Tabela ${table}: ${countResult.rows[0].count} registros`);
        } catch (tableError) {
          console.log(`Tabela ${table} não existe ou não é acessível`);
        }
      }
      
      console.log('Teste de conexão concluído com sucesso!');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
  } finally {
    await pool.end();
  }
}

testReplitDatabase()
  .then(() => {
    console.log('Script concluído.');
  })
  .catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
  });
