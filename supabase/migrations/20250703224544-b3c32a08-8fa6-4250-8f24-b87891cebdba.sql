
-- Adicionar campo is_blocked à tabela membros_grupos
ALTER TABLE membros_grupos ADD COLUMN is_blocked BOOLEAN DEFAULT false;
