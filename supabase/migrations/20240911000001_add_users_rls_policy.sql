
-- Garante que usuários autenticados possam consultar outros usuários
-- Isso é necessário para a funcionalidade de busca de amigos

-- Habilita RLS na tabela de usuários padrão do Supabase
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados possam ver outros usuários
CREATE POLICY "Allow users to view other users" 
ON auth.users
FOR SELECT 
TO authenticated 
USING (true);

-- Política para permitir que usuários editem apenas seu próprio perfil
CREATE POLICY "Allow users to update their own profile" 
ON auth.users
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);
