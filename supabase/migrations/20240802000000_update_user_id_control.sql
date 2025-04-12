
-- Atualizar tabela de controle de IDs para garantir sequencial único
DROP TABLE IF EXISTS user_id_control;

CREATE TABLE IF NOT EXISTS user_id_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_id INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir valor inicial se a tabela estiver vazia
INSERT INTO user_id_control (last_id)
SELECT 0
WHERE NOT EXISTS (SELECT 1 FROM user_id_control);

-- Criar ou substituir a função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger para atualizar o timestamp
DROP TRIGGER IF EXISTS update_user_id_control_timestamp ON user_id_control;
CREATE TRIGGER update_user_id_control_timestamp
BEFORE UPDATE ON user_id_control
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Criar função para obter o próximo ID sequencial
CREATE OR REPLACE FUNCTION get_next_user_id_seq()
RETURNS INTEGER AS $$
DECLARE
  next_id INTEGER;
BEGIN
  -- Obter e incrementar o last_id em uma única operação atômica
  UPDATE user_id_control
  SET last_id = last_id + 1
  RETURNING last_id INTO next_id;
  
  RETURN next_id;
END;
$$ LANGUAGE plpgsql;
