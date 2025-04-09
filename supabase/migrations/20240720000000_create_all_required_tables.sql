
-- Certifique-se de que as tabelas existem no Supabase

-- Criar tabela de perfis de usuário se não existir
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  username TEXT,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  institution TEXT,
  birth_date DATE,
  plan_type TEXT,
  balance NUMERIC DEFAULT 150,
  expert_balance NUMERIC DEFAULT 320,
  level INTEGER DEFAULT 1,
  rank TEXT DEFAULT 'Aprendiz',
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(username),
  UNIQUE(email)
);

-- Criar tabela de configurações da plataforma
CREATE TABLE IF NOT EXISTS platform_settings (
  id BIGINT PRIMARY KEY,
  logo_url TEXT NOT NULL,
  logo_version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelas para o Conexão Expert
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  subject TEXT NOT NULL,
  difficulty TEXT,
  urgency BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'aberto',
  user_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[],
  auction JSONB
);

CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id),
  expert_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  price NUMERIC DEFAULT 0,
  response_time TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  request_id UUID REFERENCES requests(id),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID REFERENCES responses(id),
  user_id UUID REFERENCES profiles(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Controle de ID de usuário
CREATE TABLE IF NOT EXISTS user_id_control (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  last_id INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir valores padrão
INSERT INTO platform_settings (id, logo_url)
VALUES (1, '/images/ponto-school-logo.png')
ON CONFLICT (id) DO UPDATE
SET logo_url = '/images/ponto-school-logo.png', updated_at = NOW();

INSERT INTO user_id_control (id, last_id)
VALUES (uuid_generate_v4(), 0)
ON CONFLICT DO NOTHING;

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurar políticas de segurança
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Criar políticas para tabela profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Políticas para platform_settings
DROP POLICY IF EXISTS "Permitir leitura para todos" ON platform_settings;
CREATE POLICY "Permitir leitura para todos"
ON platform_settings FOR SELECT
USING (true);

-- Habilitar suporte realtime
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE platform_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE requests;
ALTER PUBLICATION supabase_realtime ADD TABLE responses;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE feedback;
