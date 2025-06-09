
-- CORREÇÃO COMPLETA DO ERRO DE RECURSÃO INFINITA EM GRUPOS_ESTUDO

-- 1. Remover todas as políticas problemáticas existentes
DROP POLICY IF EXISTS "Permitir leitura de grupos" ON grupos_estudo;
DROP POLICY IF EXISTS "Permitir criação de grupos" ON grupos_estudo;
DROP POLICY IF EXISTS "Permitir atualização de grupos próprios" ON grupos_estudo;
DROP POLICY IF EXISTS "Users can view grupos_estudo" ON grupos_estudo;
DROP POLICY IF EXISTS "Users can create grupos_estudo" ON grupos_estudo;
DROP POLICY IF EXISTS "Users can update own grupos_estudo" ON grupos_estudo;
DROP POLICY IF EXISTS "Public groups are viewable by all" ON grupos_estudo;
DROP POLICY IF EXISTS "Users can view own groups" ON grupos_estudo;
DROP POLICY IF EXISTS "Users can view joined groups" ON grupos_estudo;
DROP POLICY IF EXISTS "Users can create groups" ON grupos_estudo;
DROP POLICY IF EXISTS "Creators can update own groups" ON grupos_estudo;

-- 2. Criar função auxiliar SECURITY DEFINER para verificar membros sem recursão
CREATE OR REPLACE FUNCTION public.user_can_access_group(group_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN := FALSE;
BEGIN
  -- Verificar se é criador
  IF EXISTS (SELECT 1 FROM grupos_estudo WHERE id = group_id AND criador_id = user_id) THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se é membro
  IF EXISTS (SELECT 1 FROM membros_grupos WHERE grupo_id = group_id AND membros_grupos.user_id = user_id) THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se é grupo público
  IF EXISTS (SELECT 1 FROM grupos_estudo WHERE id = group_id AND is_public = TRUE) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. Função para criar grupo sem problemas de RLS
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
  
  -- Gerar código único
  WHILE v_codigo_exists AND v_attempts < 10 LOOP
    v_codigo_unico := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    
    SELECT EXISTS(SELECT 1 FROM grupos_estudo WHERE codigo_unico = v_codigo_unico) INTO v_codigo_exists;
    v_attempts := v_attempts + 1;
  END LOOP;
  
  IF v_codigo_exists THEN
    v_codigo_unico := upper(substr(md5(random()::text || p_criador_id::text), 1, 8));
  END IF;
  
  -- Inserir grupo
  INSERT INTO grupos_estudo (
    nome, descricao, tipo_grupo, disciplina_area, topico_especifico, tags,
    is_public, is_visible_to_all, is_visible_to_partners, criador_id, codigo_unico
  ) VALUES (
    trim(p_nome), trim(p_descricao), p_tipo_grupo, p_disciplina_area, p_topico_especifico, p_tags,
    p_is_public, p_is_visible_to_all, p_is_visible_to_partners, p_criador_id, v_codigo_unico
  ) RETURNING grupos_estudo.id INTO v_new_id;
  
  -- Adicionar criador como membro
  INSERT INTO membros_grupos (grupo_id, user_id) VALUES (v_new_id, p_criador_id);
  
  RETURN QUERY SELECT v_new_id, trim(p_nome), v_codigo_unico, TRUE, 'Grupo criado com sucesso';
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, FALSE, 'Erro: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar políticas RLS simples e sem recursão
CREATE POLICY "grupos_select_policy" ON grupos_estudo
FOR SELECT
USING (
  -- Grupos públicos são visíveis para todos
  is_public = TRUE
  OR 
  -- Criador pode ver seus grupos
  criador_id = auth.uid()
  OR
  -- Usar função auxiliar para verificar acesso
  public.user_can_access_group(id, auth.uid())
);

CREATE POLICY "grupos_insert_policy" ON grupos_estudo
FOR INSERT
WITH CHECK (criador_id = auth.uid());

CREATE POLICY "grupos_update_policy" ON grupos_estudo
FOR UPDATE
USING (criador_id = auth.uid())
WITH CHECK (criador_id = auth.uid());

CREATE POLICY "grupos_delete_policy" ON grupos_estudo
FOR DELETE
USING (criador_id = auth.uid());

-- 5. Garantir que as políticas de membros_grupos também estejam corretas
DROP POLICY IF EXISTS "Permitir leitura de membresia" ON membros_grupos;
DROP POLICY IF EXISTS "Permitir inserção de membresia" ON membros_grupos;
DROP POLICY IF EXISTS "Permitir remoção de membresia" ON membros_grupos;

CREATE POLICY "membros_select_policy" ON membros_grupos
FOR SELECT
USING (
  user_id = auth.uid()
  OR 
  EXISTS (SELECT 1 FROM grupos_estudo WHERE grupos_estudo.id = membros_grupos.grupo_id AND grupos_estudo.criador_id = auth.uid())
);

CREATE POLICY "membros_insert_policy" ON membros_grupos
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "membros_delete_policy" ON membros_grupos
FOR DELETE
USING (user_id = auth.uid());

-- 6. Atualizar cache do esquema
SELECT pg_notify('pgrst', 'reload schema');

-- 7. Conceder permissões necessárias
GRANT EXECUTE ON FUNCTION public.user_can_access_group TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_group_safe TO authenticated;

-- 8. Teste rápido da função (comentado para não executar automaticamente)
-- SELECT * FROM public.create_group_safe('Teste Grupo', 'Descrição teste', 'estudo', 'Matemática', 'Cálculo', ARRAY['matemática', 'cálculo'], true, true, false);
