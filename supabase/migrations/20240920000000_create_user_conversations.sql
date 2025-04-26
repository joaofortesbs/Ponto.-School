
-- Criação da tabela para armazenar conversas do usuário
CREATE TABLE IF NOT EXISTS user_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL DEFAULT 'Nova Conversa',
  conversation JSONB NOT NULL DEFAULT '[]'::jsonb,
  tipo VARCHAR NOT NULL DEFAULT 'explicacao',
  tags JSONB DEFAULT '[]'::jsonb,
  preview TEXT,
  fixada BOOLEAN NOT NULL DEFAULT false,
  favorita BOOLEAN NOT NULL DEFAULT false,
  analise JSONB,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índice para melhorar a performance de busca por user_id
CREATE INDEX IF NOT EXISTS idx_user_conversations_user_id ON user_conversations(user_id);

-- Habilitar Row Level Security
ALTER TABLE user_conversations ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
-- Permitir leitura apenas para o próprio usuário
CREATE POLICY "Usuários podem ver apenas suas próprias conversas"
  ON user_conversations FOR SELECT
  USING (auth.uid() = user_id);

-- Permitir inserção apenas pelo próprio usuário
CREATE POLICY "Usuários podem inserir apenas suas próprias conversas"
  ON user_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Permitir atualização apenas pelo próprio usuário
CREATE POLICY "Usuários podem atualizar apenas suas próprias conversas"
  ON user_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- Permitir exclusão apenas pelo próprio usuário
CREATE POLICY "Usuários podem excluir apenas suas próprias conversas"
  ON user_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Criar função trigger para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_user_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger
CREATE TRIGGER set_user_conversations_updated_at
BEFORE UPDATE ON user_conversations
FOR EACH ROW
EXECUTE FUNCTION update_user_conversations_updated_at();
