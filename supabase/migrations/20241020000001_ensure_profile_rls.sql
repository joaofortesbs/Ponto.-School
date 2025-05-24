
-- Verificar se RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verificar políticas existentes e criar caso não existam
DO $$
BEGIN
    -- Política de leitura pública
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Public profiles are viewable'
    ) THEN
        CREATE POLICY "Public profiles are viewable" 
        ON profiles FOR SELECT 
        USING (true);
    END IF;
    
    -- Política de inserção
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile" 
        ON profiles FOR INSERT 
        WITH CHECK (auth.uid() = id);
    END IF;
    
    -- Política de atualização
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" 
        ON profiles FOR UPDATE 
        USING (auth.uid() = id);
    END IF;
END
$$;
