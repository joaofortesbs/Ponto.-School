
const { Client } = require('pg');
require('dotenv').config();

// Usar a URL do banco PostgreSQL do Replit
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL não configurada! Configure o banco PostgreSQL no Replit.');
  process.exit(1);
}

async function createTables() {
  const client = new Client({ connectionString: databaseUrl });
  
  try {
    await client.connect();
    console.log('Conectado ao banco Neon PostgreSQL');
    
    // Criar extensões necessárias
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    // Criar tabela de perfis (equivalente ao auth.users do Supabase)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        email_confirmed BOOLEAN DEFAULT FALSE,
        last_sign_in_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    // Criar tabela de perfis
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        avatar_url TEXT,
        bio TEXT,
        cover_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        display_name TEXT,
        email VARCHAR(255) NOT NULL,
        full_name TEXT,
        role VARCHAR(50) DEFAULT 'user',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_id VARCHAR(13),
        username TEXT UNIQUE
      )
    `);
    
    // Criar tabela de flow sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS flow_sessions (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_title TEXT,
        session_goal TEXT,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE,
        duration_seconds INTEGER NOT NULL DEFAULT 0,
        duration_formatted TEXT NOT NULL DEFAULT '00:00:00',
        subjects TEXT[] NOT NULL DEFAULT '{}',
        progress INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        notes TEXT,
        xp_earned INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Criar tabela de user_streak
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_streak (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        dias_consecutivos INTEGER NOT NULL DEFAULT 0,
        recorde_dias INTEGER NOT NULL DEFAULT 0,
        dias_para_proximo_nivel INTEGER NOT NULL DEFAULT 3,
        meta_diaria INTEGER NOT NULL DEFAULT 5,
        proxima_recompensa TEXT NOT NULL DEFAULT 'Badge Iniciante',
        ultimo_check_in TIMESTAMP WITH TIME ZONE,
        eventos JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `);
    
    // Criar tabela de tasks
    await client.query(`
      CREATE TABLE IF NOT EXISTS tarefas (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        titulo TEXT NOT NULL,
        descricao TEXT,
        status BOOLEAN DEFAULT FALSE,
        data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Criar tabela de grupos de estudo
    await client.query(`
      CREATE TABLE IF NOT EXISTS grupos_estudo (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        criador_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        nome TEXT NOT NULL,
        descricao TEXT,
        disciplina_area TEXT,
        tipo_grupo TEXT,
        topico_especifico TEXT,
        tags TEXT[],
        codigo_unico TEXT UNIQUE,
        is_private BOOLEAN DEFAULT FALSE,
        is_public BOOLEAN DEFAULT TRUE,
        is_visible_to_all BOOLEAN DEFAULT TRUE,
        is_visible_to_partners BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Criar tabela de membros dos grupos
    await client.query(`
      CREATE TABLE IF NOT EXISTS membros_grupos (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        grupo_id UUID NOT NULL REFERENCES grupos_estudo(id) ON DELETE CASCADE,
        is_blocked BOOLEAN DEFAULT FALSE,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (user_id, grupo_id)
      )
    `);
    
    // Criar tabela de mensagens dos grupos
    await client.query(`
      CREATE TABLE IF NOT EXISTS mensagens_grupos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        grupo_id UUID NOT NULL REFERENCES grupos_estudo(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        mensagem TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Criar tabela de eventos do calendário
    await client.query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
        attachments TEXT[],
        guests TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Criar tabela de user_focus
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_focus (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        disciplines TEXT[] DEFAULT '{}',
        study_time INTEGER DEFAULT 120,
        tasks JSONB DEFAULT '[]',
        emotional_state TEXT,
        mentor_tip TEXT,
        completed BOOLEAN DEFAULT FALSE,
        points_awarded BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Criar tabela de atividades compartilháveis
    await client.query(`
      CREATE TABLE IF NOT EXISTS atividades_compartilhaveis (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        atividade_id VARCHAR(255) NOT NULL,
        titulo VARCHAR(500) NOT NULL,
        tipo VARCHAR(100) NOT NULL,
        dados JSONB NOT NULL DEFAULT '{}',
        criado_por VARCHAR(255) NOT NULL,
        codigo_unico VARCHAR(20) NOT NULL UNIQUE,
        link_publico TEXT NOT NULL,
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        desativado_em TIMESTAMP WITH TIME ZONE NULL
      )
    `);
    
    // Criar índices para performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_flow_sessions_user_id ON flow_sessions(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_streak_user_id ON user_streak(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tarefas_user_id ON tarefas(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_grupos_estudo_criador_id ON grupos_estudo(criador_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_mensagens_grupos_grupo_id ON mensagens_grupos(grupo_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_focus_user_id ON user_focus(user_id)');
    
    console.log('✅ Todas as tabelas foram criadas com sucesso!');
    
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
  } finally {
    await client.end();
  }
}

createTables();
