
-- Adiciona campo cover_url à tabela profiles
ALTER TABLE IF EXISTS "public"."profiles"
ADD COLUMN IF NOT EXISTS "cover_url" text;

-- Cria bucket para armazenar arquivos de perfil
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para permitir upload de arquivos autenticados
CREATE POLICY "Arquivos de perfil acessíveis para todos" ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

CREATE POLICY "Usuários autenticados podem fazer upload" ON storage.objects FOR INSERT
TO authenticated USING (bucket_id = 'profiles');

CREATE POLICY "Usuários podem atualizar seus próprios arquivos" ON storage.objects FOR UPDATE
TO authenticated USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuários podem excluir seus próprios arquivos" ON storage.objects FOR DELETE
TO authenticated USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);
