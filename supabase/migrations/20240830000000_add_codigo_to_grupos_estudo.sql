
-- Adicionar coluna de código único aos grupos de estudo existentes
ALTER TABLE IF EXISTS public.grupos_estudo
ADD COLUMN IF NOT EXISTS codigo TEXT UNIQUE;

-- Criar função para gerar código aleatório
CREATE OR REPLACE FUNCTION generate_random_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    -- Gerar um código de 6 caracteres com hífen no meio
    FOR i IN 1..6 LOOP
        -- Adicionar hífen após os 3 primeiros caracteres
        IF i = 4 THEN
            result := result || '-';
        END IF;
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Atualizar grupos existentes com códigos aleatórios
UPDATE public.grupos_estudo 
SET codigo = generate_random_code()
WHERE codigo IS NULL;

-- Criar trigger para adicionar código automaticamente a novos grupos
CREATE OR REPLACE FUNCTION add_grupo_code()
RETURNS TRIGGER AS $$
DECLARE
    code_exists INTEGER;
    new_code TEXT;
BEGIN
    -- Se um código foi fornecido, use-o
    IF NEW.codigo IS NOT NULL THEN
        RETURN NEW;
    END IF;
    
    -- Gerar e verificar códigos até encontrar um único
    LOOP
        new_code := generate_random_code();
        
        -- Verificar se o código já existe
        SELECT COUNT(*) INTO code_exists 
        FROM public.grupos_estudo 
        WHERE codigo = new_code;
        
        -- Se não existir, usar esse código
        IF code_exists = 0 THEN
            NEW.codigo := new_code;
            EXIT;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para novos grupos
DROP TRIGGER IF EXISTS add_grupo_code_trigger ON public.grupos_estudo;
CREATE TRIGGER add_grupo_code_trigger
BEFORE INSERT ON public.grupos_estudo
FOR EACH ROW
WHEN (NEW.codigo IS NULL)
EXECUTE FUNCTION add_grupo_code();
