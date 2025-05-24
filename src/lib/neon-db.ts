
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Verificar se a string de conexão está definida
if (!process.env.NEON_CONNECTION_STRING) {
  console.error('Variável de ambiente NEON_CONNECTION_STRING não configurada. Verifique o arquivo .env');
}

// Criar pool de conexão com o Neon
export const neonPool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false // Necessário para conexões SSL com Neon
  }
});

// Função auxiliar para verificar a conexão
export const checkNeonConnection = async () => {
  try {
    const client = await neonPool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Conexão com Neon PostgreSQL estabelecida com sucesso:', result.rows[0]);
    client.release();
    return true;
  } catch (error) {
    console.error('Erro ao conectar com Neon PostgreSQL:', error);
    return false;
  }
};

// Função para executar consultas SQL
export const executeQuery = async (query: string, params: any[] = []) => {
  const client = await neonPool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
};

// Função para criar as tabelas necessárias iniciais
export const initializeDatabase = async () => {
  try {
    // Criar tabela de perfis de usuário
    await executeQuery(`
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
    `);

    // Criar tabela de eventos de calendário
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    `);

    // Criar tabela de grupos de estudo
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS grupos_estudo (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    `);

    console.log('Tabelas iniciais criadas com sucesso no Neon PostgreSQL');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados Neon:', error);
    return false;
  }
};
