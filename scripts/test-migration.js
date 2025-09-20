
const { Client } = require('pg');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

async function testMigration() {
  const client = new Client({ connectionString: databaseUrl });
  
  try {
    await client.connect();
    console.log('🔍 Testando migração...');
    
    // Testar estrutura das tabelas
    const tables = ['users', 'profiles', 'flow_sessions', 'user_streak', 'tarefas', 'grupos_estudo'];
    
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ Tabela ${table}: ${result.rows[0].count} registros`);
      } catch (error) {
        console.error(`❌ Erro na tabela ${table}:`, error.message);
      }
    }
    
    // Testar algumas operações CRUD
    console.log('\n🧪 Testando operações CRUD...');
    
    // Teste de inserção de usuário
    try {
      const userResult = await client.query(`
        INSERT INTO users (email, password_hash, email_confirmed)
        VALUES ('test@example.com', 'test_hash', true)
        RETURNING id, email
      `);
      
      const userId = userResult.rows[0].id;
      console.log('✅ Usuário de teste criado:', userResult.rows[0].email);
      
      // Teste de inserção de perfil
      await client.query(`
        INSERT INTO profiles (id, email, display_name)
        VALUES ($1, 'test@example.com', 'Teste')
      `, [userId]);
      
      console.log('✅ Perfil de teste criado');
      
      // Teste de inserção de tarefa
      await client.query(`
        INSERT INTO tarefas (user_id, titulo, descricao, status)
        VALUES ($1, 'Tarefa de teste', 'Descrição de teste', false)
      `, [userId]);
      
      console.log('✅ Tarefa de teste criada');
      
      // Limpeza dos dados de teste
      await client.query('DELETE FROM tarefas WHERE titulo = $1', ['Tarefa de teste']);
      await client.query('DELETE FROM profiles WHERE email = $1', ['test@example.com']);
      await client.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
      
      console.log('✅ Dados de teste removidos');
      
    } catch (error) {
      console.error('❌ Erro nos testes CRUD:', error.message);
    }
    
    console.log('\n🎉 Teste de migração concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    await client.end();
  }
}

testMigration();
