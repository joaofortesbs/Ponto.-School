
-- Criar tabela de mensagens para chat dos grupos
CREATE TABLE IF NOT EXISTS mensagens_chat_grupos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grupo_id UUID REFERENCES grupos_estudo(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  enviado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_grupo_chat FOREIGN KEY (grupo_id) REFERENCES grupos_estudo(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_chat FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_mensagens_chat_grupos_grupo_id ON mensagens_chat_grupos(grupo_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_chat_grupos_enviado_em ON mensagens_chat_grupos(enviado_em);
CREATE INDEX IF NOT EXISTS idx_mensagens_chat_grupos_user_id ON mensagens_chat_grupos(user_id);

-- Habilitar Row Level Security
ALTER TABLE mensagens_chat_grupos ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura apenas para membros do grupo
CREATE POLICY "Permitir leitura para membros do grupo" ON mensagens_chat_grupos
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM membros_grupos 
  WHERE grupo_id = mensagens_chat_grupos.grupo_id 
  AND user_id = auth.uid()
) OR EXISTS (
  SELECT 1 FROM grupos_estudo 
  WHERE id = mensagens_chat_grupos.grupo_id 
  AND criador_id = auth.uid()
));

-- Política para permitir inserção apenas para membros do grupo
CREATE POLICY "Permitir inserção para membros do grupo" ON mensagens_chat_grupos
FOR INSERT
WITH CHECK (mensagens_chat_grupos.user_id = auth.uid() AND (EXISTS (
  SELECT 1 FROM membros_grupos 
  WHERE grupo_id = mensagens_chat_grupos.grupo_id 
  AND user_id = auth.uid()
) OR EXISTS (
  SELECT 1 FROM grupos_estudo 
  WHERE id = mensagens_chat_grupos.grupo_id 
  AND criador_id = auth.uid()
)));

-- Habilitar Realtime para a tabela
ALTER PUBLICATION supabase_realtime ADD TABLE mensagens_chat_grupos;
