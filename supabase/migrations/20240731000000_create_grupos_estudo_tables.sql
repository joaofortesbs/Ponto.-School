
-- Tabela para grupos de estudo
CREATE TABLE IF NOT EXISTS grupos_estudo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  topico TEXT,
  topico_nome TEXT,
  topico_icon TEXT,
  cor TEXT NOT NULL DEFAULT '#FF6B00',
  codigo TEXT,
  privado BOOLEAN NOT NULL DEFAULT false,
  visibilidade TEXT NOT NULL DEFAULT 'todos', -- 'todos' ou 'convidados'
  criador_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela para membros dos grupos de estudo
CREATE TABLE IF NOT EXISTS grupos_estudo_membros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID REFERENCES grupos_estudo(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('administrador', 'membro')), -- administrador ou membro comum
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(grupo_id, user_id)
);

-- Políticas de segurança
ALTER TABLE grupos_estudo ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupos_estudo_membros ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver grupos públicos ou grupos dos quais são membros
CREATE POLICY "Usuários podem ver grupos públicos" ON grupos_estudo
  FOR SELECT USING (
    visibilidade = 'todos' OR 
    EXISTS (
      SELECT 1 FROM grupos_estudo_membros 
      WHERE grupos_estudo_membros.grupo_id = grupos_estudo.id 
      AND grupos_estudo_membros.user_id = auth.uid()
    ) OR
    criador_id = auth.uid()
  );

-- Usuários podem criar grupos
CREATE POLICY "Usuários podem criar grupos" ON grupos_estudo
  FOR INSERT WITH CHECK (auth.uid() = criador_id);

-- Usuários podem atualizar seus próprios grupos
CREATE POLICY "Usuários podem atualizar seus próprios grupos" ON grupos_estudo
  FOR UPDATE USING (auth.uid() = criador_id);

-- Usuários podem deletar seus próprios grupos
CREATE POLICY "Usuários podem deletar seus próprios grupos" ON grupos_estudo
  FOR DELETE USING (auth.uid() = criador_id);

-- Políticas para a tabela de membros
CREATE POLICY "Usuários podem ver membros dos grupos" ON grupos_estudo_membros
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM grupos_estudo
      WHERE grupos_estudo.id = grupos_estudo_membros.grupo_id
      AND (
        grupos_estudo.visibilidade = 'todos' OR
        grupos_estudo.criador_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM grupos_estudo_membros m
          WHERE m.grupo_id = grupos_estudo_membros.grupo_id
          AND m.user_id = auth.uid()
        )
      )
    )
  );

-- Apenas criadores de grupos podem adicionar membros
CREATE POLICY "Criadores podem adicionar membros" ON grupos_estudo_membros
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM grupos_estudo
      WHERE grupos_estudo.id = grupos_estudo_membros.grupo_id
      AND grupos_estudo.criador_id = auth.uid()
    ) OR 
    user_id = auth.uid() -- usuários podem se adicionar em grupos públicos
  );

-- Adicionar índices para melhorar performance
CREATE INDEX idx_grupos_estudo_criador ON grupos_estudo(criador_id);
CREATE INDEX idx_grupos_estudo_membros_grupo ON grupos_estudo_membros(grupo_id);
CREATE INDEX idx_grupos_estudo_membros_usuario ON grupos_estudo_membros(user_id);
