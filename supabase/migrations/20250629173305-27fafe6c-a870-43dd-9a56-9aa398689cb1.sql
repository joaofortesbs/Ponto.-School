
-- Criar tabela para mensagens dos grupos
CREATE TABLE IF NOT EXISTS mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID REFERENCES grupos_estudo(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_mensagens_grupo_id ON mensagens(grupo_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_created_at ON mensagens(created_at);

-- Habilitar RLS
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;

-- Política para leitura: apenas membros do grupo podem ler mensagens
CREATE POLICY "Membros podem ler mensagens do grupo" ON mensagens
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM membros_grupos
    WHERE membros_grupos.grupo_id = mensagens.grupo_id
    AND membros_grupos.user_id = auth.uid()
  )
);

-- Política para escrita: apenas membros do grupo podem enviar mensagens
CREATE POLICY "Membros podem enviar mensagens no grupo" ON mensagens
FOR INSERT
WITH CHECK (
  mensagens.user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM membros_grupos
    WHERE membros_grupos.grupo_id = mensagens.grupo_id
    AND membros_grupos.user_id = auth.uid()
  )
);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE mensagens;
