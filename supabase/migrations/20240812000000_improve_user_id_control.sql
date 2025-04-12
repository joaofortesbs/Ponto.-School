
-- Migração para melhorar o controle de IDs de usuário
-- Garante que os últimos 6 dígitos sejam sequenciais e que a UF seja sempre registrada

-- Atualizar tabela de controle de IDs para garantir sequencial único por UF
CREATE TABLE IF NOT EXISTS user_id_control_by_uf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uf CHAR(2) NOT NULL,
  ano_mes CHAR(4) NOT NULL,
  tipo_conta INT NOT NULL,
  last_id INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(uf, ano_mes, tipo_conta)
);

-- Inserir registros iniciais baseado nos estados brasileiros para o mês atual
DO $$
DECLARE
  atual_ano_mes TEXT := to_char(NOW(), 'YYMM');
  estados TEXT[] := ARRAY['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
                         'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
                         'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
  estado TEXT;
BEGIN
  FOREACH estado IN ARRAY estados LOOP
    -- Inserir controle para tipo de conta 1 (Full)
    INSERT INTO user_id_control_by_uf (uf, ano_mes, tipo_conta, last_id)
    VALUES (estado, atual_ano_mes, 1, 0)
    ON CONFLICT (uf, ano_mes, tipo_conta) DO NOTHING;
    
    -- Inserir controle para tipo de conta 2 (Lite)
    INSERT INTO user_id_control_by_uf (uf, ano_mes, tipo_conta, last_id)
    VALUES (estado, atual_ano_mes, 2, 0)
    ON CONFLICT (uf, ano_mes, tipo_conta) DO NOTHING;
  END LOOP;
END;
$$;

-- Criar função para obter o próximo ID sequencial para uma UF, ano/mês e tipo de conta específicos
CREATE OR REPLACE FUNCTION get_next_user_id_for_uf(p_uf TEXT, p_tipo_conta INT)
RETURNS TEXT AS $$
DECLARE
  next_id INTEGER;
  atual_ano_mes TEXT := to_char(NOW(), 'YYMM');
  v_uf TEXT := upper(p_uf);
  record_id UUID;
BEGIN
  -- Verificar se a UF é válida
  IF v_uf IS NULL OR length(v_uf) != 2 OR v_uf = 'BR' THEN
    RAISE EXCEPTION 'UF inválida: %', v_uf;
  END IF;
  
  -- Verificar se o tipo de conta é válido
  IF p_tipo_conta IS NULL OR p_tipo_conta NOT IN (1, 2) THEN
    RAISE EXCEPTION 'Tipo de conta inválido: %', p_tipo_conta;
  END IF;
  
  -- Verificar se existe registro para esta UF, ano/mês e tipo de conta
  SELECT id, last_id + 1 INTO record_id, next_id
  FROM user_id_control_by_uf
  WHERE uf = v_uf AND ano_mes = atual_ano_mes AND tipo_conta = p_tipo_conta;
  
  -- Se não existe, criar o registro
  IF record_id IS NULL THEN
    INSERT INTO user_id_control_by_uf (uf, ano_mes, tipo_conta, last_id)
    VALUES (v_uf, atual_ano_mes, p_tipo_conta, 1)
    RETURNING id, last_id INTO record_id, next_id;
  ELSE
    -- Atualizar o contador
    UPDATE user_id_control_by_uf
    SET last_id = next_id, updated_at = NOW()
    WHERE id = record_id;
  END IF;
  
  -- Retornar o ID completo formatado
  RETURN v_uf || atual_ano_mes || p_tipo_conta || lpad(next_id::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_modified_column_for_id_control()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger à tabela de controle por UF
DROP TRIGGER IF EXISTS update_user_id_control_by_uf_timestamp ON user_id_control_by_uf;
CREATE TRIGGER update_user_id_control_by_uf_timestamp
BEFORE UPDATE ON user_id_control_by_uf
FOR EACH ROW
EXECUTE FUNCTION update_modified_column_for_id_control();

-- Adicionar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_user_id_control_by_uf_lookup 
ON user_id_control_by_uf(uf, ano_mes, tipo_conta);

-- Função para converter um perfil existente para o novo formato de ID
CREATE OR REPLACE FUNCTION fix_user_id_format(p_profile_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_profile RECORD;
  v_new_id TEXT;
  v_tipo_conta INTEGER;
BEGIN
  -- Buscar o perfil
  SELECT * INTO v_profile FROM profiles WHERE id = p_profile_id;
  
  IF v_profile IS NULL THEN
    RAISE EXCEPTION 'Perfil não encontrado: %', p_profile_id;
  END IF;
  
  -- Verificar se o estado é válido
  IF v_profile.state IS NULL OR length(v_profile.state) != 2 OR v_profile.state = 'BR' THEN
    RAISE EXCEPTION 'Estado inválido no perfil: %', v_profile.state;
  END IF;
  
  -- Determinar o tipo de conta
  IF v_profile.plan_type = 'full' OR v_profile.plan_type = 'premium' THEN
    v_tipo_conta := 1;
  ELSE
    v_tipo_conta := 2;
  END IF;
  
  -- Gerar o novo ID
  v_new_id := get_next_user_id_for_uf(v_profile.state, v_tipo_conta);
  
  -- Atualizar o perfil
  UPDATE profiles
  SET user_id = v_new_id,
      updated_at = NOW()
  WHERE id = p_profile_id;
  
  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;
