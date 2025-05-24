
require('dotenv').config();
const { Pool } = require('pg');

const setupFriendshipTables = async () => {
  console.log('Iniciando configuração das tabelas de amizade no banco Neon...');
  
  // Conectar ao banco de dados Neon
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Verificar conexão
    await pool.query('SELECT NOW()');
    console.log('Conexão com banco Neon estabelecida com sucesso!');

    // Criar tabela de solicitações de amizade se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id SERIAL PRIMARY KEY,
        sender_id UUID NOT NULL,
        receiver_id UUID NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_request UNIQUE (sender_id, receiver_id)
      );
    `);
    console.log('Tabela friend_requests verificada/criada com sucesso!');

    // Criar tabela de amizades se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        user1_id UUID NOT NULL,
        user2_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_friendship UNIQUE (user1_id, user2_id)
      );
    `);
    console.log('Tabela friendships verificada/criada com sucesso!');

    // Criar índices para otimização
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_friend_requests ON friend_requests (sender_id, receiver_id);
      CREATE INDEX IF NOT EXISTS idx_friendships ON friendships (user1_id, user2_id);
    `);
    console.log('Índices criados/verificados com sucesso!');

    console.log('Configuração das tabelas de amizade concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao configurar tabelas de amizade:', error);
  } finally {
    await pool.end();
  }
};

setupFriendshipTables();
