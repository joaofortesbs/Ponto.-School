
-- Criação da tabela para armazenar histórico de quiz
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_id TEXT NOT NULL,
  type TEXT NOT NULL,
  theme TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  bncc_competence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índice para consultas rápidas por usuário
CREATE INDEX IF NOT EXISTS quiz_attempts_user_id_idx ON quiz_attempts(user_id);

-- Políticas de segurança
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Política para usuários lerem apenas seus próprios dados
CREATE POLICY "Users can only view their own attempts"
  ON quiz_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para usuários inserirem apenas seus próprios dados
CREATE POLICY "Users can only insert their own attempts"
  ON quiz_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem apenas seus próprios dados
CREATE POLICY "Users can only update their own attempts"
  ON quiz_attempts
  FOR UPDATE
  USING (auth.uid() = user_id);
