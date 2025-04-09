
// Este script configura as tabelas necessárias no Supabase
// Precisa ser executado com as credenciais corretas

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase - substitua pelos valores reais no seu arquivo .env
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
    // Criar tabela de perfis se não existir
    const { error: profilesError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id),
          display_name TEXT,
          avatar_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
        
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.profiles (id, display_name, avatar_url)
          VALUES (NEW.id, NEW.email, '');
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `
    });

    if (profilesError) {
      console.error('Erro ao criar tabela de perfis:', profilesError);
    } else {
      console.log('Tabela de perfis criada ou já existente');
    }

    // Configurar políticas RLS (Row Level Security)
    const { error: rlsError } = await supabase.rpc('execute_sql', {
      sql_query: `
        -- Habilitar RLS na tabela profiles
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        -- Criar política para perfis (usuários só podem ver seus próprios dados)
        DROP POLICY IF EXISTS "Usuários podem ler seus próprios perfis" ON profiles;
        CREATE POLICY "Usuários podem ler seus próprios perfis"
          ON profiles FOR SELECT
          USING (auth.uid() = id);
          
        -- Criar política para atualização de perfis
        DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON profiles;
        CREATE POLICY "Usuários podem atualizar seus próprios perfis"
          ON profiles FOR UPDATE
          USING (auth.uid() = id);
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
