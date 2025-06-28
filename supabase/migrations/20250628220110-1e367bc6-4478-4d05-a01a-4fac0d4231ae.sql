
-- Primeiro, vamos remover todas as políticas existentes na tabela grupos_estudo
DROP POLICY IF EXISTS "Permitir leitura de grupos" ON grupos_estudo;
DROP POLICY IF EXISTS "Permitir leitura de todos os grupos" ON grupos_estudo;
DROP POLICY IF EXISTS "Permitir leitura de meus grupos" ON grupos_estudo;
DROP POLICY IF EXISTS "Permitir criação de grupos" ON grupos_estudo;
DROP POLICY IF EXISTS "Permitir atualização de grupos próprios" ON grupos_estudo;
DROP POLICY IF EXISTS "Permitir exclusão de grupos próprios" ON grupos_estudo;

-- Política para criação: apenas usuários autenticados podem criar grupos
CREATE POLICY "Usuários podem criar grupos" ON grupos_estudo
FOR INSERT 
TO authenticated
WITH CHECK (criador_id = auth.uid());

-- Política para leitura: TODOS os grupos são visíveis para usuários autenticados
-- Isso resolve o problema de "Todos os Grupos" não aparecerem
CREATE POLICY "Todos os grupos são visíveis" ON grupos_estudo
FOR SELECT 
TO authenticated
USING (true);

-- Política para atualização: apenas criador pode atualizar
CREATE POLICY "Criadores podem atualizar seus grupos" ON grupos_estudo
FOR UPDATE 
TO authenticated
USING (criador_id = auth.uid())
WITH CHECK (criador_id = auth.uid());

-- Política para exclusão: apenas criador pode excluir
CREATE POLICY "Criadores podem excluir seus grupos" ON grupos_estudo
FOR DELETE 
TO authenticated
USING (criador_id = auth.uid());
