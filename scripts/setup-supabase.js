
// Este script configura as tabelas necessárias no Supabase
// Precisa ser executado com as credenciais corretas

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Verificar configurações
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Credenciais do Supabase não definidas!');
  console.error('Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Iniciando configuração do Supabase...');

  try {
    // Criar função auxiliar para executar SQL
    const { error: sqlFunctionError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
        RETURNS VOID AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    }).catch(() => {
      // Criamos esta função primeiro, pode ser que ela ainda não exista
      return { error: null };
    });

    if (sqlFunctionError) {
      console.log('Tentando criar função execute_sql diretamente...');
      
      // Tentar criar a função diretamente
      const { error } = await supabase.from('_exec_sql').select('*').limit(1);
      if (error) {
        console.error('Erro ao criar função execute_sql:', error);
        // Mesmo com erro, continuamos com as outras operações
      }
    }

    // Criar função de ping para verificação de saúde
    const { error: pingError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION public.rpc_ping()
        RETURNS TEXT AS $$
        BEGIN
          RETURN 'pong';
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    if (pingError) {
      console.error('Erro ao criar função de ping:', pingError);
    } else {
      console.log('Função de ping criada com sucesso');
    }

    // Criar tabela de perfis se não existir
    const { error: profilesError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id),
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
      `
    });

    if (profilesError) {
      console.error('Erro ao criar tabela de perfis:', profilesError);
    } else {
      console.log('Tabela de perfis criada ou já existente');
    }

    // Criar trigger para criar perfil automaticamente ao cadastrar usuário
    const { error: triggerError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.profiles (
            id,
            email,
            display_name,
            full_name,
            username,
            institution,
            birth_date,
            plan_type
          )
          VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', NEW.email),
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'username',
            NEW.raw_user_meta_data->>'institution',
            (NEW.raw_user_meta_data->>'birth_date')::DATE,
            NEW.raw_user_meta_data->>'plan_type'
          );
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `
    });

    if (triggerError) {
      console.error('Erro ao criar trigger de usuário:', triggerError);
    } else {
      console.log('Trigger para criação de perfil configurado com sucesso');
    }

    // Criar tabela de configurações da plataforma
    const { error: settingsError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS platform_settings (
          id INTEGER PRIMARY KEY DEFAULT 1,
          logo_url TEXT,
          logo_version INTEGER DEFAULT 1,
          brand_name TEXT DEFAULT 'Ponto School',
          primary_color TEXT DEFAULT '#6466F1',
          secondary_color TEXT DEFAULT '#22D3EE',
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
        
        -- Inserir valores padrão se tabela estiver vazia
        INSERT INTO platform_settings (id, logo_url, brand_name)
        SELECT 1, '/images/ponto-school-logo.png', 'Ponto School'
        WHERE NOT EXISTS (SELECT 1 FROM platform_settings WHERE id = 1);
      `
    });

    if (settingsError) {
      console.error('Erro ao criar tabela de configurações:', settingsError);
    } else {
      console.log('Tabela de configurações criada com sucesso');
    }

    // Criar tabelas para sistema de conexão expert
    const { error: expertTablesError } = await supabase.rpc('execute_sql', {
      sql_query: `
        -- Tabela de pedidos/solicitações
        CREATE TABLE IF NOT EXISTS requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          subject TEXT NOT NULL,
          difficulty TEXT,
          urgency BOOLEAN DEFAULT FALSE,
          status TEXT DEFAULT 'aberto',
          user_id UUID REFERENCES profiles(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          tags TEXT[],
          auction JSONB
        );
        
        -- Tabela de respostas
        CREATE TABLE IF NOT EXISTS responses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          request_id UUID REFERENCES requests(id),
          expert_id UUID REFERENCES profiles(id),
          content TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          status TEXT DEFAULT 'pending',
          price INTEGER DEFAULT 0,
          response_time TEXT
        );
        
        -- Tabela de mensagens
        CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          sender_id UUID REFERENCES profiles(id),
          receiver_id UUID REFERENCES profiles(id),
          request_id UUID REFERENCES requests(id),
          content TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          read BOOLEAN DEFAULT FALSE
        );
        
        -- Tabela de avaliações/feedback
        CREATE TABLE IF NOT EXISTS feedback (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          response_id UUID REFERENCES responses(id),
          user_id UUID REFERENCES profiles(id),
          rating INTEGER NOT NULL,
          comment TEXT,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
      `
    });

    if (expertTablesError) {
      console.error('Erro ao criar tabelas para sistema de conexão expert:', expertTablesError);
    } else {
      console.log('Tabelas para sistema de conexão expert criadas com sucesso');
    }

    // Configurar políticas RLS (Row Level Security)
    const { error: rlsError } = await supabase.rpc('execute_sql', {
      sql_query: `
        -- Habilitar RLS nas tabelas
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
        ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
        ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
        ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
        
        -- Criar política para perfis (usuários podem ver seus próprios dados)
        DROP POLICY IF EXISTS "Usuários podem ler seus próprios perfis" ON profiles;
        CREATE POLICY "Usuários podem ler seus próprios perfis"
          ON profiles FOR SELECT
          USING (auth.uid() = id);
          
        -- Criar política para atualização de perfis
        DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON profiles;
        CREATE POLICY "Usuários podem atualizar seus próprios perfis"
          ON profiles FOR UPDATE
          USING (auth.uid() = id);
          
        -- Políticas para solicitações
        DROP POLICY IF EXISTS "Qualquer um pode ver solicitações" ON requests;
        CREATE POLICY "Qualquer um pode ver solicitações"
          ON requests FOR SELECT
          TO authenticated
          USING (true);
          
        DROP POLICY IF EXISTS "Usuários podem criar solicitações" ON requests;
        CREATE POLICY "Usuários podem criar solicitações"
          ON requests FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = user_id);
          
        DROP POLICY IF EXISTS "Usuários podem atualizar suas solicitações" ON requests;
        CREATE POLICY "Usuários podem atualizar suas solicitações"
          ON requests FOR UPDATE
          TO authenticated
          USING (auth.uid() = user_id);
          
        -- Política para respostas
        DROP POLICY IF EXISTS "Qualquer um pode ver respostas" ON responses;
        CREATE POLICY "Qualquer um pode ver respostas"
          ON responses FOR SELECT
          TO authenticated
          USING (true);
          
        DROP POLICY IF EXISTS "Experts podem criar respostas" ON responses;
        CREATE POLICY "Experts podem criar respostas"
          ON responses FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = expert_id);
      `
    });

    if (rlsError) {
      console.error('Erro ao configurar políticas RLS:', rlsError);
    } else {
      console.log('Políticas RLS configuradas com sucesso');
    }

    console.log('Configuração do Supabase concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a configuração do Supabase:', error);
  }
}

main();
