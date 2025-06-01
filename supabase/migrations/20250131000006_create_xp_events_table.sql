
-- Criar tabela para eventos de XP
CREATE TABLE IF NOT EXISTS xp_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL DEFAULT 0,
  event_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_xp_events_user_id ON xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_created_at ON xp_events(created_at);
CREATE INDEX IF NOT EXISTS idx_xp_events_event_type ON xp_events(event_type);

-- Habilitar RLS
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view their own XP events" ON xp_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own XP events" ON xp_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Adicionar campos de experiência à tabela user_profiles se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'experience_points') THEN
    ALTER TABLE user_profiles ADD COLUMN experience_points INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'level') THEN
    ALTER TABLE user_profiles ADD COLUMN level INTEGER DEFAULT 1;
  END IF;
END $$;

-- Atualizar perfis existentes para garantir valores padrão
UPDATE user_profiles 
SET experience_points = 0, level = 1 
WHERE experience_points IS NULL OR level IS NULL;
