
-- Add image columns to grupos_estudo table
ALTER TABLE public.grupos_estudo 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Update RLS policies to allow users to update images for groups they belong to
CREATE POLICY IF NOT EXISTS "Users can update images for groups they belong to"
  ON public.grupos_estudo FOR UPDATE
  USING (
    auth.uid() = criador_id OR 
    EXISTS (
      SELECT 1 FROM public.membros_grupos 
      WHERE grupo_id = grupos_estudo.id 
      AND user_id = auth.uid()
    )
  );
