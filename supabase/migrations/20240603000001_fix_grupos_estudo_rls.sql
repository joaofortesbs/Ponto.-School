
-- Corrigir as políticas RLS que estão causando recursão infinita
-- Primeiro, remover as políticas problemáticas
DROP POLICY IF EXISTS "Users can view grupos_estudo" ON grupos_estudo;
DROP POLICY IF EXISTS "Users can create grupos_estudo" ON grupos_estudo;
DROP POLICY IF EXISTS "Users can update own grupos_estudo" ON grupos_estudo;
DROP POLICY IF EXISTS "Users can view membros_grupos" ON membros_grupos;
DROP POLICY IF EXISTS "Users can join grupos" ON membros_grupos;
DROP POLICY IF EXISTS "Users can leave grupos" ON membros_grupos;

-- Criar função para verificar se usuário é membro de um grupo (Security Definer)
CREATE OR REPLACE FUNCTION public.is_group_member(group_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.membros_grupos 
    WHERE grupo_id = group_id AND membros_grupos.user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Políticas mais simples e seguras para grupos_estudo
CREATE POLICY "Public groups are viewable by all" 
  ON grupos_estudo FOR SELECT
  USING (is_publico = true);

CREATE POLICY "Users can view own groups" 
  ON grupos_estudo FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view joined groups" 
  ON grupos_estudo FOR SELECT
  USING (public.is_group_member(id, auth.uid()));

CREATE POLICY "Users can create groups" 
  ON grupos_estudo FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators can update own groups" 
  ON grupos_estudo FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para membros_grupos
CREATE POLICY "Users can view group memberships" 
  ON membros_grupos FOR SELECT
  USING (
    user_id = auth.uid() OR 
    public.is_group_member(grupo_id, auth.uid())
  );

CREATE POLICY "Users can join groups" 
  ON membros_grupos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" 
  ON membros_grupos FOR DELETE
  USING (auth.uid() = user_id);
