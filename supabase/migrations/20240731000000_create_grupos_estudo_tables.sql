
-- Criar tabela para grupos de estudo
CREATE TABLE IF NOT EXISTS grupos_estudo (
  id UUID PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  privado BOOLEAN NOT NULL DEFAULT false,
  cor TEXT,
  codigo_acesso TEXT,
  topico TEXT,
  topico_nome TEXT,
  topico_icon TEXT,
  visibilidade TEXT NOT NULL DEFAULT 'todos',
  criador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Criar tabela para membros de grupos de estudo
CREATE TABLE IF NOT EXISTS grupos_estudo_membros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID NOT NULL REFERENCES grupos_estudo(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('administrador', 'moderador', 'membro')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(grupo_id, user_id)
);

-- Criar tabela para mensagens de grupos de estudo
CREATE TABLE IF NOT EXISTS grupos_estudo_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID NOT NULL REFERENCES grupos_estudo(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'texto',
  anexo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Configurar políticas de segurança
ALTER TABLE grupos_estudo ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupos_estudo_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupos_estudo_mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas para grupos_estudo
CREATE POLICY "Qualquer usuário autenticado pode ver grupos públicos" 
  ON grupos_estudo FOR SELECT 
  USING (auth.uid() IS NOT NULL AND (visibilidade = 'todos' OR criador_id = auth.uid()));

CREATE POLICY "Membros podem ver grupos privados" 
  ON grupos_estudo FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM grupos_estudo_membros 
    WHERE grupos_estudo_membros.grupo_id = id AND grupos_estudo_membros.user_id = auth.uid()
  ));

CREATE POLICY "Usuários autenticados podem criar grupos" 
  ON grupos_estudo FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND criador_id = auth.uid());

CREATE POLICY "Criadores e admins podem atualizar grupos" 
  ON grupos_estudo FOR UPDATE 
  USING (
    criador_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM grupos_estudo_membros 
      WHERE grupos_estudo_membros.grupo_id = id 
      AND grupos_estudo_membros.user_id = auth.uid()
      AND grupos_estudo_membros.tipo = 'administrador'
    )
  );

CREATE POLICY "Criadores podem deletar grupos" 
  ON grupos_estudo FOR DELETE 
  USING (criador_id = auth.uid());

-- Políticas para grupos_estudo_membros
CREATE POLICY "Qualquer usuário pode ver membros de grupos" 
  ON grupos_estudo_membros FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Membros podem ver membros de seus grupos" 
  ON grupos_estudo_membros FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM grupos_estudo_membros AS m
      WHERE m.grupo_id = grupo_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários autenticados podem se juntar a grupos públicos" 
  ON grupos_estudo_membros FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    user_id = auth.uid() AND
    (
      EXISTS (
        SELECT 1 FROM grupos_estudo 
        WHERE grupos_estudo.id = grupo_id AND grupos_estudo.visibilidade = 'todos'
      ) OR
      EXISTS (
        SELECT 1 FROM grupos_estudo 
        WHERE grupos_estudo.id = grupo_id AND grupos_estudo.criador_id = auth.uid()
      )
    )
  );

CREATE POLICY "Administradores podem adicionar membros" 
  ON grupos_estudo_membros FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM grupos_estudo_membros 
      WHERE grupos_estudo_membros.grupo_id = grupo_id 
      AND grupos_estudo_membros.user_id = auth.uid()
      AND grupos_estudo_membros.tipo IN ('administrador', 'moderador')
    )
  );

CREATE POLICY "Membros podem sair de grupos" 
  ON grupos_estudo_membros FOR DELETE 
  USING (user_id = auth.uid());

CREATE POLICY "Administradores podem remover membros" 
  ON grupos_estudo_membros FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM grupos_estudo_membros 
      WHERE grupos_estudo_membros.grupo_id = grupo_id 
      AND grupos_estudo_membros.user_id = auth.uid()
      AND grupos_estudo_membros.tipo IN ('administrador', 'moderador')
    )
  );

-- Políticas para grupos_estudo_mensagens
CREATE POLICY "Membros podem ver mensagens de seus grupos" 
  ON grupos_estudo_mensagens FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM grupos_estudo_membros 
      WHERE grupos_estudo_membros.grupo_id = grupo_id 
      AND grupos_estudo_membros.user_id = auth.uid()
    )
  );

CREATE POLICY "Membros podem enviar mensagens para seus grupos" 
  ON grupos_estudo_mensagens FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM grupos_estudo_membros 
      WHERE grupos_estudo_membros.grupo_id = grupo_id 
      AND grupos_estudo_membros.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem editar suas próprias mensagens" 
  ON grupos_estudo_mensagens FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Usuários podem excluir suas próprias mensagens" 
  ON grupos_estudo_mensagens FOR DELETE 
  USING (user_id = auth.uid());

CREATE POLICY "Administradores e moderadores podem excluir qualquer mensagem do grupo" 
  ON grupos_estudo_mensagens FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM grupos_estudo_membros 
      WHERE grupos_estudo_membros.grupo_id = grupo_id 
      AND grupos_estudo_membros.user_id = auth.uid()
      AND grupos_estudo_membros.tipo IN ('administrador', 'moderador')
    )
  );
