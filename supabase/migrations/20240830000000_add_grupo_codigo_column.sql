
-- Add codigo column to grupos_estudo table to store unique group invitation codes
ALTER TABLE IF EXISTS public.grupos_estudo
ADD COLUMN IF NOT EXISTS codigo VARCHAR(10);

-- Create unique index on codigo column
CREATE UNIQUE INDEX IF NOT EXISTS idx_grupos_estudo_codigo_unique 
ON public.grupos_estudo(codigo);

-- Add comment to explain column purpose
COMMENT ON COLUMN public.grupos_estudo.codigo IS 'Unique invitation code for study groups';
