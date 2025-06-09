
-- REVISÃO E AJUSTE COMPLETO DA ESTRUTURA DE GRUPOS DE ESTUDOS
-- Primeiro, vamos verificar e corrigir a estrutura existente

-- 1. Verificar e corrigir a tabela grupos_estudo
ALTER TABLE grupos_estudo DROP CONSTRAINT IF EXISTS fk_grupos_estudo_criador_id;
ALTER TABLE grupos_estudo ADD CONSTRAINT fk_grupos_estudo_criador_id 
FOREIGN KEY (criador_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Garantir que codigo_unico seja NOT NULL e único
UPDATE grupos_estudo SET codigo_unico = UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8)) WHERE codigo_unico IS NULL;
ALTER TABLE grupos_estudo ALTER COLUMN codigo_unico SET NOT NULL;

-- Criar índice para melhor performance
DROP INDEX IF EXISTS idx_grupos_criador_id;
CREATE INDEX idx_grupos_criador_id ON grupos_estudo (criador_id);

-- 2. Corrigir a tabela membros_grupos
-- Remover restrições existentes para recriá-las corretamente
ALTER TABLE membros_grupos DROP CONSTRAINT IF EXISTS fk_membros_grupos_grupo_id;
ALTER TABLE membros_grupos DROP CONSTRAINT IF EXISTS fk_membros_grupos_user_id;
ALTER TABLE membros_grupos DROP CONSTRAINT IF EXISTS membros_grupos_pkey;

-- Adicionar chaves estrangeiras corretas
ALTER TABLE membros_grupos ADD CONSTRAINT fk_membros_grupos_grupo_id 
FOREIGN KEY (grupo_id) REFERENCES grupos_estudo(id) ON DELETE CASCADE;
ALTER TABLE membros_grupos ADD CONSTRAINT fk_membros_grupos_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Criar chave primária composta para evitar duplicatas
ALTER TABLE membros_grupos ADD PRIMARY KEY (grupo_id, user_id);

-- 3. Corrigir a tabela mensagens_grupos
-- Remover restrições existentes
ALTER TABLE mensagens_grupos DROP CONSTRAINT IF EXISTS fk_mensagens_grupos_grupo_id;
ALTER TABLE mensagens_grupos DROP CONSTRAINT IF EXISTS fk_mensagens_grupos_user_id;

-- Adicionar chaves estrangeiras corretas
ALTER TABLE mensagens_grupos ADD CONSTRAINT fk_mensagens_grupos_grupo_id 
FOREIGN KEY (grupo_id) REFERENCES grupos_estudo(id) ON DELETE CASCADE;
ALTER TABLE mensagens_grupos ADD CONSTRAINT fk_mensagens_grupos_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Criar índices para performance
DROP INDEX IF EXISTS idx_mensagens_grupo_id;
DROP INDEX IF EXISTS idx_mensagens_created_at;
CREATE INDEX idx_mensagens_grupo_id ON mensagens_grupos (grupo_id);
CREATE INDEX idx_mensagens_created_at ON mensagens_grupos (created_at);

-- 4. Corrigir a tabela convites_grupos
ALTER TABLE convites_grupos DROP CONSTRAINT IF EXISTS fk_convites_grupos_grupo_id;
ALTER TABLE convites_grupos DROP CONSTRAINT IF EXISTS fk_convites_grupos_convidado_id;
ALTER TABLE convites_grupos DROP CONSTRAINT IF EXISTS fk_convites_grupos_criador_id;

