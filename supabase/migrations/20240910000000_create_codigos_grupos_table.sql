
-- Criar tabela para armazenar códigos de grupos
CREATE TABLE IF NOT EXISTS codigos_grupos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(7) UNIQUE NOT NULL,
  grupo_id UUID NOT NULL,
  nome_grupo TEXT NOT NULL,
  descricao TEXT,
  criado_por UUID NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ativo BOOLEAN DEFAULT TRUE
);

-- Criar índices para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_codigos_grupos_codigo ON codigos_grupos(codigo);
CREATE INDEX IF NOT EXISTS idx_codigos_grupos_grupo_id ON codigos_grupos(grupo_id);

-- Trigger para atualizar informações quando o grupo é atualizado
CREATE OR REPLACE FUNCTION atualizar_codigo_grupo() 
RETURNS TRIGGER AS $$
BEGIN
  UPDATE codigos_grupos
  SET nome_grupo = NEW.nome,
      descricao = NEW.descricao
  WHERE grupo_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_codigo_grupo
AFTER UPDATE ON grupos_estudo
FOR EACH ROW
EXECUTE FUNCTION atualizar_codigo_grupo();
