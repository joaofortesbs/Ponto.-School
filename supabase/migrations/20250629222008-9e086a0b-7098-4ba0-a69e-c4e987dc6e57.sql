
-- Criar tabela para mensagens dos grupos (usando nome diferente para evitar conflito)
CREATE TABLE IF NOT EXISTS mensagens_chat_grupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID REFERENCES grupos_estudo(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  enviado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_mensagens_chat_grupos_grupo_id ON mensagens_chat_grupos (grupo_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_chat_grupos_enviado_em ON mensagens_chat_grupos (enviado_em);
CREATE INDEX IF NOT EXISTS idx_mensagens_chat_grupos_user_id ON mensagens_chat_grupos (user_id);

-- Habilitar RLS
ALTER TABLE mensagens_chat_grupos ENABLE ROW LEVEL SECURITY;

-- Política para leitura: apenas membros do grupo podem ler mensagens
CREATE POLICY "Membros podem ler mensagens do chat" ON mensagens_chat_grupos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM membros_grupos
    WHERE membros_grupos.grupo_id = mensagens_chat_grupos.grupo_id
    AND membros_grupos.user_id = auth.uid()
  )
);

-- Política para escrita: apenas membros do grupo podem enviar mensagens
CREATE POLICY "Membros podem enviar mensagens no chat" ON mensagens_chat_grupos
FOR INSERT
WITH CHECK (
  mensagens_chat_grupos.user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM membros_grupos
    WHERE membros_grupos.grupo_id = mensagens_chat_grupos.grupo_id
    AND membros_grupos.user_id = auth.uid()
  )
);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE mensagens_chat_grupos;
