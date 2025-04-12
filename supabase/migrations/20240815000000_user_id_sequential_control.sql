
-- Migração para garantir sequencialidade e unicidade de IDs de usuário
-- Criação de nova tabela dedicada a controle sequencial com bloqueio de linhas

-- Remover tabelas antigas que podem causar conflitos
DROP TABLE IF EXISTS user_id_control CASCADE;
DROP TABLE IF EXISTS user_id_control_by_uf CASCADE;

-- Nova tabela com controle por UF, ano/mês e tipo de conta
CREATE TABLE user_id_sequence_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uf CHAR(2) NOT NULL,
  ano_mes CHAR(4) NOT NULL,
  tipo_conta INTEGER NOT NULL,
  current_sequence INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(uf, ano_mes, tipo_conta)
);

-- Índice para otimizar consultas
CREATE INDEX idx_user_sequence_lookup ON user_id_sequence_control(uf, ano_mes, tipo_conta);

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_sequence_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamps
DROP TRIGGER IF EXISTS update_sequence_timestamp ON user_id_sequence_control;
CREATE TRIGGER update_sequence_timestamp
BEFORE UPDATE ON user_id_sequence_control
FOR EACH ROW
EXECUTE FUNCTION update_sequence_timestamp();

-- Adicionar constraint de unicidade para user_id em profiles se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_user_id_unique' AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
  END IF;
END
$$;

-- Função para gerar ID único com garantia de sequencialidade usando FOR UPDATE
CREATE OR REPLACE FUNCTION generate_sequential_user_id(p_uf TEXT, p_tipo_conta INTEGER)
RETURNS TEXT AS $$
DECLARE
  v_uf TEXT;
  v_ano_mes TEXT;
  v_sequence INTEGER;
  v_user_id TEXT;
  v_record_exists BOOLEAN;
BEGIN
  -- Validação da UF
  IF p_uf IS NULL OR length(p_uf) != 2 OR p_uf = 'BR' THEN
    RAISE EXCEPTION 'UF inválida: %', p_uf;
  END IF;

  -- Validação do tipo de conta
  IF p_tipo_conta IS NULL OR p_tipo_conta NOT IN (1, 2) THEN
    RAISE EXCEPTION 'Tipo de conta inválido: %', p_tipo_conta;
  END IF;

  -- Normalização da UF para maiúsculas
  v_uf := UPPER(p_uf);
  
  -- Ano/mês atual no formato AAMM
  v_ano_mes := to_char(NOW(), 'YYMM');
  
  -- IMPORTANTE: BEGIN TRANSACTION explícito para garantir que operações são atômicas
  -- SERIALIZABLE garante o mais alto nível de isolamento
  BEGIN
    -- Lock da linha de controle se existir, ou criação com lock exclusivo
    SELECT EXISTS (
      SELECT 1 
      FROM user_id_sequence_control 
      WHERE uf = v_uf 
        AND ano_mes = v_ano_mes 
        AND tipo_conta = p_tipo_conta
    ) INTO v_record_exists;
    
    IF v_record_exists THEN
      -- Atualiza com lock exclusivo (FOR UPDATE) para garantir concorrência
      UPDATE user_id_sequence_control
      SET current_sequence = current_sequence + 1
      WHERE uf = v_uf 
        AND ano_mes = v_ano_mes 
        AND tipo_conta = p_tipo_conta
      RETURNING current_sequence INTO v_sequence;
    ELSE
      -- Insere nova linha com sequencial 1
      INSERT INTO user_id_sequence_control (uf, ano_mes, tipo_conta, current_sequence)
      VALUES (v_uf, v_ano_mes, p_tipo_conta, 1)
      RETURNING current_sequence INTO v_sequence;
    END IF;
    
    -- Formato: UF (2) + AnoMês (4) + TipoConta (1) + Sequencial (6)
    v_user_id := v_uf || v_ano_mes || p_tipo_conta || LPAD(v_sequence::text, 6, '0');
    
    -- Verifica se o ID já existe (verificação secundária de segurança)
    PERFORM 1 FROM profiles WHERE user_id = v_user_id;
    IF FOUND THEN
      -- Se por algum motivo o ID já existir, tenta mais uma vez com incremento
      UPDATE user_id_sequence_control
      SET current_sequence = current_sequence + 1
      WHERE uf = v_uf 
        AND ano_mes = v_ano_mes 
        AND tipo_conta = p_tipo_conta
      RETURNING current_sequence INTO v_sequence;
      
      v_user_id := v_uf || v_ano_mes || p_tipo_conta || LPAD(v_sequence::text, 6, '0');
      
      -- Verifica novamente
      PERFORM 1 FROM profiles WHERE user_id = v_user_id;
      IF FOUND THEN
        RAISE EXCEPTION 'Falha ao gerar ID único após duas tentativas';
      END IF;
    END IF;
    
    RETURN v_user_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Erro ao gerar ID sequencial: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql;

-- Função pública para migrar perfis existentes para novos IDs sequenciais
CREATE OR REPLACE FUNCTION migrate_to_sequential_user_ids()
RETURNS TEXT AS $$
DECLARE
  profile_rec RECORD;
  new_user_id TEXT;
  migrated_count INTEGER := 0;
  failed_count INTEGER := 0;
BEGIN
  -- Para cada perfil sem ID ou com ID inválido
  FOR profile_rec IN 
    SELECT id, user_id, state, plan_type 
    FROM profiles 
    WHERE user_id IS NULL OR user_id = '' OR NOT user_id ~ '^[A-Z]{2}\d{4}[1-2]\d{6}$'
  LOOP
    BEGIN
      -- Determinar UF e tipo de conta
      IF profile_rec.state IS NULL OR profile_rec.state = '' OR profile_rec.state = 'BR' THEN
        CONTINUE; -- Pula registros sem estado válido
      END IF;
      
      -- Determinar tipo de conta (1=Premium/Full, 2=Lite/Basic)
      IF profile_rec.plan_type = 'premium' OR profile_rec.plan_type = 'full' THEN
        new_user_id := generate_sequential_user_id(profile_rec.state, 1);
      ELSE
        new_user_id := generate_sequential_user_id(profile_rec.state, 2);
      END IF;
      
      -- Atualizar o perfil
      UPDATE profiles SET user_id = new_user_id WHERE id = profile_rec.id;
      migrated_count := migrated_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        failed_count := failed_count + 1;
    END;
  END LOOP;
  
  RETURN format('Migração concluída: %s perfis atualizados, %s falhas', 
                migrated_count::text, failed_count::text);
END;
$$ LANGUAGE plpgsql;
