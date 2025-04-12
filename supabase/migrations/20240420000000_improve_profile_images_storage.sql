-- Migração para melhorar o armazenamento de imagens de perfil

-- Certificar de que a extensão de storage está habilitada
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

-- Criar o bucket para as imagens de perfil se não existir
DO $$
BEGIN
    -- Verificar se o bucket 'profile-images' já existe
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'profile-images'
    ) THEN
        -- Criar o bucket para imagens de perfil
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('profile-images', 'profile-images', true);

        -- Política para permitir upload com autenticação
        INSERT INTO storage.policies (name, definition, bucket_id)
        VALUES (
            'Avatar images are publicly accessible',
            'bucket_id = ''profile-images'' AND (storage.foldername(name))[1] = ''avatars''',
            'profile-images'
        );

        -- Política para permitir que usuários autenticados façam upload
        INSERT INTO storage.policies (name, definition, bucket_id, operation)
        VALUES (
            'Users can upload avatars',
            'bucket_id = ''profile-images'' AND auth.role() = ''authenticated''',
            'profile-images',
            'INSERT'
        );

        -- Política para permitir que usuários autenticados atualizem seus próprios arquivos
        INSERT INTO storage.policies (name, definition, bucket_id, operation)
        VALUES (
            'Users can update their own avatars',
            'bucket_id = ''profile-images'' AND auth.role() = ''authenticated''',
            'profile-images',
            'UPDATE'
        );
    END IF;
END $$;

-- Garantir que a coluna avatar_url exista na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS cover_url text;

-- Atualizar a função handle_new_user para incluir campos de imagem
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, avatar_url, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'avatar_url', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;