
-- Add codigo column to grupos_estudo table to store unique group invitation codes
ALTER TABLE IF EXISTS public.grupos_estudo
ADD COLUMN IF NOT EXISTS codigo VARCHAR(10);

-- Create unique index on codigo column 
CREATE UNIQUE INDEX IF NOT EXISTS idx_grupos_estudo_codigo_unique 
ON public.grupos_estudo(codigo) 
WHERE codigo IS NOT NULL;

-- Add comment to explain column purpose
COMMENT ON COLUMN public.grupos_estudo.codigo IS 'Unique invitation code for study groups';

-- Add membros_ids column if it doesn't exist
ALTER TABLE IF EXISTS public.grupos_estudo
ADD COLUMN IF NOT EXISTS membros_ids UUID[] DEFAULT '{}';

-- Create function to ensure codigo is always uppercase
CREATE OR REPLACE FUNCTION normalize_grupo_codigo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo IS NOT NULL THEN
    NEW.codigo = UPPER(TRIM(NEW.codigo));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to normalize codigo on insert or update
DROP TRIGGER IF EXISTS normalize_grupo_codigo_trigger ON public.grupos_estudo;
CREATE TRIGGER normalize_grupo_codigo_trigger
BEFORE INSERT OR UPDATE ON public.grupos_estudo
FOR EACH ROW
EXECUTE FUNCTION normalize_grupo_codigo();
