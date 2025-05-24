
/**
 * Script para configurar e testar a conexão com o banco de dados PostgreSQL do Replit
 */

const { Client } = require('pg');
require('dotenv').config();

async function setupReplitDatabase() {
  console.log('Iniciando configuração do banco de dados Replit...');
  
  // Verificando se temos a variável de ambiente do Replit Database
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('Erro: Variável de ambiente DATABASE_URL não encontrada!');
    console.error('Por favor, crie um banco de dados no Replit através do painel Database.');
    return;
  }
  
  console.log('Conectando ao banco de dados...');
  
  const client = new Client({
    connectionString: databaseUrl
  });

  try {
    await client.connect();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    
    // Testar a conexão com uma consulta simples
    const result = await client.query('SELECT NOW() as time');
    console.log('Consulta de teste realizada com sucesso:');
    console.log('Hora do servidor:', result.rows[0].time);
    
    // Criar tabela grupos_estudo (similar ao que temos no setup-simple-db.js)
    console.log('Criando tabela grupos_estudo...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.grupos_estudo (
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
      
      -- Create index for faster queries
      CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON public.grupos_estudo(user_id);
    `;
    
    await client.query(createTableQuery);
    console.log('Tabela grupos_estudo criada ou verificada com sucesso!');
    
    // Criar tabela de profiles se não existir
    console.log('Criando tabela profiles...');
    
    const createProfilesQuery = `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY,
        display_name TEXT,
        avatar_url TEXT,
        email TEXT,
        full_name TEXT,
        username TEXT,
        institution TEXT,
        birth_date DATE,
        plan_type TEXT,
        level INTEGER DEFAULT 1,
        rank TEXT DEFAULT 'Aprendiz',
        balance INTEGER DEFAULT 150,
        expert_balance INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
      );
    `;
    
    await client.query(createProfilesQuery);
    console.log('Tabela profiles criada ou verificada com sucesso!');
    
    console.log('Configuração do banco de dados concluída!');
    
  } catch (error) {
    console.error('Erro ao configurar banco de dados:', error);
  } finally {
    await client.end();
  }
}

setupReplitDatabase()
  .then(() => {
    console.log('Script concluído.');
  })
  .catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
  });
