
// Script para configurar o banco de dados Neon
require('dotenv').config();
const { Pool } = require('pg');

async function setupNeonDatabase() {
  console.log('Iniciando configuração do banco de dados Neon...');
  
  const neonConnectionString = process.env.NEON_CONNECTION_STRING;
  
  if (!neonConnectionString) {
    console.error('String de conexão do Neon não encontrada nas variáveis de ambiente!');
    console.error('Por favor, adicione NEON_CONNECTION_STRING ao arquivo .env');
    return;
  }
  
  const pool = new Pool({
    connectionString: neonConnectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    // Testando conexão
    const client = await pool.connect();
    const testResult = await client.query('SELECT NOW()');
    console.log('Conexão com Neon PostgreSQL estabelecida com sucesso:', testResult.rows[0]);
    
    // Criar extensões necessárias
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    `);
    
    // Criar tabelas
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY,
        full_name TEXT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        institution TEXT,
        birth_date DATE,
        plan_type TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS calendar_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT,
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE,
        start_time TEXT,
        end_time TEXT,
        location TEXT,
        is_online BOOLEAN DEFAULT FALSE,
        meeting_link TEXT,
        type TEXT,
        discipline TEXT,
        professor TEXT,
        reminders TEXT[],
        repeat TEXT,
        visibility TEXT DEFAULT 'private',
        user_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE
      );
      
      CREATE TABLE IF NOT EXISTS grupos_estudo (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        nome TEXT NOT NULL,
        descricao TEXT,
        cor TEXT NOT NULL DEFAULT '#FF6B00',
        membros INTEGER NOT NULL DEFAULT 1,
        topico TEXT,
        topico_nome TEXT,
        topico_icon TEXT,
        privado BOOLEAN DEFAULT false,
        visibilidade TEXT DEFAULT 'todos',
        codigo TEXT,
        data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
      
      -- Criar índices
      CREATE INDEX IF NOT EXISTS calendar_events_user_id_idx ON calendar_events(user_id);
      CREATE INDEX IF NOT EXISTS calendar_events_start_date_idx ON calendar_events(start_date);
      CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON grupos_estudo(user_id);
    `);
    
    console.log('Banco de dados Neon configurado com sucesso!');
    console.log('Tabelas criadas: profiles, calendar_events, grupos_estudo');
    
    client.release();
  } catch (error) {
    console.error('Erro ao configurar banco de dados Neon:', error);
  } finally {
    await pool.end();
  }
}

// Executar configuração
setupNeonDatabase().then(() => {
  console.log('Script de configuração do Neon concluído.');
});
