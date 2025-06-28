
-- Remover todas as versões existentes da função create_group_safe
DROP FUNCTION IF EXISTS public.create_group_safe;

-- Atualizar a tabela grupos_estudo com os novos campos e estrutura
ALTER TABLE grupos_estudo 
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;

-- Atualizar as constraints do tipo_grupo
ALTER TABLE grupos_estudo DROP CONSTRAINT IF EXISTS grupos_estudo_tipo_grupo_check;
ALTER TABLE grupos_estudo ADD CONSTRAINT grupos_estudo_tipo_grupo_check 
CHECK (tipo_grupo IN ('estudo', 'pesquisa', 'projeto', 'discussao'));

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_grupos_estudo_is_visible_to_all ON grupos_estudo(is_visible_to_all);
CREATE INDEX IF NOT EXISTS idx_grupos_estudo_codigo_unico ON grupos_estudo(codigo_unico) WHERE codigo_unico IS NOT NULL;

-- Atualizar a política RLS para permitir leitura de grupos visíveis
DROP POLICY IF EXISTS "Permitir leitura de grupos" ON grupos_estudo;
CREATE POLICY "Permitir leitura de grupos visíveis" ON grupos_estudo
FOR SELECT
USING (
  is_visible_to_all = TRUE 
  OR criador_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM membros_grupos 
    WHERE grupo_id = grupos_estudo.id AND user_id = auth.uid()
  )
);

-- Criar nova função de criação de grupos
CREATE OR REPLACE FUNCTION public.create_group_safe(
  p_nome TEXT,
  p_descricao TEXT DEFAULT NULL,
  p_tipo_grupo TEXT DEFAULT NULL,
  p_disciplina_area TEXT DEFAULT NULL,
  p_topico_especifico TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT '{}',
  p_is_public BOOLEAN DEFAULT FALSE,
  p_is_visible_to_all BOOLEAN DEFAULT FALSE,
  p_is_visible_to_partners BOOLEAN DEFAULT FALSE,
  p_is_private BOOLEAN DEFAULT FALSE,
  p_criador_id UUID DEFAULT auth.uid()
)
RETURNS TABLE(
  id UUID,
  nome TEXT,
  codigo_unico TEXT,
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_new_id UUID;
  v_codigo_unico TEXT;
  v_attempts INTEGER := 0;
  v_codigo_exists BOOLEAN := TRUE;
BEGIN
  -- Validar usuário autenticado
  IF p_criador_id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, FALSE, 'Usuário não autenticado';
    RETURN;
  END IF;
  
  -- Validar dados obrigatórios
  IF p_nome IS NULL OR trim(p_nome) = '' THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, FALSE, 'Nome do grupo é obrigatório';
    RETURN;
  END IF;
  
  -- Gerar código único apenas para grupos privados
  IF p_is_private = TRUE THEN
    WHILE v_codigo_exists AND v_attempts < 10 LOOP
      -- Gerar código de 6 caracteres alfanuméricos
      v_codigo_unico := upper(
        substr(
          translate(
            encode(gen_random_bytes(4), 'base64'), 
            '+/=', 'XYZ'
          ), 1, 6
        )
      );
      
      -- Verificar se o código já existe
      SELECT EXISTS(
        SELECT 1 FROM grupos_estudo 
        WHERE codigo_unico = v_codigo_unico
      ) INTO v_codigo_exists;
      
      v_attempts := v_attempts + 1;
    END LOOP;
    
    -- Se ainda houver conflito, usar timestamp
    IF v_codigo_exists THEN
      v_codigo_unico := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    END IF;
  END IF;
  
  -- Inserir grupo
  INSERT INTO grupos_estudo (
    nome, 
    descricao, 
    tipo_grupo, 
    disciplina_area, 
    topico_especifico, 
    tags,
    is_public, 
    is_visible_to_all, 
    is_visible_to_partners,
    is_private,
    criador_id, 
    codigo_unico,
    created_at
  ) VALUES (
    trim(p_nome), 
    trim(p_descricao), 
    p_tipo_grupo, 
    p_disciplina_area, 
    p_topico_especifico, 
    p_tags,
    p_is_public, 
    p_is_visible_to_all, 
    p_is_visible_to_partners,
    p_is_private,
    p_criador_id, 
    v_codigo_unico,
    NOW()
  ) RETURNING grupos_estudo.id INTO v_new_id;
  
  -- Adicionar criador como membro
  INSERT INTO membros_grupos (grupo_id, user_id, joined_at) 
  VALUES (v_new_id, p_criador_id, NOW());
  
  RETURN QUERY SELECT 
    v_new_id, 
    trim(p_nome), 
    v_codigo_unico, 
    TRUE, 
    'Grupo criado com sucesso';
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT 
      NULL::UUID, 
      NULL::TEXT, 
      NULL::TEXT, 
      FALSE, 
      'Erro: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissões
GRANT EXECUTE ON FUNCTION public.create_group_safe TO authenticated;
