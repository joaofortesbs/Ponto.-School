-- Criar tabela para configurações da plataforma
CREATE TABLE IF NOT EXISTS platform_settings (
  id BIGINT PRIMARY KEY,
  logo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir a logo padrão
INSERT INTO platform_settings (id, logo_url)
VALUES (1, '/images/ponto-school-logo.png')
ON CONFLICT (id) DO UPDATE
SET logo_url = '/images/ponto-school-logo.png', updated_at = NOW();

-- Habilitar RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura para todos
DROP POLICY IF EXISTS "Permitir leitura para todos" ON platform_settings;
CREATE POLICY "Permitir leitura para todos"
ON platform_settings FOR SELECT
USING (true);

-- Criar política para permitir atualização apenas para administradores
DROP POLICY IF EXISTS "Permitir atualização apenas para administradores" ON platform_settings;
CREATE POLICY "Permitir atualização apenas para administradores"
ON platform_settings FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM user_profiles WHERE role = 'admin'));

-- Adicionar à publicação de realtime
alter publication supabase_realtime add table platform_settings;
