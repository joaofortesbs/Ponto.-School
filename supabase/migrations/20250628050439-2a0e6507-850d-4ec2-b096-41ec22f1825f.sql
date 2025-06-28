
-- Primeiro, vamos atualizar a estrutura da tabela grupos_estudo para corrigir os problemas de visibilidade
-- e garantir que todos os grupos tenham códigos únicos funcionais

-- Remover constraint existente se houver conflito
ALTER TABLE grupos_estudo DROP CONSTRAINT IF EXISTS grupos_estudo_tipo_grupo_check;

-- Atualizar constraint para usar valores corretos (minúsculos para consistência)
ALTER TABLE grupos_estudo ADD CONSTRAINT grupos_estudo_tipo_grupo_check 
CHECK (tipo_grupo IN ('estudo', 'pesquisa', 'projeto', 'discussao'));

-- Garantir que a coluna is_private existe
ALTER TABLE grupos_estudo 
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;

-- Atualizar a função create_group_safe para funcionar corretamente
DROP FUNCTION IF EXISTS public.create_group_safe;

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
  
  -- Gerar código único sempre (para todos os grupos)
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

-- Atualizar política RLS para permitir leitura correta
DROP POLICY IF EXISTS "Permitir leitura de grupos visíveis" ON grupos_estudo;
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

-- Criar função para entrada por código
CREATE OR REPLACE FUNCTION public.join_group_by_code(p_codigo_unico TEXT, p_user_id UUID)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  group_id UUID,
  group_name TEXT
) AS $$
DECLARE
  v_group_id UUID;
  v_group_name TEXT;
  v_is_member BOOLEAN;
BEGIN
  -- Validar parâmetros
  IF p_codigo_unico IS NULL OR TRIM(p_codigo_unico) = '' THEN
    RETURN QUERY SELECT FALSE, 'Código é obrigatório', NULL::UUID, NULL::TEXT;
    RETURN;
  END IF;
  
  IF p_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Usuário não autenticado', NULL::UUID, NULL::TEXT;
    RETURN;
  END IF;
  
  -- Buscar grupo pelo código
  SELECT id, nome INTO v_group_id, v_group_name
  FROM grupos_estudo 
  WHERE codigo_unico = UPPER(TRIM(p_codigo_unico));
  
  IF v_group_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Código inválido ou grupo não encontrado', NULL::UUID, NULL::TEXT;
    RETURN;
  END IF;
  
  -- Verificar se já é membro
  SELECT EXISTS(
    SELECT 1 FROM membros_grupos 
    WHERE grupo_id = v_group_id AND user_id = p_user_id
  ) INTO v_is_member;
  
  IF v_is_member THEN
    RETURN QUERY SELECT TRUE, 'Você já é membro deste grupo', v_group_id, v_group_name;
    RETURN;
  END IF;
  
  -- Adicionar como membro
  INSERT INTO membros_grupos (grupo_id, user_id, joined_at)
  VALUES (v_group_id, p_user_id, NOW());
  
  RETURN QUERY SELECT TRUE, 'Entrada no grupo realizada com sucesso', v_group_id, v_group_name;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, 'Erro: ' || SQLERRM, NULL::UUID, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissões
GRANT EXECUTE ON FUNCTION public.join_group_by_code TO authenticated;
