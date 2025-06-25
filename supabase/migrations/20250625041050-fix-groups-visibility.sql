
-- Corrigir políticas RLS para grupos_estudo
DROP POLICY IF EXISTS "grupos_select_policy" ON grupos_estudo;
DROP POLICY IF EXISTS "grupos_insert_policy" ON grupos_estudo;
DROP POLICY IF EXISTS "grupos_update_policy" ON grupos_estudo;
DROP POLICY IF EXISTS "grupos_delete_policy" ON grupos_estudo;

-- Política de leitura corrigida
CREATE POLICY "Permitir leitura de grupos" ON grupos_estudo
FOR SELECT
USING (
  -- Grupos visíveis para todos
  is_visible_to_all = true
  OR 
  -- Grupos criados pelo usuário
  criador_id = auth.uid()
  OR
  -- Grupos onde o usuário é membro
  EXISTS (
    SELECT 1 FROM membros_grupos 
    WHERE membros_grupos.grupo_id = grupos_estudo.id 
    AND membros_grupos.user_id = auth.uid()
  )
);

-- Política de inserção
CREATE POLICY "Permitir criação de grupos" ON grupos_estudo
FOR INSERT
WITH CHECK (criador_id = auth.uid());

-- Política de atualização (apenas criador)
CREATE POLICY "Permitir atualização de grupos próprios" ON grupos_estudo
FOR UPDATE
USING (criador_id = auth.uid())
WITH CHECK (criador_id = auth.uid());

-- Política de exclusão (apenas criador)
CREATE POLICY "Permitir exclusão de grupos próprios" ON grupos_estudo
FOR DELETE
USING (criador_id = auth.uid());

-- Garantir que código_unico é único quando não for nulo
DROP INDEX IF EXISTS grupos_estudo_codigo_unico_unique;
CREATE UNIQUE INDEX grupos_estudo_codigo_unico_unique ON grupos_estudo(codigo_unico) WHERE codigo_unico IS NOT NULL;

-- Função para validar entrada por código
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
