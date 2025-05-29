
-- Criar tabela para controlar regenerações diárias de recompensas
CREATE TABLE IF NOT EXISTS daily_regenerations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  regeneration_count INTEGER NOT NULL DEFAULT 0 CHECK (regeneration_count >= 0 AND regeneration_count <= 3),
  current_group INTEGER NOT NULL DEFAULT 0 CHECK (current_group >= 0 AND current_group <= 3),
  total_sps_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para garantir apenas um registro por usuário por dia
  UNIQUE(user_id, date)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_daily_regenerations_user_date ON daily_regenerations(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_regenerations_date ON daily_regenerations(date);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_daily_regenerations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_regenerations_updated_at
  BEFORE UPDATE ON daily_regenerations
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_regenerations_updated_at();

-- Função para limpar registros antigos (opcional - manter apenas últimos 30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_regenerations()
RETURNS void AS $$
BEGIN
  DELETE FROM daily_regenerations 
  WHERE date < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE daily_regenerations IS 'Tabela para controlar regenerações diárias de recompensas da roleta';
COMMENT ON COLUMN daily_regenerations.regeneration_count IS 'Número de regenerações realizadas no dia (máximo 3)';
COMMENT ON COLUMN daily_regenerations.current_group IS 'Grupo atual de recompensas (0-3)';
COMMENT ON COLUMN daily_regenerations.total_sps_spent IS 'Total de SPs gastos em regenerações no dia';
