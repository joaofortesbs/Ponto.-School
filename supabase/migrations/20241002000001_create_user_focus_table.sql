
-- Criação da tabela para armazenar os dados de foco do usuário
CREATE TABLE IF NOT EXISTS user_focus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  disciplines TEXT[] DEFAULT '{}',
  topic TEXT,
  study_time INTEGER NOT NULL,
  tasks JSONB DEFAULT '[]',
  emotional_state TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para consulta por usuário
CREATE INDEX IF NOT EXISTS idx_user_focus_user_id ON user_focus(user_id);

-- Função para atualizar o timestamp de updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_focus_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar automaticamente o campo updated_at
CREATE TRIGGER update_user_focus_updated_at_trigger
BEFORE UPDATE ON user_focus
FOR EACH ROW
EXECUTE FUNCTION update_user_focus_updated_at();

-- Permissões para a tabela
ALTER TABLE user_focus ENABLE ROW LEVEL SECURITY;

-- Política para que usuários só possam ver seus próprios dados
CREATE POLICY user_focus_select_policy ON user_focus
  FOR SELECT USING (auth.uid() = user_id);

-- Política para que usuários só possam inserir seus próprios dados
CREATE POLICY user_focus_insert_policy ON user_focus
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que usuários só possam atualizar seus próprios dados
CREATE POLICY user_focus_update_policy ON user_focus
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para que usuários só possam excluir seus próprios dados
CREATE POLICY user_focus_delete_policy ON user_focus
  FOR DELETE USING (auth.uid() = user_id);
