
-- Tabela para armazenar conversas
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  favorito BOOLEAN DEFAULT FALSE,
  privado BOOLEAN DEFAULT FALSE,
  categoria TEXT DEFAULT 'geral',
  resumo TEXT
);

-- Tabela para armazenar mensagens
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

-- Políticas de Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas para conversas
CREATE POLICY "Usuários podem ver apenas suas próprias conversas" 
  ON conversations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas suas próprias conversas" 
  ON conversations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias conversas" 
  ON conversations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias conversas" 
  ON conversations FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para mensagens
CREATE POLICY "Usuários podem ver mensagens de suas próprias conversas" 
  ON messages FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM conversations WHERE id = conversation_id
    )
  );

CREATE POLICY "Usuários podem inserir apenas mensagens em suas próprias conversas" 
  ON messages FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IN (
      SELECT user_id FROM conversations WHERE id = conversation_id
    )
  );

CREATE POLICY "Usuários podem atualizar apenas suas próprias mensagens" 
  ON messages FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias mensagens" 
  ON messages FOR DELETE 
  USING (auth.uid() = user_id);
