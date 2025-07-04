
-- Criar tabela para bloqueios de membros em grupos se não existir
CREATE TABLE IF NOT EXISTS bloqueios_grupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID NOT NULL REFERENCES grupos_estudo(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bloqueado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Garantir que um usuário só pode ser bloqueado uma vez por grupo
  UNIQUE(grupo_id, user_id)
);

-- Habilitar Row Level Security
ALTER TABLE bloqueios_grupos ENABLE ROW LEVEL SECURITY;

-- Criar políticas para bloqueios_grupos
CREATE POLICY "Criadores podem ver bloqueios em seus grupos" 
  ON bloqueios_grupos FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM grupos_estudo 
    WHERE grupos_estudo.id = bloqueios_grupos.grupo_id 
    AND grupos_estudo.criador_id = auth.uid()
  ));

CREATE POLICY "Criadores podem bloquear membros em seus grupos" 
  ON bloqueios_grupos FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM grupos_estudo 
    WHERE grupos_estudo.id = bloqueios_grupos.grupo_id 
    AND grupos_estudo.criador_id = auth.uid()
  ));

CREATE POLICY "Criadores podem desbloquear membros em seus grupos" 
  ON bloqueios_grupos FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM grupos_estudo 
    WHERE grupos_estudo.id = bloqueios_grupos.grupo_id 
    AND grupos_estudo.criador_id = auth.uid()
  ));

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_bloqueios_grupos_grupo_id ON bloqueios_grupos(grupo_id);
CREATE INDEX IF NOT EXISTS idx_bloqueios_grupos_user_id ON bloqueios_grupos(user_id);

-- Habilitar Realtime para a tabela bloqueios_grupos
ALTER PUBLICATION supabase_realtime ADD TABLE bloqueios_grupos;
