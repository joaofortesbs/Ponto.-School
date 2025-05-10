
-- Create table for grupos_estudo (study groups)
CREATE TABLE IF NOT EXISTS grupos_estudo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR NOT NULL,
  descricao TEXT,
  cor VARCHAR NOT NULL,
  topico VARCHAR,
  topico_nome VARCHAR,
  topico_icon VARCHAR,
  privado BOOLEAN DEFAULT false,
  visibilidade VARCHAR DEFAULT 'todos',
  membros INTEGER DEFAULT 1,
  codigo VARCHAR,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create policies for grupos_estudo
CREATE POLICY "Users can view their own grupos_estudo"
  ON grupos_estudo FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grupos_estudo"
  ON grupos_estudo FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own grupos_estudo"
  ON grupos_estudo FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own grupos_estudo"
  ON grupos_estudo FOR DELETE
  USING (auth.uid() = user_id);

-- Grant access to authenticated users
ALTER TABLE grupos_estudo ENABLE ROW LEVEL SECURITY;
