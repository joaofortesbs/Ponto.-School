
-- Adicionar campo student_title à tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS student_title TEXT;

-- Comentário para documentar o campo
COMMENT ON COLUMN profiles.student_title IS 'Título de estudante para personalização de conteúdo';
