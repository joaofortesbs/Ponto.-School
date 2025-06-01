
-- Criar tabela para registrar eventos de XP
CREATE TABLE IF NOT EXISTS xp_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  total_xp_after INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_xp_events_user_id ON xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_created_at ON xp_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_events_event_type ON xp_events(event_type);

-- Habilitar RLS
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver seus próprios eventos de XP"
  ON xp_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir eventos de XP"
  ON xp_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Comentários para documentação
COMMENT ON TABLE xp_events IS 'Tabela para registrar todos os eventos que concedem XP aos usuários';
COMMENT ON COLUMN xp_events.event_type IS 'Tipo do evento: flow_session, task_completion, daily_login, achievement, study_session';
COMMENT ON COLUMN xp_events.points_earned IS 'Quantidade de XP ganha neste evento';
COMMENT ON COLUMN xp_events.total_xp_after IS 'Total de XP do usuário após este evento';
