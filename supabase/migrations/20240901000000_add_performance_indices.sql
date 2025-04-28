
-- Adicionar índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_apostila_anotacoes_user_id ON apostila_anotacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_apostila_anotacoes_pasta_id ON apostila_anotacoes(pasta_id);
CREATE INDEX IF NOT EXISTS idx_apostila_anotacoes_data_exportacao ON apostila_anotacoes(data_exportacao);
CREATE INDEX IF NOT EXISTS idx_caderno_anotacoes_user_id ON caderno_anotacoes(user_id);

