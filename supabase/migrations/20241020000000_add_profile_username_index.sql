
-- Criar índice para otimizar buscas por username
CREATE INDEX IF NOT EXISTS idx_username ON profiles (username);
