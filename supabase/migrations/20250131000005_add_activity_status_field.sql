
-- Adicionar campo activity_status à tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS activity_status TEXT DEFAULT 'online';

-- Comentário para documentar o campo
COMMENT ON COLUMN profiles.activity_status IS 'Status de atividade do usuário (online, ocupado, estudando, trabalhando)';

-- Adicionar restrição para valores válidos
ALTER TABLE profiles 
ADD CONSTRAINT activity_status_check 
CHECK (activity_status IN ('online', 'ocupado', 'estudando', 'trabalhando'));
