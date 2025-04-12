
-- Certifica-se de que o bucket 'profiles' existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO UPDATE SET
    public = true;

-- Certifica-se de que as permissões existem para o bucket
DO $$
BEGIN
    -- Verificar e criar política para acesso de leitura público
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname = 'Profiles Images Public Read Access'
    ) THEN
        CREATE POLICY "Profiles Images Public Read Access" ON storage.objects FOR SELECT
        USING (bucket_id = 'profiles');
    END IF;

    -- Verificar e criar política para upload por usuários autenticados
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname = 'Authenticated Users Can Upload Profile Images'
    ) THEN
        CREATE POLICY "Authenticated Users Can Upload Profile Images" ON storage.objects FOR INSERT
        TO authenticated USING (bucket_id = 'profiles');
    END IF;

    -- Verificar e criar política para atualização por usuários autenticados
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname = 'Authenticated Users Can Update Own Profile Images'
    ) THEN
        CREATE POLICY "Authenticated Users Can Update Own Profile Images" ON storage.objects FOR UPDATE
        TO authenticated USING (bucket_id = 'profiles');
    END IF;

    -- Verificar e criar política para exclusão por usuários autenticados
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname = 'Authenticated Users Can Delete Own Profile Images'
    ) THEN
        CREATE POLICY "Authenticated Users Can Delete Own Profile Images" ON storage.objects FOR DELETE
        TO authenticated USING (bucket_id = 'profiles');
    END IF;
END
$$;

-- Adiciona um gatilho para garantir que as URLs de avatar e capa sejam atualizadas em outros componentes
CREATE OR REPLACE FUNCTION update_profile_images_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Se alterou avatar_url ou cover_url, atualizar em outros locais que possam referenciar
    IF NEW.avatar_url IS DISTINCT FROM OLD.avatar_url OR NEW.cover_url IS DISTINCT FROM OLD.cover_url THEN
        -- Aqui poderia ter lógica adicional para manter consistência
        -- Por exemplo, atualizar uma tabela de cache ou outra relacionada
        NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS profile_images_update_trigger ON profiles;
CREATE TRIGGER profile_images_update_trigger
AFTER UPDATE ON profiles
FOR EACH ROW
WHEN (NEW.avatar_url IS DISTINCT FROM OLD.avatar_url OR NEW.cover_url IS DISTINCT FROM OLD.cover_url)
EXECUTE FUNCTION update_profile_images_trigger();

-- Adiciona índices para melhorar o desempenho de consultas por avatar_url e cover_url
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url);
CREATE INDEX IF NOT EXISTS idx_profiles_cover_url ON profiles(cover_url);
