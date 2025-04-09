
-- Função para executar consultas SQL (restrita a SELECTs apenas)
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Verificar se a consulta é apenas SELECT
  IF NOT (
    sql_query ~* '^[\s\n\r]*SELECT\s' AND 
    sql_query !~* '\s(DELETE|UPDATE|INSERT|DROP|ALTER|TRUNCATE|CREATE|GRANT|REVOKE)\s'
  ) THEN
    RAISE EXCEPTION 'Apenas consultas SELECT são permitidas';
  END IF;

  -- Executar a consulta
  EXECUTE 'SELECT jsonb_agg(row_to_json(t)) FROM (' || sql_query || ') AS t' INTO result;
  
  -- Retornar resultado vazio se nulo
  IF result IS NULL THEN
    result := '[]'::jsonb;
  END IF;
  
  RETURN result;
END;
$$;

-- Conceder permissão apenas para usuários autenticados
REVOKE ALL ON FUNCTION execute_sql FROM PUBLIC;
GRANT EXECUTE ON FUNCTION execute_sql TO authenticated;
