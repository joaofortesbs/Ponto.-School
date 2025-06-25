
-- Primeiro, remover a constraint que pode estar causando conflito
ALTER TABLE grupos_estudo DROP CONSTRAINT IF EXISTS grupos_estudo_tipo_grupo_check;

-- Verificar todos os valores existentes na tabela
SELECT tipo_grupo, COUNT(*) as count
FROM grupos_estudo 
WHERE tipo_grupo IS NOT NULL 
GROUP BY tipo_grupo
ORDER BY count DESC;

-- Normalizar todos os valores existentes para minúsculas
UPDATE grupos_estudo 
SET tipo_grupo = LOWER(tipo_grupo)
WHERE tipo_grupo IS NOT NULL;

-- Mapear valores que não estão na lista padrão para valores válidos
UPDATE grupos_estudo 
SET tipo_grupo = CASE 
  WHEN tipo_grupo IN ('estudo', 'projeto', 'pesquisa', 'revisao', 'debate') THEN tipo_grupo
  WHEN tipo_grupo LIKE '%estud%' THEN 'estudo'
  WHEN tipo_grupo LIKE '%projet%' THEN 'projeto'
  WHEN tipo_grupo LIKE '%pesquis%' THEN 'pesquisa'
  WHEN tipo_grupo LIKE '%revis%' THEN 'revisao'
  WHEN tipo_grupo LIKE '%debat%' THEN 'debate'
  ELSE 'estudo'
END
WHERE tipo_grupo IS NOT NULL;

-- Agora criar a constraint com valores mais abrangentes
ALTER TABLE grupos_estudo 
ADD CONSTRAINT grupos_estudo_tipo_grupo_check 
CHECK (tipo_grupo IN ('estudo', 'projeto', 'pesquisa', 'revisao', 'debate'));

-- Verificar se ainda há algum valor inválido
SELECT tipo_grupo, COUNT(*) as count
FROM grupos_estudo 
WHERE tipo_grupo IS NOT NULL 
  AND tipo_grupo NOT IN ('estudo', 'projeto', 'pesquisa', 'revisao', 'debate')
GROUP BY tipo_grupo;

-- Atualizar cache do esquema
SELECT pg_notify('pgrst', 'reload schema');
