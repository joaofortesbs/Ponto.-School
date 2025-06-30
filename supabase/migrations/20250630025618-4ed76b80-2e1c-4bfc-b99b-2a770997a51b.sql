
-- Criar tabela para rastrear usuários online
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  grupo_id UUID NOT NULL,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_sessions_grupo FOREIGN KEY (grupo_id) REFERENCES grupos_estudo(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_group UNIQUE (user_id, grupo_id)
);

-- Habilitar Row Level Security
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção e atualização para usuários autenticados
CREATE POLICY "Permitir inserção e atualização para o usuário" ON user_sessions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Política para permitir leitura de sessões do grupo para membros
CREATE POLICY "Permitir leitura para membros do grupo" ON user_sessions
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM membros_grupos mg 
  WHERE mg.grupo_id = user_sessions.grupo_id AND mg.user_id = auth.uid()
));

-- Habilitar Realtime para atualizações em tempo real
ALTER TABLE user_sessions REPLICA IDENTITY FULL;

-- Adicionar tabela à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE user_sessions;
