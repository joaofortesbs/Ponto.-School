
-- Create table for user study groups
CREATE TABLE IF NOT EXISTS grupos_estudo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR NOT NULL,
  topico VARCHAR NOT NULL,
  disciplina VARCHAR NOT NULL,
  descricao TEXT,
  membros INTEGER NOT NULL DEFAULT 1,
  proxima_reuniao VARCHAR,
  progresso INTEGER NOT NULL DEFAULT 0,
  nivel VARCHAR NOT NULL,
  imagem VARCHAR NOT NULL,
  tags TEXT[],
  data_inicio VARCHAR NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster user-based queries
CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON grupos_estudo(user_id);

-- Create RLS policies
CREATE POLICY "Users can view their own study groups" 
  ON grupos_estudo FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study groups" 
  ON grupos_estudo FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study groups" 
  ON grupos_estudo FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study groups" 
  ON grupos_estudo FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS
ALTER TABLE grupos_estudo ENABLE ROW LEVEL SECURITY;
