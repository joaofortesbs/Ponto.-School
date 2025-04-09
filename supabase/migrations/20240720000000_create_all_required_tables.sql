
-- Criar função para executar SQL dinamicamente (usada por scripts)
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar tabela de perfis se não existir
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Criar trigger para criar perfil automaticamente quando um usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.email, 'Usuário'), '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Configurar políticas de segurança
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ler seus próprios perfis" ON profiles;
CREATE POLICY "Usuários podem ler seus próprios perfis"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
  
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON profiles;
CREATE POLICY "Usuários podem atualizar seus próprios perfis"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Tabela para mensagens do chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Habilitar RLS para mensagens
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam todas as mensagens
DROP POLICY IF EXISTS "Usuários podem ver todas as mensagens" ON messages;
CREATE POLICY "Usuários podem ver todas as mensagens"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir que usuários criem suas próprias mensagens
DROP POLICY IF EXISTS "Usuários podem criar suas próprias mensagens" ON messages;
CREATE POLICY "Usuários podem criar suas próprias mensagens"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Tabela para configurações da plataforma
CREATE TABLE IF NOT EXISTS platform_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Inserir algumas configurações padrão
INSERT INTO platform_settings (key, value)
VALUES 
  ('logo', '{"url": "/images/ponto-school-logo.png", "version": 1}'),
  ('theme', '{"default": "dark"}')
ON CONFLICT (key) DO NOTHING;

-- Criar tabela para turmas
CREATE TABLE IF NOT EXISTS turmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  codigo TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Criar tabela para participantes de turmas
CREATE TABLE IF NOT EXISTS turma_participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID REFERENCES turmas(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('professor', 'aluno', 'monitor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(turma_id, user_id)
);

-- Políticas de segurança para turmas
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE turma_participantes ENABLE ROW LEVEL SECURITY;

-- Todos usuários autenticados podem ver turmas
DROP POLICY IF EXISTS "Todos usuários podem ver turmas" ON turmas;
CREATE POLICY "Todos usuários podem ver turmas"
  ON turmas FOR SELECT
  TO authenticated
  USING (true);

-- Usuários podem ver apenas turmas em que participam
DROP POLICY IF EXISTS "Usuários podem ver turmas em que participam" ON turma_participantes;
CREATE POLICY "Usuários podem ver turmas em que participam"
  ON turma_participantes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
