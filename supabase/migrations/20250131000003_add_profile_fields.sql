
-- Adicionar campos necessários na tabela profiles
DO $$ 
BEGIN
    -- Verificar e adicionar campo bio se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;

    -- Verificar e adicionar campo phone se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone VARCHAR(20);
    END IF;

    -- Verificar e adicionar campo location se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE profiles ADD COLUMN location VARCHAR(100);
    END IF;

    -- Verificar e adicionar campo birth_date se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'birth_date') THEN
        ALTER TABLE profiles ADD COLUMN birth_date DATE;
    END IF;

    -- Verificar e adicionar campo occupation se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'occupation') THEN
        ALTER TABLE profiles ADD COLUMN occupation VARCHAR(100);
    END IF;

    -- Verificar e adicionar campo education se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'education') THEN
        ALTER TABLE profiles ADD COLUMN education VARCHAR(200);
    END IF;

    -- Verificar e adicionar campo interests se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'interests') THEN
        ALTER TABLE profiles ADD COLUMN interests TEXT;
    END IF;

    -- Verificar e adicionar campo website se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
        ALTER TABLE profiles ADD COLUMN website VARCHAR(255);
    END IF;

    -- Verificar e adicionar campo social_links se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'social_links') THEN
        ALTER TABLE profiles ADD COLUMN social_links JSONB DEFAULT '{}';
    END IF;

    -- Verificar e adicionar campo full_name se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE profiles ADD COLUMN full_name VARCHAR(100);
    END IF;
END $$;

-- Comentários para documentação
COMMENT ON COLUMN profiles.bio IS 'Biografia do usuário';
COMMENT ON COLUMN profiles.phone IS 'Telefone do usuário';
COMMENT ON COLUMN profiles.location IS 'Localização do usuário (cidade, estado)';
COMMENT ON COLUMN profiles.birth_date IS 'Data de nascimento do usuário';
COMMENT ON COLUMN profiles.occupation IS 'Profissão do usuário';
COMMENT ON COLUMN profiles.education IS 'Formação acadêmica do usuário';
COMMENT ON COLUMN profiles.interests IS 'Interesses e hobbies do usuário';
COMMENT ON COLUMN profiles.website IS 'Website pessoal do usuário';
COMMENT ON COLUMN profiles.social_links IS 'Links para redes sociais em formato JSON';
COMMENT ON COLUMN profiles.full_name IS 'Nome completo do usuário';
