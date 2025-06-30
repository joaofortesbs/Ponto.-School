
-- Adicionar colunas para banner e imagem do grupo
ALTER TABLE grupos_estudo 
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS group_image_url TEXT;

-- Criar bucket para imagens de grupos no Storage se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('group-images', 'group-images', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir upload e leitura de imagens para usuários autenticados
CREATE POLICY "Permitir upload de imagens de grupo para membros" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'group-images');

CREATE POLICY "Permitir leitura de imagens de grupo" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'group-images');

CREATE POLICY "Permitir atualização de imagens de grupo para membros" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'group-images');

CREATE POLICY "Permitir exclusão de imagens de grupo para membros" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'group-images');