ALTER TABLE convites_grupos ADD CONSTRAINT fk_convites_grupos_grupo_id 
FOREIGN KEY (grupo_id) REFERENCES grupos_estudo(id) ON DELETE CASCADE;
ALTER TABLE convites_grupos ADD CONSTRAINT fk_convites_grupos_convidado_id 
FOREIGN KEY (convidado_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE convites_grupos ADD CONSTRAINT fk_convites_grupos_criador_id 
FOREIGN KEY (criador_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Adicionar CHECK constraint para status se não existir
ALTER TABLE convites_grupos DROP CONSTRAINT IF EXISTS check_status_valid;
ALTER TABLE convites_grupos ADD CONSTRAINT check_status_valid 
CHECK (status IN ('pendente', 'aceito', 'recusado'));

-- Criar índice para performance
DROP INDEX IF EXISTS idx_convites_grupo_id;
CREATE INDEX idx_convites_grupo_id ON convites_grupos (grupo_id);

-- 5. RECRIAR POLÍTICAS RLS CORRETAS

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view grupos_estudo" ON grupos_estudo;
DROP POLICY IF EXISTS "Users can create grupos_estudo" ON grupos_estudo;
DROP POLICY IF EXISTS "Users can update own grupos_estudo" ON grupos_estudo;
DROP POLICY IF EXISTS "Public groups are viewable by all" ON grupos_estudo;
DROP POLICY IF EXISTS "Users can view own groups" ON grupos_estudo;
DROP POLICY IF EXISTS "Users can view joined groups" ON grupos_estudo;
DROP POLICY IF EXISTS "Users can create groups" ON grupos_estudo;
DROP POLICY IF EXISTS "Creators can update own groups" ON grupos_estudo;
DROP POLICY IF EXISTS "Usuários podem criar grupos" ON grupos_estudo;
DROP POLICY IF EXISTS "Usuários podem ler seus grupos" ON grupos_estudo;
DROP POLICY IF EXISTS "Criadores podem atualizar seus grupos" ON grupos_estudo;

DROP POLICY IF EXISTS "Users can view membros_grupos" ON membros_grupos;
DROP POLICY IF EXISTS "Users can join grupos" ON membros_grupos;
DROP POLICY IF EXISTS "Users can leave grupos" ON membros_grupos;
DROP POLICY IF EXISTS "Users can view group memberships" ON membros_grupos;
DROP POLICY IF EXISTS "Usuários podem inserir membresia" ON membros_grupos;
DROP POLICY IF EXISTS "Usuários podem ler sua membresia" ON membros_grupos;
DROP POLICY IF EXISTS "Usuários podem sair dos grupos" ON membros_grupos;

DROP POLICY IF EXISTS "Membros podem ler mensagens" ON mensagens_grupos;
DROP POLICY IF EXISTS "Membros podem enviar mensagens" ON mensagens_grupos;
DROP POLICY IF EXISTS "Usuários podem inserir mensagens" ON mensagens_grupos;
DROP POLICY IF EXISTS "Usuários podem ler mensagens de seus grupos" ON mensagens_grupos;

DROP POLICY IF EXISTS "Permitir leitura de convites" ON convites_grupos;
DROP POLICY IF EXISTS "Permitir criação de convites" ON convites_grupos;

-- CRIAR POLÍTICAS RLS CORRETAS

-- Políticas para grupos_estudo
CREATE POLICY "Permitir leitura de grupos" ON grupos_estudo
FOR SELECT
USING (
  is_public = true
  OR criador_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM membros_grupos 
    WHERE membros_grupos.grupo_id = grupos_estudo.id 
    AND membros_grupos.user_id = auth.uid()
  )
);

CREATE POLICY "Permitir criação de grupos" ON grupos_estudo
FOR INSERT
WITH CHECK (criador_id = auth.uid());

CREATE POLICY "Permitir atualização de grupos próprios" ON grupos_estudo
FOR UPDATE
USING (criador_id = auth.uid());

-- Políticas para membros_grupos
CREATE POLICY "Permitir leitura de membresia" ON membros_grupos
FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM grupos_estudo 
    WHERE grupos_estudo.id = membros_grupos.grupo_id 
    AND grupos_estudo.criador_id = auth.uid()
  )
);

CREATE POLICY "Permitir inserção de membresia" ON membros_grupos
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Permitir remoção de membresia" ON membros_grupos
FOR DELETE
USING (user_id = auth.uid());

-- Políticas para mensagens_grupos (CORRIGIDAS)
CREATE POLICY "Membros podem ler mensagens" ON mensagens_grupos
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM membros_grupos 
  WHERE membros_grupos.grupo_id = mensagens_grupos.grupo_id 
  AND membros_grupos.user_id = auth.uid()
));

CREATE POLICY "Membros podem escrever mensagens" ON mensagens_grupos
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM membros_grupos 
    WHERE membros_grupos.grupo_id = mensagens_grupos.grupo_id 
    AND membros_grupos.user_id = auth.uid()
  )
);

-- Políticas para convites_grupos
CREATE POLICY "Permitir leitura de convites" ON convites_grupos
FOR SELECT
USING (
  criador_id = auth.uid()
  OR convidado_id = auth.uid()
);

CREATE POLICY "Permitir criação de convites" ON convites_grupos
FOR INSERT
WITH CHECK (criador_id = auth.uid());

CREATE POLICY "Permitir atualização de convites" ON convites_grupos
FOR UPDATE
USING (convidado_id = auth.uid());

-- 6. HABILITAR REALTIME PARA MENSAGENS (CORRIGIDO)
-- Tentar remover da publicação (ignorar erro se não existir)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE mensagens_grupos;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Adicionar à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE mensagens_grupos;

-- 7. CRIAR TABELA DE AUDITORIA PARA DEPURAÇÃO (OPCIONAL)
CREATE TABLE IF NOT EXISTS chat_erros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  erro TEXT NOT NULL,
  grupo_id UUID,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_erros_grupo_id FOREIGN KEY (grupo_id) REFERENCES grupos_estudo(id) ON DELETE SET NULL,
  CONSTRAINT fk_chat_erros_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Habilitar RLS na tabela de erros
ALTER TABLE chat_erros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios erros" ON chat_erros
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Usuários podem inserir erros" ON chat_erros
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 8. FUNÇÃO AUXILIAR PARA VERIFICAR MEMBRESIA (Security Definer)
CREATE OR REPLACE FUNCTION public.is_group_member_safe(group_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.membros_grupos 
    WHERE grupo_id = group_id AND membros_grupos.user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 9. FUNÇÃO PARA CARREGAR MENSAGENS COM SEGURANÇA
CREATE OR REPLACE FUNCTION public.get_group_messages_safe(
  p_group_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  mensagem TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Verificar se o usuário é membro do grupo
  IF NOT public.is_group_member_safe(p_group_id, p_user_id) THEN
    -- Log do erro para depuração
    INSERT INTO chat_erros (erro, grupo_id, user_id)
    VALUES ('Usuário não é membro do grupo', p_group_id, p_user_id);
    
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE LIMIT 0;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT m.id, m.user_id, m.mensagem, m.created_at
  FROM mensagens_grupos m
  WHERE m.grupo_id = p_group_id
  ORDER BY m.created_at ASC;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro para depuração
    INSERT INTO chat_erros (erro, grupo_id, user_id)
    VALUES (SQLERRM, p_group_id, p_user_id);
    
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE LIMIT 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. CONCEDER PERMISSÕES
GRANT EXECUTE ON FUNCTION public.is_group_member_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_messages_safe TO authenticated;

-- 11. VERIFICAÇÃO FINAL DA ESTRUTURA
-- Verificar se todas as tabelas têm as colunas corretas
DO $$
BEGIN
  -- Verificar grupos_estudo
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grupos_estudo' AND column_name = 'criador_id') THEN
    RAISE EXCEPTION 'Coluna criador_id não encontrada em grupos_estudo';
  END IF;
  
  -- Verificar membros_grupos
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'membros_grupos' AND column_name = 'grupo_id') THEN
    RAISE EXCEPTION 'Coluna grupo_id não encontrada em membros_grupos';
  END IF;
  
  -- Verificar mensagens_grupos
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensagens_grupos' AND column_name = 'mensagem') THEN
    RAISE EXCEPTION 'Coluna mensagem não encontrada em mensagens_grupos';
  END IF;
  
  RAISE NOTICE 'Estrutura do banco de dados verificada com sucesso!';
END
$$;
